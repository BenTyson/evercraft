'use server';

import { auth, clerkClient } from '@clerk/nextjs/server';
import { stripe, isStripeConfigured } from '@/lib/stripe';
import { db } from '@/lib/db';
import { ShippingAddress } from '@/store/checkout-store';
import { sendOrderConfirmationEmail } from '@/lib/email';
import { calculateCartShipping } from '@/lib/shipping';
import { Prisma } from '@/generated/prisma';
import { syncUserToDatabase } from '@/lib/auth';

// Platform fee rate (6.5%)
const platformFeeRate = 0.065;

// Enable automatic transfers (false in test mode to avoid balance issues)
const ENABLE_AUTO_TRANSFERS = process.env.ENABLE_AUTO_TRANSFERS === 'true';

interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  variantName?: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
  shopId: string;
  shopName: string;
}

interface CreatePaymentIntentInput {
  items: CartItem[];
  shippingAddress: ShippingAddress;
}

export async function createPaymentIntent(input: CreatePaymentIntentInput) {
  try {
    if (!isStripeConfigured || !stripe) {
      return { success: false, error: 'Payment processing is not configured' };
    }

    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    // Calculate totals
    const subtotal = input.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Calculate shipping dynamically
    const shippingResult = calculateCartShipping({
      items: input.items.map((item) => ({
        price: item.price,
        quantity: item.quantity,
        weight: 1, // Default weight
      })),
      destinationCountry: input.shippingAddress.country,
      destinationState: input.shippingAddress.state,
    });
    const shipping = shippingResult.shippingCost;

    // Stripe processing fee (2.9% + $0.30) - passed to buyer
    const stripeProcessingFee = (subtotal + shipping) * 0.029 + 0.3;

    // Total includes subtotal, shipping, and processing fee
    // Platform fee (6.5%) and nonprofit donation come from seller portion
    const total = subtotal + shipping + stripeProcessingFee;

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // Stripe uses cents
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        userId,
        subtotal: subtotal.toFixed(2),
        shipping: shipping.toFixed(2),
        processingFee: stripeProcessingFee.toFixed(2),
      },
    });

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create payment intent',
    };
  }
}

interface CreateOrderInput {
  paymentIntentId: string;
  items: CartItem[];
  shippingAddress: ShippingAddress;
}

