import { useState, useCallback, useEffect } from 'react';
import type { CrewRoster } from '@/lib/pdfParser';
import type { ComplianceResult, GymRecommendation } from '@/lib/complianceEngine';

export interface AnalysisRecord {
  id: string;
  rosterMonth: string; // YYYY-MM
  roster: CrewRoster;
  compliance: ComplianceResult;
  gym: GymRecommendation[];
  savedAt: number; // timestamp
}

const STORAGE_KEY = 'crewcheck_analysis_history';

/**
 * Hook to manage local analysis history using localStorage
 * Allows users to compare previous months and track trends
 */
export function useAnalysisHistory() {
  const [history, setHistory] = useState<AnalysisRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setHistory(Array.isArray(parsed) ? parsed : []);
      }
    } catch (error) {
      console.error('Error loading analysis history:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Save a new analysis to history
   */
  const saveAnalysis = useCallback(
    (roster: CrewRoster, compliance: ComplianceResult, gym: GymRecommendation[]) => {
      try {
        const newRecord: AnalysisRecord = {
          id: `analysis_${Date.now()}`,
          rosterMonth: `${roster.year}-${String(roster.month).padStart(2, '0')}`,
          roster,
          compliance,
          gym,
          savedAt: Date.now(),
        };

        const updated = [newRecord, ...history];
        // Keep only last 12 months of history
        const trimmed = updated.slice(0, 12);
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
        setHistory(trimmed);
        return newRecord.id;
      } catch (error) {
        console.error('Error saving analysis:', error);
        throw error;
      }
    },
    [history]
  );

  /**
   * Get analyses for a specific month
   */
  const getByMonth = useCallback(
    (month: string): AnalysisRecord[] => {
      return history.filter((record) => record.rosterMonth === month);
    },
    [history]
  );

  /**
   * Get all analyses grouped by month
   */
  const getGroupedByMonth = useCallback((): Record<string, AnalysisRecord[]> => {
    const grouped: Record<string, AnalysisRecord[]> = {};
    history.forEach((record) => {
      if (!grouped[record.rosterMonth]) {
        grouped[record.rosterMonth] = [];
      }
      grouped[record.rosterMonth].push(record);
    });
    return grouped;
  }, [history]);

  /**
   * Delete an analysis record
   */
  const deleteAnalysis = useCallback(
    (id: string) => {
      try {
        const updated = history.filter((record) => record.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        setHistory(updated);
      } catch (error) {
        console.error('Error deleting analysis:', error);
        throw error;
      }
    },
    [history]
  );

  /**
   * Clear all history
   */
  const clearHistory = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setHistory([]);
    } catch (error) {
      console.error('Error clearing history:', error);
      throw error;
    }
  }, []);

  return {
    history,
    isLoading,
    saveAnalysis,
    getByMonth,
    getGroupedByMonth,
    deleteAnalysis,
    clearHistory,
  };
}
