/**
 * Parser for "Escala de Tripulante Convertida para padrão AIMS" PDF format.
 * This format has a column-per-day layout extracted as sequential text blocks.
 */

import type { CrewRoster, RosterDay, FlightLeg } from './pdfParser';

const MONTH_MAP: Record<string, number> = {
  'jan': 1, 'fev': 2, 'feb': 2, 'mar': 3, 'abr': 4, 'apr': 4,
  'mai': 5, 'may': 5, 'jun': 6, 'jul': 7, 'ago': 8, 'aug': 8,
  'set': 9, 'sep': 9, 'out': 10, 'oct': 10, 'nov': 11, 'dez': 12, 'dec': 12
};

function parseMonthFromCode(code: string): number {
  // Code like "Ma" from "01May" -> extract month
  // Or from header date "01/05/2026"
  const lower = code.toLowerCase();
  for (const [key, val] of Object.entries(MONTH_MAP)) {
    if (lower.startsWith(key)) return val;
  }
  return 0;
}

export function isAimsFormat(text: string): boolean {
  return text.includes('Convertida para padrão AIMS') || 
         text.includes('Convertida para padrao AIMS') ||
         text.includes('Convertida para padr');
}

export function parseAimsRoster(fullText: string): CrewRoster {
  // Extract header info
  // "Tripulante: BRUNO SARAIVA -BP:04453812 -Base: BSB -01/05/2026 até31/05/2026"
  const headerMatch = fullText.match(/Tripulante:\s*([^-]+?)\s*-\s*BP:\s*(\d+)\s*-\s*Base:\s*([A-Z]{3})\s*-\s*(\d{2})\/(\d{2})\/(\d{4})/);
  
  let crewName = 'Tripulante';
  let crewId = '';
  let base = 'BSB';
  let month = new Date().getMonth() + 1;
  let year = new Date().getFullYear();
  
  if (headerMatch) {
    crewName = headerMatch[1].trim();
    crewId = headerMatch[2];
    base = headerMatch[3];
    month = parseInt(headerMatch[5]);
    year = parseInt(headerMatch[6]);
  }
  
  // Parse all pages text into lines
  const lines = fullText.split('\n');
  const allLines: string[] = [];
  
  for (const line of lines) {
    // Skip headers and footers
    if (line.includes('Convertida para padr') || 
        line.includes('Tripulante:') || 
        line.includes('Confira na') ||
        line.includes('Timezone') ||
        line.includes('Tripulações') ||
        line.trim() === '') continue;
    allLines.push(line.trim());
  }
  
  // Join all content and split by day markers
  // Day markers are like "01Ma", "02Ma", etc. or "01Jun" for next month overflow
  const content = allLines.join('\n');
  
  // Split by day markers: pattern is DDMon (e.g., "01Ma", "10Ma", "01Jun")
  // These can appear concatenated with previous content like "(320)10Ma" or "21:0019Ma"
  const dayPattern = /(\d{2})(Jan|Feb|Mar|Apr|Ma|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Ja|Fe|Ma|Ab|Mai|Ju|Jul|Ag|Se|Ou|No|De)/gi;
  
  // Find all day markers and their positions
  const dayMarkers: { day: number; monthCode: string; pos: number }[] = [];
  let match;
  
  while ((match = dayPattern.exec(content)) !== null) {
    const dayNum = parseInt(match[1]);
    const monthCode = match[2];
    if (dayNum >= 1 && dayNum <= 31) {
      dayMarkers.push({ day: dayNum, monthCode, pos: match.index });
    }
  }
  
  // Parse each day's content
  const days: RosterDay[] = [];
  const seenDates = new Set<string>();
  
  for (let i = 0; i < dayMarkers.length; i++) {
    const marker = dayMarkers[i];
    const startPos = marker.pos + `${marker.day.toString().padStart(2, '0')}${marker.monthCode}`.length;
    const endPos = i < dayMarkers.length - 1 ? dayMarkers[i + 1].pos : content.length;
    const dayContent = content.substring(startPos, endPos).trim();
    
    // Determine if this is the target month or overflow (next month)
    let dayMonth = month;
    let dayYear = year;
    const mc = marker.monthCode.toLowerCase();
    
    // Check if it's a different month (e.g., "01Jun" when month is May)
    const parsedMonth = parseMonthFromCode(mc);
    if (parsedMonth > 0 && parsedMonth !== month) {
      dayMonth = parsedMonth;
      if (parsedMonth < month) dayYear++;
    }
    
    // Skip days not in the target month (only keep target month days)
    if (dayMonth !== month) continue;
    
    const dateFormatted = `${marker.day.toString().padStart(2, '0')}/${dayMonth.toString().padStart(2, '0')}/${dayYear}`;
    
    // Deduplicate: keep only the first occurrence of each date
    if (seenDates.has(dateFormatted)) continue;
    seenDates.add(dateFormatted);
    
    const dateObj = new Date(dayYear, dayMonth - 1, marker.day);
    const dayOfWeekNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const dayOfWeek = dayOfWeekNames[dateObj.getDay()];
    
    // Parse the day content
    const parsed = parseDayContent(dayContent, base);
    
    days.push({
      date: dateFormatted,
      dayOfWeek,
      type: parsed.type,
      pairingCode: parsed.pairingCode,
      dutyReport: parsed.dutyReport,
      dutyDebrief: parsed.dutyDebrief,
      legs: parsed.legs,
      dutyHours: parsed.dutyHours,
      flyingHours: parsed.flyingHours,
      isNextDay: parsed.isNextDay,
      hotel: parsed.hotel,
      base
    });
  }
  
  // Sort days by date
  days.sort((a, b) => {
    const [da, ma] = a.date.split('/').map(Number);
    const [db, mb] = b.date.split('/').map(Number);
    if (ma !== mb) return ma - mb;
    return da - db;
  });
  
  return {
    crewName,
    crewId,
    base,
    rank: 'CCM',
    month,
    year,
    days,
    rawText: fullText
  };
}

