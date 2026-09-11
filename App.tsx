import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Header } from './components/Header';
import { CustomerCatalog } from './components/CustomerCatalog';
import { CustomerLoginModal, CustomerAccount } from './components/CustomerLoginModal';
import { QueryDrawer } from './components/QueryDrawer';
import { ReceptionQRModal } from './components/ReceptionQRModal';
import { SlabModal } from './components/SlabModal';

// Code-Splitting / Lazy Loading for Security: Staff and Admin Panel bundles are separate
const AdminPanel = lazy(() => import('./components/AdminPanel').then(m => ({ default: m.AdminPanel })));
const StaffLoginPortal = lazy(() => import('./components/StaffLoginPortal').then(m => ({ default: m.StaffLoginPortal })));

import { 
  SlabStock, 
  TrashItem, 
  CustomerQuery, 
  Announcement, 
  UserSession,
  ThemeType
} from './types';
import { 
  INITIAL_SLABS, 
  INITIAL_ANNOUNCEMENTS, 
  INITIAL_QUERIES, 
  INITIAL_TRASH 
} from './data/mockData';
import { filterExpiredTrash } from './utils/calc';

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<ThemeType>(() => {
    try {
      const saved = localStorage.getItem('sbg_theme') as ThemeType;
      if (['amber', 'sapphire', 'emerald', 'rose', 'obsidian', 'amethyst', 'copper', 'cyan', 'slate', 'sunset'].includes(saved)) {
        return saved;
      }
    } catch {}
    return 'amber';
  });

  // Route State derived from URL Path or Hash
  const [routeHash, setRouteHash] = useState<string>(() => {
    const path = (window.location.pathname || '').toLowerCase();
    const hash = (window.location.hash || '').toLowerCase();
    if (path.includes('admin') || path.includes('staff')) {
      return path;
    }
    if (hash && hash !== '#/' && hash !== '#') {
      return hash;
    }
    return hash || '#/';
  });

  // Staff User Session
  const [session, setSession] = useState<UserSession>(() => {
    try {
      const saved = localStorage.getItem('sbg_session');
      return saved ? JSON.parse(saved) : { username: 'guest', role: 'guest', name: 'Guest Customer' };
    } catch {
      return { username: 'guest', role: 'guest', name: 'Guest Customer' };
    }
  });

  // Customer Account State (Public Store)
  const [customerAccount, setCustomerAccount] = useState<CustomerAccount | null>(() => {
    try {
      const saved = localStorage.getItem('sbg_customer_account');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isCustomerLoginModalOpen, setIsCustomerLoginModalOpen] = useState(false);

  // Persistent State Data
  const [slabs, setSlabs] = useState<SlabStock[]>(() => {
    try {
      const saved = localStorage.getItem('sbg_slabs');
      return saved ? JSON.parse(saved) : INITIAL_SLABS;
    } catch {
      return INITIAL_SLABS;
    }
  });

  const [trash, setTrash] = useState<TrashItem[]>(() => {
    try {
      const saved = localStorage.getItem('sbg_trash');
      return saved ? filterExpiredTrash(JSON.parse(saved)) : filterExpiredTrash(INITIAL_TRASH);
    } catch {
      return filterExpiredTrash(INITIAL_TRASH);
    }
  });

  const [queries, setQueries] = useState<CustomerQuery[]>(() => {
    try {
      const saved = localStorage.getItem('sbg_queries');
      return saved ? JSON.parse(saved) : INITIAL_QUERIES;
    } catch {
      return INITIAL_QUERIES;
    }
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    try {
      const saved = localStorage.getItem('sbg_announcements');
      return saved ? JSON.parse(saved) : INITIAL_ANNOUNCEMENTS;
    } catch {
      return INITIAL_ANNOUNCEMENTS;
    }
  });

  const [cart, setCart] = useState<SlabStock[]>([]);

  // Modals State
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSlabModalOpen, setIsSlabModalOpen] = useState(false);
  const [editSlab, setEditSlab] = useState<SlabStock | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('sbg_theme', theme);
    } catch {}
    if (document.documentElement) {
      document.documentElement.className = `theme-${theme}`;
    }
  }, [theme]);

  // Sync state changes to LocalStorage
  useEffect(() => {
    try { localStorage.setItem('sbg_slabs', JSON.stringify(slabs)); } catch {}
  }, [slabs]);

  useEffect(() => {
    try { localStorage.setItem('sbg_trash', JSON.stringify(trash)); } catch {}
  }, [trash]);

  useEffect(() => {
    try { localStorage.setItem('sbg_queries', JSON.stringify(queries)); } catch {}
  }, [queries]);

  useEffect(() => {
    try { localStorage.setItem('sbg_announcements', JSON.stringify(announcements)); } catch {}
  }, [announcements]);

  useEffect(() => {
    try { localStorage.setItem('sbg_session', JSON.stringify(session)); } catch {}
  }, [session]);

  useEffect(() => {
    try {
      if (customerAccount) {
        localStorage.setItem('sbg_customer_account', JSON.stringify(customerAccount));
      } else {
        localStorage.removeItem('sbg_customer_account');
      }
    } catch {}
  }, [customerAccount]);

  // Hash and Location change listener and cross-tab localStorage sync
  useEffect(() => {
    setTrash((prevTrash) => filterExpiredTrash(prevTrash));

    const handleLocationChange = () => {
      const path = (window.location.pathname || '').toLowerCase();
      const hash = (window.location.hash || '').toLowerCase();

      if (path.includes('admin') || path.includes('staff')) {
        setRouteHash(path);
      } else if (hash) {
        setRouteHash(hash);
      } else {
        setRouteHash('#/');
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      try {
        if (e.key === 'sbg_queries' && e.newValue) {
          setQueries(JSON.parse(e.newValue));
        }
        if (e.key === 'sbg_slabs' && e.newValue) {
          setSlabs(JSON.parse(e.newValue));
        }
        if (e.key === 'sbg_announcements' && e.newValue) {
          setAnnouncements(JSON.parse(e.newValue));
        }
        if (e.key === 'sbg_trash' && e.newValue) {
          setTrash(filterExpiredTrash(JSON.parse(e.newValue)));
        }
        if (e.key === 'sbg_session' && e.newValue) {
          setSession(JSON.parse(e.newValue));
        }
      } catch {}
    };

    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Staff Route Protection Rules & URL mappings
  const currentPath = (window.location.pathname || '').toLowerCase();
  const normalizedHash = (routeHash || window.location.hash || '').toLowerCase();

  const isStaffRoute = 
    currentPath.includes('admin') || 
    currentPath.includes('staff') || 
    normalizedHash.includes('admin') || 
    normalizedHash.includes('staff');

  // Cart Handlers
  const addToCart = (slab: SlabStock) => {
    if (!cart.some((item) => item.id === slab.id)) {
      setCart((prev) => [...prev, slab]);
    }
  };

  const removeFromCart = (slabId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== slabId));
  };

  const clearCart = () => setCart([]);

  // Slab Handlers
  const handleToggleSlabStatus = (slabId: string) => {
    setSlabs((prev) =>
      prev.map((s) => (s.id === slabId ? { ...s, isSold: !s.isSold } : s))
    );
  };

  const handleSaveSlab = (savedSlab: SlabStock) => {
    setSlabs((prev) => {
      const exists = prev.some((s) => s.id === savedSlab.id);
      if (exists) {
        return prev.map((s) => (s.id === savedSlab.id ? savedSlab : s));
      } else {
        return [savedSlab, ...prev];
      }
    });
  };

  const handleDeleteSlab = (slabToDelete: SlabStock) => {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const newTrashItem: TrashItem = {
      id: 'trash-' + Date.now(),
      slab: slabToDelete,
      deletedAt: now.toISOString(),
      deletedBy: session.name,
      expiresAt,
    };

    setTrash((prev) => [newTrashItem, ...prev]);
    setSlabs((prev) => prev.filter((s) => s.id !== slabToDelete.id));
    removeFromCart(slabToDelete.id);
  };

  const handleRestoreTrash = (trashItem: TrashItem) => {
    setSlabs((prev) => [trashItem.slab, ...prev]);
    setTrash((prev) => prev.filter((t) => t.id !== trashItem.id));
  };

  const handlePermanentDeleteTrash = (trashItemId: string) => {
    setTrash((prev) => prev.filter((t) => t.id !== trashItemId));
  };

  // Queries Handlers
  const handleSubmitQuery = (newQuery: CustomerQuery) => {
    setQueries((prev) => [newQuery, ...prev]);
  };

  const handleUpdateQueryStatus = (queryId: string, status: CustomerQuery['status']) => {
    setQueries((prev) =>
      prev.map((q) => (q.id === queryId ? { ...q, status } : q))
    );
  };

  // Announcement Handlers
  const handleToggleAnnouncement = (id: string) => {
    setAnnouncements((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a))
    );
  };

  const handleAddAnnouncement = (newAnn: Announcement) => {
    setAnnouncements((prev) => [newAnn, ...prev]);
  };

  const handleQuickAddCalculatorStock = (slab: SlabStock) => {
    setSlabs((prev) => [slab, ...prev]);
  };

  const handleLogout = () => {
    const guestSession: UserSession = {
      username: 'guest',
      role: 'guest',
      name: 'Guest Customer',
    };
    setSession(guestSession);
    try {
      localStorage.setItem('sbg_session', JSON.stringify(guestSession));
    } catch {}
    if (window.location.search) {
      window.history.replaceState(null, '', window.location.pathname + '#/');
    } else {
      window.location.hash = '#/';
    }
  };

  // =========================================================================
  // ROUTE RENDER 1: STAFF & OFFICE ERP AREA (#/staff/login or #/staff/dashboard)
  // =========================================================================
  if (isStaffRoute) {
    if (session.role === 'guest') {
      return (
        <div className={`min-h-screen font-sans theme-${theme}`}>
          <Suspense fallback={<div className="min-h-screen bg-stone-900 flex items-center justify-center text-white text-xs font-mono">Loading Staff Login...</div>}>
            <StaffLoginPortal
              onLoginSuccess={(newSession) => {
                setSession(newSession);
                window.location.hash = '#/staff/dashboard';
              }}
              onReturnToCatalog={() => {
                window.history.pushState(null, '', window.location.origin + window.location.pathname.replace(/\/admin.*|\/staff.*/, '') + '/#/');
                window.location.hash = '#/';
                setRouteHash('#/');
              }}
            />
          </Suspense>
        </div>
      );
    }

    return (
      <div className={`min-h-screen font-sans bg-stone-900 text-stone-100 theme-${theme} selection:bg-blue-600 selection:text-white`}>
        {/* Office ERP Dashboard Body */}
        <div className="pb-16">
          <Suspense fallback={<div className="p-8 text-center text-stone-400 font-mono text-xs">Loading Office ERP Dashboard...</div>}>
            <AdminPanel
              session={session}
              slabs={slabs}
              trash={trash}
              queries={queries}
              announcements={announcements}
              onAddSlabClick={() => {
                setEditSlab(null);
                setIsSlabModalOpen(true);
              }}
              onEditSlabClick={(s) => {
                setEditSlab(s);
                setIsSlabModalOpen(true);
              }}
              onToggleSlabStatus={handleToggleSlabStatus}
              onDeleteSlab={handleDeleteSlab}
              onRestoreTrash={handleRestoreTrash}
              onPermanentDeleteTrash={handlePermanentDeleteTrash}
              onUpdateQueryStatus={handleUpdateQueryStatus}
              onToggleAnnouncement={handleToggleAnnouncement}
              onAddAnnouncement={handleAddAnnouncement}
              onQuickAddCalculatorStock={handleQuickAddCalculatorStock}
              openQrModal={() => setIsQrModalOpen(true)}
              openLoginModal={() => {
                window.location.hash = '#/staff/login';
              }}
              onSwitchToCatalog={() => {
                window.history.pushState(null, '', window.location.origin + window.location.pathname.replace(/\/admin.*|\/staff.*/, '') + '/#/');
                window.location.hash = '#/';
                setRouteHash('#/');
              }}
              onLogout={handleLogout}
            />
          </Suspense>
        </div>

        {/* Add / Edit Slab Modal */}
        <SlabModal
          isOpen={isSlabModalOpen}
          onClose={() => {
            setIsSlabModalOpen(false);
            setEditSlab(null);
          }}
          onSave={handleSaveSlab}
          editSlab={editSlab}
          session={session}
        />

        {/* Reception QR Modal */}
        <ReceptionQRModal
          isOpen={isQrModalOpen}
          onClose={() => setIsQrModalOpen(false)}
        />
      </div>
    );
  }

  // =========================================================================
  // ROUTE RENDER 2: PUBLIC SHOPPING WEBSITE (#/ or #/shop)
  // (Zero Staff Elements / 100% Customer Facing Store)
  // =========================================================================
  return (
    <div className={`min-h-screen font-sans selection:bg-amber-500 selection:text-stone-950 theme-${theme}`}>
      {/* Top Header */}
      <Header
        session={session}
        customerAccount={customerAccount}
        activeView={isStaffRoute ? 'admin' : 'catalog'}
        setActiveView={(view) => {
          if (view === 'admin') {
            if (session.role === 'guest') {
              window.location.hash = '#/staff/login';
            } else {
              window.location.hash = '#/staff/dashboard';
            }
          } else {
            window.location.hash = '#/';
          }
        }}
        cartCount={cart.length}
        openCart={() => setIsCartOpen(true)}
        openCustomerLoginModal={() => setIsCustomerLoginModalOpen(true)}
        onLogout={handleLogout}
        openQrModal={() => setIsQrModalOpen(true)}
        announcements={announcements}
        pendingQueriesCount={queries.filter((q) => q.status === 'Pending' || q.status === 'pending').length}
        theme={theme}
        setTheme={setTheme}
      />

      {/* Main Customer Catalog */}
      <main className="pb-16">
        <CustomerCatalog
          slabs={slabs}
          cart={cart}
          addToCart={addToCart}
          removeFromCart={removeFromCart}
          clearCart={clearCart}
          openCart={() => setIsCartOpen(true)}
          onSubmitOrder={handleSubmitQuery}
          session={session}
          onLogout={handleLogout}
        />
      </main>

      {/* Customer Login / Register Modal */}
      <CustomerLoginModal
        isOpen={isCustomerLoginModalOpen}
        onClose={() => setIsCustomerLoginModalOpen(false)}
        customer={customerAccount}
        onLoginCustomer={(acc) => setCustomerAccount(acc)}
        onLogoutCustomer={() => setCustomerAccount(null)}
      />

      {/* Reception QR Modal */}
      <ReceptionQRModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
      />

      {/* Inquiry Cart Drawer */}
      <QueryDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        removeFromCart={removeFromCart}
        clearCart={clearCart}
        onSubmitQuery={handleSubmitQuery}
      />

      {/* Customer Shopping Footer */}
      <footer className="bg-stone-900 text-stone-400 py-6 px-4 text-xs border-t border-stone-800 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span>© {new Date().getFullYear()} Sri Balaji Granites & Marbles.</span>
          </div>
          <div className="flex items-center gap-3 text-stone-400 font-mono text-[11px] flex-wrap justify-center">
            <span>Bangalore Yard</span>
            <span>•</span>
            <span>Chittoor Factory</span>
            <span>•</span>
            <span>Vishakapatnam Export</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
