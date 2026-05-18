/**
 * Compliance Analysis Engine
 * Checks crew roster against RBAC 117, Lei do Aeronauta (13.475/2017) and CLT
 * 
 * Design: Sky Atlas / Cartographic Modernism
 */

import type { CrewRoster, RosterDay } from './pdfParser';

export type Severity = 'error' | 'warning' | 'info' | 'ok';

export interface ComplianceAlert {
  id: string;
  severity: Severity;
  category: string;
  title: string;
  description: string;
  legalReference: string;
  affectedDates: string[];
  details: string;
}

export interface ComplianceMetrics {
  totalFlightHours: number;
  maxFlightHoursMonth: number;
  totalDutyHours: number;
  maxDutyHoursMonth: number;
  totalDaysOff: number;
  minDaysOffRequired: number;
  totalStandby: number;
  maxStandbyMonth: number;
  nightOperations: number;
  maxNightOps168h: number;
  weekendPairs: number;
  minWeekendPairs: number;
}

export interface ComplianceResult {
  alerts: ComplianceAlert[];
  metrics: ComplianceMetrics;
  overallStatus: 'compliant' | 'warning' | 'violation';
  score: number; // 0-100
  summary: string;
}

export interface GymRecommendation {
  date: string;
  dayOfWeek: string;
  availability: 'ideal' | 'possible' | 'avoid';
  suggestedTime: string;
  reason: string;
}

// RBAC 117 Table B.1 - Max duty for simple crew, acclimated
const DUTY_LIMITS_TABLE: Record<string, Record<string, number>> = {
  '6': { '1-2': 11, '3-4': 11, '5': 10, '6': 9, '7+': 9 },
  '7': { '1-2': 13, '3-4': 12, '5': 11, '6': 10, '7+': 9 },
  '8-11': { '1-2': 13, '3-4': 13, '5': 12, '6': 11, '7+': 10 },
  '12-13': { '1-2': 12, '3-4': 12, '5': 11, '6': 10, '7+': 9 },
  '14-15': { '1-2': 11, '3-4': 11, '5': 10, '6': 9, '7+': 9 },
  '16-17': { '1-2': 10, '3-4': 10, '5': 9, '6': 9, '7+': 9 },
  '18-5': { '1-2': 9, '3-4': 9, '5': 9, '6': 9, '7+': 9 },
};

function getMaxDuty(startHour: number, legs: number): number {
  let hourKey = '18-5';
  if (startHour === 6) hourKey = '6';
  else if (startHour === 7) hourKey = '7';
  else if (startHour >= 8 && startHour <= 11) hourKey = '8-11';
  else if (startHour >= 12 && startHour <= 13) hourKey = '12-13';
  else if (startHour >= 14 && startHour <= 15) hourKey = '14-15';
  else if (startHour >= 16 && startHour <= 17) hourKey = '16-17';
  else hourKey = '18-5'; // 18-23 and 0-5

  let legKey = '1-2';
  if (legs <= 2) legKey = '1-2';
  else if (legs <= 4) legKey = '3-4';
  else if (legs === 5) legKey = '5';
  else if (legs === 6) legKey = '6';
  else legKey = '7+';

  return DUTY_LIMITS_TABLE[hourKey]?.[legKey] ?? 9;
}

function parseTime(timeStr: string | null): { hours: number; minutes: number } | null {
  if (!timeStr) return null;
  const match = timeStr.match(/(\d{1,2}):(\d{2})/);
  if (!match) return null;
  return { hours: parseInt(match[1]), minutes: parseInt(match[2]) };
}


function parseDate(dateStr: string): Date | null {
  // Parse date format: DD/MM/YYYY
  const match = dateStr.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!match) return null;
  const [, day, month, year] = match;
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
}
function timeToMinutes(timeStr: string | null): number | null {
  const t = parseTime(timeStr);
  if (!t) return null;
  return t.hours * 60 + t.minutes;
}

