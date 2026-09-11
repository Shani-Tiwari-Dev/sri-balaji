import React, { useState, useRef } from 'react';
import { 
  ShoppingBag, 
  Send, 
  CheckCircle2, 
  Sparkles, 
  Trash2, 
  Building2, 
  Phone, 
  User, 
  MapPin, 
  FileText, 
  Ruler,
  MessageCircle,
  X,
  Upload,
  FileImage,
  Image as ImageIcon
} from 'lucide-react';
import { SlabStock, CustomerQuery, GodownId } from '../types';
import { formatCurrency, generateWhatsAppUrl } from '../utils/calc';

interface CustomerOrderFormProps {
  cart: SlabStock[];
  slabs: SlabStock[];
  removeFromCart: (slabId: string) => void;
  clearCart: () => void;
  onSubmitOrder: (newOrder: CustomerQuery) => void;
}

export const CustomerOrderForm: React.FC<CustomerOrderFormProps> = ({
  cart,
  slabs,
  removeFromCart,
  clearCart,
  onSubmitOrder,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [preferredGodown, setPreferredGodown] = useState<GodownId | 'any'>('any');
  const [requirementText, setRequirementText] = useState('');
  const [requestedSqFt, setRequestedSqFt] = useState<number>(
    cart.length > 0 ? cart.reduce((sum, s) => sum + s.totalSqFt, 0) : 1000
  );
  
  const [sampleImage, setSampleImage] = useState<string>('');
  const sampleFileInputRef = useRef<HTMLInputElement>(null);

  const handleSampleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setSampleImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const [orderConfirmation, setOrderConfirmation] = useState<CustomerQuery | null>(null);

  const calculateTotalEstimate = () => {
    if (cart.length === 0) return requestedSqFt * 250; // default estimated rate
    return cart.reduce((sum, item) => sum + item.totalSqFt * item.pricePerSqFt, 0);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !mobileNumber.trim()) {
      alert('Please fill in your Name and Mobile Number to place the order.');
      return;
    }

    const orderNum = `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: CustomerQuery = {
      id: 'query-' + Date.now(),
      orderNumber: orderNum,
      clientName: customerName.trim(),
      mobileNumber: mobileNumber.trim(),
      deliveryAddress: deliveryAddress.trim() || 'Site Address Provided via Phone',
      preferredGodown: preferredGodown,
      requirement: requirementText.trim() || `Order for ${cart.length} selected slab(s)`,
      dimensionUnit: 'feet',
      requestedQuantitySqFt: requestedSqFt,
      selectedSlabs: [...cart],
      totalEstimatedCost: calculateTotalEstimate(),
      status: 'Pending',
      createdAt: new Date().toISOString(),
      notes: sampleImage
        ? `Placed directly from Customer Form with uploaded gallery photo. Selected ${cart.length} items.`
        : `Placed directly from Customer Form. Selected ${cart.length} items.`,
    };

    onSubmitOrder(newOrder);
    setOrderConfirmation(newOrder);
    // Automatically reset and clear all form input fields so they don't remain stuck
    setCustomerName('');
    setMobileNumber('');
    setDeliveryAddress('');
    setRequirementText('');
    setSampleImage('');
    if (sampleFileInputRef.current) {
      sampleFileInputRef.current.value = '';
    }
  };

  return (
    <div id="first-page-order-section" className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 relative overflow-hidden">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold tracking-wide mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Customer Direct Order & Inquiry Option</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Place Your Marble & Granite Order
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Fill your details below. Select slabs from the catalog above or list your custom size requirement. Instant order sync for processing!
          </p>
        </div>

        {cart.length > 0 && (
          <button
            onClick={clearCart}
            className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Selection ({cart.length})</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Selected Slabs Summary */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
                Selected Slabs for Order ({cart.length})
              </h3>
              <span className="text-[11px] text-stone-600 font-mono font-bold">
                {cart.reduce((sum, s) => sum + s.totalSqFt, 0)} Total Sq.Ft
              </span>
            </div>

            {cart.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-stone-300 bg-white rounded-xl space-y-2">
                <p className="text-xs text-stone-500">
                  No specific slab selected yet. You can still submit your general requirement below, or click <strong>"Add to Order"</strong> on any slab above!
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1 no-scrollbar divide-y divide-stone-200">
                {cart.map((item) => (
                  <div key={item.id} className="pt-2 first:pt-0 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-10 h-10 object-cover rounded-lg border border-stone-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="font-bold text-stone-900 truncate block">{item.title}</span>
                        <span className="text-[10px] text-stone-600 font-mono block">
                          Block: {item.blockNumber} • {item.category}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-bold text-stone-900 block font-mono">{item.totalSqFt} Sq.Ft</span>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-[10px] text-rose-600 hover:underline font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Price Estimate Summary */}
            <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-stone-500 uppercase font-mono block font-bold">Estimated Total</span>
                <span className="text-xs text-stone-600">Subject to slab verification</span>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-stone-900">
                  {formatCurrency(calculateTotalEstimate())}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-900 space-y-2">
            <div className="font-bold flex items-center gap-1.5 text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Instant Direct Order Processing:</span>
            </div>
            <p className="text-[11px] leading-relaxed text-stone-700">
              Your inquiry is submitted directly to our sales and dispatch team. We will verify your selected slabs and contact you with final delivery timeline and competitive pricing!
            </p>
          </div>
        </div>

        {/* Right Column: Customer Details Form */}
        <div className="lg:col-span-7 bg-stone-50 border border-stone-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
          <form onSubmit={handleFormSubmit} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Customer Name */}
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-stone-600" />
                  Your Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="order-form-name-input"
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-500"
                />
              </div>

              {/* Mobile / Phone Number */}
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-stone-600" />
                  WhatsApp / Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  id="order-form-phone-input"
                  type="text"
                  required
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="e.g. 9829012345"
                  className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 font-mono placeholder-stone-400 focus:outline-none focus:border-stone-500"
                />
              </div>

            </div>

            {/* Custom Requirement Text */}
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-stone-600" />
                Custom Requirements / Notes
              </label>
              <textarea
                id="order-form-requirement-textarea"
                rows={3}
                value={requirementText}
                onChange={(e) => setRequirementText(e.target.value)}
                placeholder="Describe your marble / granite requirement..."
                className="w-full bg-white border border-stone-300 rounded-xl p-3 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-500"
              />
            </div>

            {/* Optional Marble Photo Upload from Gallery */}
            <div className="p-3.5 bg-white rounded-2xl border border-stone-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-stone-800 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-stone-600" />
                  Attach Marble Photo from Gallery (Optional)
                </label>
                <span className="text-[10px] text-stone-500 font-mono">Upload sample photo</span>
              </div>

              <input
                ref={sampleFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleSampleImageUpload}
                className="hidden"
                id="customer-sample-image-file-input"
              />

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  id="customer-upload-gallery-btn"
                  onClick={() => sampleFileInputRef.current?.click()}
                  className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 font-semibold text-xs flex items-center gap-2 transition-all"
                >
                  <FileImage className="w-4 h-4 text-stone-600" />
                  <span>{sampleImage ? 'Change Photo from Gallery' : 'Upload Photo from Gallery'}</span>
                  <Upload className="w-3.5 h-3.5 text-stone-500" />
                </button>

                {sampleImage && (
                  <div className="relative group rounded-xl overflow-hidden border border-stone-300 bg-white h-10 w-16 flex items-center justify-center">
                    <img src={sampleImage} alt="Uploaded sample" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setSampleImage('')}
                      className="absolute inset-0 bg-rose-600/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Action Submit Buttons */}
            <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              <button
                type="submit"
                id="place-order-direct-btn"
                className="py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
              >
                <Send className="w-4 h-4 fill-white" />
                <span>Submit Order to Godown Managers</span>
              </button>

              <a
                id="place-order-whatsapp-btn"
                href={generateWhatsAppUrl(
                  customerName || 'Customer',
                  mobileNumber || '',
                  `New Order Request:\nAddress: ${deliveryAddress || 'N/A'}\nRequirement: ${requirementText || 'General Inquiry'}\nSqFt: ${requestedSqFt} Sq.Ft`,
                  cart
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Send Order Directly to WhatsApp</span>
              </a>

            </div>

          </form>
        </div>

      </div>

      {/* Success Confirmation Receipt Modal */}
      {orderConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-600/40 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white border border-stone-200 rounded-3xl p-6 shadow-2xl space-y-5 text-stone-900 animate-in fade-in zoom-in-95">
            
            <button
              onClick={() => {
                setOrderConfirmation(null);
                clearCart();
              }}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto border border-emerald-300">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-stone-900">Order Placed Successfully!</h3>
              <p className="text-xs text-stone-600">
                Order Reference No: <span className="font-mono font-bold text-emerald-700">{orderConfirmation.orderNumber}</span>
              </p>
            </div>

            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-stone-500">Customer:</span>
                <span className="font-bold text-stone-900">{orderConfirmation.clientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Mobile:</span>
                <span className="text-stone-900 font-bold">{orderConfirmation.mobileNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Delivery Location:</span>
                <span className="text-stone-800 truncate max-w-[200px]">{orderConfirmation.deliveryAddress}</span>
              </div>
              <div className="flex justify-between border-t border-stone-200 pt-2">
                <span className="text-stone-500">Items Ordered:</span>
                <span className="text-emerald-700 font-bold">{orderConfirmation.selectedSlabs.length} Slabs ({orderConfirmation.requestedQuantitySqFt} Sq.Ft)</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <a
                href={generateWhatsAppUrl(
                  orderConfirmation.clientName,
                  orderConfirmation.mobileNumber,
                  `Order Confirmation #${orderConfirmation.orderNumber}\nRequirement: ${orderConfirmation.requirement}`,
                  orderConfirmation.selectedSlabs
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Open & Confirm on WhatsApp</span>
              </a>

              <button
                onClick={() => {
                  setOrderConfirmation(null);
                  clearCart();
                }}
                className="w-full py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 text-xs font-bold"
              >
                Close & Return to Catalog
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
