import React from 'react';
import { ServiceItem } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Check, Clock, Briefcase, ArrowRight } from 'lucide-react';

interface ServiceDetailModalProps {
  service: ServiceItem | null;
  onClose: () => void;
  onRequestQuote: (serviceName: string) => void;
}

export const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({
  service,
  onClose,
  onRequestQuote,
}) => {
  if (!service) return null;

  return (
    <Modal
      isOpen={!!service}
      onClose={onClose}
      title={service.name}
      subtitle="Alpha Virtual Task Verified Solution"
      maxWidth="2xl"
    >
      <div className="space-y-6">
        <div>
          <p className="text-sm text-slate-300 leading-relaxed">
            {service.fullDesc}
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#161B26] p-4 rounded-xl border border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#E5A93C]/10 text-[#E5A93C]">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-400">
                Guaranteed Turnaround
              </div>
              <div className="text-sm font-semibold text-white font-mono">
                {service.turnaround}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#E5A93C]/10 text-[#E5A93C]">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-400">
                Standard Quality Check
              </div>
              <div className="text-sm font-semibold text-emerald-400">
                Dual-Tier Inspection
              </div>
            </div>
          </div>
        </div>

        {/* Deliverables */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#E5A93C] mb-3">
            Standard Package Deliverables
          </h4>
          <ul className="space-y-2.5">
            {service.deliverables.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                <div className="w-4 h-4 rounded-full bg-[#E5A93C]/15 text-[#E5A93C] flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recommended For */}
        <div className="text-xs text-slate-400 border-t border-white/5 pt-4">
          <span className="font-semibold text-slate-300">Best Suited For: </span>
          {service.recommendedFor}
        </div>

        {/* Action Row */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              onClose();
              onRequestQuote(service.name);
            }}
            icon={<ArrowRight className="w-4 h-4" />}
            iconPosition="right"
          >
            Request This Service
          </Button>
        </div>
      </div>
    </Modal>
  );
};
