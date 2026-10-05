import React from 'react';
import { Camera, Sparkles, Calendar, Award } from 'lucide-react';
import { getActivePhotoChallenge } from '../constants';

interface WeeklyPhotoChallengeProps {
  currentDate?: string;
}

const WeeklyPhotoChallenge: React.FC<WeeklyPhotoChallengeProps> = ({ currentDate }) => {
  const activeChallenge = getActivePhotoChallenge(currentDate);
  const isPreEvent = activeChallenge.weekNumber === 0;

  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-5">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3.5">
          <div className="bg-purple-50 text-purple-600 p-3 rounded-2xl shadow-2xs flex-shrink-0">
            <Camera size={24} />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100 mb-1">
              <Sparkles size={12} /> {activeChallenge.badgeLabel}
            </div>
            <h3 className="text-lg md:text-xl font-extrabold text-gray-900">
              {activeChallenge.themeTitle}
            </h3>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 bg-gray-50 px-3.5 py-2 rounded-xl border border-gray-100 self-start sm:self-center">
          <Calendar size={14} className="text-[#4285F4]" />
          <span>{activeChallenge.dateRangeLabel}</span>
        </div>
      </div>

      {/* Prompt Options for Current Week Only */}
      <div className={`grid grid-cols-1 ${activeChallenge.prompts.length > 1 ? 'md:grid-cols-2' : ''} gap-3.5`}>
        {activeChallenge.prompts.map((prompt, index) => (
          <div
            key={index}
            className={`p-4 rounded-2xl border transition-all ${
              prompt.isFeatured
                ? 'bg-gradient-to-br from-purple-50/70 via-blue-50/50 to-indigo-50/60 border-purple-200/80 shadow-2xs'
                : 'bg-gray-50/70 border-gray-100'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl leading-none select-none pt-0.5">{prompt.emoji}</span>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-extrabold text-gray-900 text-sm">{prompt.title}</h4>
                  {prompt.isFeatured && !isPreEvent && (
                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-purple-600 text-white px-2 py-0.5 rounded-full">
                      Featured Prompt
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600 leading-relaxed font-medium">
                  {prompt.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Note */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-1 text-xs text-gray-500 font-medium">
        <div className="flex items-center gap-1.5">
          <Award size={15} className="text-[#FBBC05] flex-shrink-0" />
          <span>
            {isPreEvent
              ? 'New photo challenge prompts drop every Monday starting October 19!'
              : 'Share your photo in the Stepathon group chat! Weekly Photo Challenge winners are announced every Tuesday.'}
          </span>
        </div>
        <span className="text-[11px] font-bold text-purple-600">
          Refreshes automatically each week
        </span>
      </div>
    </div>
  );
};

export default WeeklyPhotoChallenge;
