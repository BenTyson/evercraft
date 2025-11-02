/**
 * Email Service
 *
 * Utility functions for sending transactional emails using Resend.
 */

import { Resend } from 'resend';

// Initialize Resend client (will return null if API key not configured)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Evercraft <noreply@evercraft.com>';

/**
 * Check if email service is configured
 */
export function isEmailConfigured(): boolean {
  return !!resend;
}

/**
 * Send order confirmation email to buyer
 */
export async function sendOrderConfirmationEmail({
  to,
  orderNumber,
  orderTotal,
  items,
  shippingAddress,
  buyerDonation,
}: {
  to: string;
  orderNumber: string;
  orderTotal: number;
  items: Array<{
    title: string;
    variantName?: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string | null;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  buyerDonation?: {
    nonprofitName: string;
    amount: number;
  };
}) {
  if (!resend) {
    console.warn('Email service not configured - skipping order confirmation email');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const formattedTotal = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(orderTotal);

    const itemsList = items
      .map(
        (item) =>
          `- ${item.title}${item.variantName ? ` (${item.variantName})` : ''} x${item.quantity} - ${new Intl.NumberFormat(
            'en-US',
            {
              style: 'currency',
              currency: 'USD',
            }
          ).format(item.price * item.quantity)}`
      )
      .join('\n');

    const shippingInfo = `
${shippingAddress.fullName}
${shippingAddress.addressLine1}
${shippingAddress.addressLine2 ? shippingAddress.addressLine2 + '\n' : ''}${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postalCode}
${shippingAddress.country}
    `.trim();

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #2D5016 0%, #4A7C2C 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
    <h1 style="margin: 0; font-size: 28px;">Order Confirmed!</h1>
    <p style="margin: 10px 0 0 0; opacity: 0.9;">Thank you for your sustainable purchase</p>
  </div>

  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
    <p style="font-size: 16px; margin-top: 0;">Hi ${shippingAddress.fullName},</p>

    <p>Your order has been confirmed and will be processed shortly. Here are your order details:</p>

    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h2 style="margin-top: 0; color: #2D5016; font-size: 18px;">Order #${orderNumber}</h2>

      <h3 style="color: #666; font-size: 14px; margin: 20px 0 10px 0;">Items Ordered:</h3>
      <div style="font-family: monospace; white-space: pre-wrap; background: #f5f5f5; padding: 15px; border-radius: 4px; font-size: 14px;">${itemsList}</div>

      <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #e0e0e0;">
        <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; color: #2D5016;">
          <span>Total:</span>
          <span>${formattedTotal}</span>
        </div>
      </div>
    </div>

    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #2D5016; font-size: 16px;">Shipping Address:</h3>
      <div style="white-space: pre-wrap; color: #666;">${shippingInfo}</div>
    </div>

    ${
      buyerDonation
        ? `
    <div style="background: #e8f5e9; border-left: 4px solid #4A7C2C; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #2D5016; font-size: 16px;">💚 Thank You for Your Donation!</h3>
      <p style="margin: 10px 0; color: #2D5016;">
        Your donation of <strong>${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(buyerDonation.amount)}</strong> to <strong>${buyerDonation.nonprofitName}</strong> will make a real difference.
      </p>
      <p style="margin: 10px 0 0 0; font-size: 13px; color: #4A7C2C;">
        Evercraft will facilitate your donation and provide documentation for your tax records. You can view your donation history at any time in your account under <a href="${process.env.NEXT_PUBLIC_APP_URL}/account/impact" style="color: #2D5016; text-decoration: underline;">My Impact</a>.
      </p>
    </div>
    `
        : `
    <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px; color: #2D5016;">
        🌱 <strong>Impact Note:</strong> Many sellers on Evercraft contribute a percentage of their sales to environmental nonprofits working to create a sustainable future.
      </p>
    </div>
    `
    }

    <p style="color: #666; font-size: 14px;">
      We'll send you another email when your order ships. You can track your order status anytime in your account.
    </p>

    <div style="text-align: center; margin-top: 30px;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderNumber}"
         style="display: inline-block; background: #4A7C2C; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">
        View Order Details
      </a>
    </div>
  </div>

  <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
    <p>Thank you for choosing sustainable products! 🌿</p>
    <p style="margin-top: 10px;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color: #4A7C2C; text-decoration: none;">Visit Evercraft</a>
    </p>
  </div>
</body>
</html>
    `;

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Order Confirmation - ${orderNumber}`,
      html,
    });

    if (error) {
      console.error('Error sending order confirmation email:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}

/**
 * Send order status update email
 */
export async function sendOrderStatusUpdateEmail({
  to,
  orderNumber,
  status,
  customerName,
}: {
  to: string;
  orderNumber: string;
  status: string;
  customerName: string;
}) {
  if (!resend) {
    console.warn('Email service not configured - skipping order status update email');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const statusMessages: Record<string, { title: string; message: string; color: string }> = {
      PROCESSING: {
        title: 'Order Processing',
        message: 'Your order is being prepared for shipment.',
        color: '#FFA726',
      },
      SHIPPED: {
        title: 'Order Shipped!',
        message: 'Your order is on its way to you.',
        color: '#4A7C2C',
      },
      DELIVERED: {
        title: 'Order Delivered',
        message: 'Your order has been delivered. Enjoy your sustainable products!',
        color: '#2D5016',
      },
      CANCELLED: {
        title: 'Order Cancelled',
        message: 'Your order has been cancelled.',
        color: '#D32F2F',
      },
    };

    const statusInfo = statusMessages[status] || {
      title: 'Order Updated',
      message: 'Your order status has been updated.',
      color: '#666',
    };

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Status Update</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: ${statusInfo.color}; color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
    <h1 style="margin: 0; font-size: 28px;">${statusInfo.title}</h1>
    <p style="margin: 10px 0 0 0; opacity: 0.9;">Order #${orderNumber}</p>
  </div>

  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
    <p style="font-size: 16px; margin-top: 0;">Hi ${customerName},</p>

    <p style="font-size: 16px;">${statusInfo.message}</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderNumber}"
         style="display: inline-block; background: #4A7C2C; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">
        Track Your Order
      </a>
    </div>

    <p style="color: #666; font-size: 14px;">
      If you have any questions, please don't hesitate to contact us.
    </p>
  </div>

  <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
    <p>Thank you for choosing sustainable products! 🌿</p>
    <p style="margin-top: 10px;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color: #4A7C2C; text-decoration: none;">Visit Evercraft</a>
    </p>
  </div>
</body>
</html>
    `;

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `${statusInfo.title} - Order ${orderNumber}`,
      html,
    });

    if (error) {
      console.error('Error sending order status update email:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending order status update email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}
