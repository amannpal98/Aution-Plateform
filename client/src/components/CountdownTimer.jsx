import React, { useState, useEffect } from 'react';

const CountdownTimer = ({ endTime, onEnd, compact = false }) => {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(endTime));

  function getTimeLeft(end) {
    const total = new Date(end) - new Date();
    if (total <= 0) return null;
    return {
      total,
      days:    Math.floor(total / (1000 * 60 * 60 * 24)),
      hours:   Math.floor((total / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((total / 1000 / 60) % 60),
      seconds: Math.floor((total / 1000) % 60),
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const tl = getTimeLeft(endTime);
      setTimeLeft(tl);
      if (!tl) { clearInterval(timer); onEnd?.(); }
    }, 1000);
    return () => clearInterval(timer);
  }, [endTime, onEnd]);

  if (!timeLeft) {
    return (
      <span className={`font-bold text-red-400 ${compact ? 'text-xs' : 'text-sm'}`}>
        ⏰ Auction Ended
      </span>
    );
  }

  const isUrgent = timeLeft.total < 1000 * 60 * 60; // < 1 hour
  const isCritical = timeLeft.total < 1000 * 60 * 5; // < 5 minutes

  if (compact) {
    return (
      <span className={`font-mono font-bold text-xs ${isCritical ? 'text-red-400 animate-pulse' : isUrgent ? 'text-amber-400' : 'text-emerald-400'}`}>
        {timeLeft.days > 0 && `${timeLeft.days}d `}
        {String(timeLeft.hours).padStart(2,'0')}:{String(timeLeft.minutes).padStart(2,'0')}:{String(timeLeft.seconds).padStart(2,'0')}
      </span>
    );
  }

  const segments = timeLeft.days > 0
    ? [['Days', timeLeft.days], ['Hours', timeLeft.hours], ['Min', timeLeft.minutes], ['Sec', timeLeft.seconds]]
    : [['Hours', timeLeft.hours], ['Min', timeLeft.minutes], ['Sec', timeLeft.seconds]];

  return (
    <div className="flex items-center gap-2">
      {segments.map(([label, val]) => (
        <div key={label} className="flex flex-col items-center">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-mono font-black text-lg
            ${isCritical ? 'bg-red-900/60 text-red-300 border border-red-700' :
              isUrgent   ? 'bg-amber-900/60 text-amber-300 border border-amber-700' :
                           'bg-slate-800 text-white border border-slate-700'}`}>
            {String(val).padStart(2, '0')}
          </div>
          <span className="text-xs text-slate-500 mt-1">{label}</span>
        </div>
      ))}
    </div>
  );
};

export default CountdownTimer;
