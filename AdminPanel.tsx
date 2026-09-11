import React, { useState } from 'react';
import { 
  Building2, 
  Boxes, 
  Calculator, 
  Trash2, 
  FileSpreadsheet, 
  Printer, 
  Plus, 
  Search, 
  RefreshCw, 
  MessageSquareQuote, 
  Megaphone, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Edit3, 
  ExternalLink,
  ShieldAlert,
  MapPin,
  TrendingUp,
  DollarSign,
  Send,
  Eye,
  Check,
  RotateCcw,
  Sparkles,
  Link2,
  Copy,
  Download
} from 'lucide-react';
import { 
  SlabStock, 
  TrashItem, 
  CustomerQuery, 
  Announcement, 
  UserSession, 
  GodownId, 
  DimensionUnit, 
  CategoryType 
} from '../types';
import { 
  formatCurrency, 
  calculateSlabArea, 
  getTrashRemainingDays, 
  exportStockToCSV, 
  generateWhatsAppUrl,
  getRatesInAllUnits,
  getDimensionsInAllUnits
} from '../utils/calc';

interface AdminPanelProps {
  session: UserSession;
  slabs: SlabStock[];
  trash: TrashItem[];
  queries: CustomerQuery[];
  announcements: Announcement[];
  onAddSlabClick: () => void;
  onEditSlabClick: (slab: SlabStock) => void;
  onDeleteSlab: (slab: SlabStock) => void;
  onRestoreTrash: (trashItem: TrashItem) => void;
  onPermanentDeleteTrash: (trashItemId: string) => void;
  onUpdateQueryStatus: (queryId: string, status: CustomerQuery['status']) => void;
  onToggleAnnouncement: (announcementId: string) => void;
  onAddAnnouncement: (ann: Announcement) => void;
  onQuickAddCalculatorStock: (slab: SlabStock) => void;
  onToggleSlabStatus?: (slabId: string) => void;
  openQrModal: () => void;
  openLoginModal: () => void;
  onSwitchToCatalog?: () => void;
  onLogout?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  session,
  slabs,
  trash,
  queries,
  announcements,
  onAddSlabClick,
  onEditSlabClick,
  onDeleteSlab,
  onRestoreTrash,
  onPermanentDeleteTrash,
  onUpdateQueryStatus,
  onToggleAnnouncement,
  onAddAnnouncement,
  onQuickAddCalculatorStock,
  onToggleSlabStatus,
  openQrModal,
  openLoginModal,
  onSwitchToCatalog,
  onLogout,
}) => {
  const isManager = session.role !== 'admin' && session.role !== 'guest';
  const assignedGodown: GodownId = session.godownId || 'godown_1';

  const [adminTab, setAdminTab] = useState<'godowns' | 'calc' | 'queries' | 'trash' | 'reports' | 'announcements'>('godowns');

  // Sync tab with URL hash route
  React.useEffect(() => {
    const syncRouteHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('/staff/products') || hash.includes('/staff/inventory')) {
        setAdminTab('godowns');
      } else if (hash.includes('/staff/orders') || hash.includes('/staff/customers')) {
        setAdminTab('queries');
      } else if (hash.includes('/staff/reports')) {
        setAdminTab('reports');
      } else if (hash.includes('/staff/settings')) {
        setAdminTab('announcements');
      } else if (hash.includes('/staff/calculator')) {
        setAdminTab('calc');
      } else if (hash.includes('/staff/trash')) {
        setAdminTab('trash');
      } else if (hash.includes('/staff/dashboard') || hash === '#/staff') {
        setAdminTab('godowns');
      }
    };

    syncRouteHash();
    window.addEventListener('hashchange', syncRouteHash);
    return () => window.removeEventListener('hashchange', syncRouteHash);
  }, []);

  const handleTabChange = (tab: 'godowns' | 'calc' | 'queries' | 'trash' | 'reports' | 'announcements', routePath: string) => {
    setAdminTab(tab);
    window.location.hash = routePath;
  };
  const [godownFilter, setGodownFilter] = useState<GodownId | 'all'>(
    isManager ? assignedGodown : 'all'
  );
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'available' | 'out_of_stock'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedPortalLink, setCopiedPortalLink] = useState<'customer' | 'admin' | null>(null);

  const getPortalUrls = () => {
    const origin = window.location.origin;
    const cleanPath = window.location.pathname.replace(/\/(admin|staff)(\/.*)?$/i, '');
    const basePath = `${origin}${cleanPath === '/' ? '' : cleanPath}`;
    return {
      customer: `${basePath}/`,
      admin: `${basePath}/#/admin`
    };
  };

  const copyPortalLink = (type: 'customer' | 'admin') => {
    const urls = getPortalUrls();
    navigator.clipboard.writeText(urls[type]);
    setCopiedPortalLink(type);
    setTimeout(() => setCopiedPortalLink(null), 2000);
  };

  // Helper to match godown ID (handling godown_1/a, godown_2/b, godown_3/c)
  const isSlabInGodown = (slabGodownId: GodownId, targetGodown: GodownId | 'all') => {
    if (targetGodown === 'all') return true;
    if (targetGodown === 'godown_1' && (slabGodownId === 'godown_1' || slabGodownId === 'godown_a')) return true;
    if (targetGodown === 'godown_2' && (slabGodownId === 'godown_2' || slabGodownId === 'godown_b')) return true;
    if (targetGodown === 'godown_3' && (slabGodownId === 'godown_3' || slabGodownId === 'godown_c')) return true;
    return slabGodownId === targetGodown;
  };

  // Base slabs visible to this session (Strictly restricted for Godown Managers)
  const scopedBaseSlabs = isManager
    ? slabs.filter((s) => isSlabInGodown(s.godownId, assignedGodown))
    : slabs;

  // Filtered slabs for display in inventory table
  const activeSlabs = scopedBaseSlabs.filter((s) => {
    let matchesGodown = godownFilter === 'all';
    if (!matchesGodown) {
      matchesGodown = isSlabInGodown(s.godownId, godownFilter);
    }

    let matchesStatus = true;
    if (stockStatusFilter === 'available') matchesStatus = !s.isSold;
    if (stockStatusFilter === 'out_of_stock') matchesStatus = s.isSold;

    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.blockNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGodown && matchesSearch && matchesStatus;
  });

  // Scoped queries for this session
  const scopedQueries = isManager
    ? queries.filter((q) => {
        if (q.preferredGodown === assignedGodown || q.preferredGodown === 'any') return true;
        return q.selectedSlabs?.some((s) => isSlabInGodown(s.godownId, assignedGodown));
      })
    : queries;

  // Scoped trash for this session
  const scopedTrash = isManager
    ? trash.filter((t) => isSlabInGodown(t.slab.godownId, assignedGodown))
    : trash;

  // Interactive Calculator State
  const [calcLength, setCalcLength] = useState<number>(3.5);
  const [calcWidth, setCalcWidth] = useState<number>(1.8);
  const [calcUnit, setCalcUnit] = useState<DimensionUnit>('meters');
  const [calcPieces, setCalcPieces] = useState<number>(25);
  const [calcTitle, setCalcTitle] = useState('New Lot Entry');
  const [calcCategory, setCalcCategory] = useState<CategoryType>('Italian Marble');
  const [calcGodown, setCalcGodown] = useState<GodownId>(isManager ? assignedGodown : 'godown_1');
  const [calcRate, setCalcRate] = useState<number>(320);

  // Announcement Form
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnMsg, setNewAnnMsg] = useState('');

  // Access control check
  const canEditGodown = (godownId: GodownId) => {
    if (session.role === 'admin') return true;
    return isSlabInGodown(godownId, assignedGodown);
  };

  // Aggregated Stats calculated strictly on scopedBaseSlabs
  const totalSlabsInStock = scopedBaseSlabs.filter((s) => !s.isSold).length;
  const totalSlabsOutOfStock = scopedBaseSlabs.filter((s) => s.isSold).length;
  const totalSlabsAll = scopedBaseSlabs.length;
  const totalSqFtInStock = scopedBaseSlabs
    .filter((s) => !s.isSold)
    .reduce((sum, s) => sum + s.totalSqFt, 0);
  const totalEstimatedValue = scopedBaseSlabs
    .filter((s) => !s.isSold)
    .reduce((sum, s) => sum + s.totalSqFt * s.pricePerSqFt, 0);
  const pendingQueries = scopedQueries.filter((q) => q.status === 'Pending').length;

  const { sqFt: calcResultSqFt, sqMeters: calcResultSqM } = calculateSlabArea(
    calcLength,
    calcWidth,
    calcUnit,
    calcPieces
  );

  const handleCalculatorAddStock = (e: React.FormEvent) => {
    e.preventDefault();
    const godownNames: Record<GodownId, string> = {
      godown_1: 'Bangalore Yard',
      godown_2: 'Chittoor Factory',
      godown_3: 'Vishakapatnam Export',
      godown_a: 'Bangalore Yard',
      godown_b: 'Chittoor Factory',
      godown_c: 'Vishakapatnam Export',
    };

    const newSlab: SlabStock = {
      id: 'slab-' + Date.now(),
      godownId: calcGodown,
      godownName: godownNames[calcGodown],
      blockNumber: `CALC-${Math.floor(100 + Math.random() * 900)}`,
      title: calcTitle.trim() || 'Calculated Slab Stock',
      category: calcCategory,
      imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      length: calcLength,
      width: calcWidth,
      unit: calcUnit,
      pieces: calcPieces,
      totalSqFt: calcResultSqFt,
      totalSqMeters: calcResultSqM,
      thicknessMm: 18,
      finish: 'Polished',
      pricePerSqFt: calcRate,
      isSold: false,
      createdAt: new Date().toISOString(),
    };

    onQuickAddCalculatorStock(newSlab);
    alert(`Successfully added ${calcResultSqFt} Sq.Ft slab stock to ${godownNames[calcGodown]}!`);
  };

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnTitle.trim() || !newAnnMsg.trim()) return;

    const newAnn: Announcement = {
      id: 'ann-' + Date.now(),
      title: newAnnTitle.trim(),
      message: newAnnMsg.trim(),
      isActive: true,
      date: new Date().toISOString().split('T')[0],
      type: 'offer',
    };

    onAddAnnouncement(newAnn);
    setNewAnnTitle('');
    setNewAnnMsg('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Staff Workspace Header Bar */}
      <div className="bg-stone-900 text-white p-4 rounded-3xl shadow-lg border border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-md">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold tracking-tight text-white">{session.name}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-900/80 text-blue-300 font-mono text-[10px] font-bold border border-blue-700">
                {session.role === 'admin' ? 'SUPER ADMIN (3 LOCATIONS)' : session.godownName || 'YARD MANAGER'}
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              Sri Balaji Granites ERP • Live Monitoring & Inventory Controller
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            id="staff-go-to-store-btn"
            onClick={() => {
              try {
                window.history.replaceState(null, '', window.location.origin + window.location.pathname.replace(/\/admin.*|\/staff.*/, '') + '#/');
              } catch {}
              window.location.hash = '#/';
              if (onSwitchToCatalog) onSwitchToCatalog();
            }}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-all flex items-center gap-2 shadow-md cursor-pointer hover:scale-105"
            title="Exit Admin ERP and return to Customer Store"
          >
            <Eye className="w-4 h-4 text-white" />
            <span>🛍️ Exit Admin & Go To Store</span>
          </button>

          <a
            href="/Sri_Balaji_Granites_All_In_One.zip"
            download="Sri_Balaji_Granites_All_In_One.zip"
            className="px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs border border-blue-500 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer hover:scale-105"
            title="Download complete updated source code ZIP"
          >
            <Download className="w-4 h-4 text-white" />
            <span className="hidden sm:inline">Download ZIP</span>
          </a>

          <button
            type="button"
            id="staff-logout-btn"
            onClick={() => {
              if (onLogout) onLogout();
              if (window.location.search) {
                window.history.replaceState(null, '', window.location.pathname + '#/');
              } else {
                window.location.hash = '#/';
              }
            }}
            className="px-3.5 py-2.5 rounded-xl bg-stone-800 hover:bg-rose-900 text-rose-200 hover:text-white font-bold text-xs border border-stone-700 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            title="Logout Admin Session"
          >
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Interconnected Portals Links Banner */}
      <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-700 rounded-2xl border border-blue-200">
            <Link2 className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-stone-900 text-sm">Interconnected System Portals</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold border border-emerald-300">
                Live Data Synchronized
              </span>
            </div>
            <p className="text-xs text-stone-500">
              Share Customer Link with buyers or use Admin Link for staff inventory management.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto">
          {/* Customer Portal Link Box */}
          <div className="w-full sm:w-auto p-2.5 bg-stone-50 border border-stone-200 rounded-2xl flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-600 shrink-0 ml-1" />
            <div className="min-w-0">
              <div className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider">Customer Store Link</div>
              <div className="text-xs font-mono font-bold text-stone-800 truncate max-w-[140px] sm:max-w-[180px]">
                {getPortalUrls().customer}
              </div>
            </div>
            <button
              type="button"
              onClick={() => copyPortalLink('customer')}
              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer"
              title="Copy Customer Store URL"
            >
              {copiedPortalLink === 'customer' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedPortalLink === 'customer' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Admin ERP Portal Link Box */}
          <div className="w-full sm:w-auto p-2.5 bg-stone-50 border border-stone-200 rounded-2xl flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 ml-1" />
            <div className="min-w-0">
              <div className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider">Admin ERP Link</div>
              <div className="text-xs font-mono font-bold text-stone-800 truncate max-w-[140px] sm:max-w-[180px]">
                {getPortalUrls().admin}
              </div>
            </div>
            <button
              type="button"
              onClick={() => copyPortalLink('admin')}
              className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer"
              title="Copy Admin ERP URL"
            >
              {copiedPortalLink === 'admin' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedPortalLink === 'admin' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        <div className="p-5 bg-white border border-stone-200 rounded-3xl shadow-sm flex items-center gap-4 hover:border-stone-300 transition-all">
          <div className="p-3.5 bg-emerald-100 text-emerald-800 rounded-2xl border border-emerald-200">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-stone-500 font-mono uppercase tracking-wider block">Available Stock</span>
            <span className="text-2xl font-black text-emerald-700">{totalSlabsInStock} Slabs</span>
            <span className="text-[10px] text-stone-500 block">Out of {totalSlabsAll} total slabs</span>
          </div>
        </div>

        <div className="p-5 bg-white border border-stone-200 rounded-3xl shadow-sm flex items-center gap-4 hover:border-stone-300 transition-all">
          <div className="p-3.5 bg-rose-100 text-rose-800 rounded-2xl border border-rose-200">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-stone-500 font-mono uppercase tracking-wider block">Sold Out</span>
            <span className="text-2xl font-black text-rose-700">{totalSlabsOutOfStock} Sold Out</span>
            <span className="text-[10px] text-stone-500 block">Marked inactive</span>
          </div>
        </div>

        <div className="p-5 bg-white border border-stone-200 rounded-3xl shadow-sm flex items-center gap-4 hover:border-stone-300 transition-all">
          <div className="p-3.5 bg-blue-100 text-blue-800 rounded-2xl border border-blue-200">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-stone-500 font-mono uppercase tracking-wider block">Total Live Surface</span>
            <span className="text-2xl font-black text-blue-700">{Math.round(totalSqFtInStock).toLocaleString()} Sq.Ft</span>
            <span className="text-[10px] text-blue-800 font-mono block">Valuation {formatCurrency(totalEstimatedValue)}</span>
          </div>
        </div>

        <div className="p-5 bg-white border border-stone-200 rounded-3xl shadow-sm flex items-center gap-4 hover:border-stone-300 transition-all">
          <div className="p-3.5 bg-stone-100 text-stone-800 rounded-2xl border border-stone-200">
            <MessageSquareQuote className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-stone-500 font-mono uppercase tracking-wider block">Customer Queries</span>
            <span className="text-2xl font-black text-stone-900">{pendingQueries} Pending</span>
            <span className="text-[10px] text-stone-500 block">Out of {scopedQueries.length} total</span>
          </div>
        </div>

      </div>

      {/* Admin Tab Navigation */}
      <div className="bg-white p-1.5 rounded-2xl border border-stone-200 flex items-center gap-1 overflow-x-auto no-scrollbar text-xs font-medium shadow-sm">
        <button
          id="tab-godowns-btn"
          onClick={() => handleTabChange('godowns', '#/staff/products')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
            adminTab === 'godowns'
              ? 'bg-blue-600 text-white font-bold shadow-sm'
              : 'text-stone-700 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Stock & Inventory</span>
        </button>

        <button
          id="tab-calc-btn"
          onClick={() => handleTabChange('calc', '#/staff/calculator')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
            adminTab === 'calc'
              ? 'bg-blue-600 text-white font-bold shadow-sm'
              : 'text-stone-700 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Slab Auto-Calculator</span>
        </button>

        <button
          id="tab-queries-btn"
          onClick={() => handleTabChange('queries', '#/staff/orders')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shrink-0 relative ${
            adminTab === 'queries'
              ? 'bg-blue-600 text-white font-bold shadow-sm'
              : 'text-stone-700 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <MessageSquareQuote className="w-4 h-4" />
          <span>Orders & Queries</span>
          {pendingQueries > 0 && (
            <span className="bg-rose-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
              {pendingQueries}
            </span>
          )}
        </button>

        <button
          id="tab-trash-btn"
          onClick={() => handleTabChange('trash', '#/staff/trash')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
            adminTab === 'trash'
              ? 'bg-blue-600 text-white font-bold shadow-sm'
              : 'text-stone-700 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Trash2 className="w-4 h-4" />
          <span>Trash Bin</span>
          {trash.length > 0 && (
            <span className="bg-stone-200 text-stone-800 text-[10px] font-mono font-bold px-1.5 rounded">
              {trash.length}
            </span>
          )}
        </button>

        <button
          id="tab-reports-btn"
          onClick={() => handleTabChange('reports', '#/staff/reports')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
            adminTab === 'reports'
              ? 'bg-blue-600 text-white font-bold shadow-sm'
              : 'text-stone-700 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Reports & Export</span>
        </button>

        <button
          id="tab-announcements-btn"
          onClick={() => handleTabChange('announcements', '#/staff/settings')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
            adminTab === 'announcements'
              ? 'bg-blue-600 text-white font-bold shadow-sm'
              : 'text-stone-700 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>Settings & Banners</span>
        </button>
      </div>

      {/* TAB 1: 3 GODOWNS INVENTORY */}
      {adminTab === 'godowns' && (
        <div className="space-y-4">
          
          {/* Controls Header */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
            
            {/* Filter buttons for 3 Godowns */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              <span className="text-xs font-semibold text-stone-600 mr-1 flex items-center gap-1 shrink-0">
                <MapPin className="w-3.5 h-3.5 text-blue-600" /> View:
              </span>
              {!isManager ? (
                <>
                  <button
                    id="admin-filter-all-btn"
                    onClick={() => setGodownFilter('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      godownFilter === 'all'
                        ? 'bg-blue-600 text-white font-bold shadow-sm'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    All Locations
                  </button>
                  <button
                    id="admin-filter-godown-1-btn"
                    onClick={() => setGodownFilter('godown_1')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      godownFilter === 'godown_1' || godownFilter === 'godown_a'
                        ? 'bg-blue-600 text-white font-bold shadow-sm'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    Bangalore Yard
                  </button>
                  <button
                    id="admin-filter-godown-2-btn"
                    onClick={() => setGodownFilter('godown_2')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      godownFilter === 'godown_2' || godownFilter === 'godown_b'
                        ? 'bg-blue-600 text-white font-bold shadow-sm'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    Chittoor Factory
                  </button>
                  <button
                    id="admin-filter-godown-3-btn"
                    onClick={() => setGodownFilter('godown_3')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      godownFilter === 'godown_3' || godownFilter === 'godown_c'
                        ? 'bg-blue-600 text-white font-bold shadow-sm'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    Vishakapatnam Export
                  </button>
                </>
              ) : (
                <div className="px-3 py-1.5 rounded-xl bg-blue-100 text-blue-900 border border-blue-200 text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Assigned Scope: {session.godownName || ('Godown ' + assignedGodown.replace('godown_', ''))} (Restricted)</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                <input
                  id="admin-stock-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search block, material..."
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-8 pr-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                id="add-new-slab-btn"
                onClick={onAddSlabClick}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shrink-0 shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Slab</span>
              </button>
            </div>

          </div>

          {/* Stock Availability Filter Sub-Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-stone-200 shadow-sm">
            <div className="flex items-center gap-2 overflow-x-auto">
              <span className="text-xs font-semibold text-stone-600 mr-1 flex items-center gap-1 shrink-0">
                <Boxes className="w-3.5 h-3.5 text-blue-600" /> Availability Filter:
              </span>
              <button
                id="stock-filter-all-btn"
                onClick={() => setStockStatusFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  stockStatusFilter === 'all'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'
                }`}
              >
                All Stock Items ({totalSlabsAll})
              </button>
              <button
                id="stock-filter-available-btn"
                onClick={() => setStockStatusFilter('available')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  stockStatusFilter === 'available'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-stone-100 text-emerald-800 hover:bg-stone-200 border border-stone-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Available / In Stock ({totalSlabsInStock})
              </button>
              <button
                id="stock-filter-out-of-stock-btn"
                onClick={() => setStockStatusFilter('out_of_stock')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  stockStatusFilter === 'out_of_stock'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-stone-100 text-rose-800 hover:bg-stone-200 border border-stone-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Out of Stock / Sold ({totalSlabsOutOfStock})
              </button>
            </div>
            <div className="text-xs text-stone-600 font-mono">
              Showing <strong className="text-blue-700">{activeSlabs.length}</strong> matching slabs
            </div>
          </div>

          {/* Godown Stock Table */}
          <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-700">
                <thead className="bg-stone-50 text-stone-900 font-mono text-[11px] uppercase border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-4">Photo & Block No</th>
                    <th className="py-3 px-4">Godown Location</th>
                    <th className="py-3 px-4">Material / Category</th>
                    <th className="py-3 px-4">Dimensions (L x W)</th>
                    <th className="py-3 px-4">Pieces & Total Area</th>
                    <th className="py-3 px-4">Rate (Rs/Sq.Ft)</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {activeSlabs.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-stone-500">
                        No slabs found in inventory matching filter.
                      </td>
                    </tr>
                  ) : (
                    activeSlabs.map((s) => (
                      <tr key={s.id} className="hover:bg-stone-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={s.imageUrl}
                              alt={s.title}
                              className="w-12 h-12 object-cover rounded-xl border border-stone-200 shrink-0"
                            />
                            <div>
                              <span className="font-mono font-bold text-blue-700 block text-xs">{s.blockNumber}</span>
                              <span className="text-[10px] text-stone-500 truncate max-w-[120px] block">{s.lotName || 'Standard Lot'}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-stone-100 rounded-lg text-stone-800 border border-stone-200 font-mono text-[11px]">
                            {s.godownName.split('-')[0]}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-bold text-stone-900">{s.title}</div>
                          <div className="text-[10px] text-stone-500">{s.category} • {s.thicknessMm}mm</div>
                        </td>

                        <td className="py-3 px-4 font-mono">
                          {(() => {
                            const dims = getDimensionsInAllUnits(s.length, s.width, s.unit);
                            return (
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 border border-blue-200 text-[9px] font-bold">
                                    ft
                                  </span>
                                  <span className="font-bold text-stone-900 text-xs">{dims.feet}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 text-[9px] font-bold">
                                    cm
                                  </span>
                                  <span className="text-stone-700 text-xs font-semibold">{dims.centimeters}</span>
                                </div>
                                <div className="text-[10px] text-stone-500 flex items-center gap-2 pt-0.5">
                                  <span>m: {dims.meters}</span>
                                  <span className="text-stone-500 font-sans">({s.length}x{s.width} {s.unit})</span>
                                </div>
                              </div>
                            );
                          })()}
                        </td>

                        <td className="py-3 px-4 font-mono">
                          <div className="text-stone-900 font-bold">{s.pieces} Slabs</div>
                          <div className="text-blue-700 text-[11px] font-bold">{s.totalSqFt} Sq.Ft ({s.totalSqMeters} Sq.M)</div>
                          <div className="text-[10px] text-stone-500">{Math.round(s.totalSqFt * 929.03).toLocaleString()} Sq.Cm</div>
                        </td>

                        <td className="py-3 px-4 font-mono">
                          {(() => {
                            const rates = getRatesInAllUnits(s.pricePerSqFt);
                            return (
                              <div>
                                <span className="font-extrabold text-blue-700 block">{formatCurrency(rates.perSqFt)} / Sq.Ft</span>
                                <span className="text-[10px] text-stone-700 block">₹{rates.perSqMeter} / Sq.M</span>
                                <span className="text-[10px] text-stone-500 block">₹{rates.perSqCm} / Sq.Cm</span>
                              </div>
                            );
                          })()}
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex flex-col gap-1 items-start">
                            {s.isSold ? (
                              <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300 text-[10px] font-bold">
                                Out of Stock
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                                Available
                              </span>
                            )}
                            {canEditGodown(s.godownId) && onToggleSlabStatus && (
                              <button
                                id={`toggle-status-btn-${s.id}`}
                                onClick={() => onToggleSlabStatus(s.id)}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all border ${
                                  s.isSold
                                    ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border-emerald-300'
                                    : 'bg-stone-100 hover:bg-rose-100 text-stone-800 hover:text-rose-800 border-stone-300'
                                }`}
                                title={s.isSold ? 'Click to set Available / In Stock' : 'Click to set Out of Stock / Sold'}
                              >
                                {s.isSold ? '✓ Set Available' : '✕ Set Out of Stock'}
                              </button>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {canEditGodown(s.godownId) ? (
                              <>
                                <button
                                  id={`edit-slab-btn-${s.id}`}
                                  onClick={() => onEditSlabClick(s)}
                                  className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors border border-stone-200"
                                  title="Edit Slab Details"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  id={`delete-slab-btn-${s.id}`}
                                  onClick={() => onDeleteSlab(s)}
                                  className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors"
                                  title="Delete to Trash Bin"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            ) : (
                              <span className="text-[10px] text-stone-500 font-mono italic">
                                View Only
                              </span>
                            )}
                          </div>
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: SLAB AUTO CALCULATOR */}
      {adminTab === 'calc' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="bg-white border border-stone-200 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-stone-900 text-base">Interactive Slab Area Calculator</h3>
            </div>
            <p className="text-xs text-stone-600">
              Enter Length, Width, Unit, and Piece count to instantly compute total Square Feet and Square Meters without manual math.
            </p>

            <form onSubmit={handleCalculatorAddStock} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Dimension Unit</label>
                  <select
                    id="calc-unit-select"
                    value={calcUnit}
                    onChange={(e) => setCalcUnit(e.target.value as DimensionUnit)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-blue-700 font-mono font-bold"
                  >
                    <option value="meters">Meters (m)</option>
                    <option value="centimeters">Centimeters (cm)</option>
                    <option value="feet">Feet (ft)</option>
                    <option value="inches">Inches (in)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Target Godown</label>
                  <select
                    id="calc-godown-select"
                    value={calcGodown}
                    onChange={(e) => setCalcGodown(e.target.value as GodownId)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900"
                  >
                    <option value="godown_1">Bangalore Yard</option>
                    <option value="godown_2">Chittoor Factory</option>
                    <option value="godown_3">Vishakapatnam Export</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Length</label>
                  <input
                    id="calc-length-input"
                    type="number"
                    step="0.01"
                    value={calcLength}
                    onChange={(e) => setCalcLength(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Width</label>
                  <input
                    id="calc-width-input"
                    type="number"
                    step="0.01"
                    value={calcWidth}
                    onChange={(e) => setCalcWidth(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Pieces (Slabs)</label>
                  <input
                    id="calc-pieces-input"
                    type="number"
                    value={calcPieces}
                    onChange={(e) => setCalcPieces(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-blue-700 font-bold font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Title</label>
                  <input
                    id="calc-title-input"
                    type="text"
                    value={calcTitle}
                    onChange={(e) => setCalcTitle(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Category</label>
                  <select
                    id="calc-category-select"
                    value={calcCategory}
                    onChange={(e) => setCalcCategory(e.target.value as CategoryType)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900"
                  >
                    <option value="Italian Marble">Italian Marble</option>
                    <option value="Indian Marble">Indian Marble</option>
                    <option value="Granite">Granite</option>
                    <option value="Quartz">Quartz</option>
                    <option value="Onyx">Onyx</option>
                    <option value="Sandstone">Sandstone</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                id="quick-add-calc-stock-btn"
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Quick Add this Slab to Stock</span>
              </button>
            </form>
          </div>

          {/* Calculator Output Live Preview Box */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 space-y-4 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-blue-700 block mb-2 font-bold">Live Calculation Output</span>
              
              <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200 text-center space-y-3">
                <span className="text-xs text-stone-600 block">Total Slab Area Result</span>
                <div className="text-4xl font-black text-blue-700 tracking-tight">
                  {calcResultSqFt} <span className="text-lg font-normal text-stone-600">Sq.Ft</span>
                </div>
                <div className="text-xl font-bold text-emerald-700">
                  {calcResultSqM} <span className="text-xs text-stone-600">Sq. Meters</span>
                </div>
              </div>

              <div className="mt-4 p-4 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-2 text-stone-700 font-mono">
                <div className="flex justify-between">
                  <span>Input Formula:</span>
                  <span className="text-blue-700 font-bold">{calcLength} x {calcWidth} {calcUnit} x {calcPieces} pcs</span>
                </div>
                <div className="flex justify-between">
                  <span>Est. Value (@ ₹{calcRate}/sq.ft):</span>
                  <span className="text-stone-900 font-bold">{formatCurrency(calcResultSqFt * calcRate)}</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-[11px] text-stone-600 italic">
              💡 Staff tip: Automatic area conversion handles cm, meters, feet, and inches directly into Sq.Ft.
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: CUSTOMER QUERIES */}
      {adminTab === 'queries' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
            <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
              <MessageSquareQuote className="w-5 h-5 text-blue-600" />
              Incoming Website & Catalog Queries ({scopedQueries.length})
            </h3>
          </div>

          <div className="space-y-3">
            {scopedQueries.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-stone-200 text-stone-500 shadow-sm">
                No customer queries for this godown yet. Slabs selected by clients from online catalog appear here.
              </div>
            ) : (
              scopedQueries.map((q) => (
                <div
                  key={q.id}
                  className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-900 text-base">{q.clientName}</span>
                      <span className="px-2 py-0.5 rounded bg-stone-100 text-blue-800 border border-stone-200 font-mono text-xs font-bold">
                        Ph: {q.mobileNumber}
                      </span>
                      <span className="text-[10px] text-stone-500 font-mono">
                        {new Date(q.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-xs text-stone-700">
                      <strong>Requirement:</strong> {q.requirement} | <strong>Quantity:</strong> {q.requestedQuantitySqFt} Sq.Ft
                    </p>

                    {/* Slabs requested */}
                    {q.selectedSlabs && q.selectedSlabs.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {q.selectedSlabs.map((s) => (
                          <span key={s.id} className="px-2 py-1 rounded bg-stone-50 border border-stone-200 text-[11px] text-stone-800 font-mono flex items-center gap-1">
                            <span className="text-blue-700 font-bold">{s.blockNumber}</span> ({s.title})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div>
                      <label className="block text-[10px] text-stone-500 uppercase font-mono mb-1">Status</label>
                      <select
                        value={q.status}
                        onChange={(e) => onUpdateQueryStatus(q.id, e.target.value as any)}
                        className="bg-stone-50 border border-stone-300 rounded-xl px-3 py-1.5 text-xs text-stone-900 font-bold"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Quoted">Quoted</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </div>

                    <a
                      href={generateWhatsAppUrl(q.clientName, q.mobileNumber, `Quotation reply for query #${q.id}`, q.selectedSlabs)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>WhatsApp Reply</span>
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: TRASH BIN (7-DAY AUTO) */}
      {adminTab === 'trash' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-blue-600" />
                Trash Bin (7-Day Auto Purge Protection)
              </h3>
              <p className="text-xs text-stone-600">
                Deleted slabs are preserved here for 7 days before permanent auto-purge. Staff can restore entries anytime.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-xs font-mono font-bold shrink-0">
              7 Days Retention Active
            </span>
          </div>

          <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-700">
                <thead className="bg-stone-50 text-stone-900 font-mono text-[11px] uppercase border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-4">Deleted Slab</th>
                    <th className="py-3 px-4">Godown</th>
                    <th className="py-3 px-4">Deleted By & Date</th>
                    <th className="py-3 px-4">Auto-Purge In</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {scopedTrash.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-stone-500">
                        Trash Bin is empty for this godown. No deleted entries in past 7 days.
                      </td>
                    </tr>
                  ) : (
                    scopedTrash.map((item) => {
                      const daysLeft = getTrashRemainingDays(item.deletedAt);
                      return (
                        <tr key={item.id} className="hover:bg-stone-50 transition-colors">
                          <td className="py-3 px-4 font-bold text-stone-900">
                            {item.slab.title} ({item.slab.blockNumber})
                            <span className="text-[10px] text-stone-500 block font-normal">{item.slab.totalSqFt} Sq.Ft</span>
                          </td>
                          <td className="py-3 px-4 font-mono">{item.slab.godownName.split('-')[0]}</td>
                          <td className="py-3 px-4 text-stone-600">
                            {item.deletedBy} • {new Date(item.deletedAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 font-mono">
                            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 text-[11px] font-bold">
                              {daysLeft} Days Remaining
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right space-x-2">
                            <button
                              id={`restore-trash-btn-${item.id}`}
                              onClick={() => onRestoreTrash(item)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-1 shadow-sm transition-colors"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Restore</span>
                            </button>
                            <button
                              id={`perm-delete-btn-${item.id}`}
                              onClick={() => onPermanentDeleteTrash(item.id)}
                              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs inline-flex items-center gap-1 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete Permanently</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: REPORTS & EXPORT */}
      {adminTab === 'reports' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
            <div>
              <h3 className="font-bold text-stone-900 text-lg flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                Monthly Stock & Inventory Report Exporter
              </h3>
              <p className="text-xs text-stone-600">
                One-click export stock calculations into CSV Excel spreadsheets or trigger printable PDF reports.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                id="export-csv-btn"
                onClick={() => exportStockToCSV(scopedBaseSlabs)}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Export CSV Excel</span>
              </button>

              <button
                id="print-report-btn"
                onClick={() => window.print()}
                className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 font-bold text-xs flex items-center gap-2 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Print PDF Summary</span>
              </button>
            </div>
          </div>

          {/* Godown Breakdown Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['godown_1', 'godown_2', 'godown_3']
              .filter((gId) => !isManager || isSlabInGodown(gId as GodownId, assignedGodown))
              .map((gId) => {
                const gSlabs = scopedBaseSlabs.filter((s) => isSlabInGodown(s.godownId, gId as GodownId) && !s.isSold);
                const gSqFt = gSlabs.reduce((sum, s) => sum + s.totalSqFt, 0);
                const gValue = gSlabs.reduce((sum, s) => sum + s.totalSqFt * s.pricePerSqFt, 0);
                const gNames: Record<string, string> = {
                  godown_1: 'Bangalore Yard',
                  godown_2: 'Chittoor Factory',
                  godown_3: 'Vishakapatnam Export',
                };

                return (
                  <div key={gId} className="bg-white border border-stone-200 rounded-2xl p-5 space-y-3 shadow-sm">
                    <span className="text-xs font-mono font-bold text-blue-700 uppercase">{gNames[gId]}</span>
                    <div className="text-2xl font-black text-stone-900">{gSlabs.length} Slabs</div>
                    <div className="text-sm font-bold text-emerald-700">{Math.round(gSqFt)} Sq.Ft Total</div>
                    <div className="text-xs text-stone-500 font-mono">Valuation: {formatCurrency(gValue)}</div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* TAB 6: ANNOUNCEMENTS & RECEPTION QR */}
      {adminTab === 'announcements' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Post Announcement Form */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 space-y-4 shadow-sm">
            <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-blue-600" />
              Website Banner Announcement Manager
            </h3>

            <form onSubmit={handleCreateAnnouncement} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Offer / Notice Title</label>
                <input
                  id="ann-title-input"
                  type="text"
                  required
                  value={newAnnTitle}
                  onChange={(e) => setNewAnnTitle(e.target.value)}
                  placeholder="e.g. 🎉 Special Discount on Italian Bottochino!"
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Message Detail</label>
                <textarea
                  id="ann-msg-textarea"
                  rows={2}
                  required
                  value={newAnnMsg}
                  onChange={(e) => setNewAnnMsg(e.target.value)}
                  placeholder="e.g. Get 10% off on orders exceeding 2000 Sq.Ft."
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900"
                />
              </div>

              <button
                type="submit"
                id="publish-announcement-btn"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-colors"
              >
                Publish Announcement
              </button>
            </form>

            <div className="pt-2 space-y-2">
              <span className="text-xs font-mono font-semibold text-stone-600 block uppercase">Active Banners</span>
              {announcements.map((ann) => (
                <div key={ann.id} className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between">
                  <div className="text-xs">
                    <div className="font-bold text-stone-900">{ann.title}</div>
                    <div className="text-stone-600 text-[11px]">{ann.message}</div>
                  </div>
                  <button
                    id={`toggle-ann-btn-${ann.id}`}
                    onClick={() => onToggleAnnouncement(ann.id)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                      ann.isActive ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-stone-200 text-stone-600'
                    }`}
                  >
                    {ann.isActive ? 'Active' : 'Disabled'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Reception QR Code Section */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 space-y-4 shadow-sm text-center flex flex-col justify-between">
            <div>
              <Sparkles className="w-10 h-10 text-blue-600 mx-auto" />
              <h3 className="font-bold text-stone-900 text-lg">Office Reception QR Standee</h3>
              <p className="text-xs text-stone-600 max-w-sm mx-auto">
                Generate and print a branded QR code poster for your office reception desk so visiting customers can scan and view stock on their mobile phones.
              </p>
            </div>

            <button
              id="launch-reception-qr-btn"
              onClick={openQrModal}
              className="py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm inline-flex items-center justify-center gap-2 mx-auto transition-colors"
            >
              <span>Launch & Print Reception QR Poster</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
