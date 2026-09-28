import React, { useState } from 'react';
import { Logo } from '../common/Logo';
import { COMPANY_INFO, SERVICES_DATA } from '../../data/mockData';
import { Modal } from '../common/Modal';
import { ViewMode } from '../../types';
import { Mail, Phone, ShieldCheck, ExternalLink } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: ViewMode) => void;
  onScrollTo: (id: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onScrollTo }) => {
  const [legalModal, setLegalModal] = useState<'privacy' | 'terms' | null>(null);

  return (
    <footer className="bg-[#080A0E] border-t border-white/10 pt-16 pb-12 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-white/5">
          
          {/* Col 1: Brand & Tagline */}
          <div className="lg:col-span-4 space-y-4">
            <Logo size="md" showTagline={true} onClick={() => onScrollTo('home')} />
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm mt-3">
              We provide reliable and efficient data-related services to help individuals and businesses manage, organize, process and maintain their data with accuracy and professionalism.
            </p>
            <div className="text-xs text-slate-500 pt-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#E5A93C]" />
              <span>Enterprise Grade Confidentiality & Quality</span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onScrollTo('home')}
                  className="hover:text-[#E5A93C] transition-colors cursor-pointer"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollTo('services')}
                  className="hover:text-[#E5A93C] transition-colors cursor-pointer"
                >
                  Our Services
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollTo('about')}
                  className="hover:text-[#E5A93C] transition-colors cursor-pointer"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollTo('reviews')}
                  className="hover:text-[#E5A93C] transition-colors cursor-pointer"
                >
                  Reviews
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollTo('contact')}
                  className="hover:text-[#E5A93C] transition-colors cursor-pointer"
                >
                  Contact Us
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Popular Services */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Featured Solutions
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onScrollTo('services')}
                  className="hover:text-[#E5A93C] transition-colors text-left"
                >
                  Data Entry & Validation
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollTo('services')}
                  className="hover:text-[#E5A93C] transition-colors text-left"
                >
                  Data Cleaning & Deduplication
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollTo('services')}
                  className="hover:text-[#E5A93C] transition-colors text-left"
                >
                  Excel & Spreadsheet Services
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollTo('services')}
                  className="hover:text-[#E5A93C] transition-colors text-left"
                >
                  Web Research & Collection
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollTo('services')}
                  className="hover:text-[#E5A93C] transition-colors text-left"
                >
                  Content QA & Proofreading
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Portals & Contact */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Portals & Inquiries
            </h4>
            <div className="space-y-2 text-xs">
              <div>
                <a
                  href={`mailto:${COMPANY_INFO.email}`}
                  className="text-white hover:text-[#E5A93C] transition-colors flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5 text-[#E5A93C]" />
                  <span>{COMPANY_INFO.email}</span>
                </a>
              </div>
              <div>
                <a
                  href={`tel:${COMPANY_INFO.phoneRaw || '+917738767859'}`}
                  className="hover:text-[#E5A93C] transition-colors flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-[#E5A93C]" />
                  <span>{COMPANY_INFO.phone}</span>
                </a>
              </div>

              <div className="pt-2 flex flex-col gap-1.5">
                <button
                  onClick={() => onNavigate('client-signin')}
                  className="text-xs text-slate-300 hover:text-[#E5A93C] text-left transition-colors flex items-center gap-1"
                >
                  <span>Client Login</span>
                  <ExternalLink className="w-3 h-3 text-[#E5A93C]" />
                </button>
                <button
                  onClick={() => onNavigate('admin-login')}
                  className="text-xs text-slate-400 hover:text-[#E5A93C] text-left transition-colors flex items-center gap-1"
                >
                  <span>Operations Admin Login</span>
                  <ExternalLink className="w-3 h-3 text-[#E5A93C]/70" />
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Legal */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © 2025 Alpha Virtual Task. All Rights Reserved.
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setLegalModal('privacy')}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <span>·</span>
            <button
              onClick={() => setLegalModal('terms')}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Terms & Conditions
            </button>
          </div>
        </div>

      </div>

      {/* Legal Dialogs */}
      <Modal
        isOpen={legalModal !== null}
        onClose={() => setLegalModal(null)}
        title={legalModal === 'privacy' ? 'Privacy Policy' : 'Terms & Conditions'}
        subtitle="Alpha Virtual Task — Legal Governance"
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
          {legalModal === 'privacy' ? (
            <>
              <p>
                At Alpha Virtual Task, client data privacy and confidentiality represent our core priority. All datasets, customer records, spreadsheets, documents, and communications shared with our team are treated as strictly confidential proprietary assets.
              </p>
              <h5 className="font-bold text-white text-xs uppercase tracking-wider mt-3">
                1. Information Collection & Usage
              </h5>
              <p>
                We only collect and process information explicitly provided to fulfill your contracted virtual task scope (data entry, cleaning, formatting, transcription, QA, or research). We do not sell, rent, monetize, or train third-party public models on your private data.
              </p>
              <h5 className="font-bold text-white text-xs uppercase tracking-wider mt-3">
                2. Data Retention & Secure Deletion
              </h5>
              <p>
                Client project files and deliverables are retained in encrypted temporary storage during active project milestones and up to 30 days after final sign-off for client verification, after which datasets are securely purged unless an ongoing maintenance retainer is active.
              </p>
            </>
          ) : (
            <>
              <p>
                By requesting services or executing project agreements with Alpha Virtual Task, clients agree to the following terms governing deliverable turnaround, milestone acceptance, and professional services.
              </p>
              <h5 className="font-bold text-white text-xs uppercase tracking-wider mt-3">
                1. Scope of Work & Deliverables
              </h5>
              <p>
                Each project begins with a clear scope summary, itemized deliverables, and agreed target completion dates. Adjustments to raw source volume or schema variations mid-project may adjust the quote and timeline proportionally.
              </p>
              <h5 className="font-bold text-white text-xs uppercase tracking-wider mt-3">
                2. Quality Guarantee & Revisions
              </h5>
              <p>
                We stand behind our dual-tier QA standards. If any deliverable fails to adhere to the agreed brief, clients are entitled to prompt corrective revisions at no additional cost within 14 days of delivery.
              </p>
            </>
          )}
        </div>
      </Modal>
    </footer>
  );
};
