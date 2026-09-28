import React from 'react';
import {
  ShieldAlert,
  Briefcase,
  Folders,
  Clock,
  Users,
  Award,
} from 'lucide-react';
import { WHY_CHOOSE_US } from '../../data/mockData';

export const WhyChooseUs: React.FC = () => {
  const getIcon = (name: string) => {
    const iconProps = { className: 'w-6 h-6 text-[#E5A93C]' };
    switch (name) {
      case 'ShieldAlert':
        return <ShieldAlert {...iconProps} />;
      case 'Briefcase':
        return <Briefcase {...iconProps} />;
      case 'Folders':
        return <Folders {...iconProps} />;
      case 'Clock':
        return <Clock {...iconProps} />;
      case 'Users':
        return <Users {...iconProps} />;
      case 'Award':
        return <Award {...iconProps} />;
      default:
        return <Award {...iconProps} />;
    }
  };

  return (
    <section className="py-24 bg-[#0B0D11] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-[#E5A93C] mb-3">
            <span>Commitment to Excellence</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white font-display tracking-tight text-balance">
            Why Choose Us?
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300">
            Built on accuracy, strict confidentiality, and uninterrupted operational reliability.
          </p>
        </div>

        {/* 6 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {WHY_CHOOSE_US.map((item, idx) => (
            <div
              key={item.id}
              className="relative p-7 rounded-xl bg-[#121620] border border-[#232938] hover:border-[#E5A93C]/40 transition-all duration-300 group"
            >
              {/* Subtle top index bar */}
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-lg bg-[#181E2B] border border-white/5 flex items-center justify-center group-hover:scale-105 transition-transform">
                  {getIcon(item.iconName)}
                </div>
                <span className="text-xs font-mono font-bold text-slate-500">
                  Pillar {idx + 1}
                </span>
              </div>

              <h3 className="text-lg font-bold text-white font-display mb-2.5 group-hover:text-[#F5B942] transition-colors">
                {item.title}
              </h3>
              
              <p className="text-sm text-slate-300 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
