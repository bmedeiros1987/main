import * as pdfjsLib from 'pdfjs-dist';
import PDFWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { isAimsFormat, parseAimsRoster } from './aimsParser';

// Set up the worker
pdfjsLib.GlobalWorkerOptions.workerSrc = PDFWorker;

export interface FlightLeg {
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  workType: string; // OP, PS, DH
}

export interface RosterDay {
  date: string; // DD/MM/YYYY
  dayOfWeek: string;
  type: 'VOO' | 'DO' | 'DOF' | 'DR' | 'HSB' | 'HSBE' | 'ASB' | 'OFF' | 'CRM' | 'LAYOVER' | 'OTHER';
  pairingCode: string;
  dutyReport: string | null; // HH:MM
  dutyDebrief: string | null; // HH:MM
  legs: FlightLeg[];
  dutyHours: number | null;
  flyingHours: number | null;
  isNextDay: boolean;
  hotel: string | null;
  base: string;
}

export interface CrewRoster {
  crewName: string;
  crewId: string;
  base: string;
  rank: string;
  airline: string; // Airline name extracted from PDF
  month: number;
  year: number;
  days: RosterDay[];
  rawText: string;
}

export async function parsePDF(file: File): Promise<CrewRoster> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  let fullText = '';
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const items = textContent.items as any[];
    const text = items.map(item => item.str).join(' ');
    fullText += text + '\n';
  }
  
  // Detect format: AIMS or CrewRosterReport
  if (isAimsFormat(fullText)) {
    // For AIMS format, use page 1 text directly
    // pdf.js extracts items left-to-right, top-to-bottom per text item
    // We need to extract by Y position (rows) then group by columns
    // But the simplest reliable approach: extract all page 1 items sorted by X then Y
    // to reconstruct the column-based layout
    const page1 = await pdf.getPage(1);
    const textContent = await page1.getTextContent();
    const items = textContent.items as any[];
    
    // Group items by Y position (rows), then sort each row by X
    const rowMap = new Map<number, { str: string; x: number; y: number }[]>();
    for (const item of items) {
      if (!item.str.trim()) continue;
      const y = Math.round(item.transform[5]);
      // Group items within 3px of each other as same row
      let foundRow = false;
      for (const [rowY] of rowMap) {
        if (Math.abs(rowY - y) <= 3) {
          rowMap.get(rowY)!.push({ str: item.str.trim(), x: Math.round(item.transform[4]), y });
          foundRow = true;
          break;
        }
      }
      if (!foundRow) {
        rowMap.set(y, [{ str: item.str.trim(), x: Math.round(item.transform[4]), y }]);
      }
    }
    
    // Sort rows by Y descending (PDF Y is bottom-up, so highest Y = top of page)
    const sortedRows = [...rowMap.entries()]
      .sort(([a], [b]: [number, any]) => b - a)
      .map(([, items]: [number, any]) => items.sort((a: any, b: any) => a.x - b.x));
    
    // Find the row with day markers (01Ma, 02Ma, etc.)
    const dayMarkerPattern = /^(\d{2})(Jan|Feb|Mar|Apr|Ma|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i;
    let dayMarkerRow: { str: string; x: number; y: number }[] | null = null;
    let dayMarkerRowIdx = -1;
    
    for (let i = 0; i < sortedRows.length; i++) {
      const row = sortedRows[i];
      const markerCount = row.filter(item => dayMarkerPattern.test(item.str)).length;
      if (markerCount >= 10) { // At least 10 day markers in a row = this is the header
        dayMarkerRow = row;
        dayMarkerRowIdx = i;
        break;
      }
    }
    
    if (!dayMarkerRow) {
      // Fallback: use fullText directly
      return parseAimsRoster(fullText);
    }
    
    // Get column X positions from day markers
    const columns: { day: number; monthCode: string; x: number }[] = [];
    for (const item of dayMarkerRow) {
      const m = item.str.match(dayMarkerPattern);
      if (m) {
        columns.push({ day: parseInt(m[1]), monthCode: m[2], x: item.x });
      }
    }
    columns.sort((a, b) => a.x - b.x);
    
    // For each column, collect items from rows BELOW the day marker row
    // that fall within the column's X range
    const contentRows = sortedRows.slice(dayMarkerRowIdx + 1);
    
    // Build text for each day column
    let aimsText = '';
    const headerLine = fullText.split('\n').find(l => l.includes('Tripulante'));
    if (headerLine) aimsText += headerLine + '\n';
    aimsText += 'Convertida para padrão AIMS\n';
    
    for (let i = 0; i < columns.length; i++) {
      const col = columns[i];
      const xMin = col.x - 5;
      const xMax = i < columns.length - 1 ? columns[i + 1].x - 5 : col.x + 100;
      
      aimsText += `${col.day.toString().padStart(2, '0')}${col.monthCode}\n`;
      
      // Collect all items in this column from content rows
      for (const row of contentRows) {
        for (const item of row) {
          if (item.x >= xMin && item.x < xMax) {
            aimsText += item.str + '\n';
          }
        }
      }
    }
    
    const result = parseAimsRoster(aimsText);
    return result;
  }
  
  return parseRosterText(fullText);
}

