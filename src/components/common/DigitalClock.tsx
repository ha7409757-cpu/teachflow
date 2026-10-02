/**
 * Digital Clock Component
 * Displays live time in Asia/Dhaka school timezone with Bengali localization.
 */

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DigitalClock: React.FC<{ showSeconds?: boolean; className?: string }> = ({
  showSeconds = false,
  className = ''
}) => {
  const [time, setTime] = useState<Date>(new Date());
  const { language } = useApp();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = time.toLocaleTimeString(language === 'bn' ? 'bn-BD' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: showSeconds ? '2-digit' : undefined,
    hour12: true
  });

  const formattedDate = time.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className={`flex items-center gap-2 text-xs font-mono text-emerald-800 ${className}`}>
      <Clock className="w-3.5 h-3.5 text-rose-600 shrink-0" />
      <span>{formattedDate}</span>
      <span className="text-emerald-400">•</span>
      <span className="font-bold text-emerald-950 tracking-wider">{formattedTime}</span>
    </div>
  );
};
