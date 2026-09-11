import React, { useState } from 'react';
import { X, Trash2, MessageCircle, Send, User, Phone, FileText, Sparkles, CheckCircle2, Building2, ShoppingBag, ArrowRight, ExternalLink } from 'lucide-react';
import { SlabStock, CustomerQuery, DimensionUnit } from '../types';
import { generateWhatsAppUrl, formatCurrency } from '../utils/calc';

interface QueryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: SlabStock[];
  removeFromCart: (slabId: string) => void;
  clearCart: () => void;
  onSubmitQuery: (query: CustomerQuery) => void;
}

export const QueryDrawer: React.FC<QueryDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  removeFromCart,
  clearCart,
  onSubmitQuery,
}) => {
  const [clientName, setClientName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [requirement, setRequirement] = useState('');
  const [dimensionUnit, setDimensionUnit] = useState<DimensionUnit>('feet');
  const [requestedQuantitySqFt, setRequestedQuantitySqFt] = useState<number>(0);
  
  const [submissionSuccess, setSubmissionSuccess] = useState<'direct' | 'whatsapp' | null>(null);
  const [submittedQuery, setSubmittedQuery] = useState<CustomerQuery | null>(null);

  if (!isOpen) return null;

  const totalCartSqFt = cart.reduce((sum, item) => sum + item.totalSqFt, 0);
  const totalCartValue = cart.reduce((sum, item) => sum + item.totalSqFt * item.pricePerSqFt, 0);

  const createQueryObject = (): CustomerQuery | null => {
    if (!clientName.trim() || !mobileNumber.trim()) {
      alert('Please enter your Name and Mobile / WhatsApp Number.');
      return null;
    }

    const orderNum = `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newQuery: CustomerQuery = {
      id: 'query-' + Date.now(),
      orderNumber: orderNum,
      clientName: clientName.trim(),
      mobileNumber: mobileNumber.trim(),
      requirement: requirement.trim() || `Inquiry for ${cart.length} selected slab(s)`,
      dimensionUnit,
      requestedQuantitySqFt: requestedQuantitySqFt || totalCartSqFt,
      selectedSlabs: [...cart],
      totalEstimatedCost: totalCartValue,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      notes: `Placed from Add-to-Cart Inquiry Drawer with ${cart.length} slab(s).`,
    };

    return newQuery;
  };

  // Option 1: Direct Online Query Submit to ERP
  const handleSubmitDirectQuery = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const queryObj = createQueryObject();
    if (!queryObj) return;

    onSubmitQuery(queryObj);
    setSubmittedQuery(queryObj);
    setSubmissionSuccess('direct');
    setClientName('');
    setMobileNumber('');
    setRequirement('');
  };

  // Option 2: Workable WhatsApp Order & Query
  const handleSendWhatsApp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const queryObj = createQueryObject();
    if (!queryObj) return;

    // First save query to ERP state
    onSubmitQuery(queryObj);
    setSubmittedQuery(queryObj);

    // Generate WhatsApp URL
    const waUrl = generateWhatsAppUrl(
      queryObj.clientName,
      queryObj.mobileNumber,
      queryObj.requirement,
      queryObj.selectedSlabs,
      queryObj.requestedQuantitySqFt,
      queryObj.dimensionUnit
    );

    // Reset input fields
    setClientName('');
    setMobileNumber('');
    setRequirement('');

    // Open WhatsApp in new window/tab
    try {
      window.open(waUrl, '_blank');
    } catch {
      window.location.href = waUrl;
    }

    setSubmissionSuccess('whatsapp');
  };

  const handleFinishAndReset = () => {
    clearCart();
    setSubmissionSuccess(null);
    setSubmittedQuery(null);
    setClientName('');
    setMobileNumber('');
    setRequirement('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-stone-900/50 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-white text-stone-900 h-full flex flex-col shadow-2xl overflow-hidden border-l border-stone-200">
        
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 bg-stone-900 text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 text-stone-950 rounded-xl font-black">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                Inquiry & Order Cart
              </h3>
              <p className="text-[11px] text-stone-300 font-mono">
                {cart.length} Slabs ({totalCartSqFt} Sq.Ft)
                {totalCartValue > 0 && ` • Est: ₹${totalCartValue.toLocaleString('en-IN')}`}
              </p>
            </div>
          </div>
          <button
            id="close-query-drawer-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          
          {/* SUCCESS CONFIRMATION VIEW */}
          {submissionSuccess && submittedQuery ? (
            <div className="py-8 space-y-6 text-stone-900 animate-in fade-in zoom-in-95">
              <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-3xl text-center space-y-3 shadow-xs">
                <div className="w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-emerald-950">
                    {submissionSuccess === 'whatsapp' ? 'WhatsApp Chat Opened & Saved!' : 'Query Submitted to ERP!'}
                  </h3>
                  <p className="text-xs text-stone-600 mt-1">
                    Reference Order #: <strong className="font-mono text-emerald-700">{submittedQuery.orderNumber || 'ORD-2026-SUB'}</strong>
                  </p>
                </div>
                <p className="text-xs text-stone-700 leading-relaxed max-w-sm mx-auto bg-white p-3 rounded-2xl border border-emerald-200">
                  {submissionSuccess === 'whatsapp'
                    ? 'Your order items were populated into WhatsApp. Our staff team has also logged this query in our office ERP system.'
                    : 'Your query has been logged in our office admin dashboard. A representative will review your selected slabs and contact you shortly.'}
                </p>
              </div>

              {/* Order Summary Receipt Box */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2.5 text-xs">
                <div className="font-bold text-stone-900 pb-2 border-b border-stone-200 flex justify-between">
                  <span>Customer Details</span>
                  <span className="text-[10px] text-blue-700 font-mono bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {submittedQuery.selectedSlabs.length} Items
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-stone-700 font-mono text-[11px]">
                  <div>Name: <strong className="text-stone-900">{submittedQuery.clientName}</strong></div>
                  <div>Phone: <strong className="text-stone-900">{submittedQuery.mobileNumber}</strong></div>
                </div>
                <div className="text-[11px] text-stone-600 font-mono">
                  Req: {submittedQuery.requirement}
                </div>
                {totalCartValue > 0 && (
                  <div className="pt-2 border-t border-stone-200 flex justify-between font-bold text-stone-900">
                    <span>Estimated Total:</span>
                    <span className="text-emerald-700 font-mono">₹{totalCartValue.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-2.5">
                <a
                  href={generateWhatsAppUrl(
                    submittedQuery.clientName,
                    submittedQuery.mobileNumber,
                    submittedQuery.requirement,
                    submittedQuery.selectedSlabs,
                    submittedQuery.requestedQuantitySqFt,
                    submittedQuery.dimensionUnit
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Re-open WhatsApp Chat Directly</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={handleFinishAndReset}
                  className="w-full py-3 px-4 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs transition-colors"
                >
                  Done & Back to Shopping Catalog
                </button>
              </div>
            </div>
          ) : cart.length === 0 ? (
            /* EMPTY CART VIEW */
            <div className="py-16 text-center space-y-4">
              <div className="w-16 h-16 bg-stone-100 text-stone-400 rounded-full flex items-center justify-center mx-auto border border-stone-200">
                <Sparkles className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-stone-800">Your Inquiry Cart is Empty</h4>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  Browse our granite and marble slabs and click <strong>"Add to Order Selection"</strong> on any slab.
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
              >
                Browse Live Slabs Catalog
              </button>
            </div>
          ) : (
            /* CART ITEMS & OPTIONS FORM VIEW */
            <>
              {/* Selected Items List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-stone-700 uppercase tracking-wider">
                  <span>Selected Slabs ({cart.length})</span>
                  <button
                    id="clear-query-cart-btn"
                    onClick={clearCart}
                    className="text-rose-600 hover:text-rose-700 flex items-center gap-1 text-[11px] font-bold"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Clear Selection
                  </button>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1 divide-y divide-stone-100">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="pt-2 first:pt-0 flex items-center gap-3 bg-stone-50 p-2.5 rounded-2xl border border-stone-200"
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-12 h-12 object-cover rounded-xl border border-stone-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] text-blue-700 font-mono font-bold truncate">
                          {item.blockNumber} • {item.godownName.split('-')[0]}
                        </div>
                        <h4 className="text-xs font-bold text-stone-900 truncate">{item.title}</h4>
                        <div className="text-[11px] text-stone-600 font-mono">
                          {item.length} x {item.width} {item.unit} | <span className="text-emerald-700 font-bold">{item.totalSqFt} Sq.Ft</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs font-black text-stone-900 font-mono">
                          ₹{item.pricePerSqFt}/ft
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1 text-stone-400 hover:text-rose-600 transition-colors"
                          title="Remove slab"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Subtotal Banner */}
                <div className="p-3 bg-stone-100 rounded-xl border border-stone-200 flex items-center justify-between text-xs font-mono">
                  <span className="text-stone-600 font-bold">Total Estimated Value:</span>
                  <span className="text-base font-black text-emerald-700">
                    ₹{totalCartValue.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Form Input for Customer Information */}
              <div className="space-y-4 pt-3 border-t border-stone-200">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    Enter Contact Details
                  </h4>
                  <span className="text-[10px] text-stone-500 font-semibold">* Required</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-stone-700 font-bold mb-1">
                      Your Full Name <span className="text-rose-600">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                      <input
                        id="query-client-name-input"
                        type="text"
                        required
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="e.g. Ramesh Kumar"
                        className="w-full bg-white border border-stone-300 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-stone-700 font-bold mb-1">
                      Mobile / WhatsApp Number <span className="text-rose-600">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                      <input
                        id="query-mobile-input"
                        type="tel"
                        required
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        placeholder="e.g. 9828400811"
                        className="w-full bg-white border border-stone-300 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] text-stone-700 font-bold mb-1">Unit</label>
                      <select
                        id="query-unit-select"
                        value={dimensionUnit}
                        onChange={(e) => setDimensionUnit(e.target.value as DimensionUnit)}
                        className="w-full bg-white border border-stone-300 rounded-xl px-2.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-blue-600"
                      >
                        <option value="feet">Feet (Sq.Ft)</option>
                        <option value="meters">Meters (Sq.M)</option>
                        <option value="centimeters">Centimeters</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] text-stone-700 font-bold mb-1">Required Sq.Ft</label>
                      <input
                        id="query-quantity-input"
                        type="number"
                        value={requestedQuantitySqFt || ''}
                        onChange={(e) => setRequestedQuantitySqFt(Number(e.target.value))}
                        placeholder={`${totalCartSqFt} Sq.Ft`}
                        className="w-full bg-white border border-stone-300 rounded-xl px-2.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-blue-600 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-stone-700 font-bold mb-1">Requirement Notes / Site Location</label>
                    <div className="relative">
                      <FileText className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                      <textarea
                        id="query-requirement-textarea"
                        rows={2}
                        value={requirement}
                        onChange={(e) => setRequirement(e.target.value)}
                        placeholder="e.g. Need pricing for home flooring in Bangalore..."
                        className="w-full bg-white border border-stone-300 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>
                </div>

                {/* TWO DISTINCT WORKABLE BUTTON OPTIONS */}
                <div className="pt-3 space-y-2.5">
                  <p className="text-[11px] font-bold text-stone-700 text-center uppercase tracking-wide">
                    Choose Your Submission Option:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    
                    {/* Option 1: Direct ERP Online Query Submit */}
                    <button
                      type="button"
                      id="submit-direct-query-btn"
                      onClick={() => handleSubmitDirectQuery()}
                      className="py-3 px-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-sm transition-all flex flex-col items-center justify-center gap-1 border border-blue-700"
                    >
                      <div className="flex items-center gap-1.5">
                        <Send className="w-3.5 h-3.5 fill-white" />
                        <span>1. Submit Direct Query</span>
                      </div>
                      <span className="text-[9px] font-normal text-blue-100">Send to Office ERP Queue</span>
                    </button>

                    {/* Option 2: Workable WhatsApp Order & Quote */}
                    <button
                      type="button"
                      id="submit-whatsapp-inquiry-btn"
                      onClick={() => handleSendWhatsApp()}
                      className="py-3 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-sm transition-all flex flex-col items-center justify-center gap-1 border border-emerald-700"
                    >
                      <div className="flex items-center gap-1.5">
                        <MessageCircle className="w-3.5 h-3.5 fill-white text-emerald-600" />
                        <span>2. Send via WhatsApp</span>
                      </div>
                      <span className="text-[9px] font-normal text-emerald-100">Instant Chat & Rate Quote</span>
                    </button>

                  </div>

                  {/* Direct WhatsApp Call/Chat Emergency Link */}
                  <div className="text-center pt-1">
                    <a
                      href="https://wa.me/919828400811"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:underline"
                    >
                      <MessageCircle className="w-3.5 h-3.5" /> Direct WhatsApp Chat (+91 9828400811)
                    </a>
                  </div>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};
