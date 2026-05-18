import type { CrewRoster } from './pdfParser';
import type { GymRecommendation } from './complianceEngine';

/**
 * Export crew roster to iCal format for Google Calendar
 * Creates events for each flight leg with proper formatting
 */
export function generateICalendar(roster: CrewRoster, gymRecommendations?: GymRecommendation[]): string {
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const monthStr = String(roster.month).padStart(2, '0');
  const uid = `crewcheck-${roster.year}-${monthStr}-${Date.now()}@crewcheck.com.br`;

  let ical = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//CrewCheck//Crew Roster Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:${roster.airline || 'Crew Roster'} - ${roster.year}-${monthStr}
X-WR-TIMEZONE:America/Sao_Paulo
X-WR-CALDESC:Crew roster schedule exported from CrewCheck
BEGIN:VTIMEZONE
TZID:America/Sao_Paulo
BEGIN:STANDARD
DTSTART:20230219T000000
TZOFFSETFROM:-0200
TZOFFSETTO:-0300
TZNAME:BRST
END:STANDARD
BEGIN:DAYLIGHT
DTSTART:20231105T000000
TZOFFSETFROM:-0300
TZOFFSETTO:-0200
TZNAME:BRDT
END:DAYLIGHT
END:VTIMEZONE
`;

  // Add flight events
  roster.days.forEach((day, dayIndex) => {
    day.flights.forEach((flight, flightIndex) => {
      const eventUid = `${uid}-flight-${dayIndex}-${flightIndex}`;
      const startTime = formatDateTimeForIcal(day.date, flight.startTime);
      const endTime = formatDateTimeForIcal(day.date, flight.endTime);
      
      // Extract flight number and IATA codes from route (e.g., "LA3953 POA-FLN" or "G3 1234 POA-FLN")
      const routeParts = flight.route.split(' ');
      let flightNum = '';
      let iataRoute = '';
      
      if (routeParts.length >= 2) {
        flightNum = routeParts[0];
        iataRoute = routeParts[routeParts.length - 1]; // Last part is usually the IATA route
      }
      
      // Detect extra flights
      const isExtraFlight = flight.workType === 'EXTRA' || flight.route.toUpperCase().includes('EXTRA');
      const summary = flightNum && iataRoute ? `${flightNum} ${iataRoute}` : flight.route;
      const description = `Flight: ${flight.route}\\nDuration: ${flight.duration} hours\\nAircraft: ${flight.aircraft || 'N/A'}\\nWork Type: ${flight.workType || 'OP'}`;
      const color = isExtraFlight ? '#9CA3AF' : '#4F46E5'; // Gray for extra flights, blue for regular
      
      ical += `BEGIN:VEVENT
UID:${eventUid}
DTSTAMP:${now}
DTSTART;TZID=America/Sao_Paulo:${startTime}
DTEND;TZID=America/Sao_Paulo:${endTime}
SUMMARY:✈️ ${summary}
DESCRIPTION:${description}
LOCATION:${iataRoute || flight.route}
CATEGORIES:Flight
STATUS:CONFIRMED
TRANSP:OPAQUE
COLOR:${color}
END:VEVENT
`;
    });

    // Add rest/duty events
    day.duties.forEach((duty, dutyIndex) => {
      const eventUid = `${uid}-duty-${dayIndex}-${dutyIndex}`;
      const startTime = formatDateTimeForIcal(day.date, duty.startTime);
      const endTime = formatDateTimeForIcal(day.date, duty.endTime);
      
      const summary = duty.type === 'rest' ? '🛏️ Rest Period' : '📋 Duty Period';
      const description = `${duty.type === 'rest' ? 'Rest' : 'Duty'} Period\\nDuration: ${duty.duration} hours`;
      const color = duty.type === 'rest' ? '#10B981' : '#F59E0B';
      
      ical += `BEGIN:VEVENT
UID:${eventUid}
DTSTAMP:${now}
DTSTART;TZID=America/Sao_Paulo:${startTime}
DTEND;TZID=America/Sao_Paulo:${endTime}
SUMMARY:${summary}
DESCRIPTION:${description}
CATEGORIES:${duty.type === 'rest' ? 'Rest' : 'Duty'}
STATUS:CONFIRMED
TRANSP:TRANSPARENT
COLOR:${color}
END:VEVENT
`;
    });
  });

  // Add gym recommendation events
  if (gymRecommendations && gymRecommendations.length > 0) {
    gymRecommendations.forEach((gym, index) => {
      const eventUid = `${uid}-gym-${index}`;
      
      // Parse date to create a time slot for gym (suggest 2 hours in the morning)
      const dateObj = parseDate(gym.date);
      if (dateObj) {
        // Suggest gym at 08:00-10:00 for ideal, 16:00-17:30 for possible
        const startHour = gym.availability === 'ideal' ? 8 : 16;
        const duration = gym.availability === 'ideal' ? 2 : 1.5;
        
        const startTime = new Date(dateObj);
        startTime.setHours(startHour, 0, 0, 0);
        
        const endTime = new Date(startTime);
        endTime.setHours(startTime.getHours() + Math.floor(duration), (duration % 1) * 60, 0, 0);
        
        const startTimeStr = formatDateTimeForIcal(gym.date, `${startHour.toString().padStart(2, '0')}:00`);
        const endTimeStr = formatDateTimeForIcal(gym.date, `${(startHour + Math.floor(duration)).toString().padStart(2, '0')}:${((duration % 1) * 60).toString().padStart(2, '0')}`);
        
        const summary = gym.availability === 'ideal' ? '💪 Academia (Recomendado)' : '💪 Academia (Leve)';
        const description = `${gym.reason}\\nHorário sugerido: ${gym.suggestedTime}`;
        const color = gym.availability === 'ideal' ? '#EF4444' : '#F97316'; // Red for ideal, orange for possible
        
        ical += `BEGIN:VEVENT
UID:${eventUid}
DTSTAMP:${now}
DTSTART;TZID=America/Sao_Paulo:${startTimeStr}
DTEND;TZID=America/Sao_Paulo:${endTimeStr}
SUMMARY:${summary}
DESCRIPTION:${description}
CATEGORIES:Gym
STATUS:TENTATIVE
TRANSP:TRANSPARENT
COLOR:${color}
END:VEVENT
`;
      }
    });
  }

  ical += `END:VCALENDAR`;
  
  return ical;
}

/**
 * Parse date string to Date object
 */
function parseDate(dateStr: string): Date | null {
  try {
    // Handle formats: "DD/MM/YYYY" or "DD-Mon-YYYY"
    if (dateStr.includes('/')) {
      const [day, month, year] = dateStr.split('/').map(Number);
      return new Date(year, month - 1, day);
    } else if (dateStr.includes('-')) {
      return new Date(dateStr);
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Format date and time for iCal format (YYYYMMDDTHHMMSS)
 */
function formatDateTimeForIcal(dateStr: string, timeStr: string): string {
  // Parse date: "2024-05-15" or "15/05/2024" or "15"
  let date: Date | null = null;
  
  if (dateStr.includes('/')) {
    // DD/MM/YYYY format
    const [day, month, year] = dateStr.split('/').map(Number);
    date = new Date(year, month - 1, day);
  } else if (dateStr.includes('-')) {
    // Full date format
    date = new Date(dateStr);
  } else {
    // Day of month only, assume current month
    const today = new Date();
    date = new Date(today.getFullYear(), today.getMonth(), parseInt(dateStr));
  }
  
  if (!date) {
    return '';
  }
  
  // Parse time: "15:30" or "15:30:00"
  const [hours, minutes] = timeStr.split(':').map(Number);
  date.setHours(hours, minutes, 0, 0);
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  const second = '00';
  
  return `${year}${month}${day}T${hour}${minute}${second}`;
}

/**
 * Download iCal file to user's device
 */
export function downloadCalendarFile(ical: string, filename: string = 'crew-roster.ics'): void {
  const element = document.createElement('a');
  const file = new Blob([ical], { type: 'text/calendar' });
  element.href = URL.createObjectURL(file);
  element.download = filename;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
  URL.revokeObjectURL(element.href);
}

/**
 * Open calendar in Google Calendar
 */
export function openInGoogleCalendar(ical: string): void {
  // Encode the iCal data
  const encoded = encodeURIComponent(ical);
  
  // Create a data URL
  const dataUrl = `data:text/calendar;charset=utf-8,${encoded}`;
  
  // Open in new tab
  window.open(dataUrl, '_blank');
}

/**
 * Generate Google Calendar import URL
 * Note: This requires hosting the .ics file on a server
 */
export function getGoogleCalendarImportUrl(ical: string): string {
  // For now, return a placeholder
  // In production, you'd upload the .ics file to a server and return that URL
  return `https://calendar.google.com/calendar/u/0/r/settings/addbyurl`;
}
