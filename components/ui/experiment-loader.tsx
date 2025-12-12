'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

type ExperimentLoaderProps = {
  onComplete: () => void;
  duration?: number;
};

export function ExperimentLoader({ onComplete, duration = 4000 }: ExperimentLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [countdown, setCountdown] = useState(4);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);

      // Update countdown
      const remaining = Math.ceil((duration - elapsed) / 1000);
      setCountdown(Math.max(0, remaining));

      if (newProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          onComplete();
        }, 200); // Small delay before navigation
      }
    }, 16); // ~60fps updates

    return () => clearInterval(interval);
  }, [duration, onComplete]);

  const getStatusMessage = () => {
    if (progress < 25) return 'Loading modules...';
    if (progress < 50) return 'Calibrating sensors...';
    if (progress < 75) return 'Preparing workspace...';
    if (progress < 100) return 'Ready to launch...';
    return 'Complete!';
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-[#010415]">
      <div className="text-center space-y-8 w-full max-w-md px-6">
        {/* Logo with pulse animation */}
        <div className="relative w-24 h-24 mx-auto">
          <div className="absolute inset-0 animate-pulse">
            <Image
              src="/lab-logo.png"
              alt="Experiment Engine"
              width={96}
              height={96}
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-3">
          <div className="relative h-3 bg-[#0a0f1f] rounded-full overflow-hidden">
            {/* Shimmer background */}
            <div className="absolute inset-0 shimmer-bg" />
            
            {/* Progress fill */}
            <div
              className="relative h-full rounded-full transition-all duration-200 ease-out"
              style={{
                width: `${progress}%`,
                background: `linear-gradient(90deg, #3b82f6 0%, #facc15 50%, #3b82f6 100%)`,
                backgroundSize: '200% 100%',
                boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
              }}
            >
              {/* Glossy overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded-full" />
            </div>
          </div>

          {/* Progress percentage and countdown */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#3b82f6] font-mono font-bold">
              {Math.round(progress)}%
            </span>
            <span className="text-gray-400 font-mono">
              {countdown > 0 ? `${countdown}s` : 'Launching...'}
            </span>
          </div>
        </div>

        {/* Status message */}
        <div className="space-y-2">
          <p className="text-white font-medium text-lg">{getStatusMessage()}</p>
          <div className="flex items-center justify-center gap-1">
            <span className="w-2 h-2 bg-[#3b82f6] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-[#3b82f6] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-[#3b82f6] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

