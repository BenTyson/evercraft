/**
 * Test Factories
 *
 * Creates mock data objects with correct field names for testing.
 * Ensures tests use the same field names as the actual schema.
 */

// ============================================================================
// PRODUCT FACTORIES
// ============================================================================

export interface MockProduct {
  id: string;
  shopId: string;
  title: string;
  description: string;
  price: number;
  compareAtPrice?: number | null;
  sku?: string | null;
  categoryId?: string | null;
  tags: string[];
  inventoryQuantity: number; // NOT 'quantity'
  trackInventory: boolean;
  lowStockThreshold?: number | null;
  status: 'DRAFT' | 'ACTIVE' | 'SOLD_OUT' | 'ARCHIVED';
  hasVariants: boolean;
  variantOptions?: Record<string, string[]> | null;
  shippingProfileId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export function createMockProduct(overrides: Partial<MockProduct> = {}): MockProduct {
  return {
    id: 'prod_test_123',
    shopId: 'shop_test_123',
    title: 'Test Product',
    description: 'A test product description',
    price: 29.99,
    compareAtPrice: null,
    sku: 'TEST-SKU-001',
    categoryId: null,
    tags: ['eco-friendly', 'handmade'],
    inventoryQuantity: 10, // Correct field name
    trackInventory: true,
    lowStockThreshold: 5,
    status: 'ACTIVE',
    hasVariants: false,
    variantOptions: null,
    shippingProfileId: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

// ============================================================================
// SHOP FACTORIES
// ============================================================================

export interface MockShop {
  id: string;
  userId: string;
  slug: string;
  name: string;
  bio?: string | null;
  story?: string | null;
  bannerImage?: string | null;
  logo?: string | null;
  isVerified: boolean;
  verificationStatus: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
  stripeAccountId?: string | null;
  nonprofitId?: string | null;
  donationPercentage: number;
  createdAt: Date;
  updatedAt: Date;
}

export function createMockShop(overrides: Partial<MockShop> = {}): MockShop {
  return {
    id: 'shop_test_123',
    userId: 'user_test_123',
    slug: 'test-shop',
    name: 'Test Shop',
    bio: 'A sustainable shop for eco-friendly products',
    story: null,
    bannerImage: null,
    logo: null,
    isVerified: true,
    verificationStatus: 'APPROVED',
    stripeAccountId: null,
    nonprofitId: null,
    donationPercentage: 1.0,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

// ============================================================================
// ORDER ITEM FACTORIES
// ============================================================================

export interface MockOrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId?: string | null;
  shopId: string;
  quantity: number;
  priceAtPurchase: number;
  subtotal: number; // NOT 'price' - this is priceAtPurchase * quantity
  nonprofitId?: string | null;
  donationAmount: number;
  createdAt: Date;
}

export function createMockOrderItem(overrides: Partial<MockOrderItem> = {}): MockOrderItem {
  const quantity = overrides.quantity ?? 2;
  const priceAtPurchase = overrides.priceAtPurchase ?? 29.99;

  return {
    id: 'item_test_123',
    orderId: 'order_test_123',
    productId: 'prod_test_123',
    variantId: null,
    shopId: 'shop_test_123',
    quantity,
    priceAtPurchase,
    subtotal: quantity * priceAtPurchase, // Correct calculation
    nonprofitId: null,
    donationAmount: 0,
    createdAt: new Date('2024-01-01'),
    ...overrides,
  };
}

// ============================================================================
// ECO PROFILE FACTORIES
// ============================================================================

export interface MockShopEcoProfile {
  plasticFreePackaging: boolean;
  recycledPackaging: boolean;
  biodegradablePackaging: boolean;
  organicMaterials: boolean;
  recycledMaterials: boolean;
  fairTradeSourcing: boolean;
  localSourcing: boolean;
  carbonNeutralShipping: boolean;
  renewableEnergy: boolean;
  carbonOffset: boolean;
  // Tier 2 fields
  annualCarbonEmissions?: number | null;
  carbonOffsetPercent?: number | null;
  renewableEnergyPercent?: number | null;
  waterConservation: boolean;
  fairWageCertified: boolean;
  takeBackProgram: boolean;
  repairService: boolean;
}

export function createMockShopEcoProfile(
  overrides: Partial<MockShopEcoProfile> = {}
): MockShopEcoProfile {
  return {
    plasticFreePackaging: false,
    recycledPackaging: false,
    biodegradablePackaging: false,
    organicMaterials: false,
    recycledMaterials: false,
    fairTradeSourcing: false,
    localSourcing: false,
    carbonNeutralShipping: false,
    renewableEnergy: false,
    carbonOffset: false,
    annualCarbonEmissions: null,
    carbonOffsetPercent: null,
    renewableEnergyPercent: null,
    waterConservation: false,
    fairWageCertified: false,
    takeBackProgram: false,
    repairService: false,
    ...overrides,
  };
}

export interface MockProductEcoProfile {
  isOrganic: boolean;
  isRecycled: boolean;
  isBiodegradable: boolean;
  isVegan: boolean;
  isFairTrade: boolean;
  plasticFreePackaging: boolean;
  recyclablePackaging: boolean;
  compostablePackaging: boolean;
  minimalPackaging: boolean;
  carbonNeutralShipping: boolean;
  madeLocally: boolean;
  madeToOrder: boolean;
  renewableEnergyMade: boolean;
  isRecyclable: boolean;
  isCompostable: boolean;
  isRepairable: boolean;
  hasDisposalInfo: boolean;
  // Tier 2 fields
  organicPercent?: number | null;
  recycledPercent?: number | null;
  carbonFootprintKg?: number | null;
  madeIn?: string | null;
  disposalInstructions?: string | null;
}

export function createMockProductEcoProfile(
  overrides: Partial<MockProductEcoProfile> = {}
): MockProductEcoProfile {
  return {
    isOrganic: false,
    isRecycled: false,
    isBiodegradable: false,
    isVegan: false,
    isFairTrade: false,
    plasticFreePackaging: false,
    recyclablePackaging: false,
    compostablePackaging: false,
    minimalPackaging: false,
    carbonNeutralShipping: false,
    madeLocally: false,
    madeToOrder: false,
    renewableEnergyMade: false,
    isRecyclable: false,
    isCompostable: false,
    isRepairable: false,
    hasDisposalInfo: false,
    organicPercent: null,
    recycledPercent: null,
    carbonFootprintKg: null,
    madeIn: null,
    disposalInstructions: null,
    ...overrides,
  };
}

// ============================================================================
// USER FACTORIES
// ============================================================================

export interface MockUser {
  id: string;
  email: string;
  name?: string | null;
  avatar?: string | null;
  phone?: string | null;
  role: 'BUYER' | 'SELLER' | 'ADMIN';
  twoFactorEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function createMockUser(overrides: Partial<MockUser> = {}): MockUser {
  return {
    id: 'user_test_123',
    email: 'test@example.com',
    name: 'Test User',
    avatar: null,
    phone: null,
    role: 'BUYER',
    twoFactorEnabled: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

// ============================================================================
// CART ITEM FACTORIES (for shipping tests)
// ============================================================================

export interface MockCartItem {
  price: number;
  quantity: number;
  weight?: number;
}

export function createMockCartItem(overrides: Partial<MockCartItem> = {}): MockCartItem {
  return {
    price: 29.99,
    quantity: 1,
    weight: 1,
    ...overrides,
  };
}
