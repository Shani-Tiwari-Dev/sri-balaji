export type GodownId = 'godown_1' | 'godown_2' | 'godown_3' | 'godown_a' | 'godown_b' | 'godown_c';

export type CategoryType = 
  | 'Italian Marble'
  | 'Indian Marble'
  | 'Granite'
  | 'Quartz'
  | 'Onyx'
  | 'Sandstone';

export type DimensionUnit = 'meters' | 'centimeters' | 'feet' | 'inches';

export interface SlabStock {
  id: string;
  godownId: GodownId;
  godownName: string;
  blockNumber: string;
  title: string;
  category: CategoryType;
  imageUrl: string;
  length: number; // in chosen unit
  width: number; // in chosen unit
  unit: DimensionUnit;
  pieces: number;
  totalSqFt: number;
  totalSqMeters: number;
  thicknessMm: number;
  finish: 'Polished' | 'Honed' | 'Leathered' | 'Flamed' | 'Lappato';
  pricePerSqFt: number;
  isSold: boolean;
  lotName?: string;
  createdAt: string;
}

export interface TrashItem {
  id: string;
  slab: SlabStock;
  deletedAt: string; // ISO String
  deletedBy: string;
  expiresAt: string; // ISO String (+7 days from deletedAt)
}

export interface CustomerQuery {
  id: string;
  orderNumber?: string;
  clientName: string;
  mobileNumber: string;
  deliveryAddress?: string;
  preferredGodown?: GodownId | 'any';
  requirement: string;
  dimensionUnit: DimensionUnit;
  requestedQuantitySqFt: number;
  selectedSlabs: SlabStock[];
  totalEstimatedCost?: number;
  status: 'Pending' | 'Contacted' | 'Quoted' | 'Closed';
  createdAt: string;
  notes?: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  isActive: boolean;
  date: string;
  type: 'offer' | 'arrival' | 'general';
}

export type UserRole = 
  | 'admin' // Super Admin (Access ALL 3 Godowns)
  | 'manager_godown_1' // Manager Godown 1
  | 'manager_godown_2' // Manager Godown 2
  | 'manager_godown_3' // Manager Godown 3
  | 'manager_a'
  | 'manager_b'
  | 'manager_c'
  | 'guest';

export interface UserSession {
  username: string;
  role: UserRole;
  godownId?: GodownId;
  name: string;
  godownName?: string;
}

export type ThemeType = 
  | 'amber'
  | 'sapphire'
  | 'emerald'
  | 'rose'
  | 'obsidian'
  | 'amethyst'
  | 'copper'
  | 'cyan'
  | 'slate'
  | 'sunset';


