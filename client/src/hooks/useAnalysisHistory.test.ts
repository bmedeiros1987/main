import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAnalysisHistory } from './useAnalysisHistory';
import type { CrewRoster } from '@/lib/pdfParser';
import type { ComplianceResult, GymRecommendation } from '@/lib/complianceEngine';

// Mock data
const mockRoster: CrewRoster = {
  month: 5,
  year: 2026,
  crewName: 'Test Pilot',
  rank: 'Captain',
  base: 'GIG',
  totalFlightHours: 85.5,
  flights: [
    {
      date: '2026-05-01',
      departure: 'GIG',
      arrival: 'CGH',
      departureTime: '08:00',
      arrivalTime: '10:30',
      duration: 150,
      isNight: false,
    },
  ],
};

const mockCompliance: ComplianceResult = {
  overallStatus: 'compliant',
  alerts: [],
  metrics: {
    totalFlightHours: 85.5,
    maxFlightHours: 100,
    totalDutyTime: 420,
    maxDutyTime: 600,
    nightFlights: 0,
    maxNightFlights: 10,
    restDays: 4,
    minRestDays: 4,
  },
};

const mockGym: GymRecommendation[] = [
  {
    date: '2026-05-02',
    startTime: '12:00',
    endTime: '13:00',
    reason: 'Rest day',
    location: 'Base',
  },
];

describe('useAnalysisHistory', () => {
  beforeEach(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  afterEach(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  it('should initialize with empty history', () => {
    const { result } = renderHook(() => useAnalysisHistory());
    expect(result.current.history).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it('should save analysis to history', async () => {
    const { result } = renderHook(() => useAnalysisHistory());

    let recordId = '';
    act(() => {
      recordId = result.current.saveAnalysis(mockRoster, mockCompliance, mockGym);
    });

    await waitFor(() => {
      expect(recordId).toBeTruthy();
    });

    expect(result.current.history.length).toBeGreaterThan(0);
    expect(result.current.history[0].roster).toEqual(mockRoster);
  });

  it('should persist history to localStorage', async () => {
    const { result } = renderHook(() => useAnalysisHistory());

    act(() => {
      result.current.saveAnalysis(mockRoster, mockCompliance, mockGym);
    });

    await waitFor(() => {
      const stored = localStorage.getItem('crewcheck_analysis_history');
      expect(stored).toBeTruthy();
    });
  });

  it('should load history from localStorage on mount', async () => {
    const testData = [
      {
        id: 'test_1',
        rosterMonth: '2026-05',
        roster: mockRoster,
        compliance: mockCompliance,
        gym: mockGym,
        savedAt: Date.now(),
      },
    ];

    localStorage.setItem('crewcheck_analysis_history', JSON.stringify(testData));

    const { result } = renderHook(() => useAnalysisHistory());

    await waitFor(() => {
      expect(result.current.history.length).toBeGreaterThan(0);
    });
  });

  it('should get analyses by month', async () => {
    const { result } = renderHook(() => useAnalysisHistory());

    act(() => {
      result.current.saveAnalysis(mockRoster, mockCompliance, mockGym);
    });

    await waitFor(() => {
      const byMonth = result.current.getByMonth('2026-05');
      expect(byMonth.length).toBeGreaterThan(0);
    });
  });

  it('should return empty array for non-existent month', async () => {
    const { result } = renderHook(() => useAnalysisHistory());

    act(() => {
      result.current.saveAnalysis(mockRoster, mockCompliance, mockGym);
    });

    await waitFor(() => {
      const byMonth = result.current.getByMonth('2026-06');
      expect(byMonth).toHaveLength(0);
    });
  });

  it('should delete analysis record', async () => {
    const { result } = renderHook(() => useAnalysisHistory());

    let recordId = '';
    act(() => {
      recordId = result.current.saveAnalysis(mockRoster, mockCompliance, mockGym);
    });

    await waitFor(() => {
      expect(result.current.history.length).toBeGreaterThan(0);
    });

    act(() => {
      result.current.deleteAnalysis(recordId);
    });

    await waitFor(() => {
      expect(result.current.history).toHaveLength(0);
    });
  });

  it('should clear all history', async () => {
    const { result } = renderHook(() => useAnalysisHistory());

    act(() => {
      result.current.saveAnalysis(mockRoster, mockCompliance, mockGym);
    });

    await waitFor(() => {
      expect(result.current.history.length).toBeGreaterThan(0);
    });

    act(() => {
      result.current.clearHistory();
    });

    await waitFor(() => {
      expect(result.current.history).toHaveLength(0);
      expect(localStorage.getItem('crewcheck_analysis_history')).toBeNull();
    });
  });

  it('should keep only last 12 months of history', async () => {
    const { result } = renderHook(() => useAnalysisHistory());

    act(() => {
      for (let i = 0; i < 15; i++) {
        result.current.saveAnalysis(mockRoster, mockCompliance, mockGym);
      }
    });

    await waitFor(() => {
      expect(result.current.history.length).toBeLessThanOrEqual(12);
    });
  });

  it('should group analyses by month', async () => {
    const { result } = renderHook(() => useAnalysisHistory());

    act(() => {
      result.current.saveAnalysis(mockRoster, mockCompliance, mockGym);
    });

    await waitFor(() => {
      const grouped = result.current.getGroupedByMonth();
      expect(grouped['2026-05']).toBeDefined();
    });
  });
});
