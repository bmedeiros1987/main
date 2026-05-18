import { z } from 'zod';
import { initTRPC } from '@trpc/server';
import {

  saveAnalysisHistory,
  getUserAnalysisHistory,
  getAnalysisHistoryByMonth,
  saveAnonymousStatistics,
  getStatisticsByFunctionAndBase,
  getStatisticsByFunction,
  getAllStatisticsForMonth,
  logConsentDecision,
  getUserConsentHistory,
  resetAnonymousStatistics,
  resetAnonymousConsentLog,
} from './db';

// Initialize tRPC
const t = initTRPC.create();
const router = t.router;
const publicProcedure = t.procedure;

/**
 * CrewCheck tRPC Router
 * Handles analysis history, anonymous statistics, and consent management
 */
export const appRouter = router({
  /**
   * Analysis History Procedures
   */
  analysis: router({
    /**
     * Save a new analysis to history
     * Called after PDF parsing and compliance analysis
     */
    saveHistory: publicProcedure
      .input(
        z.object({
          userId: z.string(),
          rosterMonth: z.string(), // YYYY-MM format
          rosterData: z.any(), // CrewRoster object
          complianceData: z.any(), // ComplianceResult object
          gymRecommendations: z.any().optional(), // GymRecommendation[]
        })
      )
      .mutation(async ({ input }) => {
        try {
          await saveAnalysisHistory({
            userId: input.userId,
            rosterMonth: input.rosterMonth,
            rosterData: input.rosterData,
            complianceData: input.complianceData,
            gymRecommendations: input.gymRecommendations,
          });
          return { success: true };
        } catch (error) {
          console.error('Error saving analysis history:', error);
          throw new Error('Failed to save analysis history');
        }
      }),

    /**
     * Get all analyses for a user
     */
    getHistory: publicProcedure
      .input(z.object({ userId: z.string() }))
      .query(async ({ input }) => {
        try {
          const history = await getUserAnalysisHistory(input.userId);
          return history;
        } catch (error) {
          console.error('Error fetching analysis history:', error);
          throw new Error('Failed to fetch analysis history');
        }
      }),

    /**
     * Get analyses for a specific month
     */
    getByMonth: publicProcedure
      .input(
        z.object({
          userId: z.string(),
          month: z.string(), // YYYY-MM
        })
      )
      .query(async ({ input }) => {
        try {
          const history = await getAnalysisHistoryByMonth(input.userId, input.month);
          return history;
        } catch (error) {
          console.error('Error fetching analysis history by month:', error);
          throw new Error('Failed to fetch analysis history');
        }
      }),
  }),

  /**
   * Anonymous Statistics Procedures
   */
  statistics: router({
    /**
     * Submit anonymous statistics
     * Called when user consents to share data
     */
    submit: publicProcedure
      .input(
        z.object({
          function: z.string(), // 'pilot', 'ccm', 'fa', etc.
          base: z.string(), // Airport code
          airline: z.string(), // Airline name
          totalFlightHours: z.number(),
          flightLegsCount: z.number(),
          avgFlightDuration: z.number(), // minutes
          avgDailyDutyTime: z.number(), // minutes
          avgNightFlights: z.number(),
          avgRestDays: z.number(),
          complianceScore: z.number(), // 0-100
          hasViolations: z.boolean(),
          hasWarnings: z.boolean(),
          avgGymDaysPerMonth: z.number(),
          rosterMonth: z.string(), // YYYY-MM
        })
      )
      .mutation(async ({ input }) => {
        try {
          await saveAnonymousStatistics({
            function: input.function,
            base: input.base,
            airline: input.airline,
            totalFlightHours: input.totalFlightHours.toString(),
            flightLegsCount: input.flightLegsCount,
            avgFlightDuration: input.avgFlightDuration.toString(),
            avgDailyDutyTime: input.avgDailyDutyTime.toString(),
            avgNightFlights: input.avgNightFlights.toString(),
            avgRestDays: input.avgRestDays.toString(),
            complianceScore: input.complianceScore.toString(),
            hasViolations: input.hasViolations,
            hasWarnings: input.hasWarnings,
            avgGymDaysPerMonth: input.avgGymDaysPerMonth.toString(),
            rosterMonth: input.rosterMonth,
          });
          return { success: true };
        } catch (error) {
          console.error('Error submitting anonymous statistics:', error);
          throw new Error('Failed to submit anonymous statistics');
        }
      }),

    /**
     * Get statistics for a specific function and base
     */
    getByFunctionAndBase: publicProcedure
      .input(
        z.object({
          function: z.string(),
          base: z.string(),
          airline: z.string().optional(), // Filter by airline
          month: z.string().optional(), // YYYY-MM
        })
      )
      .query(async ({ input }) => {
        try {
          const stats = await getStatisticsByFunctionAndBase(
            input.function,
            input.base,
            input.month,
            input.airline
          );
          return stats;
        } catch (error) {
          console.error('Error fetching statistics:', error);
          throw new Error('Failed to fetch statistics');
        }
      }),

    /**
     * Get statistics for a specific function (all bases)
     */
    getByFunction: publicProcedure
      .input(
        z.object({
          function: z.string(),
          month: z.string().optional(), // YYYY-MM
        })
      )
      .query(async ({ input }) => {
        try {
          const stats = await getStatisticsByFunction(input.function, input.month);
          return stats;
        } catch (error) {
          console.error('Error fetching statistics:', error);
          throw new Error('Failed to fetch statistics');
        }
      }),

    /**
     * Get all statistics for a month
     */
    getByMonth: publicProcedure
      .input(z.object({ month: z.string() }))
      .query(async ({ input }) => {
        try {
          const stats = await getAllStatisticsForMonth(input.month);
          return stats;
        } catch (error) {
          console.error('Error fetching statistics:', error);
          throw new Error('Failed to fetch statistics');
        }
      }),
  }),

  /**
   * Consent Management Procedures
   */
  consent: router({
    /**
     * Log user's consent decision for sharing anonymous data
     */
    logDecision: publicProcedure
      .input(
        z.object({
          userId: z.string(),
          analysisId: z.string(),
          consentGiven: z.boolean(),
          rosterMonth: z.string(), // YYYY-MM
        })
      )
      .mutation(async ({ input }) => {
        try {
          await logConsentDecision({
            userId: input.userId,
            analysisId: input.analysisId,
            consentGiven: input.consentGiven,
            rosterMonth: input.rosterMonth,
          });
          return { success: true };
        } catch (error) {
          console.error('Error logging consent:', error);
          throw new Error('Failed to log consent');
        }
      }),

    /**
     * Get user's consent history
     */
    getHistory: publicProcedure
      .input(z.object({ userId: z.string() }))
      .query(async ({ input }) => {
        try {
          const history = await getUserConsentHistory(input.userId);
          return history;
        } catch (error) {
          console.error('Error fetching consent history:', error);
          throw new Error('Failed to fetch consent history');
        }
      }),
  }),

  /**
   * Admin Procedures for Statistics Management
   */
  admin: router({
    /**
     * Reset all statistics (admin only)
     * Clears both anonymous statistics and consent logs
     * Requires valid ADMIN_RESET_KEY environment variable
     */
    resetStatistics: publicProcedure
      .input(
        z.object({
          adminKey: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          // Verify admin key from environment
          const adminKey = process.env.ADMIN_RESET_KEY;
          if (!adminKey || input.adminKey !== adminKey) {
            throw new Error('Unauthorized: Invalid admin key');
          }

          // Reset both statistics and consent logs
          await resetAnonymousStatistics();
          await resetAnonymousConsentLog();

          console.log('Admin: Statistics and consent logs reset successfully');
          return {
            success: true,
            message: 'All anonymous statistics and consent logs have been reset to zero',
          };
        } catch (error) {
          console.error('Error resetting statistics:', error);
          throw new Error(
            `Failed to reset statistics: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      }),

    /**
     * Get all airlines with data
     */
    getAirlines: publicProcedure.query(async () => {
      try {
        return ['LATAM', 'Azul', 'Gol', 'Avianca', 'Passaredo', 'Trip', 'Total'];
      } catch (error) {
        console.error('Error fetching airlines:', error);
        throw new Error('Failed to fetch airlines');
      }
    }),
  }),
});

export type AppRouter = typeof appRouter;