function isNightOperation(day: RosterDay): boolean {
  // Madrugada: 00:00-06:00 local time (Art. 42 §4)
  if (!day.dutyReport && !day.dutyDebrief) return false;
  
  const start = timeToMinutes(day.dutyReport);
  const end = timeToMinutes(day.dutyDebrief);
  
  // If duty starts before 06:00
  if (start !== null && start < 360) return true;
  
  // If duty ends after midnight (next day) or before 06:00
  if (day.isNextDay) return true;
  
  // If start is very late (after 22:00) it likely crosses midnight
  if (start !== null && start >= 1320) return true;
  
  return false;
}

function getDutyHours(day: RosterDay): number | null {
  if (day.dutyHours) return day.dutyHours;
  
  const start = timeToMinutes(day.dutyReport);
  const end = timeToMinutes(day.dutyDebrief);
  
  if (start === null || end === null) return null;
  
  let diff = end - start;
  if (diff < 0 || day.isNextDay) diff += 24 * 60;
  
  return diff / 60;
}

function getRestBetween(day1: RosterDay, day2: RosterDay): number | null {
  const end1 = timeToMinutes(day1.dutyDebrief);
  const start2 = timeToMinutes(day2.dutyReport);
  
  if (end1 === null || start2 === null) return null;
  
  // Calculate days between
  const [d1, m1, y1] = day1.date.split('/').map(Number);
  const [d2, m2, y2] = day2.date.split('/').map(Number);
  const date1 = new Date(y1, m1 - 1, d1);
  const date2 = new Date(y2, m2 - 1, d2);
  const daysDiff = Math.round((date2.getTime() - date1.getTime()) / (24 * 60 * 60 * 1000));
  
  let rest = start2 - end1 + (daysDiff * 24 * 60);
  if (day1.isNextDay) rest -= 24 * 60;
  
  return rest / 60;
}

