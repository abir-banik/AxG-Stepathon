import React from 'react';
import { Trophy, Heart, Globe, Users, Award, Sparkles, MessageSquare, ExternalLink, Calendar, CheckCircle2 } from 'lucide-react';

interface EventConcludedPageProps {
  onAdminUnlock?: () => void;
}

export const EventConcludedPage: React.FC<EventConcludedPageProps> = ({ onAdminUnlock }) => {
  return (
    <div className="min-h-screen bg-[#f8f9fa] text-gray-900 flex flex-col justify-between p-4 md:p-8 font-sans selection:bg-blue-100">
      <div className="max-w-4xl mx-auto w-full space-y-8 py-6 md:py-12 animate-fade-in">
        
        {/* Top Branding Pill */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-[#4285F4] border border-blue-100 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-xs">
            <Sparkles size={14} className="animate-pulse text-[#FBBC05]" />
            <span>Event Concluded • July 13 – August 5, 2026</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black tracking-tight pt-2">
            <span className="text-[#4285F4]">2nd</span>{" "}
            <span className="text-[#EA4335]">Annual</span>{" "}
            <span className="text-[#FBBC05]">Global</span>{" "}
            <span className="text-[#34A853]">Stepathon</span>
          </h1>
          <p className="text-gray-500 font-bold text-sm tracking-wide uppercase">
            Inclusion & Diversity + Care
          </p>
        </div>

        {/* Main Hero Thank You Card */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 text-center space-y-6 relative overflow-hidden">
          {/* Subtle Background Google Colored Accents */}
          <div className="absolute -top-16 -right-16 w-40 h-40 bg-blue-50 rounded-full blur-2xl opacity-60 pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-green-50 rounded-full blur-2xl opacity-60 pointer-events-none" />

          {/* Trophy & Heart Icon Badge */}
          <div className="relative inline-flex items-center justify-center">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-tr from-amber-400 via-amber-300 to-yellow-200 flex items-center justify-center shadow-lg shadow-amber-200/50">
              <Trophy size={42} className="text-amber-900" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-[#EA4335] text-white p-2 rounded-full shadow-md">
              <Heart size={16} fill="currentColor" />
            </div>
          </div>

          {/* Core Message */}
          <div className="space-y-3 max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">
              Thank You for Walking With Us!
            </h2>
            <p className="text-gray-600 text-base md:text-lg leading-relaxed">
              The <strong>2nd Annual Global Stepathon</strong> has officially come to an end. Over four unforgettable weeks, colleagues across the globe came together to move, encourage one another, prioritize wellness, and champion <span className="font-semibold text-gray-800">Inclusion & Diversity + Care</span>.
            </p>
            <p className="text-gray-500 text-sm md:text-base leading-relaxed">
              A huge thank you to all our racers, teams, offices, hype squads, and everyone who made every step count!
            </p>
          </div>

          {/* Community Milestones Summary */}
          <div className="pt-4 border-t border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
              Celebrated Together Across The Globe
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
                <div className="text-2xl font-black text-[#4285F4]">10+</div>
                <div className="text-xs font-bold text-gray-600 mt-1 flex items-center justify-center gap-1">
                  <Globe size={12} className="text-blue-500" /> Countries
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
                <div className="text-2xl font-black text-[#EA4335]">39+</div>
                <div className="text-xs font-bold text-gray-600 mt-1 flex items-center justify-center gap-1">
                  <Users size={12} className="text-red-500" /> Teams
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
                <div className="text-2xl font-black text-[#FBBC05]">135+</div>
                <div className="text-xs font-bold text-gray-600 mt-1 flex items-center justify-center gap-1">
                  <Award size={12} className="text-amber-500" /> Racers
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
                <div className="text-2xl font-black text-[#34A853]">35M</div>
                <div className="text-xs font-bold text-gray-600 mt-1 flex items-center justify-center gap-1">
                  <CheckCircle2 size={12} className="text-green-500" /> Global Goal
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps & Feedback Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Card 1: Final Results Notice */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Trophy size={20} />
            </div>
            <h4 className="font-extrabold text-base text-gray-900">
              Final Results & Standings
            </h4>
            <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
              Final leaderboards, team rankings, etc. are out! Reach out to the team if you have any questions!
            </p>
          </div>

          {/* Card 2: Feedback & Memories Form */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-3 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#4285F4] flex items-center justify-center mb-3">
                <MessageSquare size={20} />
              </div>
              <h4 className="font-extrabold text-base text-gray-900">
                Share Your Feedback & Memories
              </h4>
              <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                Have thoughts, suggestions, or highlights you'd like to share to make the next Stepathon even better? We’d love to hear from you.
              </p>
            </div>
            <div className="pt-2">
              <a
                href="https://forms.office.com/r/Zg03YymPPq"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#4285F4] hover:bg-blue-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm hover:shadow active:scale-95 w-full sm:w-auto"
              >
                <span>Open Feedback Form</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>

        </div>

      </div>

      {/* Footer */}
      <footer className="text-center text-gray-400 text-xs py-6 border-t border-gray-200/60 max-w-4xl mx-auto w-full space-y-2">
        <p className="font-medium text-gray-500">
          © 2026 Inclusion & Diversity + Care • Stepathon
        </p>
        <p className="text-gray-400">
          See you at the 3rd Annual Global Stepathon in 2027! 👟🌍
        </p>
      </footer>
    </div>
  );
};

export default EventConcludedPage;
