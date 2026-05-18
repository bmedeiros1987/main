import { useCallback } from 'react';
import type { CrewRoster } from '@/lib/pdfParser';
import type { ComplianceResult } from '@/lib/complianceEngine';

interface AnonymousStatistics {
  function: string;
  base: string;
  totalFlightHours: number;
  flightLegsCount: number;
  avgFlightDuration: number;
  avgDailyDutyTime: number;
  avgNightFlights: number;
  avgRestDays: number;
  complianceScore: number;
  hasViolations: boolean;
  hasWarnings: boolean;
  avgGymDaysPerMonth: number;
  rosterMonth: string;
}

const CONSENT_STORAGE_KEY = 'crewcheck_consent_history';
const LAST_CONSENT_KEY = 'crewcheck_last_consent';

export function useAnonymousStatistics() {
  /**
   * Check if user has given consent to share anonymous data
   */
  const hasUserConsented = useCallback((): boolean => {
    const consentHistory = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!consentHistory) return false;
    
    try {
      const history = JSON.parse(consentHistory) as Array<{ consent: boolean; timestamp: number }>;
      // Get the most recent consent decision
      const lastConsent = history[history.length - 1];
      return lastConsent?.consent ?? false;
    } catch {
      return false;
    }
  }, []);

  /**
   * Extract function from crew roster (Pilot, CCM, FA, etc.)
   */
  const extractFunction = useCallback((roster: CrewRoster): string => {
    const crewId = roster.crewId?.toLowerCase() || '';
    const rank = roster.rank?.toLowerCase() || '';
    
    if (crewId.includes('pilot') || rank.includes('captain') || rank.includes('first officer')) {
      return 'pilot';
    }
    if (crewId.includes('ccm') || rank.includes('ccm') || rank.includes('chief')) {
      return 'ccm';
    }
    if (crewId.includes('fa') || rank.includes('flight attendant')) {
      return 'fa';
    }
    
    return 'other';
  }, []);

  /**
   * Calculate anonymous statistics from roster and compliance data
   */
  const calculateStatistics = useCallback(
    (roster: CrewRoster, compliance: ComplianceResult): AnonymousStatistics => {
      const totalFlightHours = roster.days.reduce((sum, day) => sum + (day.flyingHours || 0), 0);
      const flightLegs = roster.days.filter(d => d.type === 'VOO').length;
      const avgFlightDuration = flightLegs > 0 ? totalFlightHours / flightLegs : 0;
      const avgDailyDutyTime = roster.days.length > 0 
        ? roster.days.reduce((sum, day) => sum + (day.dutyHours || 0), 0) / roster.days.length 
        : 0;
      
      const nightFlights = roster.days.filter(d => 
        d.legs.some(leg => {
          const depHour = parseInt(leg.departureTime.split(':')[0]);
          return depHour >= 22 || depHour < 6;
        })
      ).length;
      
      const avgNightFlights = roster.days.length > 0 ? nightFlights / (roster.days.length / 30) : 0;
      const avgRestDays = compliance.metrics.restDays || 0;
      
      // Calculate compliance score (0-100)
      const errorCount = compliance.alerts.filter(a => a.severity === 'error').length;
      const warningCount = compliance.alerts.filter(a => a.severity === 'warning').length;
      const complianceScore = Math.max(0, 100 - (errorCount * 10 + warningCount * 5));
      
      const hasViolations = compliance.overallStatus === 'violation';
      const hasWarnings = compliance.overallStatus === 'warning';
      
      const rosterMonth = `${roster.year}-${String(roster.month).padStart(2, '0')}`;
      
      return {
        function: extractFunction(roster),
        base: roster.base,
        totalFlightHours,
        flightLegsCount: flightLegs,
        avgFlightDuration,
        avgDailyDutyTime,
        avgNightFlights,
        avgRestDays,
        complianceScore,
        hasViolations,
        hasWarnings,
        avgGymDaysPerMonth: 0, // Would need gym data to calculate
        rosterMonth,
      };
    },
    [extractFunction]
  );

  /**
   * Submit anonymous statistics if user has consented
   */
  const submitStatisticsIfConsented = useCallback(
    async (roster: CrewRoster, compliance: ComplianceResult): Promise<boolean> => {
      if (!hasUserConsented()) {
        return false;
      }

      try {
        const stats = calculateStatistics(roster, compliance);
        
        // In a real implementation, this would call the tRPC endpoint
        // For now, we just log it to localStorage as a proof of concept
        const submissions = JSON.parse(localStorage.getItem('crewcheck_stat_submissions') || '[]');
        submissions.push({
          ...stats,
          submittedAt: Date.now(),
        });
        localStorage.setItem('crewcheck_stat_submissions', JSON.stringify(submissions));
        
        return true;
      } catch (error) {
        console.error('Error submitting anonymous statistics:', error);
        return false;
      }
    },
    [hasUserConsented, calculateStatistics]
  );

  /**
   * Get the last consent decision
   */
  const getLastConsentDecision = useCallback((): boolean | null => {
    const consentHistory = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!consentHistory) return null;
    
    try {
      const history = JSON.parse(consentHistory) as Array<{ consent: boolean; timestamp: number }>;
      return history[history.length - 1]?.consent ?? null;
    } catch {
      return null;
    }
  }, []);

  return {
    hasUserConsented,
    calculateStatistics,
    submitStatisticsIfConsented,
    getLastConsentDecision,
    extractFunction,
  };
}
