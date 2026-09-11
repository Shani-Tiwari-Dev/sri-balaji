import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  Ruler, 
  Plus, 
  Check, 
  MessageCircle, 
  Eye, 
  Boxes,
  Sparkles,
  ShoppingBag,
  X,
  ShieldAlert,
  Lock,
  Building2,
  Copy,
  KeyRound,
  Link2,
  ExternalLink
} from 'lucide-react';
import { SlabStock, CategoryType, GodownId, CustomerQuery, UserSession } from '../types';
import { formatCurrency, generateWhatsAppUrl, getRatesInAllUnits, getDimensionsInAllUnits, RateDisplayUnit } from '../utils/calc';
import { CustomerOrderForm } from './CustomerOrderForm';
import { SlabModal } from './SlabModal';

interface CustomerCatalogProps {
  slabs: SlabStock[];
  cart: SlabStock[];
  addToCart: (slab: SlabStock) => void;
  removeFromCart: (slabId: string) => void;
  clearCart: () => void;
  openCart: () => void;
  onSubmitOrder: (newOrder: CustomerQuery) => void;
  openStaffPortal?: () => void;
  session?: UserSession;
  onLogout?: () => void;
}

export const CustomerCatalog: React.FC<CustomerCatalogProps> = ({
  slabs,
  cart,
  addToCart,
  removeFromCart,
  clearCart,
  openCart,
  onSubmitOrder,
  openStaffPortal,
  session,
  onLogout,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedGodown, setSelectedGodown] = useState<string>('All');
  const [onlyInStock, setOnlyInStock] = useState<boolean>(true);
  const [rateDisplayUnit, setRateDisplayUnit] = useState<RateDisplayUnit>('sqft');
  const [inspectSlab, setInspectSlab] = useState<SlabStock | null>(null);

  const categories: (CategoryType | 'All')[] = [
    'All',
    'Italian Marble',
    'Indian Marble',
    'Granite',
    'Quartz',
    'Onyx',
    'Sandstone',
  ];

  const godowns: { id: GodownId | 'All'; name: string }[] = [
    { id: 'All', name: 'All Locations' },
    { id: 'godown_1', name: 'Bangalore Yard' },
    { id: 'godown_2', name: 'Chittoor Factory' },
    { id: 'godown_3', name: 'Vishakapatnam Export' },
  ];

  // Filter slabs
  const filteredSlabs = slabs.filter((s) => {
    // Search query
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.blockNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.lotName && s.lotName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase());

    // Category
    const matchesCategory = selectedCategory === 'All' || s.category === selectedCategory;

    // Godown (matching godown_1 or legacy godown_a)
    let matchesGodown = selectedGodown === 'All';
    if (!matchesGodown) {
      if (selectedGodown === 'godown_1' && (s.godownId === 'godown_1' || s.godownId === 'godown_a')) matchesGodown = true;
      else if (selectedGodown === 'godown_2' && (s.godownId === 'godown_2' || s.godownId === 'godown_b')) matchesGodown = true;
      else if (selectedGodown === 'godown_3' && (s.godownId === 'godown_3' || s.godownId === 'godown_c')) matchesGodown = true;
      else matchesGodown = s.godownId === selectedGodown;
    }

    // In Stock
    const matchesStock = onlyInStock ? !s.isSold : true;

    return matchesSearch && matchesCategory && matchesGodown && matchesStock;
  });

  const isInCart = (id: string) => cart.some((item) => item.id === id);

  // Check if search query matches admin panel keywords
  const isSearchingAdmin = searchQuery.trim() !== '' && ['admin', 'staff', 'erp', 'manager', 'login', 'portal', '#/admin'].some(k => searchQuery.toLowerCase().includes(k));

  const scrollToOrderForm = () => {
    const el = document.getElementById('first-page-order-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
      
      {/* SRI BALAJI GRANITES & MARBLES Architectural Showcase Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-stone-200 p-6 sm:p-8 shadow-sm group">
        <div className="relative z-10 space-y-4">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl font-serif-display font-black tracking-tight text-stone-900 leading-tight">
              Sri Balaji <span className="font-sans text-stone-800">Granites & Marbles</span>
            </h1>
            <p className="text-sm sm:text-base text-stone-600 font-medium max-w-3xl leading-relaxed">
              Premium Italian Marbles, Indian Granite Slabs, Black Stone, Wall & Floor Tiles, and Custom Marble Sinks at Direct Quarry Wholesale Rates.
            </p>
          </div>

          {/* Contact Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 text-xs font-bold">
            <a
              href="tel:9828400811"
              className="px-4 sm:px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black flex items-center justify-center gap-2 shadow-sm transition-all hover:scale-105"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Call Direct: 9828400811</span>
            </a>

            <a
              href="tel:9982749180"
              className="px-4 sm:px-5 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 flex items-center justify-center gap-2 transition-all hover:scale-105"
            >
              <span>Call: 9982749180</span>
            </a>

            <a
              href={generateWhatsAppUrl('Customer', '', 'Hello Sri Balaji Granites, I want to inquire about granite/marble rates.', [])}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 sm:px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black flex items-center justify-center gap-2 shadow-sm transition-all hover:scale-105"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>WhatsApp Instant Quote</span>
            </a>
          </div>
        </div>
      </div>

      {/* Filter & Search Panel */}
      <div className="space-y-4 bg-white p-4 sm:p-6 rounded-3xl border border-stone-200 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3 sm:gap-4 justify-between items-center">
          
          {/* Search Field */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-stone-400 absolute left-4 top-3.5" />
            <input
              id="catalog-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && isSearchingAdmin) {
                  window.location.hash = '#/admin';
                  window.dispatchEvent(new Event('hashchange'));
                }
              }}
              placeholder="Search marble, granite name, or block number..."
              className="w-full bg-stone-50 border border-stone-300 rounded-2xl pl-11 pr-10 py-3 text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all font-medium"
            />
            {searchQuery && (
              <button
                id="clear-catalog-search-btn"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-3 text-stone-400 hover:text-stone-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* In Stock & Unit Switcher Controls */}
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 w-full md:w-auto justify-end">
            
            {/* Rate & Dimension Unit Display Switcher */}
            <div className="flex items-center gap-1 bg-stone-100 p-1.5 rounded-2xl border border-stone-200 overflow-x-auto no-scrollbar w-full sm:w-auto">
              <span className="text-[10px] sm:text-[11px] font-bold text-stone-600 px-1.5 flex items-center gap-1 shrink-0">
                <Ruler className="w-3.5 h-3.5" /> Unit:
              </span>
              <button
                id="unit-display-sqft-btn"
                onClick={() => setRateDisplayUnit('sqft')}
                className={`flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap ${
                  rateDisplayUnit === 'sqft'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Feet (Sq.Ft)
              </button>
              <button
                id="unit-display-sqmeter-btn"
                onClick={() => setRateDisplayUnit('sqmeter')}
                className={`flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap ${
                  rateDisplayUnit === 'sqmeter'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Meters (Sq.M)
              </button>
              <button
                id="unit-display-sqcm-btn"
                onClick={() => setRateDisplayUnit('sqcm')}
                className={`flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap ${
                  rateDisplayUnit === 'sqcm'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                CM (Sq.Cm)
              </button>
            </div>

            {/* In Stock Toggle */}
            <label className="flex items-center justify-center gap-2 cursor-pointer text-xs font-bold text-stone-700 whitespace-nowrap bg-stone-100 px-4 py-2.5 rounded-2xl border border-stone-200 hover:border-stone-300 transition-colors">
              <input
                id="toggle-in-stock-checkbox"
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="rounded bg-white border-stone-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span>In Stock Only</span>
            </label>
          </div>

        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-3 border-t border-stone-200 no-scrollbar">
          <span className="text-xs font-bold text-stone-600 flex items-center gap-1 shrink-0 mr-2">
            <Filter className="w-3.5 h-3.5" /> Stone Type:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              id={`cat-filter-${cat.replace(/\s+/g, '-').toLowerCase()}`}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Admin Panel Search Keyword Banner Result */}
      {isSearchingAdmin && (
        <div className="bg-gradient-to-r from-blue-900 via-stone-900 to-stone-950 text-white rounded-3xl p-5 sm:p-6 shadow-xl border-2 border-blue-500 space-y-4 animate-in fade-in slide-in-from-top-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-3 bg-blue-600 text-white rounded-2xl shrink-0 shadow-lg ring-4 ring-blue-500/30">
                <KeyRound className="w-7 h-7 text-white" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500 text-white font-black text-[10px] tracking-wider uppercase">
                    🔑 Admin Link Keyword Match
                  </span>
                  <span className="text-xs font-mono font-bold text-blue-300 bg-blue-950/80 px-2.5 py-0.5 rounded-md border border-blue-700">
                    Direct Link: #/admin
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Sri Balaji Granites - Staff ERP & Admin Control Panel
                </h2>
                <p className="text-xs text-stone-300 font-medium max-w-xl leading-relaxed">
                  Full administrative access to manage multi-godown granite & marble inventory, track customer queries, price calculator, trash recovery, and yard announcements.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto shrink-0">
              <button
                id="search-open-admin-btn"
                onClick={() => {
                  window.location.hash = '#/admin';
                  window.dispatchEvent(new Event('hashchange'));
                }}
                className="flex-1 md:flex-initial px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-105 cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4 text-white" />
                <span>Open Admin Panel Now</span>
              </button>

              <button
                id="search-copy-admin-link-btn"
                onClick={() => {
                  const adminUrl = `${window.location.origin}${window.location.pathname}#/admin`;
                  navigator.clipboard.writeText(adminUrl);
                  alert('✅ Admin Panel Link copied to clipboard!\n\nDirect Link:\n' + adminUrl);
                }}
                className="px-4 py-3 rounded-2xl bg-stone-800 hover:bg-stone-700 text-blue-200 border border-stone-600 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Copy className="w-4 h-4 text-blue-400" />
                <span>Copy Admin Link</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Catalog Grid */}
      {filteredSlabs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 space-y-3 shadow-sm">
          <Boxes className="w-12 h-12 text-blue-600 mx-auto animate-pulse" />
          <h3 className="text-lg font-bold text-stone-900">No slabs match your selected filters</h3>
          <p className="text-xs text-stone-600 max-w-sm mx-auto">
            Try clearing search queries or switching categories/locations to view more marble & granite stock.
          </p>
          <button
            id="reset-catalog-filters-btn"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setSelectedGodown('All');
              setOnlyInStock(false);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors shadow-sm"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredSlabs.map((slab) => {
            const inCart = isInCart(slab.id);
            const rates = getRatesInAllUnits(slab.pricePerSqFt);
            const dims = getDimensionsInAllUnits(slab.length, slab.width, slab.unit);

            let cardAreaText = `${slab.totalSqFt} Sq.Ft`;
            let cardDimText = `${slab.length} x ${slab.width} ${slab.unit}`;
            let cardRateText = `${formatCurrency(rates.perSqFt)} / Sq.Ft`;

            if (rateDisplayUnit === 'sqmeter') {
              cardAreaText = `${slab.totalSqMeters} Sq.M`;
              cardDimText = dims.meters;
              cardRateText = `${formatCurrency(rates.perSqMeter)} / Sq.Meter`;
            } else if (rateDisplayUnit === 'sqcm') {
              const sqCmVal = Math.round(slab.totalSqFt * 929.03);
              cardAreaText = `${sqCmVal.toLocaleString()} Sq.Cm`;
              cardDimText = dims.centimeters;
              cardRateText = `₹${rates.perSqCm} / Sq.Cm`;
            }

            return (
              <div
                key={slab.id}
                className={`group bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all hover:border-stone-300 flex flex-col justify-between ${
                  slab.isSold ? 'opacity-75 bg-stone-50' : ''
                }`}
              >
                {/* Slab Image Container */}
                <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden cursor-pointer" onClick={() => setInspectSlab(slab)}>
                  <img
                    src={slab.imageUrl}
                    alt={slab.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  {/* Stock Status Badge */}
                  <div className="absolute top-3 left-3">
                    {slab.isSold ? (
                      <span className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 border border-rose-300 text-[11px] font-bold tracking-wider uppercase shadow-sm">
                        Sold Out
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-bold shadow-sm flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                        In Stock
                      </span>
                    )}
                  </div>

                  {/* Block Number Tag */}
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-white/90 text-stone-900 border border-stone-200 text-[11px] font-mono font-bold shadow-sm backdrop-blur-sm">
                    {slab.blockNumber}
                  </div>

                  {/* Quick Specs Overlay at Bottom of Image */}
                  <div className="absolute bottom-2 left-3 right-3 text-xs text-stone-900 flex justify-between items-end font-mono">
                    <span className="bg-white/90 px-2 py-0.5 rounded border border-stone-200 text-[11px] font-medium shadow-sm">
                      Block: {slab.blockNumber}
                    </span>
                    <span className="bg-blue-600 text-white px-2 py-0.5 rounded font-bold shadow-sm">
                      {cardAreaText}
                    </span>
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                        {slab.category}
                      </span>
                      <span className="text-[11px] font-medium text-stone-500">
                        {slab.finish}
                      </span>
                    </div>

                    <h3 className="font-bold text-stone-900 text-base leading-snug line-clamp-1 group-hover:text-stone-700 transition-colors">
                      {slab.title}
                    </h3>

                    {/* Sizing & Dimensions Details */}
                    <div className="mt-2 space-y-1.5 p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-mono text-stone-800">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-[10px] font-sans font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1">
                          <Ruler className="w-3 h-3 text-stone-500" /> Slab Dimensions
                        </span>
                        <span className="font-bold text-emerald-700">
                          {slab.pieces} Pcs Available
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                        <div className="bg-white p-1.5 rounded-lg border border-stone-200">
                          <span className="text-[9px] text-stone-500 font-sans font-bold block uppercase">Feet (ft)</span>
                          <span className="font-bold text-stone-900 text-xs">{dims.feet}</span>
                        </div>
                        <div className="bg-white p-1.5 rounded-lg border border-stone-200">
                          <span className="text-[9px] text-stone-500 font-sans font-bold block uppercase">Centimeters (cm)</span>
                          <span className="font-bold text-stone-900 text-xs">{dims.centimeters}</span>
                        </div>
                      </div>
                      <div className="text-[10px] text-stone-500 flex justify-between items-center px-0.5 pt-0.5 border-t border-stone-200">
                        <span>Input: {slab.length}x{slab.width} {slab.unit}</span>
                        <span className="text-stone-600">{dims.meters}</span>
                      </div>
                    </div>
                  </div>

                  {/* Price & Action Buttons */}
                  <div className="pt-2 border-t border-stone-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-stone-500 block uppercase font-mono font-bold">Rate Quote</span>
                        <span className="text-sm font-black text-stone-900">
                          {cardRateText}
                        </span>
                      </div>
                      <button
                        onClick={() => setInspectSlab(slab)}
                        className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                        title="View Full Specs"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        id={`add-cart-btn-${slab.id}`}
                        disabled={slab.isSold}
                        onClick={() => (inCart ? removeFromCart(slab.id) : addToCart(slab))}
                        className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                          slab.isSold
                            ? 'bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200'
                            : inCart
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300'
                        }`}
                      >
                        {inCart ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-700" />
                            <span>In Order</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5 text-stone-600" />
                            <span>Add to Order</span>
                          </>
                        )}
                      </button>

                      <a
                        id={`whatsapp-direct-btn-${slab.id}`}
                        href={generateWhatsAppUrl('Customer', '', 'Direct rate inquiry for block ' + slab.blockNumber, [slab])}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-1 shadow-sm"
                      >
                        <MessageCircle className="w-3.5 h-3.5 fill-white" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FIRST PAGE DIRECT ORDER FORM SECTION */}
      <CustomerOrderForm
        cart={cart}
        slabs={slabs}
        removeFromCart={removeFromCart}
        clearCart={clearCart}
        onSubmitOrder={onSubmitOrder}
      />

      {/* SRI BALAJI GRANITES & MARBLES OFFICIAL BUSINESS CARD & YARD INFO */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-stone-200 pb-5">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold text-emerald-700 tracking-wider">
              Official Business Contact & Factory Yard
            </span>
            <h2 className="text-2xl font-black tracking-tight text-stone-900">
              Sri Balaji Granites & Marbles
            </h2>
            <p className="text-xs text-stone-600 font-medium">
              Specialized in Granite, Marble, Black Stone, Wall & Floor Tiles, and Marble Sinks
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-bold">
            <a
              href="tel:9828400811"
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl flex items-center gap-2 shadow-sm transition-all hover:scale-105"
            >
              <span>📞 9828400811</span>
            </a>
            <a
              href="tel:9982749180"
              className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 rounded-xl flex items-center gap-2 transition-all hover:scale-105"
            >
              <span>📞 9982749180</span>
            </a>
            <a
              href="https://maps.google.com/?q=Bengaluru+Rural"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 rounded-xl flex items-center gap-2 transition-all"
            >
              <MapPin className="w-4 h-4 text-stone-700" />
              <span>Google Maps Route</span>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
            <span className="text-stone-700 font-bold block text-[11px] uppercase tracking-wider">
              🏭 Factory & Yard Addresses
            </span>
            <div className="space-y-2 text-stone-800 font-sans text-xs">
              <div>
                <span className="font-bold text-stone-900 block text-[11px] text-blue-900">Main Yard & Depot:</span>
                <p className="leading-relaxed">
                  Site No. 17, 18 & 19, Sir M. Vishveshwaraiah Extension, Southern Side Of CSI Hospital, Bengaluru Rural District - 562114
                </p>
              </div>
              <div className="pt-1.5 border-t border-stone-200">
                <span className="font-bold text-stone-900 block text-[11px] text-blue-900">Factory Unit:</span>
                <p className="leading-relaxed font-semibold text-stone-900">
                  Sri Balaji Granites & Factory, Chittoor
                </p>
              </div>
              <div className="pt-1.5 border-t border-stone-200">
                <span className="font-bold text-stone-900 block text-[11px] text-blue-900">Export Branch:</span>
                <p className="leading-relaxed font-semibold text-stone-900">
                  Suguna Export, Vishakapatnam
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
            <span className="text-stone-700 font-bold block text-[11px] uppercase tracking-wider">
              📱 Direct Cell / WhatsApp
            </span>
            <div className="space-y-1 font-sans text-xs">
              <div className="text-stone-900 font-bold">Cell 1: +91 9828400811</div>
              <div className="text-stone-900 font-bold">Cell 2: +91 9982749180</div>
              <div className="text-stone-500 text-[11px]">Instant WhatsApp responses for stock quotes</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5 flex flex-col justify-between">
            <div>
              <span className="text-emerald-800 font-bold block text-[11px] uppercase tracking-wider">
                💎 Available Products
              </span>
              <ul className="text-stone-800 space-y-1 font-sans text-xs list-disc list-inside mt-1">
                <li>Granites & South Indian Black Pearl</li>
                <li>Italian & Makrana Pure Marble Slabs</li>
                <li>Wall Tiles, Floor Tiles & Black Stone</li>
                <li>Custom Handcrafted Marble Sinks</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Inspect Slab Detailed Spec Modal */}
      {inspectSlab && (() => {
        const inspectRates = getRatesInAllUnits(inspectSlab.pricePerSqFt);
        const inspectDims = getDimensionsInAllUnits(inspectSlab.length, inspectSlab.width, inspectSlab.unit);
        const totalSqCm = Math.round(inspectSlab.totalSqFt * 929.03);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-600/40 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl bg-white border border-stone-200 rounded-3xl shadow-2xl overflow-hidden text-stone-900 max-h-[90vh] overflow-y-auto">
              
              <div className="relative aspect-video bg-stone-100">
                <img
                  src={inspectSlab.imageUrl}
                  alt={inspectSlab.title}
                  className="w-full h-full object-cover"
                />
                <button
                  id="close-inspect-modal-btn"
                  onClick={() => setInspectSlab(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/90 text-stone-700 hover:bg-white border border-stone-200 shadow-sm"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-3">
                  <div>
                    <span className="text-xs font-bold text-blue-700 uppercase tracking-widest font-mono">
                      {inspectSlab.category} • {inspectSlab.blockNumber}
                    </span>
                    <h2 className="text-xl font-bold text-stone-900">{inspectSlab.title}</h2>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-blue-700">
                      {rateDisplayUnit === 'sqmeter'
                        ? `${formatCurrency(inspectRates.perSqMeter)}`
                        : rateDisplayUnit === 'sqcm'
                        ? `₹${inspectRates.perSqCm}`
                        : `${formatCurrency(inspectRates.perSqFt)}`}
                    </span>
                    <span className="text-xs text-stone-500 block font-mono">
                      {rateDisplayUnit === 'sqmeter'
                        ? 'per Sq.Meter'
                        : rateDisplayUnit === 'sqcm'
                        ? 'per Sq.Cm'
                        : 'per Sq.Ft (Feet)'}
                    </span>
                  </div>
                </div>

                {/* Rate Conversion Table for 3 Units */}
                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                  <span className="text-xs font-bold text-blue-700 flex items-center gap-1.5 uppercase font-mono">
                    <Ruler className="w-3.5 h-3.5" /> Multi-Unit Rate & Measurement Quote
                  </span>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                    <div className="p-2.5 bg-white rounded-xl border border-stone-200">
                      <span className="text-[10px] text-stone-500 block font-semibold">Feet (Sq.Ft)</span>
                      <span className="text-sm font-black text-blue-700">₹{inspectRates.perSqFt} / Sq.Ft</span>
                      <span className="text-[10px] text-stone-600 block">{inspectDims.feet}</span>
                      <span className="text-[10px] text-emerald-700 font-bold block">{inspectSlab.totalSqFt} Sq.Ft</span>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-stone-200">
                      <span className="text-[10px] text-stone-500 block font-semibold">Meters (Sq.M)</span>
                      <span className="text-sm font-black text-blue-700">₹{inspectRates.perSqMeter} / Sq.M</span>
                      <span className="text-[10px] text-stone-600 block">{inspectDims.meters}</span>
                      <span className="text-[10px] text-emerald-700 font-bold block">{inspectSlab.totalSqMeters} Sq.M</span>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-stone-200">
                      <span className="text-[10px] text-stone-500 block font-semibold">Centimeters (Sq.Cm)</span>
                      <span className="text-sm font-black text-blue-700">₹{inspectRates.perSqCm} / Sq.Cm</span>
                      <span className="text-[10px] text-stone-600 block">{inspectDims.centimeters}</span>
                      <span className="text-[10px] text-emerald-700 font-bold block">{totalSqCm.toLocaleString()} Sq.Cm</span>
                    </div>
                  </div>
                </div>

                {/* Additional Spec Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                    <span className="text-stone-500 block text-[10px]">Block & Lot Ref</span>
                    <span className="font-semibold text-stone-900">{inspectSlab.blockNumber} {inspectSlab.lotName ? `(${inspectSlab.lotName})` : ''}</span>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                    <span className="text-stone-500 block text-[10px]">Slab Thickness</span>
                    <span className="font-semibold text-stone-900">{inspectSlab.thicknessMm} mm</span>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                    <span className="text-stone-500 block text-[10px]">Surface Finish</span>
                    <span className="font-semibold text-stone-900">{inspectSlab.finish}</span>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                    <span className="text-stone-500 block text-[10px]">Total Available Slabs</span>
                    <span className="font-semibold text-blue-700">{inspectSlab.pieces} Slabs</span>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                    <span className="text-stone-500 block text-[10px]">Total Lot Estimated Price</span>
                    <span className="font-bold text-emerald-700">{formatCurrency(inspectSlab.totalSqFt * inspectSlab.pricePerSqFt)}</span>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                    <span className="text-stone-500 block text-[10px]">Stock Availability</span>
                    <span className={`font-semibold ${inspectSlab.isSold ? 'text-rose-600' : 'text-emerald-700'}`}>
                      {inspectSlab.isSold ? 'Sold Out' : 'Available In Stock'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    onClick={() => {
                      if (isInCart(inspectSlab.id)) {
                        removeFromCart(inspectSlab.id);
                      } else {
                        addToCart(inspectSlab);
                      }
                    }}
                    className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 font-bold text-xs transition-colors"
                  >
                    {isInCart(inspectSlab.id) ? 'Remove from Order' : 'Add to Order Selection'}
                  </button>
                  <a
                    href={generateWhatsAppUrl('Customer', '', 'Inquiry for ' + inspectSlab.title, [inspectSlab])}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>Get WhatsApp Rate Quote</span>
                  </a>
                </div>

              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
};

