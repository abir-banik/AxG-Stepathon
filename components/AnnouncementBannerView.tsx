import React from 'react';
import { AnnouncementBanner } from '../types';
import { Megaphone, AlertTriangle, Sparkles, Flame, Bell } from 'lucide-react';

interface AnnouncementBannerViewProps {
  announcement: AnnouncementBanner | null;
}

const AnnouncementBannerView: React.FC<AnnouncementBannerViewProps> = ({ announcement }) => {
  if (!announcement || !announcement.active || !announcement.message || !announcement.message.trim()) {
    return null;
  }

  const type = announcement.type || 'info';

  const getTypeStyles = () => {
    switch (type) {
      case 'warning':
        return {
          container: 'bg-amber-50/90 border-amber-200 text-amber-950',
          iconBg: 'bg-[#FBBC05] text-white',
          badge: 'bg-amber-100 text-amber-900 border-amber-200',
          Icon: AlertTriangle,
          label: 'REMINDER NOTICE'
        };
      case 'celebration':
        return {
          container: 'bg-emerald-50/90 border-emerald-200 text-emerald-950',
          iconBg: 'bg-[#34A853] text-white',
          badge: 'bg-emerald-100 text-emerald-900 border-emerald-200',
          Icon: Sparkles,
          label: 'CELEBRATION'
        };
      case 'alert':
        return {
          container: 'bg-red-50/90 border-red-200 text-red-950',
          iconBg: 'bg-[#EA4335] text-white',
          badge: 'bg-red-100 text-red-900 border-red-200',
          Icon: Flame,
          label: 'IMPORTANT ALERT'
        };
      case 'info':
      default:
        return {
          container: 'bg-blue-50/90 border-blue-200 text-blue-950',
          iconBg: 'bg-[#4285F4] text-white',
          badge: 'bg-blue-100 text-blue-900 border-blue-200',
          Icon: Megaphone,
          label: 'EVENT ANNOUNCEMENT'
        };
    }
  };

  const style = getTypeStyles();
  const IconComponent = style.Icon;

  return (
    <div className={`p-4 md:p-5 rounded-3xl border ${style.container} shadow-sm animate-fade-in flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden`}>
      <div className="flex items-start sm:items-center gap-3.5 flex-1">
        <div className={`p-3 rounded-2xl ${style.iconBg} shrink-0 shadow-sm`}>
          <IconComponent size={20} />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${style.badge}`}>
              {style.label}
            </span>
            {announcement.updatedAt && (
              <span className="text-[10px] opacity-60 font-medium">
                Updated {new Date(announcement.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
          <p className="text-sm font-semibold leading-relaxed whitespace-pre-line">
            {announcement.message}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBannerView;