interface ParsedDay {
  type: RosterDay['type'];
  pairingCode: string;
  dutyReport: string | null;
  dutyDebrief: string | null;
  legs: FlightLeg[];
  dutyHours: number | null;
  flyingHours: number | null;
  isNextDay: boolean;
  hotel: string | null;
}

function parseDayContent(content: string, homeBase: string): ParsedDay {
  // Split by both newlines AND whitespace to handle space-separated tokens from column extraction
  // First split by newlines, then split each line by spaces to get individual tokens
  const rawLines = content.split('\n').filter(l => l.trim() !== '');
  const lines: string[] = [];
  for (const line of rawLines) {
    // Split each line by whitespace to get individual tokens
    const tokens = line.split(/\s+/).filter(t => t.trim() !== '');
    lines.push(...tokens);
  }
  
  // First token might be "y" (year indicator), skip it
  let idx = 0;
  if (idx < lines.length && lines[idx] === 'y') idx++;
  
  // Next token is day of week (Fri, Sat, etc.), skip it
  if (idx < lines.length && /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)$/i.test(lines[idx])) idx++;
  
  // Now determine the day type from remaining content
  const remaining = lines.slice(idx);
  
  if (remaining.length === 0) {
    return { type: 'OTHER', pairingCode: '', dutyReport: null, dutyDebrief: null, legs: [], dutyHours: null, flyingHours: null, isNextDay: false, hotel: null };
  }
  
  // Check first meaningful token
  const firstLine = remaining[0];
  
  
  // Day off types
  if (firstLine === 'DO' || firstLine.startsWith('DO')) {
    return { type: 'DO', pairingCode: '', dutyReport: null, dutyDebrief: null, legs: [], dutyHours: 0, flyingHours: 0, isNextDay: false, hotel: null };
  }
  if (firstLine === 'DOF' || firstLine.startsWith('DOF')) {
    return { type: 'DOF', pairingCode: '', dutyReport: null, dutyDebrief: null, legs: [], dutyHours: 0, flyingHours: 0, isNextDay: false, hotel: null };
  }
  if (firstLine === 'DR' || firstLine.startsWith('DR')) {
    return { type: 'DR', pairingCode: '', dutyReport: null, dutyDebrief: null, legs: [], dutyHours: 0, flyingHours: 0, isNextDay: false, hotel: null };
  }
  if (firstLine === 'OFF' || firstLine.startsWith('OFF')) {
    return { type: 'OFF', pairingCode: '', dutyReport: null, dutyDebrief: null, legs: [], dutyHours: 0, flyingHours: 0, isNextDay: false, hotel: null };
  }
  
  // HSB/HSBE - Standby
  if (firstLine === 'HSB' || firstLine.startsWith('HSB')) {
    return parseStandby(remaining, firstLine.includes('HSBE') ? 'HSBE' : 'HSB');
  }
  if (firstLine === 'HSBE') {
    return parseStandby(remaining, 'HSBE');
  }
  
  // CRM Training
  if (firstLine === 'CRMB' || firstLine === 'CRM' || firstLine.startsWith('CRM')) {
    return parseCRM(remaining);
  }
  
  // ASB - Airport Standby
  if (firstLine === 'ASB' || firstLine.startsWith('ASB')) {
    return parseASB(remaining);
  }
  
  // Check if it's a layover continuation (starts with "(...)" indicating previous day's activity continues)
  if (firstLine === '(...)' || firstLine.startsWith('(...)')) {
    const afterEllipsis = remaining.slice(1);
    
    // In AIMS format, (...) often precedes the actual day type
    // Pattern: (...) -> BSB -> time -> time -> DO/DOF/DR/OFF/HSB/HSBE/CRM/LA
    // Check if there's a day type marker anywhere in the remaining content
    const doIdx = afterEllipsis.findIndex(l => l === 'DO' || l === 'DOF' || l === 'DR' || l === 'OFF');
    if (doIdx >= 0) {
      const typeStr = afterEllipsis[doIdx] as RosterDay['type'];
      return { type: typeStr, pairingCode: '', dutyReport: null, dutyDebrief: null, legs: [], dutyHours: 0, flyingHours: 0, isNextDay: false, hotel: null };
    }
    
    // Check for HSB/HSBE after (...)
    const hsbIdx = afterEllipsis.findIndex(l => l === 'HSBE' || l === 'HSB');
    if (hsbIdx >= 0) {
      const hsbType = afterEllipsis[hsbIdx] === 'HSBE' ? 'HSBE' : 'HSB';
      return parseStandby(afterEllipsis.slice(hsbIdx), hsbType);
    }
    
    // Check for CRM after (...)
    const crmIdx = afterEllipsis.findIndex(l => l === 'CRMB' || l === 'CRM' || l.startsWith('CRM'));
    if (crmIdx >= 0) {
      return parseCRM(afterEllipsis.slice(crmIdx));
    }
    
    // Check for flights after (...)
    const hasFlights = afterEllipsis.some(l => l === 'LA');
    if (hasFlights) {
      const laStart = afterEllipsis.findIndex(l => l === 'LA');
      return parseFlightDay(afterEllipsis.slice(laStart), homeBase, true);
    }
    
    // Pure layover - check for station (non-home-base)
    const stationLine = afterEllipsis.find(l => /^[A-Z]{3}$/.test(l) && l !== homeBase);
    if (stationLine) {
      return { 
        type: 'LAYOVER', 
        pairingCode: '', 
        dutyReport: null, 
        dutyDebrief: null, 
        legs: [], 
        dutyHours: 0, 
        flyingHours: 0, 
        isNextDay: false, 
        hotel: stationLine 
      };
    }
    
    // If no station found and no other type, it might be a rest day
    return { type: 'OTHER', pairingCode: '', dutyReport: null, dutyDebrief: null, legs: [], dutyHours: 0, flyingHours: 0, isNextDay: false, hotel: null };
  }
  
  // Flight day - starts with "LA" or has "[extra]" marker
  if (firstLine === 'LA' || firstLine === '[extra]') {
    const startIdx = firstLine === '[extra]' ? 1 : 0;
    return parseFlightDay(remaining.slice(startIdx), homeBase, false);
  }
  
  // Check if it's a DO/DOF that was preceded by (...) 
  // Pattern: (...) \n STATION \n time \n time \n DO/DOF
  const doIdx = remaining.findIndex(l => l === 'DO' || l === 'DOF' || l === 'DR');
  if (doIdx > 0) {
    const typeStr = remaining[doIdx] as RosterDay['type'];
    return { type: typeStr, pairingCode: '', dutyReport: null, dutyDebrief: null, legs: [], dutyHours: 0, flyingHours: 0, isNextDay: false, hotel: null };
  }
  
  // Fallback: check for LA anywhere
  const laIdx = remaining.findIndex(l => l === 'LA');
  if (laIdx >= 0) {
    return parseFlightDay(remaining.slice(laIdx), homeBase, false);
  }
  
  return { type: 'OTHER', pairingCode: '', dutyReport: null, dutyDebrief: null, legs: [], dutyHours: null, flyingHours: null, isNextDay: false, hotel: null };
}

