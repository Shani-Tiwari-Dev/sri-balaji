import { DimensionUnit, SlabStock, TrashItem, CustomerQuery } from '../types';

export type RateDisplayUnit = 'sqft' | 'sqmeter' | 'sqcm';

/**
 * Calculates Total Square Feet, Square Meters, and Square Centimeters for given length, width, unit, and piece count.
 */
export function calculateSlabArea(
  length: number,
  width: number,
  unit: DimensionUnit,
  pieces: number = 1
): { sqFt: number; sqMeters: number; sqCm: number } {
  if (length <= 0 || width <= 0 || pieces <= 0) {
    return { sqFt: 0, sqMeters: 0, sqCm: 0 };
  }

  let lengthInInches = 0;
  let widthInInches = 0;

  switch (unit) {
    case 'meters':
      lengthInInches = length * 39.3701;
      widthInInches = width * 39.3701;
      break;
    case 'centimeters':
      lengthInInches = (length / 2.54);
      widthInInches = (width / 2.54);
      break;
    case 'feet':
      lengthInInches = length * 12;
      widthInInches = width * 12;
      break;
    case 'inches':
      lengthInInches = length;
      widthInInches = width;
      break;
  }

  // 1 Sq Ft = 144 Sq Inches
  const sqFtPerPiece = (lengthInInches * widthInInches) / 144;
  const totalSqFt = Math.round(sqFtPerPiece * pieces * 100) / 100;

  // 1 Sq Ft = 0.092903 Sq Meters
  const totalSqMeters = Math.round(totalSqFt * 0.092903 * 100) / 100;

  // 1 Sq Ft = 929.03 Sq Centimeters
  const totalSqCm = Math.round(totalSqFt * 929.03);

  return { sqFt: totalSqFt, sqMeters: totalSqMeters, sqCm: totalSqCm };
}

/**
 * Calculates rates per Sq.Ft (Feet), Sq.Meter (Meters), and Sq.Cm (Centimeters).
 */
export function getRatesInAllUnits(pricePerSqFt: number): {
  perSqFt: number;
  perSqMeter: number;
  perSqCm: number;
} {
  const perSqFt = Math.round(pricePerSqFt * 100) / 100;
  const perSqMeter = Math.round(pricePerSqFt * 10.76391 * 100) / 100;
  const perSqCm = Math.round((pricePerSqFt / 929.0304) * 1000) / 1000;

  return { perSqFt, perSqMeter, perSqCm };
}

/**
 * Converts pricePerSqFt into requested rate display unit.
 */
export function getConvertedRate(pricePerSqFt: number, displayUnit: RateDisplayUnit): number {
  const rates = getRatesInAllUnits(pricePerSqFt);
  switch (displayUnit) {
    case 'sqmeter':
      return rates.perSqMeter;
    case 'sqcm':
      return rates.perSqCm;
    case 'sqft':
    default:
      return rates.perSqFt;
  }
}

/**
 * Converts totalSqFt into requested area unit.
 */
export function getConvertedArea(sqFt: number, displayUnit: RateDisplayUnit): number {
  switch (displayUnit) {
    case 'sqmeter':
      return Math.round(sqFt * 0.092903 * 100) / 100;
    case 'sqcm':
      return Math.round(sqFt * 929.03);
    case 'sqft':
    default:
      return Math.round(sqFt * 100) / 100;
  }
}

/**
 * Returns labels for selected rate display unit.
 */
export function getUnitLabel(displayUnit: RateDisplayUnit): { short: string; full: string; unitName: string } {
  switch (displayUnit) {
    case 'sqmeter':
      return { short: 'Sq.M', full: 'Square Meter', unitName: 'Meters' };
    case 'sqcm':
      return { short: 'Sq.Cm', full: 'Square Centimeter', unitName: 'Centimeters' };
    case 'sqft':
    default:
      return { short: 'Sq.Ft', full: 'Square Feet', unitName: 'Feet' };
  }
}

/**
 * Calculates dimensions in Meters, Centimeters, and Feet for a slab.
 */
