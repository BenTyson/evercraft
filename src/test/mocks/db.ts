/**
 * Prisma Database Mock
 *
 * Provides a mock implementation of the Prisma client for testing server actions.
 * Uses vitest-mock-extended for type-safe mocking.
 *
 * Usage:
 * ```ts
 * import { mockDb, mockReset } from '@/test/mocks/db';
 *
 * beforeEach(() => {
 *   mockReset();
 * });
 *
 * it('fetches products', async () => {
 *   mockDb.product.findMany.mockResolvedValue([...]);
 *   const result = await getProducts();
 *   expect(result.products).toHaveLength(...);
 * });
 * ```
 */

import { PrismaClient } from '@/generated/prisma';
import { mockDeep, mockReset as viMockReset, DeepMockProxy } from 'vitest-mock-extended';
import { beforeEach, vi } from 'vitest';

// Create a deep mock of PrismaClient
export const mockDb = mockDeep<PrismaClient>();

// Mock the db module
vi.mock('@/lib/db', () => ({
  db: mockDb,
  default: mockDb,
}));

// Helper to reset all mocks between tests
export function mockReset() {
  viMockReset(mockDb);
}

// Type export for use in tests
export type MockPrismaClient = DeepMockProxy<PrismaClient>;