function parseStandby(lines: string[], type: 'HSB' | 'HSBE'): ParsedDay {
  // Format in extracted text:
  // HSB (or HSBE)
  // 10:05     <- start time
  // 10:05     <- (repeated)
  // BSB       <- station
  // BSB       <- (repeated)
  // 21:00     <- end time
  // 21:00     <- (repeated or concatenated with next day)
  
  let startTime: string | null = null;
  let endTime: string | null = null;
  
  const timePattern = /^(\d{1,2}:\d{2})/;
  const times: string[] = [];
  
  for (const line of lines) {
    const tm = line.match(timePattern);
    if (tm) {
      times.push(tm[1]);
    }
  }
  
  // For HSB/HSBE: first time is start, third unique time is end
  // Times array typically: [start, start, end, end] (each repeated)
  if (times.length >= 3) {
    startTime = times[0];
    // Find the first time that's different from start
    endTime = times.find(t => t !== startTime) || times[times.length - 1];
  } else if (times.length >= 2) {
    startTime = times[0];
    endTime = times[1];
  }
  
  let dutyHours: number | null = null;
  if (startTime && endTime) {
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    let diffMin = (eh * 60 + em) - (sh * 60 + sm);
    if (diffMin < 0) diffMin += 24 * 60;
    dutyHours = diffMin / 60;
  }
  
  return {
    type,
    pairingCode: '',
    dutyReport: startTime,
    dutyDebrief: endTime,
    legs: [],
    dutyHours,
    flyingHours: 0,
    isNextDay: false,
    hotel: null
  };
}

