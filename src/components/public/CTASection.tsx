import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../common/Button';

interface CTASectionProps {
  onGetStarted: () => void;
  onContactUs: () => void;
}

export const CTASection: React.FC<CTASectionProps> = ({
  onGetStarted,
  onContactUs,
}) => {
  return (
    <section className="py-20 bg-[#0B0D11] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Banner Container with gold border gradient */}
        <div className="relative rounded-3xl p-8 sm:p-12 lg:p-16 bg-gradient-to-b from-[#141926] via-[#10141E] to-[#0D1017] border border-[#E5A93C]/30 shadow-2xl overflow-hidden">
          
          {/* Subtle Ambient Radial Lighting */}
          <div className="absolute top-0 right-0 w-[400px] h-[300px] bg-[#E5A93C]/10 blur-[90px] pointer-events-none rounded-full" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[200px] bg-[#C8861B]/10 blur-[80px] pointer-events-none rounded-full" />

          <div className="relative z-10 max-w-3xl mx-auto text-center flex flex-col items-center">
            
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-[#E5A93C] mb-4">
              <Sparkles className="w-4 h-4" />
              <span>Ready for Operational Peace of Mind?</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white font-display tracking-tight text-balance mb-5">
              Have a Project in Mind?
            </h2>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mb-10">
              Let's turn your data-related tasks into organized, accurate and reliable results.
              From high-volume migrations to daily spreadsheet audits, we have you covered.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                onClick={onGetStarted}
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
                className="w-full sm:w-auto shadow-lg shadow-[#E5A93C]/25"
              >
                Get Started
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={onContactUs}
                className="w-full sm:w-auto"
              >
                Contact Us
              </Button>
            </div>

            <div className="mt-8 text-xs text-slate-400 flex items-center gap-4">
              <span>✓ Free quote & scoping</span>
              <span>·</span>
              <span>✓ Rapid 24-hr initial assessment</span>
              <span>·</span>
              <span>✓ Enterprise NDA</span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
