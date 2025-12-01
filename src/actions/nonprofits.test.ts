import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockDb, mockReset } from '@/test/mocks/db';
import { getVerifiedNonprofits } from './nonprofits';

describe('Nonprofit Actions', () => {
  beforeEach(() => {
    mockReset();
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('getVerifiedNonprofits', () => {
    it('should return verified nonprofits sorted by name', async () => {
      const mockNonprofits = [
        {
          id: 'nonprofit_1',
          name: 'A Ocean Cleanup',
          mission: 'Clean the oceans',
          logo: 'ocean.jpg',
          category: ['Environment'],
        },
        {
          id: 'nonprofit_2',
          name: 'B Forest Fund',
          mission: 'Save the forests',
          logo: 'forest.jpg',
          category: ['Environment', 'Conservation'],
        },
        {
          id: 'nonprofit_3',
          name: 'C Wildlife Rescue',
          mission: 'Rescue animals',
          logo: 'wildlife.jpg',
          category: ['Animals'],
        },
      ];

      mockDb.nonprofit.findMany.mockResolvedValue(mockNonprofits);

      const result = await getVerifiedNonprofits();

      expect(result.success).toBe(true);
      expect(result.nonprofits).toHaveLength(3);
      expect(result.nonprofits?.[0].name).toBe('A Ocean Cleanup');
      expect(mockDb.nonprofit.findMany).toHaveBeenCalledWith({
        where: {
          isVerified: true,
        },
        select: {
          id: true,
          name: true,
          mission: true,
          logo: true,
          category: true,
        },
        orderBy: {
          name: 'asc',
        },
      });
    });

    it('should return empty array when no verified nonprofits', async () => {
      mockDb.nonprofit.findMany.mockResolvedValue([]);

      const result = await getVerifiedNonprofits();

      expect(result.success).toBe(true);
      expect(result.nonprofits).toEqual([]);
    });

    it('should handle database errors gracefully', async () => {
      mockDb.nonprofit.findMany.mockRejectedValue(new Error('Database connection failed'));

      const result = await getVerifiedNonprofits();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to load nonprofits');
      expect(result.nonprofits).toEqual([]);
    });
  });
});
