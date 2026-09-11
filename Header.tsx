import React, { useState } from 'react';
import { 
  Building2, 
  ShoppingBag, 
  QrCode, 
  User, 
  LogOut, 
  Sparkles, 
  Megaphone,
  ShieldAlert,
  Boxes,
  PhoneCall,
  MapPin,
  Palette,
  Sun,
  Moon,
  Gem,
  Link2,
  Copy,
  Check,
  ExternalLink,
  Lock,
  KeyRound
} from 'lucide-react';
import { UserSession, Announcement, ThemeType } from '../types';

interface HeaderProps {
  session: UserSession;
  customerAccount?: { name: string; phone: string; customerType?: string } | null;
  activeView: 'catalog' | 'admin';
  setActiveView: (view: 'catalog' | 'admin') => void;
  cartCount: number;
  openCart: () => void;
  openCustomerLoginModal?: () => void;
  onLogout: () => void;
  openQrModal: () => void;
  announcements: Announcement[];
  pendingQueriesCount: number;
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}

const ALL_THEMES: { id: ThemeType; name: string; dot: string; description: string }[] = [
  { id: 'amber', name: 'Royal Amber Gold', dot: 'bg-amber-500', description: 'Warm Gold & Cream Marble' },
  { id: 'sapphire', name: 'Sapphire Ocean Blue', dot: 'bg-blue-600', description: 'Deep Sapphire & Sky Blue' },
  { id: 'emerald', name: 'Emerald Forest Green', dot: 'bg-emerald-600', description: 'Lush Mint Emerald Green' },
  { id: 'rose', name: 'Ruby Rose Pink', dot: 'bg-rose-500', description: 'Nordic Pearl Rose & Crimson' },
  { id: 'obsidian', name: 'Obsidian Dark Onyx', dot: 'bg-zinc-900', description: 'Polished Stealth Dark Onyx' },
  { id: 'amethyst', name: 'Amethyst Royal Purple', dot: 'bg-purple-600', description: 'Lavender Quartz & Royal Violet' },
  { id: 'copper', name: 'Copper Sandstone', dot: 'bg-orange-600', description: 'Terracotta & Warm Copper' },
  { id: 'cyan', name: 'Cyan Amazonite Gem', dot: 'bg-cyan-500', description: 'Exotic Turquoise & Sea Green' },
  { id: 'slate', name: 'Slate Silver Quartz', dot: 'bg-slate-500', description: 'Cool Silver Slate & Steel' },
  { id: 'sunset', name: 'Tuscan Sunset Coral', dot: 'bg-amber-700', description: 'Warm Sunset & Peach Gold' },
];