function parseCRM(lines: string[]): ParsedDay {
  // CRM training day
  // CRMB
  // SB
  // 09:00
  // ...
  // 18:00
  
  const times: string[] = [];
  const timePattern = /^(\d{1,2}:\d{2})/;
  
  for (const line of lines) {
    const tm = line.match(timePattern);
    if (tm) times.push(tm[1]);
  }
  
  let startTime: string | null = null;
  let endTime: string | null = null;
  
  if (times.length >= 2) {
    startTime = times[0];
    endTime = times[times.length - 1];
  }
  
  let dutyHours: number | null = null;
  if (startTime && endTime) {
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    let diffMin = (eh * 60 + em) - (sh * 60 + sm);
    if (diffMin < 0) diffMin += 24 * 60;
    dutyHours = diffMin / 60;
  }
  
  return {
    type: 'CRM',
    pairingCode: '',
    dutyReport: startTime,
    dutyDebrief: endTime,
    legs: [],
    dutyHours,
    flyingHours: 0,
    isNextDay: false,
    hotel: null
  };
}

function parseASB(lines: string[]): ParsedDay {
  const times: string[] = [];
  const timePattern = /^(\d{1,2}:\d{2})/;
  
  for (const line of lines) {
    const tm = line.match(timePattern);
    if (tm) times.push(tm[1]);
  }
  
  let startTime: string | null = null;
  let endTime: string | null = null;
  
  if (times.length >= 2) {
    startTime = times[0];
    endTime = times[times.length - 1];
  }
  
  let dutyHours: number | null = null;
  if (startTime && endTime) {
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    let diffMin = (eh * 60 + em) - (sh * 60 + sm);
    if (diffMin < 0) diffMin += 24 * 60;
    dutyHours = diffMin / 60;
  }
  
  return {
    type: 'ASB',
    pairingCode: '',
    dutyReport: startTime,
    dutyDebrief: endTime,
    legs: [],
    dutyHours,
    flyingHours: 0,
    isNextDay: false,
    hotel: null
  };
}

