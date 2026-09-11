import React, { useState } from 'react';
import { Eye, EyeOff, Lock, User, X, ShieldCheck } from 'lucide-react';
import { UserSession, UserRole, GodownId } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (session: UserSession) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanUser = username.trim();
    const cleanPass = password.trim();
    const userLower = cleanUser.toLowerCase();

    // 1. Super Admin Role
    if ((userLower === 'admin' || userLower === 'shayam' || userLower === 'shayam_admin') && (cleanPass === 'Shayam@123' || cleanPass === 'Admin@123')) {
      onLoginSuccess({
        username: 'Shayam',
        role: 'admin',
        name: 'Super Admin (Shayam - All Locations Access)',
      });
      onClose();
      return;
    }

    // 2. Manager Bangalore Role (godown_1)
    if ((userLower === 'manager_godown_1' || userLower === 'manager_a' || userLower === 'shayam_bangalore' || userLower === 'shayam_1') && (cleanPass === 'Shayam@123' || cleanPass === 'pass123')) {
      onLoginSuccess({
        username: 'Shayam',
        role: 'manager_godown_1',
        godownId: 'godown_1',
        godownName: 'Bangalore Yard',
        name: 'Shayam (Manager - Bangalore Yard)',
      });
      onClose();
      return;
    }

    // 3. Manager Chittoor Role (godown_2)
    if ((userLower === 'manager_godown_2' || userLower === 'manager_b' || userLower === 'shayam_chittoor' || userLower === 'shayam_2') && (cleanPass === 'Shayam@123' || cleanPass === 'pass123')) {
      onLoginSuccess({
        username: 'Shayam',
        role: 'manager_godown_2',
        godownId: 'godown_2',
        godownName: 'Chittoor Factory',
        name: 'Shayam (Manager - Chittoor Factory)',
      });
      onClose();
      return;
    }

    // 4. Manager Vishakapatnam Role (godown_3)
    if ((userLower === 'manager_godown_3' || userLower === 'manager_c' || userLower === 'shayam_vishakapatnam' || userLower === 'shayam_3') && (cleanPass === 'Shayam@123' || cleanPass === 'pass123')) {
      onLoginSuccess({
        username: 'Shayam',
        role: 'manager_godown_3',
        godownId: 'godown_3',
        godownName: 'Vishakapatnam Export',
        name: 'Shayam (Manager - Vishakapatnam Export)',
      });
      onClose();
      return;
    }

    // Catch-all: If Username is Shayam and Password is Shayam@123
    if (userLower === 'shayam' && cleanPass === 'Shayam@123') {
      onLoginSuccess({
        username: 'Shayam',
        role: 'admin',
        name: 'Super Admin (Shayam)',
      });
      onClose();
      return;
    }

    setErrorMsg('Invalid Username or Password! Please verify your staff credentials.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-600/40 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white border border-stone-200 rounded-3xl shadow-2xl overflow-hidden text-stone-900">
        
        {/* Header Header */}
        <div className="p-6 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl border border-blue-200">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900">ERP System Login</h3>
              <p className="text-xs text-stone-500">Access Godown Management & Administrative Controls</p>
            </div>
          </div>
          <button
            id="close-login-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Username</label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                id="login-username-input"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username (e.g. admin)"
                className="w-full bg-white border border-stone-300 rounded-xl pl-9 pr-4 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                id="login-password-input"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full bg-white border border-stone-300 rounded-xl pl-9 pr-10 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
              />
              <button
                type="button"
                id="toggle-show-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700 transition-colors p-1"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              id="login-submit-btn"
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Login to Portal</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
