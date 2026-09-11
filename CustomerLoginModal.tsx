import React, { useState } from 'react';
import { User, Phone, Mail, X, CheckCircle2, ShoppingBag, Sparkles, ShieldCheck } from 'lucide-react';

export interface CustomerAccount {
  name: string;
  phone: string;
  email?: string;
  customerType: 'Homeowner' | 'Architect' | 'Contractor' | 'Dealer';
  city?: string;
}

interface CustomerLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: CustomerAccount | null;
  onLoginCustomer: (acc: CustomerAccount) => void;
  onLogoutCustomer: () => void;
}

export const CustomerLoginModal: React.FC<CustomerLoginModalProps> = ({
  isOpen,
  onClose,
  customer,
  onLoginCustomer,
  onLogoutCustomer,
}) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [customerType, setCustomerType] = useState<'Homeowner' | 'Architect' | 'Contractor' | 'Dealer'>('Homeowner');
  const [city, setCity] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Please enter your full name');
      return;
    }

    if (!phone.trim() || phone.trim().length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number');
      return;
    }

    onLoginCustomer({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      customerType,
      city: city.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 text-white p-5 sm:p-6 relative shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-amber-400 font-mono text-xs uppercase font-bold tracking-wider mb-1">
            <ShoppingBag className="w-4 h-4" /> Customer Portal
          </div>
          <h2 className="text-xl font-black text-white font-serif">
            {customer ? 'Customer Account' : isRegistering ? 'Create Customer Account' : 'Customer Sign In'}
          </h2>
          <p className="text-xs text-stone-300 mt-1">
            {customer
              ? 'View saved details and track factory rate inquiries.'
              : 'Save your delivery address & get instant WhatsApp quotes.'}
          </p>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {customer ? (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-stone-900">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-500 rounded-xl text-stone-950 font-black text-lg">
                    {customer.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-base flex items-center gap-1.5">
                      <span>{customer.name}</span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-mono uppercase">
                        {customer.customerType}
                      </span>
                    </div>
                    <div className="text-xs text-stone-600 font-mono mt-0.5">
                      📱 +91 {customer.phone} {customer.city ? `• 📍 ${customer.city}` : ''}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-200 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Your account is active for direct quarry rate quotes.</span>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onLogoutCustomer}
                  className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-rose-50 text-rose-700 hover:border-rose-200 border border-stone-200 font-bold text-xs transition-colors"
                >
                  Sign Out
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs shadow-md transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 bg-rose-50 text-rose-700 text-xs font-bold rounded-xl border border-rose-200">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rajesh Kumar"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Mobile Number (WhatsApp) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 9876543210"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-xs font-mono focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">I am a</label>
                  <select
                    value={customerType}
                    onChange={(e) => setCustomerType(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                  >
                    <option value="Homeowner">Homeowner</option>
                    <option value="Architect">Architect</option>
                    <option value="Contractor">Contractor</option>
                    <option value="Dealer">Tiles Dealer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">City / Location</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Bangalore"
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Email Address (Optional)</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. rajesh@example.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 mt-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Save & Continue Shopping</span>
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
