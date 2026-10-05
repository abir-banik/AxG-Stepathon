import React from 'react';
import { ShieldCheck, Footprints, UserCheck, Camera, Sparkles, CheckCircle2 } from 'lucide-react';

interface HonorCodeModalProps {
  onAccept: () => void;
}

const HonorCodeModal: React.FC<HonorCodeModalProps> = ({ onAccept }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="honor-code-title"
    >
      <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl border border-gray-100 relative overflow-hidden space-y-6 animate-bounce-in">
        {/* 4-color Top Border Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 flex">
          <div className="h-full flex-1 bg-[#4285F4]" />
          <div className="h-full flex-1 bg-[#EA4335]" />
          <div className="h-full flex-1 bg-[#FBBC05]" />
          <div className="h-full flex-1 bg-[#34A853]" />
        </div>

        {/* Header */}
        <div className="text-center space-y-2 pt-1">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#4285F4] flex items-center justify-center mx-auto shadow-2xs border border-blue-100">
            <ShieldCheck size={26} />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-extrabold uppercase tracking-wider">
            <Sparkles size={12} className="text-[#FBBC05]" /> Built on Trust & Fair Play
          </div>
          <h2 id="honor-code-title" className="text-2xl font-black text-gray-900 tracking-tight">
            Stepathon Honor Policy
          </h2>
          <p className="text-xs text-gray-500 font-medium">
            To keep the 3rd Annual Global Stepathon fun and fair for everyone, please review our quick rules:
          </p>
        </div>

        {/* 4 Short, Fun Rules with Icons */}
        <div className="space-y-2.5">
          <div className="flex items-start gap-3 bg-blue-50/50 border border-blue-100/80 p-3 rounded-2xl">
            <div className="bg-[#4285F4] text-white p-2 rounded-xl shrink-0 mt-0.5 shadow-2xs">
              <Footprints size={16} />
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-gray-900">Log Honest Steps Only</h3>
              <p className="text-[11px] text-gray-600 leading-snug">
                Enter real daily step counts recorded by your watch, phone, or fitness tracker.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-red-50/50 border border-red-100/80 p-3 rounded-2xl">
            <div className="bg-[#EA4335] text-white p-2 rounded-xl shrink-0 mt-0.5 shadow-2xs">
              <UserCheck size={16} />
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-gray-900">Only Update Your Own Profile</h3>
              <p className="text-[11px] text-gray-600 leading-snug">
                Never log, edit, or delete steps on anyone else&apos;s profile—only update your own!
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-amber-50/60 border border-amber-200/70 p-3 rounded-2xl">
            <div className="bg-[#FBBC05] text-amber-950 p-2 rounded-xl shrink-0 mt-0.5 shadow-2xs">
              <Camera size={16} />
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-gray-900">30,000+ Daily Step Cap</h3>
              <p className="text-[11px] text-gray-600 leading-snug">
                Hit <strong>30,000+ steps</strong> in a day? Share a fitness app screenshot in the group chat!
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-emerald-50/50 border border-emerald-100/80 p-3 rounded-2xl">
            <div className="bg-[#34A853] text-white p-2 rounded-xl shrink-0 mt-0.5 shadow-2xs">
              <CheckCircle2 size={16} />
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-gray-900">Keep Your Tracker Proof</h3>
              <p className="text-[11px] text-gray-600 leading-snug">
                Save your step history or screenshots in case event hosts request a quick check.
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={onAccept}
          className="w-full bg-[#4285F4] hover:bg-blue-600 active:scale-[0.99] text-white font-extrabold text-sm py-3.5 px-6 rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>I Understand — Let&apos;s Step! 👟</span>
        </button>
      </div>
    </div>
  );
};

export default HonorCodeModal;
