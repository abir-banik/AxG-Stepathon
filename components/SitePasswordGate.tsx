import React, { useState } from 'react';
import { Lock, ArrowRight, AlertCircle, Footprints } from 'lucide-react';
import { SITE_ACCESS_PASSWORD, HOST_ADMIN_PASSCODE } from '../constants';

interface SitePasswordGateProps {
  onUnlock: (asAdmin?: boolean) => void;
}

const SitePasswordGate: React.FC<SitePasswordGateProps> = ({ onUnlock }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = password.trim();

    if (trimmed === HOST_ADMIN_PASSCODE) {
      setError(false);
      onUnlock(true);
      return;
    }

    if (trimmed.toUpperCase() === SITE_ACCESS_PASSWORD.toUpperCase()) {
      setError(false);
      onUnlock(false);
      return;
    }

    setError(true);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-gray-900 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100 space-y-6 animate-fade-in">
        {/* 4-Color Top Accent Bar */}
        <div className="flex h-1.5 w-24 mx-auto rounded-full overflow-hidden">
          <div className="flex-1 bg-[#4285F4]" />
          <div className="flex-1 bg-[#EA4335]" />
          <div className="flex-1 bg-[#FBBC05]" />
          <div className="flex-1 bg-[#34A853]" />
        </div>

        {/* Icon & Title */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-blue-50 text-[#4285F4] rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-2xs">
            <Footprints size={28} />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            <span className="text-[#4285F4]">1st</span>{" "}
            <span className="text-[#EA4335]">FY27</span>{" "}
            <span className="text-[#FBBC05]">Global</span>{" "}
            <span className="text-[#34A853]">Stepathon</span>
          </h1>
          <p className="text-gray-500 font-bold text-xs uppercase tracking-wider">
            Inclusion & Diversity + Care
          </p>
        </div>

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label
              htmlFor="site-access-password"
              className="block text-xs font-bold text-gray-600 uppercase tracking-wider"
            >
              Participant Access Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock size={16} />
              </div>
              <input
                id="site-access-password"
                type="password"
                autoFocus
                placeholder="Enter event password..."
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(false);
                }}
                className={`w-full bg-gray-50 border ${
                  error ? 'border-[#EA4335] focus:ring-[#EA4335]' : 'border-gray-200 focus:ring-[#4285F4]'
                } text-sm rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 font-medium text-gray-900 transition-all`}
              />
            </div>
            {error && (
              <p className="text-xs font-bold text-[#EA4335] flex items-center gap-1.5 pt-1">
                <AlertCircle size={14} /> Incorrect password. Please check with your event host.
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-[#4285F4] hover:bg-blue-600 text-white font-bold text-sm py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            Enter Stepathon <ArrowRight size={16} />
          </button>
        </form>

        <p className="text-center text-[11px] text-gray-400 font-medium pt-1">
          Protected for registered Stepathon participants & hosts.
        </p>
      </div>
    </div>
  );
};

export default SitePasswordGate;
