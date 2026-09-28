import React, { useState } from 'react';
import {
  Database,
  Layers,
  Sparkles,
  AlignLeft,
  RefreshCw,
  Cpu,
  FolderGit2,
  FileSpreadsheet,
  Search,
  Mic,
  Globe,
  CheckCheck,
  ShieldCheck,
  FileCheck,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import { SERVICES_DATA } from '../../data/mockData';
import { ServiceItem } from '../../types';
import { ServiceDetailModal } from './ServiceDetailModal';
import { Button } from '../common/Button';

interface ServicesSectionProps {
  onRequestService: (serviceName: string) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  onRequestService,
}) => {
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<'all' | 'data-processing' | 'spreadsheets-research' | 'content-qa'>('all');

  const filteredServices = activeCategory === 'all'
    ? SERVICES_DATA
    : SERVICES_DATA.filter((s) => s.category === activeCategory);

  const renderIcon = (name: string) => {
    const iconProps = { className: 'w-6 h-6 text-[#E5A93C]' };
    switch (name) {
      case 'Database':
        return <Database {...iconProps} />;
      case 'Layers':
        return <Layers {...iconProps} />;
      case 'Sparkles':
        return <Sparkles {...iconProps} />;
      case 'AlignLeft':
        return <AlignLeft {...iconProps} />;
      case 'RefreshCw':
        return <RefreshCw {...iconProps} />;
      case 'Cpu':
        return <Cpu {...iconProps} />;
      case 'FolderGit2':
        return <FolderGit2 {...iconProps} />;
      case 'FileSpreadsheet':
        return <FileSpreadsheet {...iconProps} />;
      case 'Search':
        return <Search {...iconProps} />;
      case 'Mic':
        return <Mic {...iconProps} />;
      case 'Globe':
        return <Globe {...iconProps} />;
      case 'CheckCheck':
        return <CheckCheck {...iconProps} />;
      case 'ShieldCheck':
        return <ShieldCheck {...iconProps} />;
      case 'FileCheck':
        return <FileCheck {...iconProps} />;
      default:
        return <Database {...iconProps} />;
    }
  };

  return (
    <section id="services" className="py-24 bg-[#0E121A] relative border-t border-b border-white/5">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#E5A93C]/5 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-[#E5A93C]/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-[#E5A93C] mb-3">
            <span>Precision Operational Support</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white font-display tracking-tight text-balance">
            Our Services
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300">
            Comprehensive Data Solutions for Your Business
          </p>
        </div>

        {/* Interactive Category Segmented Controls (allowed filter buttons per design rule 1.A) */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-[#E5A93C] text-black shadow-md shadow-[#E5A93C]/20'
                : 'bg-[#161B26] text-slate-300 hover:text-white hover:bg-[#1E2433] border border-white/5'
            }`}
          >
            All Services (14)
          </button>
          <button
            onClick={() => setActiveCategory('data-processing')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
              activeCategory === 'data-processing'
                ? 'bg-[#E5A93C] text-black shadow-md shadow-[#E5A93C]/20'
                : 'bg-[#161B26] text-slate-300 hover:text-white hover:bg-[#1E2433] border border-white/5'
            }`}
          >
            Data Operations (7)
          </button>
          <button
            onClick={() => setActiveCategory('spreadsheets-research')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
              activeCategory === 'spreadsheets-research'
                ? 'bg-[#E5A93C] text-black shadow-md shadow-[#E5A93C]/20'
                : 'bg-[#161B26] text-slate-300 hover:text-white hover:bg-[#1E2433] border border-white/5'
            }`}
          >
            Spreadsheets & Research (2)
          </button>
          <button
            onClick={() => setActiveCategory('content-qa')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
              activeCategory === 'content-qa'
                ? 'bg-[#E5A93C] text-black shadow-md shadow-[#E5A93C]/20'
                : 'bg-[#161B26] text-slate-300 hover:text-white hover:bg-[#1E2433] border border-white/5'
            }`}
          >
            Content, Translation & QA (5)
          </button>
        </div>

        {/* Services Grid (All 14 cards rendered with high fidelity) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service, index) => (
            <div
              key={service.id}
              className="group relative bg-[#121622] rounded-xl p-6 border border-[#232A3B] transition-all duration-300 hover:-translate-y-1 hover:border-[#E5A93C]/50 hover:shadow-xl hover:shadow-[#E5A93C]/5 flex flex-col justify-between"
            >
              <div>
                {/* Card Top: Gold Icon & Index number */}
                <div className="flex items-start justify-between mb-5">
                  <div className="w-12 h-12 rounded-lg bg-[#1A202E] border border-[#2B354A] flex items-center justify-center transition-colors group-hover:bg-[#E5A93C]/10 group-hover:border-[#E5A93C]/40">
                    {renderIcon(service.iconName)}
                  </div>
                  <span className="text-xs font-mono text-slate-500 font-semibold">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>

                {/* Service Name */}
                <h3 className="text-lg font-bold text-white mb-2.5 font-display group-hover:text-[#F5B942] transition-colors">
                  {service.name}
                </h3>

                {/* Short Description */}
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                  {service.shortDesc}
                </p>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <button
                  onClick={() => setSelectedService(service)}
                  className="text-xs font-semibold text-[#E5A93C] hover:text-[#FDE68A] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Learn More</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onRequestService(service.name)}
                  className="text-xs"
                >
                  Request Service
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Global CTA within Services Section */}
        <div className="mt-16 text-center bg-[#141924] border border-white/5 rounded-2xl p-8 max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-left">
            <h4 className="text-lg font-bold text-white font-display">
              Need a custom tailored virtual task workflow?
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              We create specialized data pipelines and dedicated virtual teams for ongoing operations.
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={() => onRequestService('Custom Virtual Task Workflow')}
            className="shrink-0 w-full sm:w-auto"
          >
            Request Custom Scope
          </Button>
        </div>

      </div>

      {/* Service Detail Modal */}
      <ServiceDetailModal
        service={selectedService}
        onClose={() => setSelectedService(null)}
        onRequestQuote={(serviceName) => onRequestService(serviceName)}
      />
    </section>
  );
};