function monthNameToNumber(name: string): number {
  const map: Record<string, number> = {
    'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'may': 5, 'jun': 6,
    'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12
  };
  return map[name.toLowerCase().substring(0, 3)] || 1;
}

function parseRosterText(fullText: string): CrewRoster {
  // Extract header: "NAME | ID | FLEET | BASE | RANK Roster Report DD-Mon-YYYY to DD-Mon-YYYY"
  const headerMatch = fullText.match(/^(.+?)\s*\|\s*(\d+)\s*\|\s*(\w+)\s*\|\s*([A-Z]{3})\s*\|\s*(CCM|CMD|COP)\s*Roster Report\s*(\d{2})-([A-Za-z]+)-(\d{4})/);
  
  let crewName = 'Tripulante';
  let crewId = '';
  let base = 'BSB';
  let rank = 'CCM';
  let airline = 'Unknown';
  let month = new Date().getMonth() + 1;
  let year = new Date().getFullYear();
  
  if (headerMatch) {
    crewName = headerMatch[1].trim();
    crewId = headerMatch[2];
    base = headerMatch[4];
    rank = headerMatch[5];
    month = monthNameToNumber(headerMatch[7]);
    year = parseInt(headerMatch[8]);
  } else {
    // Fallback header parsing
    const nameMatch = fullText.match(/([A-Z][A-Z\s]+?)\s*\|\s*(\d+)/);
    if (nameMatch) { crewName = nameMatch[1].trim(); crewId = nameMatch[2]; }
    const baseMatch = fullText.match(/\|\s*([A-Z]{3})\s*\|\s*(CCM|CMD|COP)/);
    if (baseMatch) { base = baseMatch[1]; rank = baseMatch[2]; }
    const dateMatch = fullText.match(/(\d{2})-([A-Za-z]+)-(\d{4})\s*to/);
    if (dateMatch) { month = monthNameToNumber(dateMatch[2]); year = parseInt(dateMatch[3]); }
  }
  
  // Extract airline from text (try common patterns)
  if (/LATAM|TAM/.test(fullText)) airline = 'LATAM';
  else if (/AZUL/.test(fullText)) airline = 'Azul';
  else if (/GOL/.test(fullText)) airline = 'Gol';
  else if (/AVIANCA/.test(fullText)) airline = 'Avianca';
  else if (/PASSAREDO/.test(fullText)) airline = 'Passaredo';
  else if (/TRIP/.test(fullText)) airline = 'Trip';
  else if (/TOTAL/.test(fullText)) airline = 'Total';
  
  // Parse daily entries using the known format
  const days = parseDays(fullText, month, year, base);
  
  return { crewName, crewId, base, rank, airline, month, year, days, rawText: fullText };
}

