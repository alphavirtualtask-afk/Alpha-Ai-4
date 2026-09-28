import React, { useState } from 'react';
import { Star, MessageSquarePlus, CheckCircle2 } from 'lucide-react';
import { TESTIMONIALS_DATA } from '../../data/mockData';
import { TestimonialItem } from '../../types';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Input, Textarea } from '../common/Input';

export const ReviewsSection: React.FC = () => {
  const [reviewsList, setReviewsList] = useState<TestimonialItem[]>(TESTIMONIALS_DATA);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [serviceUsed, setServiceUsed] = useState('Data Cleaning');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !reviewText) return;

    const newReview: TestimonialItem = {
      id: `test-${Date.now()}`,
      clientName: name,
      role: role || 'Client',
      company: company || 'Independent Partner',
      review: reviewText,
      rating,
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=1A202C&textColor=F5B942`,
      serviceUsed,
      date: 'Just now',
      verified: true,
    };

    // Prepend to current state (in future, this writes to Firestore /testimonials)
    setReviewsList([newReview, ...reviewsList]);
    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmitSuccess(false);
      setIsWriteModalOpen(false);
      setName('');
      setRole('');
      setCompany('');
      setReviewText('');
    }, 1800);
  };

  return (
    <section id="reviews" className="py-24 bg-[#0E121A] relative border-t border-b border-white/5">
      {/* Background glow */}
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-[#E5A93C]/5 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-[#E5A93C] mb-3">
              <span>Client Testimonials</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white font-display tracking-tight text-balance">
              What Our Clients Say
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-300">
              Trusted by Businesses & Individuals Worldwide
            </p>
          </div>

          <div>
            <Button
              variant="outline"
              size="md"
              onClick={() => setIsWriteModalOpen(true)}
              icon={<MessageSquarePlus className="w-4 h-4" />}
            >
              Write a Review
            </Button>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {reviewsList.map((item) => (
            <div
              key={item.id}
              className="bg-[#121622] rounded-2xl p-7 sm:p-8 border border-[#222838] hover:border-[#E5A93C]/40 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Top Row: Star Rating + Service Tag */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < item.rating
                            ? 'text-[#E5A93C] fill-[#E5A93C]'
                            : 'text-slate-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-mono text-[#E5A93C] bg-[#E5A93C]/10 px-2.5 py-1 rounded border border-[#E5A93C]/20">
                    {item.serviceUsed}
                  </span>
                </div>

                {/* Review Quote */}
                <p className="text-sm sm:text-base text-slate-200 leading-relaxed italic mb-6">
                  "{item.review}"
                </p>
              </div>

              {/* Bottom Row: Customer Avatar & Credentials */}
              <div className="pt-5 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-[#E5A93C]/30 bg-[#161B26] shrink-0">
                    <img
                      src={item.avatarUrl}
                      alt={item.clientName}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(item.clientName)}`;
                      }}
                    />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-1.5">
                      <span>{item.clientName}</span>
                      {item.verified && (
                        <span title="Verified Client">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#E5A93C]" />
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400">
                      {item.role} · <span className="text-slate-300">{item.company}</span>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 font-mono hidden sm:block">
                  {item.date}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Aggregate Trust Banner */}
        <div className="mt-14 p-6 rounded-xl bg-[#141925] border border-white/5 flex flex-wrap items-center justify-around gap-6 text-center">
          <div>
            <div className="text-2xl font-bold font-mono text-white">4.98 / 5.0</div>
            <div className="text-xs text-slate-400 mt-0.5">Average Satisfaction Score</div>
          </div>
          <div className="h-8 w-[1px] bg-white/10 hidden sm:block" />
          <div>
            <div className="text-2xl font-bold font-mono text-white">100%</div>
            <div className="text-xs text-slate-400 mt-0.5">Confidentiality Guarantee</div>
          </div>
          <div className="h-8 w-[1px] bg-white/10 hidden sm:block" />
          <div>
            <div className="text-2xl font-bold font-mono text-white">99.8%</div>
            <div className="text-xs text-slate-400 mt-0.5">First-Pass QA Acceptance</div>
          </div>
        </div>

      </div>

      {/* Write a Review Modal */}
      <Modal
        isOpen={isWriteModalOpen}
        onClose={() => setIsWriteModalOpen(false)}
        title="Submit a Client Review"
        subtitle="Share your experience working with Alpha Virtual Task"
        maxWidth="lg"
      >
        {submitSuccess ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white">Thank you for your feedback!</h4>
            <p className="text-xs text-slate-300">
              Your testimonial has been submitted and verified.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Rating
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-slate-500 hover:text-[#E5A93C] transition-colors cursor-pointer"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= rating
                          ? 'text-[#E5A93C] fill-[#E5A93C]'
                          : 'text-slate-600'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-mono text-slate-400 ml-2">
                  {rating} of 5 Stars
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Your Name *"
                placeholder="e.g. Rachel Adams"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                label="Role / Title"
                placeholder="e.g. Operations Director"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Company / Organization"
                placeholder="e.g. Vertex Ventures"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Service Utilized
                </label>
                <select
                  value={serviceUsed}
                  onChange={(e) => setServiceUsed(e.target.value)}
                  className="w-full bg-[#161B26] border border-[#2B3242] text-white text-sm rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-[#E5A93C]"
                >
                  <option value="Data Entry">Data Entry</option>
                  <option value="Data Collection">Data Collection</option>
                  <option value="Data Cleaning">Data Cleaning</option>
                  <option value="Data Formatting">Data Formatting</option>
                  <option value="Data Conversion">Data Conversion</option>
                  <option value="Data Processing">Data Processing</option>
                  <option value="Excel & Spreadsheets">Excel & Spreadsheets</option>
                  <option value="Web Research">Web Research</option>
                  <option value="Transcription">Transcription</option>
                  <option value="Translation">Translation</option>
                  <option value="Proofreading">Proofreading</option>
                  <option value="QA / CQA">QA / CQA</option>
                </select>
              </div>
            </div>

            <Textarea
              label="Your Review *"
              placeholder="Describe the project, turnaround speed, accuracy, and overall experience..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={4}
              required
            />

            <div className="pt-2 flex justify-end gap-3">
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => setIsWriteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" size="md" type="submit">
                Submit Review
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </section>
  );
};
