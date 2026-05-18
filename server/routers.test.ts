import { describe, it, expect, beforeEach, vi } from 'vitest';
import { appRouter } from './routers';
import * as db from './db';

// Mock database functions
vi.mock('./db', () => ({
  saveAnalysisHistory: vi.fn(),
  getUserAnalysisHistory: vi.fn(),
  getAnalysisHistoryByMonth: vi.fn(),
  saveAnonymousStatistics: vi.fn(),
  getStatisticsByFunctionAndBase: vi.fn(),
  getStatisticsByFunction: vi.fn(),
  getAllStatisticsForMonth: vi.fn(),
  logConsentDecision: vi.fn(),
  getUserConsentHistory: vi.fn(),
  resetAnonymousStatistics: vi.fn(),
  resetAnonymousConsentLog: vi.fn(),
}));

describe('tRPC Routers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('analysis router', () => {
    it('should save analysis history', async () => {
      const caller = appRouter.createCaller({});
      const mockInput = {
        userId: 'user123',
        rosterMonth: '2026-05',
        rosterData: { month: 5, year: 2026 },
        complianceData: { overallStatus: 'compliant' },
        gymRecommendations: [],
      };

      vi.mocked(db.saveAnalysisHistory).mockResolvedValueOnce(undefined);

      const result = await caller.analysis.saveHistory(mockInput);

      expect(result).toEqual({ success: true });
      expect(db.saveAnalysisHistory).toHaveBeenCalledWith(mockInput);
    });

    it('should get analysis history for user', async () => {
      const caller = appRouter.createCaller({});
      const mockHistory = [
        {
          id: 'analysis1',
          userId: 'user123',
          rosterMonth: '2026-05',
          rosterData: {},
          complianceData: {},
          gymRecommendations: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(db.getUserAnalysisHistory).mockResolvedValueOnce(mockHistory as any);

      const result = await caller.analysis.getHistory({ userId: 'user123' });

      expect(result).toEqual(mockHistory);
      expect(db.getUserAnalysisHistory).toHaveBeenCalledWith('user123');
    });

    it('should get analysis history by month', async () => {
      const caller = appRouter.createCaller({});
      const mockHistory = [
        {
          id: 'analysis1',
          userId: 'user123',
          rosterMonth: '2026-05',
          rosterData: {},
          complianceData: {},
          gymRecommendations: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(db.getAnalysisHistoryByMonth).mockResolvedValueOnce(mockHistory as any);

      const result = await caller.analysis.getByMonth({
        userId: 'user123',
        month: '2026-05',
      });

      expect(result).toEqual(mockHistory);
      expect(db.getAnalysisHistoryByMonth).toHaveBeenCalledWith('user123', '2026-05');
    });
  });

  describe('statistics router', () => {
    it('should submit anonymous statistics', async () => {
      const caller = appRouter.createCaller({});
      const mockInput = {
        function: 'pilot',
        base: 'GIG',
        airline: 'LATAM',
        totalFlightHours: 150,
        flightLegsCount: 30,
        avgFlightDuration: 300,
        avgDailyDutyTime: 480,
        avgNightFlights: 5,
        avgRestDays: 8,
        complianceScore: 95,
        hasViolations: false,
        hasWarnings: true,
        avgGymDaysPerMonth: 12,
        rosterMonth: '2026-05',
      };

      vi.mocked(db.saveAnonymousStatistics).mockResolvedValueOnce(undefined);

      const result = await caller.statistics.submit(mockInput);

      expect(result).toEqual({ success: true });
      expect(db.saveAnonymousStatistics).toHaveBeenCalled();
    });

    it('should get statistics by function and base', async () => {
      const caller = appRouter.createCaller({});
      const mockStats = [
        {
          id: 'stat1',
          function: 'pilot',
          base: 'GIG',
          airline: 'LATAM',
          totalFlightHours: '150',
          flightLegsCount: 30,
          avgFlightDuration: '300',
          avgDailyDutyTime: '480',
          avgNightFlights: '5',
          avgRestDays: '8',
          complianceScore: '95',
          hasViolations: false,
          hasWarnings: true,
          avgGymDaysPerMonth: '12',
          sampleCount: 1,
          rosterMonth: '2026-05',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(db.getStatisticsByFunctionAndBase).mockResolvedValueOnce(mockStats as any);

      const result = await caller.statistics.getByFunctionAndBase({
        function: 'pilot',
        base: 'GIG',
      });

      expect(result).toEqual(mockStats);
      expect(db.getStatisticsByFunctionAndBase).toHaveBeenCalledWith(
        'pilot',
        'GIG',
        undefined,
        undefined
      );
    });

    it('should get statistics by function', async () => {
      const caller = appRouter.createCaller({});
      const mockStats = [];

      vi.mocked(db.getStatisticsByFunction).mockResolvedValueOnce(mockStats as any);

      const result = await caller.statistics.getByFunction({ function: 'pilot' });

      expect(result).toEqual(mockStats);
      expect(db.getStatisticsByFunction).toHaveBeenCalledWith('pilot', undefined);
    });

    it('should get statistics by month', async () => {
      const caller = appRouter.createCaller({});
      const mockStats = [];

      vi.mocked(db.getAllStatisticsForMonth).mockResolvedValueOnce(mockStats as any);

      const result = await caller.statistics.getByMonth({ month: '2026-05' });

      expect(result).toEqual(mockStats);
      expect(db.getAllStatisticsForMonth).toHaveBeenCalledWith('2026-05');
    });
  });

  describe('consent router', () => {
    it('should log consent decision', async () => {
      const caller = appRouter.createCaller({});
      const mockInput = {
        userId: 'user123',
        analysisId: 'analysis1',
        consentGiven: true,
        rosterMonth: '2026-05',
      };

      vi.mocked(db.logConsentDecision).mockResolvedValueOnce(undefined);

      const result = await caller.consent.logDecision(mockInput);

      expect(result).toEqual({ success: true });
      expect(db.logConsentDecision).toHaveBeenCalledWith(mockInput);
    });

    it('should get user consent history', async () => {
      const caller = appRouter.createCaller({});
      const mockHistory = [
        {
          id: 'consent1',
          userId: 'user123',
          analysisId: 'analysis1',
          consentGiven: true,
          rosterMonth: '2026-05',
          createdAt: new Date(),
        },
      ];

      vi.mocked(db.getUserConsentHistory).mockResolvedValueOnce(mockHistory as any);

      const result = await caller.consent.getHistory({ userId: 'user123' });

      expect(result).toEqual(mockHistory);
      expect(db.getUserConsentHistory).toHaveBeenCalledWith('user123');
    });
  });

  describe('admin router', () => {
    beforeEach(() => {
      // Set admin key for testing
      process.env.ADMIN_RESET_KEY = 'test-admin-key-12345';
    });

    it('should reset statistics with valid admin key', async () => {
      const caller = appRouter.createCaller({});

      vi.mocked(db.resetAnonymousStatistics).mockResolvedValueOnce(undefined);
      vi.mocked(db.resetAnonymousConsentLog).mockResolvedValueOnce(undefined);

      const result = await caller.admin.resetStatistics({
        adminKey: 'test-admin-key-12345',
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain('reset to zero');
      expect(db.resetAnonymousStatistics).toHaveBeenCalled();
      expect(db.resetAnonymousConsentLog).toHaveBeenCalled();
    });

    it('should reject reset with invalid admin key', async () => {
      const caller = appRouter.createCaller({});

      await expect(
        caller.admin.resetStatistics({
          adminKey: 'wrong-key',
        })
      ).rejects.toThrow('Unauthorized');

      expect(db.resetAnonymousStatistics).not.toHaveBeenCalled();
      expect(db.resetAnonymousConsentLog).not.toHaveBeenCalled();
    });

    it('should get airlines list', async () => {
      const caller = appRouter.createCaller({});

      const result = await caller.admin.getAirlines();

      expect(Array.isArray(result)).toBe(true);
      expect(result).toContain('LATAM');
      expect(result).toContain('Azul');
      expect(result).toContain('Gol');
    });
  });
});
