import React, { useState, useEffect, useRef } from 'react';
import { X, Calculator, Image as ImageIcon, Save, Ruler, Layers, MapPin, Upload, Trash2, FileImage, RefreshCw } from 'lucide-react';
import { SlabStock, GodownId, CategoryType, DimensionUnit, UserSession } from '../types';
import { calculateSlabArea, formatCurrency, getRatesInAllUnits, getDimensionsInAllUnits, RateDisplayUnit } from '../utils/calc';

interface SlabModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (slab: SlabStock) => void;
  editSlab: SlabStock | null;
  session: UserSession;
}

const PRESET_STONE_IMAGES = [
  { label: 'Italian White', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80' },
  { label: 'Makrana White', url: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=800&q=80' },
  { label: 'Black Granite', url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=800&q=80' },
  { label: 'Gold Quartz', url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80' },
  { label: 'Honey Onyx', url: 'https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?auto=format&fit=crop&w=800&q=80' },
  { label: 'Teak Sandstone', url: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80' },
];

export const SlabModal: React.FC<SlabModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editSlab,
  session,
}) => {
  const [godownId, setGodownId] = useState<GodownId>(session.godownId || 'godown_1');
  const [blockNumber, setBlockNumber] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CategoryType>('Italian Marble');
  const [length, setLength] = useState<number>(3.0);
  const [width, setWidth] = useState<number>(1.5);
  const [unit, setUnit] = useState<DimensionUnit>('meters');
  const [pieces, setPieces] = useState<number>(20);
  const [thicknessMm, setThicknessMm] = useState<number>(18);
  const [finish, setFinish] = useState<'Polished' | 'Honed' | 'Leathered' | 'Flamed' | 'Lappato'>('Polished');
  const [pricePerSqFt, setPricePerSqFt] = useState<number>(250);
  const [imageUrl, setImageUrl] = useState(PRESET_STONE_IMAGES[0].url);
  const [lotName, setLotName] = useState('');
  const [isSold, setIsSold] = useState(false);
  const [rateInputMode, setRateInputMode] = useState<RateDisplayUnit>('sqft');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (editSlab) {
      setGodownId(editSlab.godownId);
      setBlockNumber(editSlab.blockNumber);
      setTitle(editSlab.title);
      setCategory(editSlab.category);
      setLength(editSlab.length);
      setWidth(editSlab.width);
      setUnit(editSlab.unit);
      setPieces(editSlab.pieces);
      setThicknessMm(editSlab.thicknessMm);
      setFinish(editSlab.finish);
      setPricePerSqFt(editSlab.pricePerSqFt);
      setImageUrl(editSlab.imageUrl);
      setLotName(editSlab.lotName || '');
      setIsSold(editSlab.isSold);
    } else {
      setGodownId(session.godownId || 'godown_1');
      setBlockNumber(`BLK-${Math.floor(100 + Math.random() * 900)}`);
      setTitle('');
      setCategory('Italian Marble');
      setLength(3.0);
      setWidth(1.5);
      setUnit('meters');
      setPieces(20);
      setThicknessMm(18);
      setFinish('Polished');
      setPricePerSqFt(250);
      setImageUrl(PRESET_STONE_IMAGES[0].url);
      setLotName('New Arrival Lot');
      setIsSold(false);
    }
  }, [editSlab, session, isOpen]);

  if (!isOpen) return null;

  // Live Auto Calculation
  const { sqFt, sqMeters, sqCm } = calculateSlabArea(length, width, unit, pieces);
  const dims = getDimensionsInAllUnits(length, width, unit);
  const rates = getRatesInAllUnits(pricePerSqFt);
  const estimatedTotalValue = sqFt * pricePerSqFt;

  const godownNameMap: Record<GodownId, string> = {
    godown_1: 'Bangalore Yard',
    godown_2: 'Chittoor Factory',
    godown_3: 'Vishakapatnam Export',
    godown_a: 'Bangalore Yard',
    godown_b: 'Chittoor Factory',
    godown_c: 'Vishakapatnam Export',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !blockNumber.trim()) {
      alert('Please fill Material Title and Block Number.');
      return;
    }

    const savedSlab: SlabStock = {
      id: editSlab ? editSlab.id : 'slab-' + Date.now(),
      godownId,
      godownName: godownNameMap[godownId],
      blockNumber: blockNumber.trim(),
      title: title.trim(),
      category,
      imageUrl,
      length: Number(length),
      width: Number(width),
      unit,
      pieces: Number(pieces),
      totalSqFt: sqFt,
      totalSqMeters: sqMeters,
      thicknessMm: Number(thicknessMm),
      finish,
      pricePerSqFt: Number(pricePerSqFt),
      isSold,
      lotName: lotName.trim(),
      createdAt: editSlab ? editSlab.createdAt : new Date().toISOString(),
    };

    onSave(savedSlab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-600/40 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-white border border-stone-200 rounded-3xl shadow-xl overflow-hidden text-stone-900 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl border border-emerald-200">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-stone-900">
                {editSlab ? 'Edit Marble / Granite Slab Stock' : 'Add New Slab Entry to Inventory'}
              </h3>
              <p className="text-xs text-stone-500">Automatic Length x Width x Pieces Square Feet Calculator</p>
            </div>
          </div>
          <button
            id="close-slab-modal-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* Live Auto Calculation Box Header */}
          <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <span className="text-[10px] uppercase font-mono font-semibold text-stone-500 block">Total Area (Sq. Ft)</span>
              <span className="text-xl font-black text-stone-900">{sqFt} Sq.Ft</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono font-semibold text-stone-500 block">Total Area (Sq. Meters)</span>
              <span className="text-xl font-black text-emerald-700">{sqMeters} Sq.M</span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-[10px] uppercase font-mono font-semibold text-stone-500 block">Est. Lot Value</span>
              <span className="text-lg font-extrabold text-stone-900">{formatCurrency(estimatedTotalValue)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Godown Selection */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Godown Location <span className="text-rose-500">*</span>
              </label>
              <select
                id="slab-godown-select"
                disabled={session.role !== 'admin'}
                value={godownId}
                onChange={(e) => setGodownId(e.target.value as GodownId)}
                className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-500"
              >
                <option value="godown_1">Bangalore Yard</option>
                <option value="godown_2">Chittoor Factory</option>
                <option value="godown_3">Vishakapatnam Export</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Material Category <span className="text-rose-500">*</span>
              </label>
              <select
                id="slab-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryType)}
                className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-500"
              >
                <option value="Italian Marble">Italian Marble</option>
                <option value="Indian Marble">Indian Marble</option>
                <option value="Granite">Granite</option>
                <option value="Quartz">Quartz</option>
                <option value="Onyx">Onyx</option>
                <option value="Sandstone">Sandstone</option>
              </select>
            </div>

            {/* Material Title */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Material Title / Marble Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="slab-title-input"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Italian Bottochino Classico"
                className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Block Number & Lot Name */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Block No <span className="text-rose-500">*</span>
                </label>
                <input
                  id="slab-block-input"
                  type="text"
                  required
                  value={blockNumber}
                  onChange={(e) => setBlockNumber(e.target.value)}
                  placeholder="IT-MAR-102"
                  className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Lot Name</label>
                <input
                  id="slab-lot-input"
                  type="text"
                  value={lotName}
                  onChange={(e) => setLotName(e.target.value)}
                  placeholder="Lot 01"
                  className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

          </div>

          {/* Sizing & Dimensions Inputs */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
            <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Ruler className="w-3.5 h-3.5" />
                Dimensions & Piece Count Calculator
              </span>
              <span className="text-[10px] text-stone-500 font-normal">Auto-converts Meters, CM & Feet</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] text-stone-600 font-medium mb-1">Input Unit</label>
                <select
                  id="slab-unit-select"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as DimensionUnit)}
                  className="w-full bg-white border border-stone-300 rounded-xl px-2.5 py-1.5 text-xs text-amber-800 font-mono font-bold focus:outline-none focus:border-amber-500"
                >
                  <option value="meters">Meters (m)</option>
                  <option value="centimeters">Centimeters (cm)</option>
                  <option value="feet">Feet (ft)</option>
                  <option value="inches">Inches (in)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-stone-600 font-medium mb-1">Length</label>
                <input
                  id="slab-length-input"
                  type="number"
                  step="0.01"
                  required
                  value={length}
                  onChange={(e) => setLength(Number(e.target.value))}
                  className="w-full bg-white border border-stone-300 rounded-xl px-3 py-1.5 text-xs text-stone-900 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-stone-600 font-medium mb-1">Width</label>
                <input
                  id="slab-width-input"
                  type="number"
                  step="0.01"
                  required
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  className="w-full bg-white border border-stone-300 rounded-xl px-3 py-1.5 text-xs text-stone-900 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-stone-600 font-medium mb-1">Piece Count (Slabs)</label>
                <input
                  id="slab-pieces-input"
                  type="number"
                  required
                  value={pieces}
                  onChange={(e) => setPieces(Number(e.target.value))}
                  className="w-full bg-white border border-stone-300 rounded-xl px-3 py-1.5 text-xs text-stone-900 font-mono font-bold text-amber-700 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Live Converted Measurement Badges (Feet, Meters, Centimeters) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-stone-200">
              <div className="p-2 bg-white rounded-xl border border-stone-200 text-xs shadow-xs">
                <span className="text-[10px] text-stone-500 font-mono block">Feet (ft / Sq.Ft)</span>
                <span className="font-bold text-amber-700 font-mono">{dims.feet}</span>
                <span className="text-[10px] text-stone-700 block font-mono font-semibold">{sqFt} Sq.Ft</span>
              </div>
              <div className="p-2 bg-white rounded-xl border border-stone-200 text-xs shadow-xs">
                <span className="text-[10px] text-stone-500 font-mono block">Meters (m / Sq.M)</span>
                <span className="font-bold text-amber-700 font-mono">{dims.meters}</span>
                <span className="text-[10px] text-stone-700 block font-mono font-semibold">{sqMeters} Sq.Meter</span>
              </div>
              <div className="p-2 bg-white rounded-xl border border-stone-200 text-xs shadow-xs">
                <span className="text-[10px] text-stone-500 font-mono block">Centimeters (cm / Sq.Cm)</span>
                <span className="font-bold text-amber-700 font-mono">{dims.centimeters}</span>
                <span className="text-[10px] text-stone-700 block font-mono font-semibold">{sqCm.toLocaleString()} Sq.Cm</span>
              </div>
            </div>
          </div>

          {/* Finishing, Thickness & Multi-Unit Rate Converter */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Thickness (mm)</label>
                <input
                  id="slab-thickness-input"
                  type="number"
                  value={thicknessMm}
                  onChange={(e) => setThicknessMm(Number(e.target.value))}
                  className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Surface Finish</label>
                <select
                  id="slab-finish-select"
                  value={finish}
                  onChange={(e) => setFinish(e.target.value as any)}
                  className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-500"
                >
                  <option value="Polished">Polished</option>
                  <option value="Honed">Honed</option>
                  <option value="Leathered">Leathered</option>
                  <option value="Flamed">Flamed</option>
                  <option value="Lappato">Lappato</option>
                </select>
              </div>
            </div>

            {/* Rate Input & Multi-Unit Conversion */}
            <div className="space-y-2 pt-2 border-t border-stone-200">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5" />
                  Rate / Price per Unit (Feet, Meter, Centimeter)
                </label>
                
                {/* Rate Input Unit Switcher Tabs */}
                <div className="flex items-center gap-1 bg-stone-200/80 p-1 rounded-xl border border-stone-300">
                  <button
                    type="button"
                    onClick={() => setRateInputMode('sqft')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                      rateInputMode === 'sqft'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-stone-700 hover:text-stone-900'
                    }`}
                  >
                    Per Sq.Ft (Feet)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRateInputMode('sqmeter')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                      rateInputMode === 'sqmeter'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-stone-700 hover:text-stone-900'
                    }`}
                  >
                    Per Sq.Meter (Meters)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRateInputMode('sqcm')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                      rateInputMode === 'sqcm'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-stone-700 hover:text-stone-900'
                    }`}
                  >
                    Per Sq.Cm (Centimeters)
                  </button>
                </div>
              </div>

              {/* Dynamic Rate Input based on selected Rate Unit Mode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-[11px] text-stone-600 mb-1">
                    Enter Rate in {rateInputMode === 'sqft' ? '₹ / Sq.Feet' : rateInputMode === 'sqmeter' ? '₹ / Sq.Meter' : '₹ / Sq.Centimeter'}
                  </label>
                  <input
                    id="slab-price-input"
                    type="number"
                    step="0.01"
                    value={
                      rateInputMode === 'sqft'
                        ? rates.perSqFt
                        : rateInputMode === 'sqmeter'
                        ? rates.perSqMeter
                        : rates.perSqCm
                    }
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (rateInputMode === 'sqft') {
                        setPricePerSqFt(val);
                      } else if (rateInputMode === 'sqmeter') {
                        setPricePerSqFt(val / 10.76391);
                      } else {
                        setPricePerSqFt(val * 929.0304);
                      }
                    }}
                    className="w-full bg-white border border-amber-400 rounded-xl px-3 py-2 text-sm text-stone-900 font-bold font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs">
                  <span className="text-[10px] text-emerald-800 font-mono block uppercase">Total Estimated Value</span>
                  <span className="text-base font-extrabold text-emerald-700 font-mono">
                    {formatCurrency(estimatedTotalValue)}
                  </span>
                  <span className="text-[10px] text-emerald-600 block font-mono">For {sqFt} Sq.Ft ({sqMeters} Sq.M)</span>
                </div>
              </div>

              {/* Converted Rates Badges for All 3 Units */}
              <div className="grid grid-cols-3 gap-2 pt-2 text-center">
                <div className="p-2 bg-white rounded-xl border border-stone-200">
                  <span className="text-[10px] text-stone-500 block font-mono">Rate per Sq.Ft</span>
                  <span className="text-xs font-bold text-amber-800 font-mono">₹{rates.perSqFt}</span>
                </div>
                <div className="p-2 bg-white rounded-xl border border-stone-200">
                  <span className="text-[10px] text-stone-500 block font-mono">Rate per Sq.Meter</span>
                  <span className="text-xs font-bold text-amber-800 font-mono">₹{rates.perSqMeter}</span>
                </div>
                <div className="p-2 bg-white rounded-xl border border-stone-200">
                  <span className="text-[10px] text-stone-500 block font-mono">Rate per Sq.Cm</span>
                  <span className="text-xs font-bold text-amber-800 font-mono">₹{rates.perSqCm}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Photo Selection & Gallery Upload */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" />
                Slab Photo Image
              </label>
              <span className="text-[10px] text-stone-500 font-mono">Upload from gallery or select sample</span>
            </div>

            {/* Hidden File Input for Device Gallery */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleGalleryUpload}
              className="hidden"
              id="slab-gallery-file-input"
            />

            {/* Gallery Upload Main Control Button & Image Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
              <button
                type="button"
                id="upload-from-gallery-btn"
                onClick={() => fileInputRef.current?.click()}
                className="col-span-2 py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition-all hover:scale-[1.01]"
              >
                <FileImage className="w-4 h-4 text-white" />
                <span>Choose Photo from Device Gallery</span>
                <Upload className="w-3.5 h-3.5 text-white ml-1" />
              </button>

              {/* Live Preview Thumbnail */}
              {imageUrl ? (
                <div className="relative group rounded-xl overflow-hidden border border-stone-300 bg-white h-16 flex items-center justify-center">
                  <img src={imageUrl} alt="Slab preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-stone-800/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-1.5 bg-amber-600 text-white rounded-lg text-[10px] font-bold"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="p-1.5 bg-rose-600 text-white rounded-lg text-[10px] font-bold"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-stone-300 h-16 flex items-center justify-center text-[10px] text-stone-400">
                  No image selected
                </div>
              )}
            </div>

            {/* Sample Presets */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] text-stone-600 font-semibold block">Or select standard sample marble pattern:</span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_STONE_IMAGES.map((preset) => (
                  <button
                    type="button"
                    key={preset.label}
                    onClick={() => setImageUrl(preset.url)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                      imageUrl === preset.url
                        ? 'bg-amber-600 text-white font-bold shadow-xs'
                        : 'bg-white text-stone-700 border border-stone-300 hover:bg-stone-100'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <input
              id="slab-image-url-input"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Or paste image URL (https://...)"
              className="w-full bg-white border border-stone-300 rounded-xl px-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>

          {/* Stock Availability Selector */}
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
            <label className="block text-xs font-bold text-stone-800">
              Stock Availability Status
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                id="slab-modal-status-available-btn"
                onClick={() => setIsSold(false)}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all border ${
                  !isSold
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-300" />
                Available / In Stock
              </button>

              <button
                type="button"
                id="slab-modal-status-sold-btn"
                onClick={() => setIsSold(true)}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all border ${
                  isSold
                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                    : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-300" />
                Out of Stock / Sold
              </button>
            </div>
            <p className="text-[10px] text-stone-500">
              {isSold
                ? 'Item marked Out of Stock. Out of stock badge will be displayed.'
                : 'Item marked Available. Customers can add this to their live direct order.'}
            </p>
          </div>

          {/* Footer Save Actions */}
          <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-3">
            <button
              type="button"
              id="cancel-slab-modal-btn"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 font-bold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="save-slab-modal-btn"
              className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Slab Entry</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
