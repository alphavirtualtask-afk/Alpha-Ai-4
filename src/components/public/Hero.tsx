import React from 'react';
import { ArrowRight, CheckCircle2, Shield, Clock } from 'lucide-react';
import { Button } from '../common/Button';
import heroImage from '../../assets/images/hero_virtual_task_workspace_1790511094279.jpg';

interface HeroProps {
  onExploreServices: () => void;
  onGetInTouch: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onExploreServices,
  onGetInTouch,
}) => {
  return (
    <section id="home" className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
      {/* Subtle background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[#E5A93C]/10 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 right-10 w-[350px] h-[350px] bg-[#C8861B]/5 blur-[100px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Text & Value Proposition */}
          <div className="lg:col-span-7 flex flex-col items-start">
            
            {/* Tagline kicker */}
            <div className="flex items-center gap-2 mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-[#E5A93C]">
              <span className="w-8 h-[2px] bg-[#E5A93C]" />
              <span>Your Trust Our Priority</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-extrabold text-white leading-[1.12] tracking-tight font-display text-balance mb-6">
              WE ARE YOUR TRUSTED{' '}
              <span className="gold-gradient-text block sm:inline">
                VIRTUAL TASK
              </span>{' '}
              PARTNER
            </h1>

            {/* Supporting Prose */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mb-8">
              We provide reliable and efficient data-related services to help
              individuals and businesses manage, organize, process and maintain
              their data with accuracy and professionalism.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 mb-10 w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                onClick={onExploreServices}
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
                className="w-full sm:w-auto shadow-lg shadow-[#E5A93C]/20"
              >
                Explore Our Services
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={onGetInTouch}
                className="w-full sm:w-auto"
              >
                Get In Touch
              </Button>
            </div>

            {/* Adjacent Trust Signals (No static pill badges; clean unboxed metadata) */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/10 w-full max-w-xl">
              <div>
                <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-white flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-[#E5A93C] shrink-0" />
                  <span>99.8%</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Accuracy Benchmark
                </div>
              </div>

              <div>
                <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#E5A93C] shrink-0" />
                  <span>14+</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Specialized Solutions
                </div>
              </div>

              <div>
                <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-white flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#E5A93C] shrink-0" />
                  <span>24/7</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Turnaround Support
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Hero Business Visual */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Outer decorative gold frame border */}
              <div className="relative rounded-2xl p-1 bg-gradient-to-br from-[#E5A93C]/50 via-white/10 to-[#E5A93C]/20 shadow-2xl shadow-black/80">
                <div className="relative rounded-[14px] overflow-hidden bg-[#121622] aspect-[16/10] sm:aspect-[4/3] group">
                  <img
                    src={heroImage}
                    alt="Alpha Virtual Task high-end digital operations workstation"
                    className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      // Fallback container
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D11]/90 via-[#0B0D11]/20 to-transparent" />
                  
                  {/* Floating Overlay Badge on visual */}
                  <div className="absolute bottom-4 left-4 right-4 bg-[#121620]/90 border border-white/15 backdrop-blur-md rounded-xl p-3.5 shadow-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs font-semibold text-white tracking-wide">
                          Live Data Task Ops
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-[#E5A93C]">
                        Confidential & Verified
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative Corner Accent */}
              <div className="absolute -bottom-4 -left-4 w-24 h-24 border-b-2 border-l-2 border-[#E5A93C]/40 -z-10 rounded-bl-xl hidden sm:block" />
              <div className="absolute -top-4 -right-4 w-24 h-24 border-t-2 border-r-2 border-[#E5A93C]/40 -z-10 rounded-tr-xl hidden sm:block" />

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
