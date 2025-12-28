import { AlertCircle, Clock, RectangleVertical } from 'lucide-react';
import Image from 'next/image';

interface EventIconProps {
  type: string;
  color: string;
  size?: number;
}

export function EventIcon({ type, color, size = 14 }: EventIconProps) {
  // Determine which icon to show with enhanced styling
  const getIconComponent = () => {
    if (type.includes('Goal Disallowed')) {
      return (
        <div className="relative">
          <div className="absolute -inset-1 animate-pulse rounded-full opacity-40 blur-sm" />

          <Image
            src={
              'https://imagecache.365scores.com/image/upload/f_svg,w_16,h_16,c_limit,q_auto:eco,dpr_1,d_NewBrand25:EventTypes:dark:11.svg/NewBrand25/EventSubType/dark/25'
            }
            width={size}
            height={size}
            alt=""
          />
        </div>
      );
    }
    if (type.includes('Goal')) {
      return (
        <div className="relative">
          <div className="absolute -inset-1 animate-pulse rounded-full opacity-40 blur-sm" />
          <span>⚽</span>
        </div>
      );
    }

    if (type.includes('Yellow Card')) {
      return (
        <div className="relative">
          <div className="absolute -inset-1 animate-pulse rounded-sm opacity-30 blur-sm" />
          <RectangleVertical size={size} color={color} fill={color} className="relative drop-" />
        </div>
      );
    }

    if (type.includes('Red Card')) {
      return (
        <div className="relative">
          <div className="absolute -inset-1 animate-pulse rounded-sm opacity-40 blur-sm" />
          <RectangleVertical
            size={size}
            color={color}
            fill={color}
            className="relative animate-pulse drop-"
            style={{ animationDuration: '2s' }}
          />
        </div>
      );
    }

    // Default icon for other events
    return <AlertCircle size={size} color={color} className="drop-" />;
  };

  return <div className="flex items-center justify-center">{getIconComponent()}</div>;
}

interface EventTimelineProps {
  match: any;
}

export function EventTimeline({ match }: EventTimelineProps) {
  const getPlayerName = (playerId: number) => {
    if (!match?.members) return 'Player';
    const member = match.members.find((m: any) => m.id === playerId);
    return member ? member.name : 'Unknown Player';
  };

  const getFilteredEvents = () => {
    if (!match?.events) return [];
    return match.events
      .filter((e: any) => {
        const name = e.eventType?.name || '';
        return name.includes('Goal') || name.includes('Yellow Card') || name.includes('Red Card');
      })
      .sort((a: any, b: any) => {
        // Sort by game time descending (most recent first)
        const timeA = parseInt(a.gameTimeDisplay) || 0;
        const timeB = parseInt(b.gameTimeDisplay) || 0;
        return timeB - timeA;
      });
  };

  const filteredEvents = getFilteredEvents();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-center gap-3">
        <div className="h-px flex-1 bg-linear-to-r from-transparent to-white/10" />
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm">
          <Clock className="h-3.5 w-3.5 text-white/60" />
          <span className="text-[10px] font-extrabold tracking-[0.2em] text-white/60 uppercase">
            Match Timeline
          </span>
        </div>
        <div className="h-px flex-1 bg-linear-to-l from-transparent to-white/10" />
      </div>

      {filteredEvents.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16">
          <div className="rounded-full bg-white/5 p-6">
            <Clock className="h-8 w-8 text-white/20" />
          </div>
          <div className="text-center">
            <p className="mb-1 text-sm font-bold text-white/40">No events yet</p>
            <p className="text-xs text-white/20">Key moments will appear here</p>
          </div>
        </div>
      ) : (
        <div className="relative space-y-6 py-4">
          {/* Vertical Timeline Line */}
          <div className="absolute top-0 bottom-0 left-1/2 w-px -translate-x-1/2 bg-linear-to-b from-white/20 via-white/10 to-transparent" />

          {filteredEvents.map((event: any, i: number) => {
            const isHome = event.competitorId === match.homeCompetitor.id;
            const eventName = event.eventType?.name || 'Event';

            let eventColor = '#94a3b8';
            let eventBg = 'from-slate-500/20 to-slate-500/10';
            if (eventName.includes('Goal Disallowed')) {
              eventBg = 'from-gray-500/20 to-gray-500/10';
            } else if (eventName.includes('Yellow')) {
              eventColor = '#FDE047';
              eventBg = 'from-yellow-400/20 to-yellow-400/10';
            } else if (eventName.includes('Red')) {
              eventColor = '#EF4444';
              eventBg = 'from-red-500/20 to-red-500/10';
            } else if (eventName.includes('Goal')) {
              eventColor = '#22c55e';
              eventBg = 'from-green-500/20 to-green-500/10';
            }

            return (
              <div
                key={i}
                className={`animate-in fade-in slide-in-from-bottom relative flex items-center duration-500`}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {/* Event Content */}
                <div
                  className={`flex flex-1 items-center gap-4 ${
                    !isHome ? 'flex-row justify-end pr-12' : 'flex-row-reverse justify-end pl-12'
                  }`}
                >
                  <div
                    className={`group relative flex items-center gap-3 rounded-2xl  border-white/10 px-5 py-3 backdrop-blur-sm`}
                  >
                    {isHome ? (
                      <>
                        <div className="relative flex items-end gap-5">
                          <span className="text-sm font-bold text-white">
                            {getPlayerName(event.playerId)}
                          </span>
                          <EventIcon type={eventName} color={eventColor} size={20} />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="relative flex gap-5 items-start">
                          <span className="text-sm font-bold text-white">
                            {getPlayerName(event.playerId)}
                          </span>
                          <EventIcon type={eventName} color={eventColor} size={20} />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Center Time Badge */}
                <div className="absolute left-1/2 z-20 flex -translate-x-1/2 items-center justify-center">
                  <div className="relative">
                    {/* Badge */}
                    <div
                      className="relative flex h-11 w-11 items-center justify-center rounded-full border-2 bg-[#0f0f0f] "
                      style={{ borderColor: eventColor }}
                    >
                      <span
                        className="text-sm font-black tabular-nums"
                        style={{ color: eventColor }}
                      >
                        {event.gameTime + event.addedTime}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