export function getDimensionsInAllUnits(length: number, width: number, unit: DimensionUnit): {
  meters: string;
  centimeters: string;
  feet: string;
} {
  let lengthInMeters = 0;
  let widthInMeters = 0;

  switch (unit) {
    case 'meters':
      lengthInMeters = length;
      widthInMeters = width;
      break;
    case 'centimeters':
      lengthInMeters = length / 100;
      widthInMeters = width / 100;
      break;
    case 'feet':
      lengthInMeters = length * 0.3048;
      widthInMeters = width * 0.3048;
      break;
    case 'inches':
      lengthInMeters = length * 0.0254;
      widthInMeters = width * 0.0254;
      break;
  }

  const lengthFeet = Math.round(lengthInMeters * 3.28084 * 100) / 100;
  const widthFeet = Math.round(widthInMeters * 3.28084 * 100) / 100;

  const lengthCm = Math.round(lengthInMeters * 100);
  const widthCm = Math.round(widthInMeters * 100);

  const lMeters = Math.round(lengthInMeters * 100) / 100;
  const wMeters = Math.round(widthInMeters * 100) / 100;

  return {
    meters: `${lMeters} x ${wMeters} m`,
    centimeters: `${lengthCm} x ${widthCm} cm`,
    feet: `${lengthFeet} x ${widthFeet} ft`,
  };
}

/**
 * Calculates remaining days in trash before auto-purge (7 days max).
 */
export function getTrashRemainingDays(deletedAtISO: string): number {
  const deletedTime = new Date(deletedAtISO).getTime();
  const now = new Date().getTime();
  const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
  const expiryTime = deletedTime + sevenDaysInMs;
  const diffInMs = expiryTime - now;

  if (diffInMs <= 0) return 0;
  return Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
}

/**
 * Filter items that are older than 7 days (auto-purge check).
 */
export function filterExpiredTrash(items: TrashItem[]): TrashItem[] {
  return items.filter((item) => getTrashRemainingDays(item.deletedAt) > 0);
}

/**
 * Builds direct WhatsApp URL with pre-filled message for Customer Queries.
 */
export function generateWhatsAppUrl(
  clientName: string,
  mobileNumber: string,
  requirement: string,
  selectedSlabs: SlabStock[],
  totalSqFtRequired?: number,
  dimensionUnit?: DimensionUnit
): string {
  // Primary Sri Balaji Granites & Marbles business WhatsApp number
  const phone = '919828400811';

  const slabListText = selectedSlabs
    .map(
      (s, idx) =>
        `${idx + 1}. *${s.title}* (${s.category})\n   - Block: ${s.blockNumber}\n   - Size: ${s.length} x ${s.width} ${s.unit} (${s.pieces} pcs = ${s.totalSqFt} Sq.Ft)\n   - Rate: ₹${s.pricePerSqFt}/Sq.Ft\n   - Location: ${s.godownName}`
    )
    .join('\n\n');

  const totalEstimatedValue = selectedSlabs.reduce((sum, s) => sum + s.totalSqFt * s.pricePerSqFt, 0);

  const text = `*SRI BALAJI GRANITES & MARBLES*
*Customer Inquiry & Rate Request*

👤 *Customer Name:* ${clientName || 'Valued Customer'}
📱 *Customer Phone:* ${mobileNumber || 'Not provided'}
📝 *Requirement:* ${requirement || 'Rate & stock availability query'}
${totalSqFtRequired ? `📐 *Required Quantity:* ${totalSqFtRequired} Sq.Ft (${dimensionUnit || 'feet'})` : ''}

*Selected Slabs (${selectedSlabs.length} Items):*
${slabListText || 'General inquiry for Granite & Marble stock'}

${totalEstimatedValue > 0 ? `💰 *Estimated Total Cost:* ₹${totalEstimatedValue.toLocaleString('en-IN')}` : ''}

📍 *Locations:* Bangalore Yard | Chittoor Factory | Vishakapatnam Export
📞 *Call/WhatsApp:* +91 9828400811 / +91 9982749180

_Sent via Sri Balaji Granites Online Catalog_`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

/**
 * Formats numbers into INR Currency format
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Exports current stock data as CSV Excel file.
 */
export function exportStockToCSV(stock: SlabStock[], filename = 'Godown_Stock_Report.csv') {
  if (!stock || stock.length === 0) return;

  const headers = [
    'Godown Name',
    'Block Number',
    'Material Title',
    'Category',
    'Length',
    'Width',
    'Unit',
    'Pieces',
    'Total Sq.Ft',
    'Total Sq.Meters',
    'Thickness (mm)',
    'Finish',
    'Rate (Rs/Sq.Ft)',
    'Estimated Total Value (Rs)',
    'Status',
  ];

  const rows = stock.map((s) => [
    `"${s.godownName}"`,
    `"${s.blockNumber}"`,
    `"${s.title}"`,
    `"${s.category}"`,
    s.length,
    s.width,
    s.unit,
    s.pieces,
    s.totalSqFt,
    s.totalSqMeters,
    s.thicknessMm,
    s.finish,
    s.pricePerSqFt,
    s.totalSqFt * s.pricePerSqFt,
    s.isSold ? 'Sold' : 'In Stock',
  ]);

  const csvContent =
    'data:text/csv;charset=utf-8,' +
    [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