export function analyzeCompliance(roster: CrewRoster): ComplianceResult {
  const alerts: ComplianceAlert[] = [];
  let alertId = 0;
  
  const workDays = roster.days.filter(d => d.type === 'VOO' || d.type === 'CRM');
  const offDays = roster.days.filter(d => ['DO', 'DOF', 'DR', 'OFF'].includes(d.type));
  const standbyDays = roster.days.filter(d => ['HSB', 'HSBE', 'ASB'].includes(d.type));
  const nightOps = roster.days.filter(d => isNightOperation(d));
  
  // ============================================================
  // 1. CHECK DUTY LIMITS (RBAC 117 Table B.1)
  // ============================================================
  workDays.forEach(day => {
    if (day.type !== 'VOO') return;
    const dutyHrs = getDutyHours(day);
    if (dutyHrs === null) return;
    
    const startTime = parseTime(day.dutyReport);
    if (!startTime) return;
    
    const legs = day.legs.length || Math.max(1, Math.round(dutyHrs / 2.5));
    const maxDuty = getMaxDuty(startTime.hours, legs);
    
    if (dutyHrs > maxDuty) {
      alerts.push({
        id: `duty-${++alertId}`,
        severity: 'error',
        category: 'Jornada',
        title: `Jornada excedida em ${day.date}`,
        description: `Jornada de ${dutyHrs.toFixed(1)}h excede o limite de ${maxDuty}h para início às ${day.dutyReport} com ${legs} etapa(s).`,
        legalReference: 'RBAC 117, Apêndice B, Tabela B.1',
        affectedDates: [day.date],
        details: `Início: ${day.dutyReport} | Fim: ${day.dutyDebrief} | Etapas: ${legs} | Limite: ${maxDuty}h`
      });
    } else if (dutyHrs > maxDuty - 1) {
      alerts.push({
        id: `duty-${++alertId}`,
        severity: 'warning',
        category: 'Jornada',
        title: `Jornada próxima do limite em ${day.date}`,
        description: `Jornada de ${dutyHrs.toFixed(1)}h está a menos de 1h do limite de ${maxDuty}h.`,
        legalReference: 'RBAC 117, Apêndice B, Tabela B.1',
        affectedDates: [day.date],
        details: `Margem: ${(maxDuty - dutyHrs).toFixed(1)}h`
      });
    }
  });
  
  // ============================================================
  // 2. CHECK REST PERIODS (Art. 48 Lei 13.475)
  // ============================================================
  const activeDays = roster.days.filter(d => d.dutyReport && d.dutyDebrief);
  for (let i = 0; i < activeDays.length - 1; i++) {
    const rest = getRestBetween(activeDays[i], activeDays[i + 1]);
    if (rest === null) continue;
    
    const dutyHrs = getDutyHours(activeDays[i]) || 0;
    let minRest = 12;
    if (dutyHrs > 15) minRest = 24;
    else if (dutyHrs > 12) minRest = 16;
    
    // Standby without activation: min 10h (RBAC 117 Appendix B)
    if (['HSB', 'HSBE', 'ASB'].includes(activeDays[i].type)) {
      minRest = 10;
    }
    
    if (rest < minRest) {
      alerts.push({
        id: `rest-${++alertId}`,
        severity: 'error',
        category: 'Repouso',
        title: `Repouso insuficiente entre ${activeDays[i].date} e ${activeDays[i + 1].date}`,
        description: `Repouso de ${rest.toFixed(1)}h é inferior ao mínimo de ${minRest}h exigido após jornada de ${dutyHrs.toFixed(1)}h.`,
        legalReference: 'Lei 13.475/2017, Art. 48',
        affectedDates: [activeDays[i].date, activeDays[i + 1].date],
        details: `Jornada anterior: ${dutyHrs.toFixed(1)}h | Repouso: ${rest.toFixed(1)}h | Mínimo: ${minRest}h`
      });
    }
  }
  
  // ============================================================
  // 3. CHECK MONTHLY DAYS OFF (Art. 51 Lei 13.475)
  // ============================================================
  if (offDays.length < 10) {
    alerts.push({
      id: `off-${++alertId}`,
      severity: 'error',
      category: 'Folgas',
      title: `Folgas mensais insuficientes`,
      description: `Apenas ${offDays.length} folgas no mês. O mínimo exigido é 10.`,
      legalReference: 'Lei 13.475/2017, Art. 51',
      affectedDates: offDays.map(d => d.date),
      details: `Folgas encontradas: ${offDays.length}/10`
    });
  }
  
  // Check weekend days off (Art. 51 - at least 2 days off that fall on Saturday OR Sunday per month)
  const weekendDaysOff = offDays.filter(d => d.dayOfWeek === 'Sáb' || d.dayOfWeek === 'Dom');
  let weekendPairs = weekendDaysOff.length; // Using same variable name for metrics compatibility
  
  if (weekendDaysOff.length < 2) {
    alerts.push({
      id: `weekend-${++alertId}`,
      severity: 'error',
      category: 'Folgas',
      title: `Folgas em finais de semana insuficientes`,
      description: `Apenas ${weekendDaysOff.length} folga(s) em sábado ou domingo. O mínimo exigido é 2.`,
      legalReference: 'Lei 13.475/2017, Art. 51',
      affectedDates: weekendDaysOff.map(d => d.date),
      details: `Folgas em sáb/dom encontradas: ${weekendDaysOff.length}/2 mínimo`
    });
  }
  
  // ============================================================
  // 4. CHECK NIGHT OPERATIONS (Art. 42 Lei 13.475)
  // ============================================================
  // Max 2 consecutive nights, max 4 in 168h
  const nightDates = nightOps.map(d => {
    const [day, month, year] = d.date.split('/').map(Number);
    return { date: new Date(year, month - 1, day), str: d.date };
  });
  
  // Check consecutive nights
  for (let i = 0; i < nightDates.length - 2; i++) {
    const diff1 = (nightDates[i + 1].date.getTime() - nightDates[i].date.getTime()) / (24 * 60 * 60 * 1000);
    const diff2 = (nightDates[i + 2].date.getTime() - nightDates[i + 1].date.getTime()) / (24 * 60 * 60 * 1000);
    
    if (diff1 <= 2 && diff2 <= 2) {
      alerts.push({
        id: `night-${++alertId}`,
        severity: 'error',
        category: 'Madrugadas',
        title: `Possível excesso de madrugadas consecutivas`,
        description: `3 operações na madrugada em sequência próxima: ${nightDates[i].str}, ${nightDates[i + 1].str}, ${nightDates[i + 2].str}. O limite é 2 consecutivas.`,
        legalReference: 'Lei 13.475/2017, Art. 42',
        affectedDates: [nightDates[i].str, nightDates[i + 1].str, nightDates[i + 2].str],
        details: 'Máximo 2 madrugadas consecutivas permitidas'
      });
    }
  }
  
  // Check 4 in 168h
  for (let i = 0; i < nightDates.length; i++) {
    const windowEnd = new Date(nightDates[i].date.getTime() + 168 * 60 * 60 * 1000);
    const count = nightDates.filter(nd => nd.date >= nightDates[i].date && nd.date < windowEnd).length;
    
    if (count > 4) {
      alerts.push({
        id: `night168-${++alertId}`,
        severity: 'error',
        category: 'Madrugadas',
        title: `Excesso de madrugadas em 168h`,
        description: `${count} operações na madrugada em período de 168h a partir de ${nightDates[i].str}. O limite é 4.`,
        legalReference: 'Lei 13.475/2017, Art. 42',
        affectedDates: nightDates.filter(nd => nd.date >= nightDates[i].date && nd.date < windowEnd).map(nd => nd.str),
        details: `${count}/4 madrugadas em 168h`
      });
      break; // Only report once
    }
  }
  
  // ============================================================
  // 5. CHECK STANDBY LIMITS (Art. 43 Lei 13.475)
  // ============================================================
  if (standbyDays.length > 8) {
    alerts.push({
      id: `standby-${++alertId}`,
      severity: 'error',
      category: 'Sobreaviso',
      title: `Sobreavisos mensais excedidos`,
      description: `${standbyDays.length} sobreavisos no mês. O limite é 8.`,
      legalReference: 'Lei 13.475/2017, Art. 43, §7º',
      affectedDates: standbyDays.map(d => d.date),
      details: `${standbyDays.length}/8 sobreavisos`
    });
  }
  
  // Check individual standby duration (3-12h)
  standbyDays.forEach(day => {
    const dutyHrs = getDutyHours(day);
    if (dutyHrs !== null) {
      if (dutyHrs < 3) {
        alerts.push({
          id: `standby-dur-${++alertId}`,
          severity: 'warning',
          category: 'Sobreaviso',
          title: `Sobreaviso curto em ${day.date}`,
          description: `Sobreaviso de ${dutyHrs.toFixed(1)}h é inferior ao mínimo de 3h.`,
          legalReference: 'Lei 13.475/2017, Art. 43',
          affectedDates: [day.date],
          details: `Duração: ${dutyHrs.toFixed(1)}h | Mínimo: 3h`
        });
      } else if (dutyHrs > 12) {
        alerts.push({
          id: `standby-dur-${++alertId}`,
          severity: 'error',
          category: 'Sobreaviso',
          title: `Sobreaviso excedido em ${day.date}`,
          description: `Sobreaviso de ${dutyHrs.toFixed(1)}h excede o máximo de 12h.`,
          legalReference: 'Lei 13.475/2017, Art. 43',
          affectedDates: [day.date],
          details: `Duração: ${dutyHrs.toFixed(1)}h | Máximo: 12h`
        });
      }
    }
  });
  
  // ============================================================
  // 6. CHECK FLIGHT HOURS (Art. 33 Lei 13.475)
  // ============================================================
  const totalFlightHours = workDays.reduce((sum, d) => sum + (d.flyingHours || 0), 0);
  // Estimate if not available
  const estimatedFlightHours = totalFlightHours > 0 ? totalFlightHours : 
    workDays.filter(d => d.type === 'VOO').reduce((sum, d) => {
      const duty = getDutyHours(d);
      return sum + (duty ? duty * 0.7 : 0); // Rough estimate: 70% of duty is flight
    }, 0);
  
  if (estimatedFlightHours > 80) {
    alerts.push({
      id: `flt-${++alertId}`,
      severity: 'error',
      category: 'Horas de Voo',
      title: `Horas de voo mensais excedidas`,
      description: `Estimativa de ${estimatedFlightHours.toFixed(0)}h de voo no mês. O limite para jato é 80h.`,
      legalReference: 'Lei 13.475/2017, Art. 33, I',
      affectedDates: [],
      details: `${estimatedFlightHours.toFixed(0)}/80h mensais`
    });
  }
  
  // ============================================================
  // 7. CHECK CONSECUTIVE WORK DAYS (Art. 50 §1)
  // ============================================================
  let consecutiveWork = 0;
  let consecutiveStart = '';
  roster.days.forEach(day => {
    if (['DO', 'DOF', 'DR'].includes(day.type)) {
      if (consecutiveWork > 6) {
        alerts.push({
          id: `consec-${++alertId}`,
          severity: 'error',
          category: 'Folgas',
          title: `Mais de 6 dias consecutivos sem folga`,
          description: `${consecutiveWork} dias consecutivos de trabalho desde ${consecutiveStart}. A folga deve iniciar no máximo após o 6º período.`,
          legalReference: 'Lei 13.475/2017, Art. 50, §1º',
          affectedDates: [consecutiveStart, day.date],
          details: `${consecutiveWork} dias consecutivos`
        });
      }
      consecutiveWork = 0;
    } else {
      if (consecutiveWork === 0) consecutiveStart = day.date;
      consecutiveWork++;
    }
  });
  
  // ============================================================
  // CALCULATE METRICS
  // ============================================================
  const totalDutyHours = workDays.reduce((sum, d) => sum + (getDutyHours(d) || 0), 0);
  
  const metrics: ComplianceMetrics = {
    totalFlightHours: estimatedFlightHours,
    maxFlightHoursMonth: 80,
    totalDutyHours,
    maxDutyHoursMonth: 176,
    totalDaysOff: offDays.length,
    minDaysOffRequired: 10,
    totalStandby: standbyDays.length,
    maxStandbyMonth: 8,
    nightOperations: nightOps.length,
    maxNightOps168h: 4,
    weekendPairs,
    minWeekendPairs: 2,
  };
  
  // ============================================================
  // DETERMINE OVERALL STATUS
  // ============================================================
  const errors = alerts.filter(a => a.severity === 'error').length;
  const warnings = alerts.filter(a => a.severity === 'warning').length;
  
  let overallStatus: ComplianceResult['overallStatus'] = 'compliant';
  if (errors > 0) overallStatus = 'violation';
  else if (warnings > 0) overallStatus = 'warning';
  
  const score = Math.max(0, 100 - (errors * 15) - (warnings * 5));
  
  const summary = errors > 0
    ? `Foram encontradas ${errors} irregularidade(s) na sua escala que ferem a legislação vigente.`
    : warnings > 0
    ? `Sua escala está dentro da lei, mas há ${warnings} ponto(s) de atenção.`
    : 'Sua escala está em total conformidade com a RBAC 117 e a Lei do Aeronauta.';
  
  return { alerts, metrics, overallStatus, score, summary };
}

