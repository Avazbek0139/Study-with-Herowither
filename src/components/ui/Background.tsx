'use client'

import React from 'react'

export function Background() {
  return (
    <div className="fixed inset-0 z-[-2] w-full h-full bg-dark-950 overflow-hidden pointer-events-none">
      {/* Noise overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] z-10 mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-500/10 blur-[100px] animate-pulse-slow motion-reduce:animate-none" style={{ animationDuration: '25s' }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#a78bfa]/5 blur-[120px] animate-pulse-slow motion-reduce:animate-none" style={{ animationDuration: '30s', animationDelay: '5s' }} />
      <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-brand-400/5 blur-[90px] animate-pulse-slow motion-reduce:animate-none" style={{ animationDuration: '20s', animationDelay: '10s' }} />
    </div>
  )
}
