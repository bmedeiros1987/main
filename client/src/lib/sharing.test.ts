import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateShareMessage, copyToClipboard } from './sharing';
import type { CrewRoster } from './pdfParser';
import type { ComplianceResult } from './complianceEngine';

const mockRoster: CrewRoster = {
  month: 5,
  year: 2026,
  crewName: 'João Silva',
  crewId: 'CR123',
  rank: 'Captain',
  base: 'GIG',
  rawText: '',
  days: [
    {
      date: '01/05/2026',
      dayOfWeek: 'Wed',
      type: 'VOO',
      pairingCode: 'AA100',
      dutyReport: '06:00',
      dutyDebrief: '12:00',
      legs: [
        {
          flightNumber: 'AA100',
          origin: 'GIG',
          destination: 'CGH',
          departureTime: '08:00',
          arrivalTime: '10:30',
          workType: 'OP',
        },
      ],
      dutyHours: 6,
      flyingHours: 2.5,
      isNextDay: false,
      hotel: null,
      base: 'GIG',
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

describe('sharing utilities', () => {
  describe('generateShareMessage', () => {
    it('should generate a message with compliant status', () => {
      const message = generateShareMessage(mockRoster, mockCompliance);

      expect(message).toContain('CrewCheck');
      expect(message).toContain('Maio 2026');
      expect(message).toContain('João Silva');
      expect(message).toContain('Captain');
      expect(message).toContain('GIG');
      expect(message).toContain('2.5h');
      expect(message).toContain('✅ CONFORME');
    });

    it('should generate a message with violation status', () => {
      const violationCompliance: ComplianceResult = {
        ...mockCompliance,
        overallStatus: 'violation',
      };

      const message = generateShareMessage(mockRoster, violationCompliance);

      expect(message).toContain('🚨 IRREGULARIDADES ENCONTRADAS');
    });

    it('should generate a message with warning status', () => {
      const warningCompliance: ComplianceResult = {
        ...mockCompliance,
        overallStatus: 'warning',
      };

      const message = generateShareMessage(mockRoster, warningCompliance);

      expect(message).toContain('⚠️ ATENÇÃO');
    });

    it('should include flight count', () => {
      const message = generateShareMessage(mockRoster, mockCompliance);

      expect(message).toContain('Voos: 1');
    });

    it('should include error and warning counts', () => {
      const complianceWithAlerts: ComplianceResult = {
        ...mockCompliance,
        alerts: [
          { severity: 'error', rule: 'test', message: 'Error 1' },
          { severity: 'error', rule: 'test', message: 'Error 2' },
          { severity: 'warning', rule: 'test', message: 'Warning 1' },
        ],
      };

      const message = generateShareMessage(mockRoster, complianceWithAlerts);

      expect(message).toContain('Irregularidades: 2');
      expect(message).toContain('Pontos de atenção: 1');
    });
  });

  describe('copyToClipboard', () => {
    beforeEach(() => {
      // Mock navigator.clipboard
      Object.assign(navigator, {
        clipboard: {
          writeText: vi.fn(() => Promise.resolve()),
        },
      });
    });

    it('should copy message to clipboard', async () => {
      const result = await copyToClipboard(mockRoster, mockCompliance);

      expect(result).toBe(true);
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
    });

    it('should return false on clipboard error', async () => {
      Object.assign(navigator, {
        clipboard: {
          writeText: vi.fn(() => Promise.reject(new Error('Clipboard error'))),
        },
      });

      const result = await copyToClipboard(mockRoster, mockCompliance);

      expect(result).toBe(false);
    });

    it('should copy the generated message', async () => {
      await copyToClipboard(mockRoster, mockCompliance);

      const message = generateShareMessage(mockRoster, mockCompliance);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(message);
    });
  });
});
