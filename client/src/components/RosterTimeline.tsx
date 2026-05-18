'use client';

import { type CrewRoster, type RosterDay } from '@/lib/pdfParser';
import { Plane, Clock } from 'lucide-react';

interface RosterTimelineProps {
  roster: CrewRoster;
}

export function RosterTimeline({ roster }: RosterTimelineProps) {
  const getDayTypeColor = (dayType: string) => {
    switch (dayType) {
      case 'VOO':
        return 'bg-blue-100 border-blue-300';
      case 'LAYOVER':
        return 'bg-purple-100 border-purple-300';
      case 'OFF':
      case 'DO':
      case 'DOF':
      case 'DR':
        return 'bg-green-100 border-green-300';
      case 'HSB':
      case 'HSBE':
        return 'bg-yellow-100 border-yellow-300';
      case 'CRM':
        return 'bg-orange-100 border-orange-300';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  };

  const getDayTypeLabel = (dayType: string) => {
    switch (dayType) {
      case 'VOO':
        return 'VOO';
      case 'LAYOVER':
        return 'PERNOITE';
      case 'OFF':
      case 'DO':
      case 'DOF':
      case 'DR':
        return 'FOLGA';
      case 'HSB':
        return 'HSB';
      case 'HSBE':
        return 'HSBE';
      case 'CRM':
        return 'CRM';
      default:
        return dayType;
    }
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-7 gap-2 mb-4">
        {roster.days.map((day, index) => {
          const dayNum = parseInt(day.date.split('/')[0]);
          return (
            <div key={index} className="flex flex-col items-center">
              <div className={`w-full p-2 rounded border-2 ${getDayTypeColor(day.type)} text-center`}>
                <div className="text-xs font-bold text-gray-700">
                  {dayNum}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {getDayTypeLabel(day.type)}
                </div>
                {day.legs && day.legs.length > 0 && (
                  <div className="text-xs mt-1 text-blue-600 font-semibold">
                    {day.legs.length} voo{day.legs.length > 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed view */}
      <div className="space-y-4">
        {roster.days.map((day, dayIndex) => (
          <div key={dayIndex} className="border-l-4 border-blue-400 pl-4 py-2">
            <div className="flex items-center gap-2 mb-2">
              <div className="font-semibold text-gray-700">
                {day.date} ({day.dayOfWeek})
              </div>
              <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                {getDayTypeLabel(day.type)}
              </span>
            </div>

            {day.legs && day.legs.length > 0 ? (
              <div className="space-y-2">
                {day.legs.map((leg, legIndex) => (
                  <div key={legIndex} className="bg-blue-50 p-2 rounded text-sm">
                    <div className="flex items-center gap-2">
                      <Plane className="w-4 h-4 text-blue-600" />
                      <span className="font-semibold">{leg.flightNumber} {leg.origin}-{leg.destination}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                      <Clock className="w-3 h-3" />
                      {leg.departureTime} - {leg.arrivalTime}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-gray-500 italic">Sem atividades programadas</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
