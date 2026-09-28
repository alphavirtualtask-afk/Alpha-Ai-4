import React, { useState } from 'react';
import { HOW_IT_WORKS_STEPS } from '../../data/mockData';
import { ArrowRight, Check } from 'lucide-react';
import { Button } from '../common/Button';

interface HowItWorksProps {
  onStartProject: () => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ onStartProject }) => {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section className="py-24 bg-[#0E121A] relative border-t border-b border-white/5 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-[#E5A93C]/5 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-[#E5A93C] mb-3">
            <span>Seamless Project Delivery</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white font-display tracking-tight text-balance">
            How It Works
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300">
            A transparent 6-step lifecycle ensuring clear requirements, guaranteed turnaround, and flawless execution.
          </p>
        </div>

        {/* 6 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {HOW_IT_WORKS_STEPS.map((stepItem, index) => {
            const isSelected = activeStep === index;
            return (
              <div
                key={stepItem.step}
                onClick={() => setActiveStep(index)}
                className={`p-7 rounded-xl border transition-all duration-300 cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? 'bg-[#161C28] border-[#E5A93C] shadow-lg shadow-[#E5A93C]/10 scale-[1.02]'
                    : 'bg-[#121622] border-[#222838] hover:border-slate-600'
                }`}
              >
                {/* Step Number */}
                <div className="flex items-center justify-between mb-5">
                  <span
                    className={`font-mono text-2xl font-extrabold tabular-nums ${
                      isSelected ? 'text-[#E5A93C]' : 'text-slate-500'
                    }`}
                  >
                    {stepItem.step}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      isSelected
                        ? 'bg-[#E5A93C] text-black'
                        : 'bg-[#1C2230] text-slate-400'
                    }`}
                  >
                    {index + 1}
                  </div>
                </div>

                {/* Step Title */}
                <h3 className="text-lg font-bold text-white font-display mb-2.5">
                  {stepItem.title}
                </h3>

                {/* Step Description */}
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {stepItem.description}
                </p>

                {isSelected && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#E5A93C] to-[#F5B942]" />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Highlight Box */}
        <div className="bg-[#121620] border border-[#2B3242] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[#E5A93C] mb-1">
              Active Step Spotlight: Step {HOW_IT_WORKS_STEPS[activeStep].step}
            </div>
            <h4 className="text-xl font-bold text-white font-display">
              {HOW_IT_WORKS_STEPS[activeStep].title}
            </h4>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              {HOW_IT_WORKS_STEPS[activeStep].description}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="primary"
              size="md"
              onClick={onStartProject}
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
            >
              Start Your Project
            </Button>
          </div>
        </div>

      </div>
    </section>
  );
};
