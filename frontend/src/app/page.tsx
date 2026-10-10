'use client';

import React from 'react';
import { HeroSection } from '@/features/home/HeroSection';
import { LearningSystem } from '@/features/home/LearningSystem';
import { ContinueLearning } from '@/features/home/ContinueLearning';
import { LearningPath } from '@/features/home/LearningPath';
import { FinalCTA } from '@/features/home/FinalCTA';

export default function HomePage() {
  return (
    <div className="bg-[#F8F4EC] min-h-screen">
      {/* 01 — HERO (Contains Philosophy & Core Progression) */}
      <HeroSection />

      {/* 02 — LEARNING SYSTEM */}
      <LearningSystem />

      {/* 04 — CONTINUE LEARNING */}
      <ContinueLearning />

      {/* 05 — LEARNING PATH */}
      <LearningPath />

      {/* 06 — FINAL CTA */}
      <FinalCTA />
    </div>
  );
}

