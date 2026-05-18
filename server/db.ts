import { db } from './_core/db';
import { 
  analysisHistory, 
  anonymousStatistics, 
  anonymousConsentLog,
  type InsertAnalysisHistory,
  type InsertAnonymousStatistics,
  type InsertAnonymousConsentLog,
} from '../drizzle/schema';
import { eq, and, desc, gte, lte } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

/**
 * Analysis History Helpers
 */
export async function saveAnalysisHistory(data: InsertAnalysisHistory) {
  return db.insert(analysisHistory).values(data);
}

export async function getUserAnalysisHistory(userId: string) {
  return db
    .select()
    .from(analysisHistory)
    .where(eq(analysisHistory.userId, userId))
    .orderBy(desc(analysisHistory.createdAt));
}

export async function getAnalysisHistoryByMonth(userId: string, month: string) {
  return db
    .select()
    .from(analysisHistory)
    .where(
      and(
        eq(analysisHistory.userId, userId),
        eq(analysisHistory.rosterMonth, month)
      )
    )
    .orderBy(desc(analysisHistory.createdAt));
}

/**
 * Anonymous Statistics Helpers
 */
export async function saveAnonymousStatistics(data: InsertAnonymousStatistics) {
  return db.insert(anonymousStatistics).values(data);
}

export async function getStatisticsByFunctionAndBase(
  func: string,
  base: string,
  month?: string,
  airline?: string
) {
  const conditions = [
    eq(anonymousStatistics.function, func),
    eq(anonymousStatistics.base, base),
  ];

  if (airline) {
    conditions.push(eq(anonymousStatistics.airline, airline));
  }

  const monthCondition = month ? eq(anonymousStatistics.rosterMonth, month) : null;
  
  const allConditions = monthCondition 
    ? [...conditions, monthCondition]
    : conditions;

  return db
    .select()
    .from(anonymousStatistics)
    .where(and(...allConditions))
    .orderBy(desc(anonymousStatistics.createdAt));
}

export async function getStatisticsByFunction(func: string, month?: string) {
  let conditions = [eq(anonymousStatistics.function, func)];
  
  if (month) {
    conditions.push(eq(anonymousStatistics.rosterMonth, month));
  }

  return db
    .select()
    .from(anonymousStatistics)
    .where(and(...conditions))
    .orderBy(desc(anonymousStatistics.createdAt));
}

export async function getAllStatisticsForMonth(month: string) {
  return db
    .select()
    .from(anonymousStatistics)
    .where(eq(anonymousStatistics.rosterMonth, month))
    .orderBy(desc(anonymousStatistics.createdAt));
}

/**
 * Anonymous Consent Log Helpers
 */
export async function logConsentDecision(data: InsertAnonymousConsentLog) {
  return db.insert(anonymousConsentLog).values(data);
}

export async function getUserConsentHistory(userId: string) {
  return db
    .select()
    .from(anonymousConsentLog)
    .where(eq(anonymousConsentLog.userId, userId))
    .orderBy(desc(anonymousConsentLog.createdAt));
}

export async function hasUserConsentedForAnalysis(analysisId: string) {
  const result = await db
    .select()
    .from(anonymousConsentLog)
    .where(eq(anonymousConsentLog.analysisId, analysisId));
  
  return result.length > 0 ? result[0].consentGiven : null;
}

/**
 * Admin Statistics Reset
 */
export async function resetAnonymousStatistics() {
  // Delete all records from anonymousStatistics table
  return db.delete(anonymousStatistics);
}

export async function resetAnonymousConsentLog() {
  // Delete all records from anonymousConsentLog table
  return db.delete(anonymousConsentLog);
}