export const Header: React.FC<HeaderProps> = ({
  session,
  customerAccount,
  activeView,
  setActiveView,
  cartCount,
  openCart,
  openCustomerLoginModal,
  onLogout,
  openQrModal,
  announcements,
  pendingQueriesCount,
  theme,
  setTheme,
}) => {
  const activeAnnouncements = announcements.filter((a) => a.isActive);
  const [currentAnnIndex, setCurrentAnnIndex] = useState(0);

  // Cycle announcements if multiple
  React.useEffect(() => {
    if (activeAnnouncements.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentAnnIndex((prev) => (prev + 1) % activeAnnouncements.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [activeAnnouncements.length]);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-stone-200 text-stone-900 shadow-sm transition-all">
      
      {/* Top Announcement Ticker */}
      {activeAnnouncements.length > 0 && (
        <div className="bg-blue-50 text-blue-900 text-xs py-1.5 px-4 font-medium border-b border-blue-200 shadow-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 overflow-hidden">
            <div className="flex items-center gap-2 max-w-5xl mx-auto w-full justify-center text-center">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white font-extrabold text-[10px] tracking-wider flex items-center gap-1.5 shrink-0 shadow-sm">
                <Sparkles className="w-3 h-3 text-white animate-pulse" /> Yard Update
              </span>
              <span className="font-bold text-blue-900">{activeAnnouncements[currentAnnIndex]?.title}:</span>
              <span className="truncate text-blue-800 font-medium">{activeAnnouncements[currentAnnIndex]?.message}</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-[3.5rem] sm:min-h-[4.5rem] py-1.5 gap-1.5 sm:gap-3 flex-nowrap overflow-hidden">
          
          {/* Logo & Brand Identity */}
          <div 
            className="flex items-center gap-1.5 sm:gap-2 cursor-pointer group shrink-0 min-w-0" 
            onClick={() => setActiveView('catalog')}
          >
            <div className="p-1.5 sm:p-2.5 bg-blue-600 text-white rounded-xl sm:rounded-2xl shadow-sm font-black flex items-center justify-center transform group-hover:scale-105 transition-all shrink-0">
              <Boxes className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <div className="flex flex-col justify-center min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-xs sm:text-xl md:text-2xl font-serif-display font-black tracking-tight text-stone-900 group-hover:text-blue-700 transition-colors whitespace-nowrap truncate">
                  Sri Balaji <span className="font-sans font-black text-blue-600">Granites</span>
                </span>
              </div>
              <div className="hidden xs:flex items-center gap-1 mt-0.5">
                <span className="inline-flex items-center gap-1 text-[8px] sm:text-[10px] font-extrabold tracking-tight px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-900 font-mono border border-blue-200 shrink-0 truncate max-w-[140px] sm:max-w-none">
                  <MapPin className="w-2.5 h-2.5 text-blue-600 shrink-0" />
                  <span className="truncate">Bengaluru • Chittoor • Vizag</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Phone Contact Shortcuts */}
          <div className="hidden xl:flex items-center gap-2 text-xs font-semibold text-stone-800">
            <a
              href="tel:9828400811"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-800 transition-all hover:scale-105 shadow-sm font-bold"
            >
              <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
              <span>9828400811</span>
            </a>
            <a
              href="tel:9982749180"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-800 transition-all hover:scale-105 shadow-sm font-bold"
            >
              <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
              <span>9982749180</span>
            </a>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-1 sm:gap-3 shrink-0">

            {/* View Switcher for Logged in Admin/Staff */}
            {session.role !== 'guest' && (
              <div className="bg-stone-100 p-0.5 sm:p-1 rounded-xl sm:rounded-2xl border border-stone-300 flex items-center text-xs font-medium shadow-inner">
                <button
                  id="header-catalog-btn"
                  onClick={() => setActiveView('catalog')}
                  className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl transition-all flex items-center gap-1 font-bold ${
                    activeView === 'catalog'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-stone-700 hover:text-stone-900 hover:bg-stone-200'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Catalog</span>
                </button>

                <button
                  id="header-admin-btn"
                  onClick={() => setActiveView('admin')}
                  className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl transition-all flex items-center gap-1 relative font-bold ${
                    activeView === 'admin'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-stone-700 hover:text-stone-900 hover:bg-stone-200'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                  <span className="hidden sm:inline">ERP Studio</span>
                  {pendingQueriesCount > 0 && (
                    <span className="bg-rose-500 text-white font-black px-1.5 py-0.5 rounded-full text-[10px] animate-pulse">
                      {pendingQueriesCount}
                    </span>
                  )}
                </button>
              </div>
            )}



            {/* Reception QR Code Button */}
            <button
              id="header-qr-btn"
              onClick={openQrModal}
              title="Reception QR Code Scanner"
              className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 transition-colors flex items-center gap-1.5 text-xs font-bold hidden sm:flex"
            >
              <QrCode className="w-4.5 h-4.5 text-emerald-700" />
              <span className="hidden md:inline font-bold">Showroom QR</span>
            </button>

            {/* Inquiry Cart Drawer Button */}
            <button
              id="header-cart-btn"
              onClick={openCart}
              className="relative p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all flex items-center gap-2 text-xs font-bold shadow-sm"
            >
              <ShoppingBag className="w-4.5 h-4.5 text-white" />
              <span className="hidden sm:inline">Order Cart</span>
              {cartCount > 0 ? (
                <span className="bg-white text-emerald-800 font-black px-2 py-0.5 rounded-full text-[11px] shadow-sm">
                  {cartCount}
                </span>
              ) : (
                <span className="text-[10px] text-emerald-100 hidden sm:inline">(0)</span>
              )}
            </button>

            {/* Customer Account Access Button */}
            <button
              type="button"
              id="header-customer-account-btn"
              onClick={openCustomerLoginModal}
              title="Customer Sign In & Saved Details"
              className="px-3 py-2 sm:px-3.5 sm:py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm border border-amber-400"
            >
              <User className="w-4 h-4 text-stone-950" />
              <span className="hidden sm:inline">
                {customerAccount ? customerAccount.name : 'Customer Login'}
              </span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