function parseFlightDay(lines: string[], homeBase: string, isLayoverStart: boolean): ParsedDay {
  // Flight day format (each flight leg):
  // LA
  // 3953        <- flight number
  // 13:25       <- departure time (or report time for first leg)
  // 14:12       <- actual departure (or second time)
  // BSB         <- origin
  // POA         <- destination
  // 16:45       <- arrival time
  // (320)       <- aircraft type
  //
  // Then next leg:
  // LA
  // 3590
  // ...
  
  const legs: FlightLeg[] = [];
  let i = 0;
  let firstReportTime: string | null = null;
  let lastArrivalTime: string | null = null;
  let isNextDay = false;
  let hotel: string | null = null;
  let totalFlyingMin = 0;
  
  while (i < lines.length) {
    if (lines[i] === 'LA') {
      i++;
      if (i >= lines.length) break;
      
      // Flight number
      const flightNum = 'LA' + lines[i];
      i++;
      
      // Next lines: times, origin, destination, arrival
      // Pattern varies:
      // Time1 (report/departure)
      // Time2 (departure if different from report) OR Origin
      // Origin
      // Destination
      // Arrival time
      // Optional: second arrival time (block time)
      // Aircraft type (320) or (328) etc.
      
      let departureTime = '';
      let arrivalTime = '';
      let origin = '';
      let destination = '';
      
      // Collect remaining tokens for this leg until next "LA" or end
      const legTokens: string[] = [];
      while (i < lines.length && lines[i] !== 'LA' && !lines[i].startsWith('(...)')) {
        legTokens.push(lines[i]);
        i++;
      }
      
      // Parse leg tokens
      // Tokens pattern: [time1, time2?, ORIGIN, DESTINATION, arrivalTime, arrivalTime2?, (aircraft)]
      const timeRegex = /^\d{1,2}:\d{2}$/;
      const stationRegex = /^[A-Z]{3}$/;
      const aircraftRegex = /^\(\d{3}\w?\)$|^\(3\d\w\)$/;
      
      const times: string[] = [];
      const stations: string[] = [];
      
      for (const token of legTokens) {
        if (timeRegex.test(token)) {
          times.push(token);
        } else if (stationRegex.test(token) && !aircraftRegex.test(`(${token})`)) {
          stations.push(token);
        }
      }
      
      // Interpret times and stations
      // For first leg of the day: times[0] = report, times[1] = departure, stations[0] = origin, stations[1] = dest, times[2] = arrival
      // For subsequent legs: times[0] = departure, stations[0] = origin, stations[1] = dest, times[1] = arrival
      
      if (stations.length >= 2) {
        origin = stations[0];
        destination = stations[1];
      } else if (stations.length === 1) {
        // Only destination (origin is implied from previous leg or base)
        destination = stations[0];
        origin = legs.length > 0 ? legs[legs.length - 1].destination : homeBase;
      }
      
      if (times.length >= 3) {
        // First leg: report, departure, arrival (or arrival, block)
        if (!firstReportTime) firstReportTime = times[0];
        departureTime = times[1] || times[0];
        arrivalTime = times[2];
        if (times.length >= 4) {
          arrivalTime = times[times.length - 2]; // second-to-last is usually arrival
        }
      } else if (times.length === 2) {
        departureTime = times[0];
        arrivalTime = times[1];
        if (!firstReportTime) firstReportTime = times[0];
      } else if (times.length === 1) {
        departureTime = times[0];
        if (!firstReportTime) firstReportTime = times[0];
      }
      
      // Calculate flying time for this leg
      if (departureTime && arrivalTime) {
        const [dh, dm] = departureTime.split(':').map(Number);
        const [ah, am] = arrivalTime.split(':').map(Number);
        let flyMin = (ah * 60 + am) - (dh * 60 + dm);
        if (flyMin < 0) flyMin += 24 * 60;
        totalFlyingMin += flyMin;
      }
      
      lastArrivalTime = arrivalTime || lastArrivalTime;
      
      legs.push({
        flightNumber: flightNum,
        origin,
        destination,
        departureTime,
        arrivalTime,
        workType: 'OP'
      });
    } else if (lines[i] === '(...)') {
      // End of day - next day continuation
      // Check what station we're at
      if (i + 1 < lines.length && /^[A-Z]{3}$/.test(lines[i + 1])) {
        hotel = lines[i + 1];
      }
      break;
    } else {
      // Skip non-LA lines (could be station info for layover)
      if (/^[A-Z]{3}$/.test(lines[i]) && legs.length === 0) {
        // This might be the origin station for a layover continuation
      }
      i++;
    }
  }
  
  // Calculate duty times
  let dutyReport = firstReportTime;
  let dutyDebrief: string | null = null;
  let dutyHours: number | null = null;
  
  if (lastArrivalTime) {
    // Debrief = last arrival + 30 min
    const [ah, am] = lastArrivalTime.split(':').map(Number);
    const debriefMin = ah * 60 + am + 30;
    const debH = Math.floor(debriefMin / 60) % 24;
    const debM = debriefMin % 60;
    dutyDebrief = `${debH.toString().padStart(2, '0')}:${debM.toString().padStart(2, '0')}`;
    
    if (debriefMin >= 24 * 60) isNextDay = true;
  }
  
  // For first leg, report time is typically 1h before departure
  // But in this format, the first time shown might already be the report time
  if (dutyReport && legs.length > 0) {
    // If report time equals departure time of first leg, subtract 1h for actual report
    if (dutyReport === legs[0].departureTime && legs[0].origin === homeBase) {
      // Report is typically shown separately in this format
      // Keep as-is since the format shows report time explicitly
    }
  }
  
  if (dutyReport && dutyDebrief) {
    const [rh, rm] = dutyReport.split(':').map(Number);
    const [dh, dm] = dutyDebrief.split(':').map(Number);
    let diff = (dh * 60 + dm) - (rh * 60 + rm);
    if (diff < 0 || isNextDay) diff += 24 * 60;
    dutyHours = diff / 60;
  }
  
  // Check if last destination is not home base (layover)
  if (legs.length > 0 && legs[legs.length - 1].destination !== homeBase) {
    hotel = legs[legs.length - 1].destination;
  }
  
  const flyingHours = totalFlyingMin > 0 ? totalFlyingMin / 60 : null;
  
  return {
    type: 'VOO',
    pairingCode: legs.length > 0 ? legs[0].flightNumber : '',
    dutyReport,
    dutyDebrief,
    legs,
    dutyHours,
    flyingHours,
    isNextDay,
    hotel
  };
}
