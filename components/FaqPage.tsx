import React, { useState } from 'react';
import { 
  HelpCircle, 
  Calendar, 
  Clock, 
  MessageSquare, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Sparkles,
  Trophy,
  ExternalLink
} from 'lucide-react';
import WeeklyPhotoChallenge from './WeeklyPhotoChallenge';

interface FaqItem {
  id: string;
  category: 'schedule' | 'logging' | 'rules' | 'community';
  question: string;
  answer: React.ReactNode;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'dates-duration',
    category: 'schedule',
    question: 'When does the Step-a-Thon take place?',
    answer: (
      <div className="space-y-2">
        <p>The 1st FY27 Global Stepathon key milestones are:</p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 pl-2">
          <li><strong className="text-gray-900">Sign-Up Window:</strong> October 7th – October 15th</li>
          <li><strong className="text-gray-900">Stepping Challenge:</strong> October 19th – November 18th (Weeks 1–4)</li>
          <li><strong className="text-gray-900">Final Step Logging Deadline:</strong> Wednesday, November 18th @ Midnight PST</li>
          <li><strong className="text-gray-900">Winners Reveal:</strong> Friday, November 20th! 🏆</li>
        </ul>
      </div>
    )
  },
  {
    id: 'how-to-log',
    category: 'logging',
    question: 'How do I log my daily steps on the website?',
    answer: (
      <div className="space-y-2">
        <ol className="list-decimal list-inside space-y-1.5 text-gray-600">
          <li>Scroll down to the <strong className="text-gray-900">Roster & Daily Step Logger</strong> section on the main page.</li>
          <li>Use the <strong className="text-gray-900">Filter by Team</strong> dropdown or <strong className="text-gray-900">Search Participant</strong> bar to locate your name (displayed as <em>First Name + Last Initial</em>, e.g., <strong>Jordan S.</strong>).</li>
          <li>Click your name avatar to open your personal Step Logging form.</li>
          <li>Select the exact date of your steps between <strong className="text-gray-900">October 19th and November 18th</strong>. <em>(The Week 1–4 indicator updates automatically!)</em></li>
          <li>Type in your step count and click <strong className="text-gray-900">Log Steps</strong>. Your total and team standing update instantly!</li>
        </ol>
      </div>
    )
  },
  {
    id: 'weekly-deadline',
    category: 'schedule',
    question: 'What is the Weekly Step Submission Deadline?',
    answer: (
      <div className="space-y-3">
        <p>
          Log your steps by <strong className="text-gray-900">Monday at Midnight PST (11:59 PM PST)</strong> each week to count toward that week's Leaderboard standings and weekly winner announcement! For the final week (Week 4: Nov 9 – Nov 18), all steps must be logged by <strong className="text-gray-900">Wednesday, November 18th at Midnight PST</strong>.
        </p>
        <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100 space-y-2 text-xs text-gray-700">
          <strong className="text-gray-900 block font-bold">💡 What this means for you:</strong>
          <ul className="space-y-1 pl-1">
            <li>• <strong>Convert to your local time:</strong> Mon Midnight PST (California) • Tue 3:00 AM EST (New York) • Tue 4:00 AM ART (Argentina) • Tue 8:00 AM (Dublin) • Tue 1:30 PM IST (India) • Tue 4:00 PM MYT (Manila/Malaysia).</li>
            <li>• <strong>Late logs are never lost:</strong> Steps logged after the weekly Monday Midnight PST cutoff will still count <strong className="text-gray-900">100% toward your team's Overall Competition Total</strong>!</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    id: 'missed-days',
    category: 'logging',
    question: 'What if I forget to log my steps on a specific day?',
    answer: (
      <p>
        No problem at all! You don't have to log every single day in real-time. If you miss logging a day, simply use the date picker in your step logger to pick the prior date and add your steps. Just be sure all your steps are entered before the final competition deadline on <strong className="text-gray-900">Wednesday, November 18th at Midnight PST</strong>. Please double-check your step counts before submitting!
      </p>
    )
  },
  {
    id: 'validation-proof',
    category: 'rules',
    question: 'Do I need to save proof or screenshots of my step count?',
    answer: (
      <div className="space-y-2.5">
        <p>
          Yes! We run on the <strong>Honor System</strong> and trust everyone to report fairly, with a <strong className="text-gray-900">30,000 daily step cap</strong> on self-logged entries.
        </p>
        <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200 text-xs text-amber-950 space-y-1">
          <strong className="font-extrabold block">📸 30,000+ Daily Steps Rule (#bigstepper):</strong>
          <p>
            If you hit <strong>30,000+ steps in a single day</strong>, you must send photo proof of your steps from your fitness app (Apple Health, Fitbit, Garmin, Samsung Health, etc.) in the group chat with the hashtag <strong className="text-amber-900">#bigstepper</strong> and the <strong>amount of steps</strong> so we can easily track and log them!
          </p>
        </div>
        <p className="text-xs text-gray-500 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
          📌 <em>Note: Event hosts reserve the right to request step tracker screenshots for validation if needed.</em>
        </p>
      </div>
    )
  },
  {
    id: 'team-rules',
    category: 'community',
    question: 'How do teams and sign-ups work?',
    answer: (
      <div className="space-y-2">
        <p>
          You can register <strong className="text-gray-900">Solo</strong> (and the organizers will match you with a team) or form a <strong className="text-gray-900">Team of up to 8 members</strong> during the October 7 – October 15 sign-up window!
        </p>
      </div>
    )
  },
  {
    id: 'leaderboard-pages',
    category: 'rules',
    question: 'How do the different Leaderboard pages work?',
    answer: (
      <div className="space-y-3">
        <p>You can track competition standings across 3 distinct live Leaderboard pages in the top navigation bar:</p>
        <ul className="space-y-2 text-gray-600">
          <li className="bg-gray-50 p-3 rounded-xl border border-gray-100">
            <strong className="text-gray-900 flex items-center gap-1.5 mb-0.5"><Trophy size={14} className="text-[#4285F4]" /> Team Leaderboard:</strong>
            Displays overall team step totals, active member counts, and team rankings.
          </li>
          <li className="bg-gray-50 p-3 rounded-xl border border-gray-100">
            <strong className="text-gray-900 flex items-center gap-1.5 mb-0.5"><Calendar size={14} className="text-[#34A853]" /> Weekly Leaderboard:</strong>
            Breaks down performance by week (Week 1–4) so you can track weekly team leaders and week-over-week progress.
          </li>
          <li className="bg-gray-50 p-3 rounded-xl border border-gray-100">
            <strong className="text-gray-900 flex items-center gap-1.5 mb-0.5"><Sparkles size={14} className="text-[#FBBC05]" /> Individual Leaderboard:</strong>
            Highlights the top individual steppers across the entire global event and milestone achievements!
          </li>
        </ul>
      </div>
    )
  },
  {
    id: 'community-chat',
    category: 'community',
    question: 'Where can I connect and share updates with other steppers?',
    answer: (
      <div className="space-y-2">
        <p>
          Join our global Teams chat channel: <strong className="text-[#4285F4]">🌍👟 Global Stepathon</strong>! Use it to share weekly photo challenge entries, post <strong className="text-gray-900">#bigstepper</strong> 30k+ step screenshots, and cheer each other on across the globe. We also encourage individual teams to set up group chats for extra motivation!
        </p>
      </div>
    )
  }
];

const FaqPage: React.FC = () => {
  const [openItems, setOpenItems] = useState<string[]>(['dates-duration', 'how-to-log', 'validation-proof']);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const toggleAccordion = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const filteredFaqs = FAQ_ITEMS.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* HEADER BANNER */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm relative overflow-hidden">
        {/* 4-color Top Border Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 flex">
          <div className="h-full flex-1 bg-[#4285F4]" />
          <div className="h-full flex-1 bg-[#EA4335]" />
          <div className="h-full flex-1 bg-[#FBBC05]" />
          <div className="h-full flex-1 bg-[#34A853]" />
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pt-2">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#4285F4] text-xs font-bold uppercase tracking-wider">
              <HelpCircle size={14} /> Official Guide & Support
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-500 text-sm max-w-2xl">
              Everything you need to know about event dates, logging steps, competition rules, and staying connected throughout the 1st FY27 Global Stepathon.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a 
              href="https://forms.office.com/r/Zg03YymPPq"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-50 hover:bg-blue-100 text-[#4285F4] px-4 py-2.5 rounded-2xl border border-blue-200 text-xs font-bold transition-all flex items-center gap-2 shadow-xs"
            >
              <Sparkles size={14} className="text-[#4285F4]" /> Give Site Feedback
              <ExternalLink size={12} />
            </a>
          </div>
        </div>

        {/* KEY MILESTONES GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-gray-100">
          <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-100 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase">
              <Calendar size={14} className="text-[#4285F4]" /> Sign-Up Window
            </div>
            <div className="text-base font-extrabold text-gray-900">October 7 – October 15</div>
            <p className="text-[11px] text-gray-400 font-medium">Solo or Team (up to 8 members)</p>
          </div>

          <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-[#4285F4] uppercase">
              <Sparkles size={14} className="text-[#4285F4]" /> Challenge Duration
            </div>
            <div className="text-base font-extrabold text-gray-900">October 19 – November 20</div>
            <p className="text-[11px] text-blue-600 font-medium">4 Weeks of Global Stepping</p>
          </div>

          <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-100 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase">
              <Clock size={14} className="text-[#EA4335]" /> Weekly & Final Cutoff
            </div>
            <div className="text-base font-extrabold text-gray-900">Mondays @ Midnight PST</div>
            <p className="text-[11px] text-gray-400 font-medium">Final Cutoff: Wed, Nov 18 @ Midnight PST</p>
          </div>

          <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase">
              <Trophy size={14} className="text-[#FBBC05]" /> Winners Reveal
            </div>
            <div className="text-base font-extrabold text-gray-900">November 20th</div>
            <p className="text-[11px] text-amber-700 font-medium">Final Winners Announcement</p>
          </div>
        </div>
      </div>

      {/* WEEKLY PHOTO CHALLENGE BANNER */}
      <WeeklyPhotoChallenge />

      {/* FILTER TABS & SEARCH */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeCategory === 'all'
                ? 'bg-gray-900 text-white shadow-sm'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            All Questions
          </button>
          <button
            onClick={() => setActiveCategory('schedule')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeCategory === 'schedule'
                ? 'bg-[#4285F4] text-white shadow-sm'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            🗓️ Schedule & Dates
          </button>
          <button
            onClick={() => setActiveCategory('logging')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeCategory === 'logging'
                ? 'bg-[#4285F4] text-white shadow-sm'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            📱 Step Logging
          </button>
          <button
            onClick={() => setActiveCategory('rules')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeCategory === 'rules'
                ? 'bg-[#4285F4] text-white shadow-sm'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            📜 Rules & Validation
          </button>
          <button
            onClick={() => setActiveCategory('community')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeCategory === 'community'
                ? 'bg-[#4285F4] text-white shadow-sm'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            👥 Community & Teams
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 text-xs rounded-xl pl-9 pr-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          />
        </div>
      </div>

      {/* ACCORDION QUESTIONS LIST */}
      <div className="space-y-4">
        {filteredFaqs.length === 0 ? (
          <div className="bg-white p-8 text-center rounded-3xl border border-gray-100 text-gray-400 space-y-2">
            <HelpCircle size={32} className="mx-auto text-gray-300" />
            <p className="text-sm font-medium">No matching questions found.</p>
            <button 
              onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
              className="text-xs font-bold text-[#4285F4] hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          filteredFaqs.map((item) => {
            const isOpen = openItems.includes(item.id);
            return (
              <div 
                key={item.id}
                className="bg-white border border-gray-100 hover:border-blue-100 rounded-3xl transition-all shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => toggleAccordion(item.id)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 font-bold text-gray-900 hover:text-[#4285F4] transition-colors"
                >
                  <span className="text-base leading-snug">{item.question}</span>
                  <div className={`p-2 rounded-full transition-all ${isOpen ? 'bg-blue-50 text-[#4285F4]' : 'bg-gray-50 text-gray-400'}`}>
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-0 text-sm text-gray-600 border-t border-gray-50 animate-fade-in">
                    <div className="pt-4 leading-relaxed font-normal">
                      {item.answer}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* EVENT SUPPORT & FEEDBACK CARD */}
      <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white rounded-3xl p-6 md:p-8 shadow-md relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-bold uppercase tracking-wider">
            <MessageSquare size={14} /> Event Support
          </div>
          <h3 className="text-2xl font-extrabold tracking-tight">We&apos;re Here to Help! 👋</h3>
          <p className="text-blue-200 text-xs max-w-xl">
            If you don&apos;t see your team listed, need help updating your entries, or have any questions or feedback, submit our form anytime!
          </p>
        </div>

        <div className="relative z-10 w-full sm:w-auto">
          <a 
            href="https://forms.office.com/r/Zg03YymPPq" 
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 text-xs font-extrabold text-gray-900 bg-white hover:bg-blue-50 px-5 py-3.5 rounded-2xl transition-all w-full sm:w-auto shadow-md"
          >
            <Sparkles size={15} className="text-[#4285F4]" />
            <span>Open Support & Feedback Form</span>
            <ExternalLink size={14} className="text-gray-500" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default FaqPage;