function parseDays(fullText: string, month: number, year: number, base: string): RosterDay[] {
  const days: RosterDay[] = [];
  
  // Find all roster date entries (DD-Mon-YYYY) that are NOT in the header or "Updated Date" columns
  // Pattern: date appears at start of a line or after a newline, followed by activity content
  // Key insight from raw text: dates like "02-May-2026 DO 12:01 BSB" or "09-May-2026LA3953/..."
  
  // First, find all unique roster dates (exclude header dates and "Updated By" dates)
  const allDates: { dateStr: string; day: number; month: number; year: number; pos: number }[] = [];
  const dateRegex = /(\d{2})-([A-Za-z]{3})-(\d{4})/g;
  let m;
  
  while ((m = dateRegex.exec(fullText)) !== null) {
    const d = parseInt(m[1]);
    const mn = monthNameToNumber(m[2]);
    const y = parseInt(m[3]);
    
    // Skip dates that are clearly "Updated Date" entries (preceded by SCHEDULER or msgsys)
    const before = fullText.substring(Math.max(0, m.index - 20), m.index);
    if (before.includes('SCHEDULER') || before.includes('msgsys') || before.includes('Updated')) continue;
    
    // Skip the header "Roster Report DD-Mon-YYYY to DD-Mon-YYYY"
    if (m.index < 200 && fullText.substring(m.index - 20, m.index).includes('Report')) continue;
    if (m.index < 200 && fullText.substring(m.index - 5, m.index).includes('to ')) continue;
    
    allDates.push({ dateStr: m[0], day: d, month: mn, year: y, pos: m.index });
  }
  
  // Deduplicate by date (keep first occurrence only)
  const seenDates = new Map<string, number>();
  const uniqueDates: typeof allDates = [];
  
  for (const d of allDates) {
    const key = `${d.day}-${d.month}-${d.year}`;
    if (!seenDates.has(key)) {
      seenDates.set(key, d.pos);
      uniqueDates.push(d);
    }
  }
  
  // Sort by position in text
  uniqueDates.sort((a, b) => a.pos - b.pos);
  
  // Extract content for each day
  for (let i = 0; i < uniqueDates.length; i++) {
    const entry = uniqueDates[i];
    const startPos = entry.pos;
    const endPos = i < uniqueDates.length - 1 ? uniqueDates[i + 1].pos : startPos + 500;
    const content = fullText.substring(startPos, Math.min(endPos, startPos + 500));
    
    const dateObj = new Date(entry.year, entry.month - 1, entry.day);
    const dayOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][dateObj.getDay()];
    const dateFormatted = `${entry.day.toString().padStart(2, '0')}/${entry.month.toString().padStart(2, '0')}/${entry.year}`;
    
    // Determine day type from content immediately after the date
    // Format: "DD-Mon-YYYY DO ..." or "DD-Mon-YYYYLA3953/..." or "DD-Mon-YYYY 13:25 LA3953..."
    const afterDate = content.substring(11); // Skip the "DD-Mon-YYYY" part
    
    // Check if day is blank (empty/inativo) - consider as OFF
    const isBlankDay = afterDate.trim().length === 0 || /^\s*$/.test(afterDate.substring(0, 50));
    
    let type: RosterDay['type'] = isBlankDay ? 'OFF' : 'OTHER';
    let dutyReport: string | null = null;
    let dutyDebrief: string | null = null;
    let dutyHours: number | null = null;
    let isNextDay = false;
    let pairingCode = '';
    const legs: FlightLeg[] = [];
    
    // Check for day types - order matters!
    if (/^\s*DOF\b/.test(afterDate)) {
      type = 'DOF';
    } else if (/^\s*DO\b/.test(afterDate)) {
      type = 'DO';
    } else if (/^\s*DR\b/.test(afterDate)) {
      type = 'DR';
    } else if (/^\s*OFF\b/.test(afterDate)) {
      type = 'OFF';
    } else if (/HSBE/.test(afterDate.substring(0, 60))) {
      type = 'HSBE';
    } else if (/HSB/.test(afterDate.substring(0, 60)) && !/HSBE/.test(afterDate.substring(0, 60))) {
      type = 'HSB';
    } else if (/^\s*ASB\b/.test(afterDate)) {
      type = 'ASB';
    } else if (/\bCRM\b/.test(afterDate.substring(0, 30))) {
      type = 'CRM';
    } else if (/LA\d{3,4}/.test(afterDate.substring(0, 80))) {
      type = 'VOO';
    }
    
    // Extract duty report time
    // For DO/DOF/DR: format is "DO 12:01 BSB" - the time is just a placeholder
    if (type === 'DO' || type === 'DOF' || type === 'DR' || type === 'OFF') {
      // These are days off - no real duty
      dutyReport = null;
      dutyDebrief = null;
      dutyHours = 0;
    } else {
      // For work days, extract duty report time
      // Format: "13:25 LA3953..." or "LA3953/...320-P13:25" or "HSB BSB 10:05"
      const reportMatch = afterDate.match(/(?:320-P|32S-P|39R-P|31R-P|321-P)?\s*(\d{1,2}:\d{2})\s+(?:LA|HSB|HSBE|ASB|CRM)/);
      if (reportMatch) {
        dutyReport = reportMatch[1];
      } else {
        // Try: just a time at the start
        const altReport = afterDate.match(/^\s*(?:LA\d+\/[^\s]+\s*)?(?:320-P|32S-P|39R-P|31R-P|321-P)?(\d{1,2}:\d{2})/);
        if (altReport) {
          dutyReport = altReport[1];
        }
      }
      
      // Extract duty hours from the content - pattern like "09:50" or "08:35" before aircraft type
      const dutyHrsMatch = content.match(/\s(\d{2}:\d{2})\s+(?:32[8S]|39R|31R|321|320)\s/);
      if (dutyHrsMatch) {
        const [h, mins] = dutyHrsMatch[1].split(':').map(Number);
        if (h <= 16) {
          dutyHours = h + mins / 60;
        }
      }
      
      // For HSB/HSBE, extract times differently
      // Format: "HSB BSB 10:05 BSB 21:00 21:00 03:38" -> start=10:05, end=21:00
      // Format: "HSBE BSB 08:07 BSB 11:07 11:07 00:59" -> start=08:07, end=11:07
      if (type === 'HSB' || type === 'HSBE') {
        const hsbMatch = afterDate.match(/(?:HSBE|HSB)\s+BSB\s+(\d{1,2}:\d{2})\s+BSB\s+(\d{1,2}:\d{2})\s+(\d{1,2}:\d{2})/);
        if (hsbMatch) {
          dutyReport = hsbMatch[1];
          dutyDebrief = hsbMatch[2];
          // Calculate actual duration from start to end
          const [sh, sm] = hsbMatch[1].split(':').map(Number);
          const [eh, em] = hsbMatch[2].split(':').map(Number);
          let diffMin = (eh * 60 + em) - (sh * 60 + sm);
          if (diffMin < 0) diffMin += 24 * 60; // crosses midnight
          dutyHours = diffMin / 60;
        }
      }
      
      // For CRM
      if (type === 'CRM') {
        const crmMatch = afterDate.match(/CRM\w*\s+(\d{1,2}:\d{2})\s+BSB\s+\d{1,2}:\d{2}\s+BSB\s+(\d{1,2}:\d{2})\s+(\d{1,2}:\d{2})\s+(\d{1,2}:\d{2})/);
        if (crmMatch) {
          dutyReport = crmMatch[1];
          dutyDebrief = crmMatch[2];
          const [h, mins] = crmMatch[4].split(':').map(Number);
          dutyHours = h + mins / 60;
        }
      }
      
      // Extract flight legs
      if (type === 'VOO') {
        // Pattern: LA3953 CC OP BSB 14:15 POA 16:55
        const flightRegex = /(LA\d{3,4})\s+(?:CC\s+)?(?:OP|PS|DH)\s+([A-Z]{3})\s+(\d{1,2}:\d{2})\s+([A-Z]{3})\s+(\d{1,2}:\d{2}(?:\(\+1\))?)/g;
        let fm;
        while ((fm = flightRegex.exec(content)) !== null) {
          const arrTime = fm[5].replace('(+1)', '');
          if (fm[5].includes('(+1)')) isNextDay = true;
          
          // Determine work type from context
          const ctx = content.substring(fm.index, fm.index + 40);
          let workType = 'OP';
          if (ctx.includes(' PS ')) workType = 'PS';
          else if (ctx.includes(' DH ')) workType = 'DH';
          
          legs.push({
            flightNumber: fm[1],
            origin: fm[2],
            destination: fm[4],
            departureTime: fm[3],
            arrivalTime: arrTime,
            workType
          });
        }
        
        // Get pairing code
        const pairMatch = afterDate.match(/(LA\d{3,4}\/\d{6}\/[^\s]+)/);
        if (pairMatch) pairingCode = pairMatch[1];
        
        // Calculate duty from first leg departure - 45min to last leg arrival + 30min
        if (legs.length > 0 && dutyReport) {
          const lastLeg = legs[legs.length - 1];
          const [lh, lm] = lastLeg.arrivalTime.split(':').map(Number);
          const debriefMin = lh * 60 + lm + 30;
          const debH = Math.floor(debriefMin / 60) % 24;
          const debM = debriefMin % 60;
          dutyDebrief = `${debH.toString().padStart(2, '0')}:${debM.toString().padStart(2, '0')}`;
          
          // Check if debrief crosses midnight
          if (isNextDay || debriefMin >= 24 * 60) {
            isNextDay = true;
          }
        }
        
        // Calculate duty hours
        if (dutyReport && dutyDebrief) {
          const [rh, rm] = dutyReport.split(':').map(Number);
          const [dh, dm] = dutyDebrief.split(':').map(Number);
          let diff = (dh * 60 + dm) - (rh * 60 + rm);
          if (diff < 0 || isNextDay) diff += 24 * 60;
          dutyHours = diff / 60;
        }
      }
    }
    
    days.push({
      date: dateFormatted,
      dayOfWeek,
      type,
      pairingCode,
      dutyReport,
      dutyDebrief,
      legs,
      dutyHours,
      flyingHours: null,
      isNextDay,
      hotel: null,
      base
    });
  }
  
  return days;
}
