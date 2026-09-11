import React from 'react';
import { QrCode, X, Printer, ExternalLink, Sparkles, Building2 } from 'lucide-react';

interface ReceptionQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  catalogUrl?: string;
}

export const ReceptionQRModal: React.FC<ReceptionQRModalProps> = ({
  isOpen,
  onClose,
  catalogUrl = window.location.href,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  // SVG QR Code generator string
  const qrSvgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(catalogUrl)}&color=1c1917&bgcolor=ffffff`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-600/40 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white border border-stone-200 rounded-3xl shadow-2xl overflow-hidden text-stone-900">
        
        {/* Modal Header */}
        <div className="p-5 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-xl border border-blue-200">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-stone-900">Reception Counter QR Code</h3>
              <p className="text-xs text-stone-500">Scan to view Digital Live Gallery on phone</p>
            </div>
          </div>
          <button
            id="close-qr-modal-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Poster Printable Container */}
        <div className="p-6 text-center space-y-4 print:p-8 bg-white">
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-mono font-bold">
            <Building2 className="w-3.5 h-3.5" />
            <span>SRI BALAJI GRANITES RECEPTION</span>
          </div>

          <h2 className="text-xl font-black text-stone-900">
            Scan QR Code to Browse Stock
          </h2>
          <p className="text-xs text-stone-600 max-w-xs mx-auto">
            Walk-in clients can scan with their smartphone camera to view live photos & sizes across all Godowns without walking.
          </p>

          {/* QR Code Graphic Box */}
          <div className="bg-white p-6 rounded-2xl shadow-md inline-block border-2 border-blue-500/40 my-2">
            <img
              src={qrSvgUrl}
              alt="Reception Catalog QR Code"
              className="w-52 h-52 object-contain mx-auto"
            />
          </div>

          <p className="text-[11px] text-stone-500 font-mono">
            Direct Link: <span className="text-blue-700 underline font-semibold truncate block max-w-xs mx-auto">{catalogUrl}</span>
          </p>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              id="print-qr-poster-btn"
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print Counter Standee</span>
            </button>

            <a
              id="test-scan-link-btn"
              href={catalogUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Test Live Catalog</span>
            </a>
          </div>

        </div>

      </div>
    </div>
  );
};
