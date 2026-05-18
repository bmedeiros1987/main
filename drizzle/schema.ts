import { mysqlTable, varchar, text, int, decimal, timestamp, boolean, json, index } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

/**
 * Local Analysis History - stores user's past analyses
 * Each analysis is a snapshot of roster + compliance results
 */
export const analysisHistory = mysqlTable(
  'analysis_history',
  {
    id: varchar('id', { length: 36 }).primaryKey().default(sql`(UUID())`),
    userId: varchar('user_id', { length: 255 }).notNull(),
    rosterMonth: varchar('roster_month', { length: 7 }).notNull(), // YYYY-MM format
    rosterData: json('roster_data').notNull(), // Full CrewRoster object
    complianceData: json('compliance_data').notNull(), // Full ComplianceResult object
    gymRecommendations: json('gym_recommendations'), // GymRecommendation[] or null
    exportedAt: timestamp('exported_at').default(sql`CURRENT_TIMESTAMP`),
    createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    userIdIdx: index('idx_user_id').on(table.userId),
    monthIdx: index('idx_roster_month').on(table.rosterMonth),
  })
);

/**
 * Anonymous Statistics - aggregated data by crew function
 * Stores anonymous metrics to show industry averages
 * Submission is opt-in and contains NO personal data
 */
export const anonymousStatistics = mysqlTable(
  'anonymous_statistics',
  {
    id: varchar('id', { length: 36 }).primaryKey().default(sql`(UUID())`),
    
    // Function/role classification
    function: varchar('function', { length: 50 }).notNull(), // 'pilot', 'ccm', 'fa', etc.
    base: varchar('base', { length: 10 }).notNull(), // Airport code (e.g., 'GIG', 'CGH')
    airline: varchar('airline', { length: 100 }).notNull(), // Airline name (e.g., 'LATAM', 'Azul', 'Gol')
    
    // Flight metrics
    totalFlightHours: decimal('total_flight_hours', { precision: 10, scale: 2 }).notNull(),
    flightLegsCount: int('flight_legs_count').notNull(),
    avgFlightDuration: decimal('avg_flight_duration', { precision: 8, scale: 2 }).notNull(), // minutes
    
    // Rest & Duty metrics
    avgDailyDutyTime: decimal('avg_daily_duty_time', { precision: 8, scale: 2 }).notNull(), // minutes
    avgNightFlights: decimal('avg_night_flights', { precision: 5, scale: 2 }).notNull(),
    avgRestDays: decimal('avg_rest_days', { precision: 5, scale: 2 }).notNull(),
    
    // Compliance metrics
    complianceScore: decimal('compliance_score', { precision: 5, scale: 2 }).notNull(), // 0-100
    hasViolations: boolean('has_violations').notNull().default(false),
    hasWarnings: boolean('has_warnings').notNull().default(false),
    
    // Gym recommendations
    avgGymDaysPerMonth: decimal('avg_gym_days_per_month', { precision: 5, scale: 2 }).notNull(),
    
    // Sample size for this aggregation
    sampleCount: int('sample_count').notNull().default(1),
    
    // Metadata
    rosterMonth: varchar('roster_month', { length: 7 }).notNull(), // YYYY-MM
    createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`).onUpdateNow(),
  },
  (table) => ({
    functionBaseAirlineIdx: index('idx_function_base_airline').on(table.function, table.base, table.airline),
    monthIdx: index('idx_month').on(table.rosterMonth),
    airlineIdx: index('idx_airline').on(table.airline),
  })
);

/**
 * Opt-in Consent - tracks which users have opted in to share anonymous data
 * This is separate from the statistics table to allow future opt-out
 */
export const anonymousConsentLog = mysqlTable(
  'anonymous_consent_log',
  {
    id: varchar('id', { length: 36 }).primaryKey().default(sql`(UUID())`),
    userId: varchar('user_id', { length: 255 }).notNull(),
    analysisId: varchar('analysis_id', { length: 36 }).notNull(),
    consentGiven: boolean('consent_given').notNull(),
    rosterMonth: varchar('roster_month', { length: 7 }).notNull(),
    createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    userIdIdx: index('idx_user_id').on(table.userId),
    analysisIdIdx: index('idx_analysis_id').on(table.analysisId),
  })
);

// Type exports for use in application code
export type AnalysisHistory = typeof analysisHistory.$inferSelect;
export type InsertAnalysisHistory = typeof analysisHistory.$inferInsert;

export type AnonymousStatistics = typeof anonymousStatistics.$inferSelect;
export type InsertAnonymousStatistics = typeof anonymousStatistics.$inferInsert;

export type AnonymousConsentLog = typeof anonymousConsentLog.$inferSelect;
export type InsertAnonymousConsentLog = typeof anonymousConsentLog.$inferInsert;