export async function createOrder(input: CreateOrderInput) {
  try {
    if (!isStripeConfigured || !stripe) {
      return { success: false, error: 'Payment processing is not configured' };
    }

    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    // Sync user to database (creates User record if it doesn't exist)
    await syncUserToDatabase(userId);

    // Verify payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(input.paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return { success: false, error: 'Payment not completed' };
    }

    // Calculate totals
    const subtotal = input.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Calculate shipping dynamically
    const shippingResult = calculateCartShipping({
      items: input.items.map((item) => ({
        price: item.price,
        quantity: item.quantity,
        weight: 1, // Default weight
      })),
      destinationCountry: input.shippingAddress.country,
      destinationState: input.shippingAddress.state,
    });
    const shipping = shippingResult.shippingCost;

    // Stripe processing fee (2.9% + $0.30)
    const stripeProcessingFee = (subtotal + shipping) * 0.029 + 0.3;

    // Total includes processing fee but not platform fee (platform fee comes from seller portion)
    const total = subtotal + shipping + stripeProcessingFee;

    // Check inventory availability for all products/variants
    const inventoryCheck = await Promise.all(
      input.items.map(async (item) => {
        // If item has a variant, check variant inventory
        if (item.variantId) {
          const variant = await db.productVariant.findUnique({
            where: { id: item.variantId },
            select: {
              id: true,
              name: true,
              trackInventory: true,
              inventoryQuantity: true,
              product: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          });

          if (!variant) {
            return {
              success: false,
              error: `Product variant ${item.variantName || 'not found'}`,
            };
          }

          if (variant.trackInventory && variant.inventoryQuantity < item.quantity) {
            return {
              success: false,
              error: `Insufficient inventory for ${variant.product.title} - ${variant.name}. Available: ${variant.inventoryQuantity}, Requested: ${item.quantity}`,
            };
          }

          return { success: true, variant };
        }

        // Otherwise, check product inventory
        const product = await db.product.findUnique({
          where: { id: item.productId },
          select: {
            id: true,
            title: true,
            trackInventory: true,
            inventoryQuantity: true,
          },
        });

        if (!product) {
          return { success: false, error: `Product ${item.title} not found` };
        }

        if (product.trackInventory && product.inventoryQuantity < item.quantity) {
          return {
            success: false,
            error: `Insufficient inventory for ${product.title}. Available: ${product.inventoryQuantity}, Requested: ${item.quantity}`,
          };
        }

        return { success: true, product };
      })
    );

    // Check if any inventory checks failed
    const failedCheck = inventoryCheck.find((check) => !check.success);
    if (failedCheck) {
      return { success: false, error: failedCheck.error };
    }

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

    // Group items by shop to calculate per-shop payments
    const itemsByShop = new Map<
      string,
      { shopId: string; items: typeof input.items; subtotal: number; donationPercentage: number }
    >();

    // First pass: get shop info and group items
    for (const item of input.items) {
      const product = await db.product.findUnique({
        where: { id: item.productId },
        select: {
          shopId: true,
          shop: {
            select: {
              donationPercentage: true,
            },
          },
        },
      });

      if (!product) continue;

      const existing = itemsByShop.get(product.shopId);
      const itemSubtotal = item.price * item.quantity;

      if (existing) {
        existing.items.push(item);
        existing.subtotal += itemSubtotal;
      } else {
        itemsByShop.set(product.shopId, {
          shopId: product.shopId,
          items: [item],
          subtotal: itemSubtotal,
          donationPercentage: product.shop.donationPercentage,
        });
      }
    }

    // Create order with transaction to ensure atomicity
    const order = await db.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          buyerId: userId,
          status: 'PROCESSING',
          subtotal,
          shippingCost: shipping,
          tax: 0,
          total,
          nonprofitDonation: 0, // Will be sum of all shop donations
          shippingAddress: input.shippingAddress as unknown as Prisma.InputJsonValue,
          billingAddress: input.shippingAddress as unknown as Prisma.InputJsonValue,
          paymentStatus: 'PAID',
          paymentIntentId: input.paymentIntentId,
          updatedAt: new Date(),
        },
      });

      let totalNonprofitDonation = 0;

      // Create Payment records for each shop and transfer funds
      for (const [shopId, shopData] of itemsByShop.entries()) {
        // Calculate shop-specific values
        const shopSubtotal = shopData.subtotal;
        const shopDonation = shopSubtotal * (shopData.donationPercentage / 100);
        const shopPlatformFee = shopSubtotal * platformFeeRate;
        const shopPayout = shopSubtotal - shopPlatformFee - shopDonation;

        totalNonprofitDonation += shopDonation;

        // Get shop's nonprofit selection for donation tracking
        const shop = await tx.shop.findUnique({
          where: { id: shopId },
          select: {
            nonprofitId: true,
          },
        });

        // Get seller's Stripe Connect account (if exists and configured)
        const sellerAccount = await tx.sellerConnectedAccount.findUnique({
          where: { shopId },
          select: {
            stripeAccountId: true,
            payoutsEnabled: true,
            chargesEnabled: true,
          },
        });

        // Create Stripe Transfer if seller has connected account
        if (ENABLE_AUTO_TRANSFERS && isStripeConfigured && stripe && sellerAccount) {
          try {
            // Sync account status from Stripe before transfer
            const stripeAccount = await stripe.accounts.retrieve(sellerAccount.stripeAccountId);
            const accountReady = stripeAccount.payouts_enabled || stripeAccount.charges_enabled;

            // Update database with latest status
            await tx.sellerConnectedAccount.update({
              where: { shopId },
              data: {
                chargesEnabled: stripeAccount.charges_enabled || false,
                payoutsEnabled: stripeAccount.payouts_enabled || false,
                onboardingCompleted: stripeAccount.details_submitted || false,
              },
            });

            if (accountReady) {
              // Create transfer to seller's Connect account
              const transfer = await stripe.transfers.create({
                amount: Math.round(shopPayout * 100), // Convert to cents
                currency: 'usd',
                destination: sellerAccount.stripeAccountId,
                description: `Payout for order ${orderNumber}`,
                metadata: {
                  orderId: newOrder.id,
                  orderNumber: orderNumber,
                  shopId: shopId,
                },
              });
              console.log(
                `✅ Transfer created for shop ${shopId}: ${transfer.id} ($${shopPayout.toFixed(2)})`
              );
            } else {
              console.log(
                `⚠️ Skipping transfer for shop ${shopId}: Account not ready for payouts yet`
              );
            }
          } catch (transferError) {
            console.error(`❌ Failed to create transfer for shop ${shopId}:`, transferError);
            // Continue without failing the order - transfer can be done manually later
          }
        } else if (!ENABLE_AUTO_TRANSFERS) {
          console.log(
            `ℹ️ Auto-transfers disabled - transfer for shop ${shopId} will need to be done manually ($${shopPayout.toFixed(2)})`
          );
        } else if (!sellerAccount) {
          console.log(
            `⚠️ No Connect account found for shop ${shopId} - seller needs to connect bank account`
          );
        }

        // Create Payment record
        await tx.payment.create({
          data: {
            orderId: newOrder.id,
            shopId: shopId,
            stripePaymentIntentId: input.paymentIntentId,
            amount: shopSubtotal,
            platformFee: shopPlatformFee,
            sellerPayout: shopPayout,
            nonprofitDonation: shopDonation,
            status: 'PAID',
          },
        });

        // Create Donation record if shop has selected a nonprofit and donation > 0
        if (shop?.nonprofitId && shopDonation > 0) {
          await tx.donation.create({
            data: {
              orderId: newOrder.id,
              nonprofitId: shop.nonprofitId,
              shopId: shopId,
              amount: shopDonation,
              donorType: 'SELLER_CONTRIBUTION',
              status: 'PENDING',
            },
          });
        }

        // Update or create SellerBalance
        const existingBalance = await tx.sellerBalance.findUnique({
          where: { shopId },
        });

        if (existingBalance) {
          await tx.sellerBalance.update({
            where: { shopId },
            data: {
              availableBalance: {
                increment: shopPayout,
              },
              totalEarned: {
                increment: shopPayout,
              },
            },
          });
        } else {
          await tx.sellerBalance.create({
            data: {
              shopId,
              availableBalance: shopPayout,
              pendingBalance: 0,
              totalEarned: shopPayout,
              totalPaidOut: 0,
            },
          });
        }

        // Update Seller1099Data for the current year
        const currentYear = new Date().getFullYear();
        const existing1099 = await tx.seller1099Data.findUnique({
          where: {
            shopId_taxYear: {
              shopId,
              taxYear: currentYear,
            },
          },
        });

        if (existing1099) {
          await tx.seller1099Data.update({
            where: {
              shopId_taxYear: {
                shopId,
                taxYear: currentYear,
              },
            },
            data: {
              grossPayments: {
                increment: shopSubtotal,
              },
              transactionCount: {
                increment: 1,
              },
              reportingRequired:
                existing1099.grossPayments + shopSubtotal >= 20000 ||
                existing1099.transactionCount + 1 >= 200,
            },
          });
        } else {
          await tx.seller1099Data.create({
            data: {
              shopId,
              taxYear: currentYear,
              grossPayments: shopSubtotal,
              transactionCount: 1,
              reportingRequired: shopSubtotal >= 20000,
            },
          });
        }
      }

      // Update order with total nonprofit donation
      await tx.order.update({
        where: { id: newOrder.id },
        data: { nonprofitDonation: totalNonprofitDonation },
      });

      // Create order items and decrement inventory
      for (const item of input.items) {
        // Get shop info for the product
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { shopId: true, trackInventory: true },
        });

        if (!product) continue;

        const shopData = itemsByShop.get(product.shopId);
        if (!shopData) continue;

        const itemDonation = item.price * item.quantity * (shopData.donationPercentage / 100);

        // Create order item
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            variantId: item.variantId || null,
            shopId: product.shopId,
            quantity: item.quantity,
            priceAtPurchase: item.price,
            subtotal: item.price * item.quantity,
            donationAmount: itemDonation,
          },
        });

        // Decrement inventory if tracking is enabled
        if (item.variantId) {
          // Decrement variant inventory
          const variant = await tx.productVariant.findUnique({
            where: { id: item.variantId },
            select: { trackInventory: true },
          });

          if (variant?.trackInventory) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: {
                inventoryQuantity: {
                  decrement: item.quantity,
                },
              },
            });
          }
        } else if (product.trackInventory) {
          // Decrement product inventory
          await tx.product.update({
            where: { id: item.productId },
            data: {
              inventoryQuantity: {
                decrement: item.quantity,
              },
            },
          });
        }
      }

      return newOrder;
    });

    // Send order confirmation email
    try {
      const clerk = await clerkClient();
      const user = await clerk.users.getUser(userId);
      const userEmail = user.emailAddresses[0]?.emailAddress;

      if (userEmail) {
        await sendOrderConfirmationEmail({
          to: userEmail,
          orderNumber: order.orderNumber,
          orderTotal: total,
          items: input.items.map((item) => ({
            title: item.title,
            variantName: item.variantName,
            quantity: item.quantity,
            price: item.price,
          })),
          // Type mismatch between ShippingAddress formats - cast for email function
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          shippingAddress: input.shippingAddress as any,
        });
      }
    } catch (emailError) {
      // Log email error but don't fail the order
      console.error('Failed to send order confirmation email:', emailError);
    }

    return {
      success: true,
      orderIds: [order.id],
    };
  } catch (error) {
    console.error('Error creating order:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create order',
    };
  }
}
