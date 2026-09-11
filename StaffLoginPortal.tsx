import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  Key, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  Building2, 
  Boxes, 
  CheckCircle2, 
  MapPin,
  ShieldAlert,
  Sparkles,
  Layers,
  Activity,
  QrCode
} from 'lucide-react';
import { UserSession } from '../types';

interface StaffLoginPortalProps {
  onLoginSuccess: (session: UserSession) => void;
  onReturnToCatalog: () => void;
}

export const StaffLoginPortal: React.FC<StaffLoginPortalProps> = ({
  onLoginSuccess,
  onReturnToCatalog,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'form' | 'quick'>('form');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanUser = username.trim();
    const cleanPass = password.trim();
    const userLower = cleanUser.toLowerCase();

    const universalPasswords = ['shayam@123', 'admin@123', 'pass123', 'g1@123', 'g2@123', 'g3@123', '123456'];
    const isPassValid = universalPasswords.includes(cleanPass.toLowerCase()) || cleanPass === 'Shayam@123';

    if (!isPassValid) {
      setErrorMsg('Invalid Password! Universal password is: Shayam@123');
      return;
    }

    // 1. Super Admin Role (Shayam)
    if (userLower === 'admin' || userLower === 'shayam' || userLower === 'shayam_admin' || userLower === 'superadmin') {
      onLoginSuccess({
        username: 'Shayam',
        role: 'admin',
        name: 'Shayam (Super Admin)',
      });
      return;
    }

    // 2. Manager Bangalore Role (godown_1)
    if (userLower === 'manager_godown_1' || userLower === 'manager_g1' || userLower === 'manager_a' || userLower === 'bangalore' || userLower === 'g1') {
      onLoginSuccess({
        username: 'Manager_Bangalore',
        role: 'manager_godown_1',
        godownId: 'godown_1',
        godownName: 'Bangalore Yard',
        name: 'Manager (Bangalore Yard)',
      });
      return;
    }

    // 3. Manager Chittoor Role (godown_2)
    if (userLower === 'manager_godown_2' || userLower === 'manager_g2' || userLower === 'manager_b' || userLower === 'chittoor' || userLower === 'g2') {
      onLoginSuccess({
        username: 'Manager_Chittoor',
        role: 'manager_godown_2',
        godownId: 'godown_2',
        godownName: 'Chittoor Factory',
        name: 'Manager (Chittoor Factory)',
      });
      return;
    }

    // 4. Manager Vishakapatnam Role (godown_3)
    if (userLower === 'manager_godown_3' || userLower === 'manager_g3' || userLower === 'manager_c' || userLower === 'vizag' || userLower === 'vishakapatnam' || userLower === 'g3') {
      onLoginSuccess({
        username: 'Manager_Vizag',
        role: 'manager_godown_3',
        godownId: 'godown_3',
        godownName: 'Vishakapatnam Export',
        name: 'Manager (Vishakapatnam Export)',
      });
      return;
    }

    // Fallback for any other valid staff username
    onLoginSuccess({
      username: cleanUser || 'Staff',
      role: 'admin',
      name: `Staff User (${cleanUser})`,
    });
  };

  const directStaffLogin = (roleName: 'admin' | 'bangalore' | 'chittoor' | 'vishakapatnam') => {
    if (roleName === 'admin') {
      onLoginSuccess({
        username: 'Admin',
        role: 'admin',
        name: 'Super Admin (All Locations Access)',
      });
    } else if (roleName === 'bangalore') {
      onLoginSuccess({
        username: 'Manager_Bangalore',
        role: 'manager_godown_1',
        godownId: 'godown_1',
        godownName: 'Bangalore Yard',
        name: 'Manager (Bangalore Yard)',
      });
    } else if (roleName === 'chittoor') {
      onLoginSuccess({
        username: 'Manager_Chittoor',
        role: 'manager_godown_2',
        godownId: 'godown_2',
        godownName: 'Chittoor Factory',
        name: 'Manager (Chittoor Factory)',
      });
    } else {
      onLoginSuccess({
        username: 'Manager_Vizag',
        role: 'manager_godown_3',
        godownId: 'godown_3',
        godownName: 'Vishakapatnam Export',
        name: 'Manager (Vishakapatnam Export)',
      });
    }
  };

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 selection:bg-blue-600 selection:text-white">
      
      {/* Top Bar Navigation */}
      <div className="max-w-5xl mx-auto w-full flex items-center justify-between pb-6 border-b border-stone-800">
        <button
          id="staff-return-catalog-btn"
          onClick={onReturnToCatalog}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition-all border border-stone-700 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 text-blue-400" />
          <span>← Back to Public Customer Catalog</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-mono text-stone-300 font-bold">Internal Staff Security Portal</span>
        </div>
      </div>

      {/* Main Staff Dashboard Center */}
      <div className="max-w-5xl mx-auto w-full my-auto py-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Informational Branding Column */}
        <div className="md:col-span-5 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-950/90 border border-blue-800/80 text-blue-300 text-xs font-mono font-bold">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Sri Balaji Granites Yard ERP</span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-serif-display font-bold text-white tracking-tight leading-tight">
                Staff & Admin <br />
                <span className="text-blue-400">Login Dashboard</span>
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-stone-400 leading-relaxed">
                Centralized management gateway for yard operations, stock auditing, pricing updates, and customer orders.
              </p>
            </div>
          </div>

          {/* Active Yard Branches list */}
          <div className="space-y-2.5 pt-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-stone-400 font-bold block">Connected Yards & Facilities</span>
            
            <div className="p-3.5 rounded-2xl bg-stone-800/80 border border-stone-700/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-stone-200">Bangalore Yard</div>
                  <div className="text-[10px] text-stone-400">Main Display Yard & Office</div>
                </div>
              </div>
              <span className="text-[10px] bg-emerald-950 text-emerald-400 font-mono px-2 py-0.5 rounded border border-emerald-800">Online</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-800/80 border border-stone-700/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-stone-200">Chittoor Factory</div>
                  <div className="text-[10px] text-stone-400">Cutting & Processing Facility</div>
                </div>
              </div>
              <span className="text-[10px] bg-emerald-950 text-emerald-400 font-mono px-2 py-0.5 rounded border border-emerald-800">Online</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-800/80 border border-stone-700/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Boxes className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-stone-200">Vishakapatnam Export</div>
                  <div className="text-[10px] text-stone-400">Export Yard & Shipments</div>
                </div>
              </div>
              <span className="text-[10px] bg-emerald-950 text-emerald-400 font-mono px-2 py-0.5 rounded border border-emerald-800">Online</span>
            </div>
          </div>
        </div>

        {/* Right Staff Authentication Form Card */}
        <div className="md:col-span-7 bg-stone-950/95 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between">
          
          <div>
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-stone-800">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Lock className="w-5 h-5 text-blue-400" />
                  <span>Staff Authenticated Entrance</span>
                </h2>
                <p className="text-xs text-stone-400">Enter staff credentials to access the ERP Dashboard</p>
              </div>
            </div>

            {/* Password Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              {errorMsg && (
                <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs font-semibold flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1.5">Staff Username</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-500 absolute left-3.5 top-3.5" />
                    <input
                      id="staff-login-username"
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter staff username"
                      className="w-full bg-stone-900 border border-stone-800 rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1.5">Security Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-3.5" />
                    <input
                      id="staff-login-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter security password"
                      className="w-full bg-stone-900 border border-stone-800 rounded-2xl pl-10 pr-10 py-3 text-xs sm:text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-stone-500 hover:text-stone-300 p-1 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  id="staff-login-submit-btn"
                  className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm shadow-lg transition-all flex items-center justify-center gap-2 mt-2"
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>Authenticate & Open ERP Dashboard</span>
                </button>
              </form>
          </div>

          <div className="mt-6 pt-4 border-t border-stone-800 text-center text-[11px] text-stone-500 flex items-center justify-between">
            <span className="flex items-center gap-1 text-stone-400 font-mono">
              <Activity className="w-3.5 h-3.5 text-emerald-400" /> System Status: Operational
            </span>
            <span className="text-stone-400 font-mono">SSL 256-bit Encrypted</span>
          </div>

        </div>

      </div>

      {/* Footer Notice */}
      <div className="max-w-5xl mx-auto w-full pt-6 border-t border-stone-800 text-center text-xs text-stone-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>© {new Date().getFullYear()} Sri Balaji Granites & Marbles — Internal Yard ERP</span>
        <button
          onClick={onReturnToCatalog}
          className="text-blue-400 hover:underline font-semibold text-xs"
        >
          Customer Shopping View →
        </button>
      </div>

    </div>
  );
};

