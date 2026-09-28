import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Shield, CheckCircle, Lock, Award, ArrowRight } from 'lucide-react';
import aboutImage from '../../assets/images/about_data_operations_1790511113070.jpg';

interface AboutUsProps {
  onContactClick: () => void;
}

export const AboutUs: React.FC<AboutUsProps> = ({ onContactClick }) => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <section id="about" className="py-24 bg-[#0B0D11] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Visual Column */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <div className="relative">
              {/* Outer Glow & Frame */}
              <div className="relative rounded-2xl p-1 bg-gradient-to-tr from-[#E5A93C]/40 via-white/10 to-[#E5A93C]/20 shadow-2xl">
                <div className="rounded-[14px] overflow-hidden bg-[#161B26] aspect-[4/3] relative group">
                  <img
                    src={aboutImage}
                    alt="Alpha Virtual Task team of data specialists reviewing operations"
                    className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D11]/85 via-transparent to-transparent" />
                  
                  {/* Floating Trust Card */}
                  <div className="absolute bottom-4 left-4 right-4 bg-[#121620]/90 backdrop-blur-md border border-white/10 rounded-xl p-3.5 shadow-xl flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white uppercase tracking-wider">
                        Enterprise Quality Audit
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Zero-error tolerance policy
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[#E5A93C]/20 text-[#E5A93C] flex items-center justify-center font-bold text-xs">
                      ✓
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative background border offset */}
              <div className="absolute -bottom-4 -right-4 w-32 h-32 border-b-2 border-r-2 border-[#E5A93C]/30 rounded-br-2xl -z-10 hidden sm:block" />
            </div>
          </div>

          {/* Text Column */}
          <div className="lg:col-span-7 order-1 lg:order-2">
            
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-[#E5A93C] mb-3">
              <span>About Alpha Virtual Task</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white font-display tracking-tight text-balance mb-6">
              Precision Data Management & Dedicated Virtual Task Support
            </h2>

            <p className="text-base text-slate-300 leading-relaxed mb-6">
              Alpha Virtual Task was established with a singular objective: to provide
              businesses, entrepreneurs, and global organizations with reliable,
              meticulous, and strictly confidential virtual data operations.
            </p>

            <p className="text-sm text-slate-400 leading-relaxed mb-8">
              In an era dominated by raw data overload and automated inaccuracies, we combine
              intelligent toolsets with rigorously trained human specialists. Every dataset,
              document, spreadsheet, or transcript processed through our pipeline undergoes
              rigorous multi-tier quality assurance before it reaches your desk.
            </p>

            {/* Core Values Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="flex items-start gap-3 bg-[#121622] p-3.5 rounded-xl border border-white/5">
                <Shield className="w-5 h-5 text-[#E5A93C] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white">99.8% Accuracy</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Dual-check verification on every deliverable.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-[#121622] p-3.5 rounded-xl border border-white/5">
                <Lock className="w-5 h-5 text-[#E5A93C] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white">Strict NDA & Privacy</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Encrypted protocols and zero client data sharing.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-[#121622] p-3.5 rounded-xl border border-white/5">
                <Award className="w-5 h-5 text-[#E5A93C] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white">Dedicated Task Leads</h4>
                  <p className="text-xs text-slate-400 mt-0.5">A single accountable point of contact.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-[#121622] p-3.5 rounded-xl border border-white/5">
                <CheckCircle className="w-5 h-5 text-[#E5A93C] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white">On-Time Delivery</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Milestone adherence with no unexpected delays.</p>
                </div>
              </div>
            </div>

            {/* Action Row */}
            <div className="flex flex-wrap items-center gap-4">
              <Button
                variant="primary"
                size="md"
                onClick={() => setModalOpen(true)}
              >
                Learn More About Us
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={onContactClick}
              >
                Schedule Consultation
              </Button>
            </div>

          </div>

        </div>

      </div>

      {/* About Us Deep-Dive Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Our Mission & Operational Standards"
        subtitle="Alpha Virtual Task — Your Trust Our Priority"
        maxWidth="2xl"
      >
        <div className="space-y-5 text-sm text-slate-300">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#E5A93C] mb-1">
              Who We Are
            </h4>
            <p className="leading-relaxed">
              Alpha Virtual Task is an agile, enterprise-grade virtual operations firm specializing in data entry, cleaning, processing, spreadsheet architecture, web intelligence, and multi-stage content quality assurance. We operate globally to serve enterprises, startups, consulting firms, and individual founders.
            </p>
          </div>

          <div className="border-t border-white/10 pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#E5A93C] mb-2">
              Our 3 Operational Standards
            </h4>
            <div className="space-y-3">
              <div className="bg-[#161B26] p-3.5 rounded-lg border border-white/5">
                <div className="font-semibold text-white">1. Dual-Tier Verification</div>
                <div className="text-xs text-slate-400 mt-1">
                  No work is dispatched to a client by a single operator alone. Every completed dataset is audited independently by a Senior QA lead before sign-off.
                </div>
              </div>
              <div className="bg-[#161B26] p-3.5 rounded-lg border border-white/5">
                <div className="font-semibold text-white">2. Ironclad Confidentiality</div>
                <div className="text-xs text-slate-400 mt-1">
                  We enforce comprehensive Non-Disclosure Agreements (NDAs), encrypted file transmissions, and restricted cloud access so your business intel remains safe.
                </div>
              </div>
              <div className="bg-[#161B26] p-3.5 rounded-lg border border-white/5">
                <div className="font-semibold text-white">3. Guaranteed Turnaround</div>
                <div className="text-xs text-slate-400 mt-1">
                  We quote realistic timelines and honor them. In the rare event of scope expansion, clients are notified in advance with clear updated estimates.
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setModalOpen(false);
                onContactClick();
              }}
              icon={<ArrowRight className="w-3.5 h-3.5" />}
              iconPosition="right"
            >
              Get In Touch With Our Team
            </Button>
          </div>
        </div>
      </Modal>
    </section>
  );
};