// ============================================================
// GYM RECOMMENDATIONS
// ============================================================
export function getGymRecommendations(roster: CrewRoster): GymRecommendation[] {
  const recommendations: GymRecommendation[] = [];
  
  // Helper: get the effective "ready by" time for gym planning
  // For off-base departures, presentation is 1h50 before first departure
  function getEffectiveReportTime(day: RosterDay): { hours: number; minutes: number } | null {
    if (day.type === 'VOO' && day.legs.length > 0) {
      const firstLeg = day.legs[0];
      // If first leg origin is NOT the crew's home base, use 1h50 before departure
      if (firstLeg.origin !== roster.base) {
        const depTime = parseTime(firstLeg.departureTime);
        if (depTime) {
          let totalMin = depTime.hours * 60 + depTime.minutes - 110; // 1h50 = 110min
          if (totalMin < 0) totalMin += 24 * 60;
          return { hours: Math.floor(totalMin / 60), minutes: totalMin % 60 };
        }
      }
    }
    // Otherwise use the duty report time from the roster
    return parseTime(day.dutyReport);
  }
  
  function formatTime(h: number, m: number): string {
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }
  
  roster.days.forEach((day, index) => {
    const prevDay = index > 0 ? roster.days[index - 1] : null;
    const nextDay = index < roster.days.length - 1 ? roster.days[index + 1] : null;
    
    // Layover (pernoite) - TODOS os pernoites são considerados
    if (day.type === 'LAYOVER') {
      // Calculate layover duration
      const currentDate = parseDate(day.date);
      const nextDayDate = nextDay ? parseDate(nextDay.date) : null;
      
      if (nextDayDate && currentDate) {
        const layoverMinutes = (nextDayDate.getTime() - currentDate.getTime()) / (1000 * 60);
        const layoverHours = layoverMinutes / 60;
        
        // Considerar TODOS os pernoites para academia
        if (layoverHours > 24) {
          recommendations.push({
            date: day.date,
            dayOfWeek: day.dayOfWeek,
            availability: 'ideal',
            suggestedTime: 'Manhã ou tarde (após descanso)',
            reason: `Pernoite em ${day.hotel || 'destino'}. Duração: ${Math.floor(layoverHours)}h. Ótima oportunidade para treino após descanso.`
          });
          return;
        } else if (layoverHours > 18) {
          recommendations.push({
            date: day.date,
            dayOfWeek: day.dayOfWeek,
            availability: 'possible',
            suggestedTime: 'Treino leve (2-3h)',
            reason: `Pernoite em ${day.hotel || 'destino'}. Duração: ${Math.floor(layoverHours)}h. Treino leve possível.`
          });
          return;
        } else if (layoverHours > 12) {
          // Pernoites 12-18h também são consideradas
          recommendations.push({
            date: day.date,
            dayOfWeek: day.dayOfWeek,
            availability: 'possible',
            suggestedTime: 'Treino muito leve (1-2h)',
            reason: `Pernoite em ${day.hotel || 'destino'}. Duração: ${Math.floor(layoverHours)}h. Treino muito leve possível se houver tempo.`
          });
          return;
        } else if (layoverHours > 8) {
          // Pernoites 8-12h
          recommendations.push({
            date: day.date,
            dayOfWeek: day.dayOfWeek,
            availability: 'avoid',
            suggestedTime: 'Alongamento leve',
            reason: `Pernoite curta em ${day.hotel || 'destino'}. Duração: ${Math.floor(layoverHours)}h. Apenas alongamento leve. Priorize descanso.`
          });
          return;
        }
      }
      
      // Default for very short layovers
      recommendations.push({
        date: day.date,
        dayOfWeek: day.dayOfWeek,
        availability: 'avoid',
        suggestedTime: '-',
        reason: `Pernoite muito curta em ${day.hotel || 'destino'}. Priorize descanso.`
      });
      return;
    }
    
    // Full day off
    if (['DO', 'DOF', 'DR', 'OFF'].includes(day.type)) {
      // Check if previous day was a night flight
      const prevWasNight = prevDay && isNightOperation(prevDay);
      
      if (prevWasNight) {
        recommendations.push({
          date: day.date,
          dayOfWeek: day.dayOfWeek,
          availability: 'possible',
          suggestedTime: 'Após 15:00',
          reason: 'Folga pós-voo noturno. Priorize descanso pela manhã, treino leve à tarde.'
        });
      } else {
        recommendations.push({
          date: day.date,
          dayOfWeek: day.dayOfWeek,
          availability: 'ideal',
          suggestedTime: 'Livre escolha (manhã ou tarde)',
          reason: 'Dia totalmente livre. Melhor dia para treino intenso.'
        });
      }
      return;
    }
    
    // Work day with late start
    if (day.type === 'VOO') {
      const effectiveStart = getEffectiveReportTime(day);
      if (effectiveStart && effectiveStart.hours >= 13) {
        const cutoffH = effectiveStart.hours - 2;
        const isOffBase = day.legs.length > 0 && day.legs[0].origin !== roster.base;
        const reportLabel = isOffBase 
          ? `Decolagem às ${day.legs[0].departureTime} fora de base (apresentação ~${formatTime(effectiveStart.hours, effectiveStart.minutes)})` 
          : `Apresentação às ${day.dutyReport}`;
        recommendations.push({
          date: day.date,
          dayOfWeek: day.dayOfWeek,
          availability: 'possible',
          suggestedTime: `Até ${cutoffH}:00 (2h antes da apresentação)`,
          reason: `${reportLabel}. Dá para treinar pela manhã com tranquilidade.`
        });
        return;
      } else if (effectiveStart && effectiveStart.hours >= 10) {
        const cutoffH = effectiveStart.hours - 2;
        const isOffBase = day.legs.length > 0 && day.legs[0].origin !== roster.base;
        const reportLabel = isOffBase 
          ? `Decolagem às ${day.legs[0].departureTime} fora de base (apresentação ~${formatTime(effectiveStart.hours, effectiveStart.minutes)})` 
          : `Apresentação às ${day.dutyReport}`;
        recommendations.push({
          date: day.date,
          dayOfWeek: day.dayOfWeek,
          availability: 'possible',
          suggestedTime: `Até ${cutoffH}:00 (2h antes da apresentação)`,
          reason: `${reportLabel}. Treino rápido pela manhã.`
        });
        return;
      }
    }
    
    // Standby day
    if (['HSB', 'HSBE', 'ASB'].includes(day.type)) {
      const startTime = parseTime(day.dutyReport);
      if (startTime && startTime.hours >= 10) {
        recommendations.push({
          date: day.date,
          dayOfWeek: day.dayOfWeek,
          availability: 'possible',
          suggestedTime: `Antes das ${startTime.hours - 1}:00`,
          reason: `Sobreaviso às ${day.dutyReport}. Treino rápido antes, mas fique alerta para acionamento.`
        });
      } else {
        recommendations.push({
          date: day.date,
          dayOfWeek: day.dayOfWeek,
          availability: 'avoid',
          suggestedTime: '-',
          reason: 'Sobreaviso cedo. Risco de ser acionado durante ou após o treino.'
        });
      }
      return;
    }
    
    // Early morning flight or CRM
    if (day.dutyReport) {
      const effectiveStart = getEffectiveReportTime(day);
      if (effectiveStart && effectiveStart.hours < 8) {
        const isOffBase = day.type === 'VOO' && day.legs.length > 0 && day.legs[0].origin !== roster.base;
        const reason = isOffBase
          ? `Decolagem às ${day.legs[0].departureTime} fora de base. Priorize o sono.`
          : `Apresentação às ${day.dutyReport}. Priorize o sono.`;
        recommendations.push({
          date: day.date,
          dayOfWeek: day.dayOfWeek,
          availability: 'avoid',
          suggestedTime: '-',
          reason
        });
      }
    }
  });
  
  return recommendations;
}
