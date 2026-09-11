import uuid
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from models import SlabStock, SlabStockCreate, CustomerQuery, Announcement, TrashItem, DimensionUnit, GodownId, FinishType, CategoryType
from calculator import calculate_slab_area

# In-Memory Database initialized with default stock, queries, and announcements
class Database:
    def __init__(self):
        self.stock: List[SlabStock] = self._get_initial_stock()
        self.queries: List[CustomerQuery] = self._get_initial_queries()
        self.announcements: List[Announcement] = self._get_initial_announcements()
        self.trash: List[TrashItem] = []

    def _get_initial_stock(self) -> List[SlabStock]:
        return [
            SlabStock(
                id="SBG-G1-101",
                godownId=GodownId.GODOWN_1,
                godownName="Main Showroom & Yard - Bangalore",
                blockNumber="BLK-ITA-01",
                title="White Statuario Premium Marble",
                category=CategoryType.ITALIAN_MARBLE,
                imageUrl="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
                length=10.5,
                width=6.2,
                unit=DimensionUnit.FEET,
                pieces=48,
                totalSqFt=3124.8,
                totalSqMeters=290.3,
                thicknessMm=18,
                finish=FinishType.POLISHED,
                pricePerSqFt=450.0,
                isSold=False,
                lotName="Statuario Royal Import Lot 2026",
                createdAt=datetime.utcnow().isoformat()
            ),
            SlabStock(
                id="SBG-G1-102",
                godownId=GodownId.GODOWN_1,
                godownName="Main Showroom & Yard - Bangalore",
                blockNumber="BLK-GRN-09",
                title="Absolute Black Granite (Export Grade)",
                category=CategoryType.GRANITE,
                imageUrl="https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=800&q=80",
                length=11.0,
                width=6.5,
                unit=DimensionUnit.FEET,
                pieces=60,
                totalSqFt=4290.0,
                totalSqMeters=398.5,
                thicknessMm=20,
                finish=FinishType.POLISHED,
                pricePerSqFt=165.0,
                isSold=False,
                lotName="Khammam Premium Jet Black",
                createdAt=datetime.utcnow().isoformat()
            ),
            SlabStock(
                id="SBG-G2-201",
                godownId=GodownId.GODOWN_2,
                godownName="Factory & Processing Unit - Chittoor",
                blockNumber="BLK-IND-14",
                title="Makrana White Heritage Marble",
                category=CategoryType.INDIAN_MARBLE,
                imageUrl="https://images.unsplash.com/photo-1541123437800-1bb1317badc2?auto=format&fit=crop&w=800&q=80",
                length=9.0,
                width=5.5,
                unit=DimensionUnit.FEET,
                pieces=35,
                totalSqFt=1732.5,
                totalSqMeters=160.9,
                thicknessMm=16,
                finish=FinishType.POLISHED,
                pricePerSqFt=220.0,
                isSold=False,
                lotName="Rajasthan Royal Cut",
                createdAt=datetime.utcnow().isoformat()
            ),
            SlabStock(
                id="SBG-G3-301",
                godownId=GodownId.GODOWN_3,
                godownName="Port Yard & Bulk Stock - Vishakapatnam",
                blockNumber="BLK-QTZ-03",
                title="Calacatta Gold Engineered Quartz",
                category=CategoryType.QUARTZ,
                imageUrl="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80",
                length=10.0,
                width=5.0,
                unit=DimensionUnit.FEET,
                pieces=25,
                totalSqFt=1250.0,
                totalSqMeters=116.1,
                thicknessMm=18,
                finish=FinishType.POLISHED,
                pricePerSqFt=280.0,
                isSold=False,
                lotName="Quartz Luxury Vein Collection",
                createdAt=datetime.utcnow().isoformat()
            )
        ]

    def _get_initial_queries(self) -> List[CustomerQuery]:
        return [
            CustomerQuery(
                id="QRY-1001",
                orderNumber="ORD-8821",
                clientName="Rajesh Kumar",
                mobileNumber="+91 9876543210",
                deliveryAddress="Indiranagar, Bangalore",
                preferredGodown="godown_1",
                requirement="Italian Statuario Marble for 3BHK Living Room Villa",
                dimensionUnit=DimensionUnit.FEET,
                requestedQuantitySqFt=1500,
                selectedSlabs=[],
                totalEstimatedCost=675000,
                status="Pending",
                createdAt=datetime.utcnow().isoformat(),
                notes="Client wants sample inspection on Sunday morning"
            )
        ]

    def _get_initial_announcements(self) -> List[Announcement]:
        return [
            Announcement(
                id="ANN-1",
                title="🎉 Festive Offer - 10% Discount on Italian Marble!",
                message="Special festive rate on White Statuario & Michael Angelo lots across all yards.",
                isActive=True,
                date=datetime.utcnow().strftime("%Y-%m-%d"),
                type="offer"
            )
        ]

    # --- STOCK CRUD ---
    def get_all_stock(self, godown_id: Optional[str] = None) -> List[SlabStock]:
        if godown_id and godown_id != "all":
            return [s for s in self.stock if s.godownId == godown_id]
        return self.stock

    def get_stock_by_id(self, slab_id: str) -> Optional[SlabStock]:
        for s in self.stock:
            if s.id == slab_id:
                return s
        return None

    def create_stock(self, data: SlabStockCreate) -> SlabStock:
        area = calculate_slab_area(data.length, data.width, data.unit, data.pieces)
        new_id = f"SBG-{data.godownId.upper()}-{uuid.uuid4().hex[:6].upper()}"
        
        slab = SlabStock(
            id=new_id,
            godownId=data.godownId,
            godownName=data.godownName,
            blockNumber=data.blockNumber,
            title=data.title,
            category=data.category,
            imageUrl=data.imageUrl or "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
            length=data.length,
            width=data.width,
            unit=data.unit,
            pieces=data.pieces,
            totalSqFt=area["sqFt"],
            totalSqMeters=area["sqMeters"],
            thicknessMm=data.thicknessMm,
            finish=data.finish,
            pricePerSqFt=data.pricePerSqFt,
            isSold=False,
            lotName=data.lotName,
            createdAt=datetime.utcnow().isoformat()
        )
        self.stock.append(slab)
        return slab

    def update_stock(self, slab_id: str, updates: Dict[str, Any]) -> Optional[SlabStock]:
        for idx, s in enumerate(self.stock):
            if s.id == slab_id:
                updated_dict = s.dict()
                updated_dict.update(updates)
                
                # Recalculate area if dimensions changed
                length = updated_dict["length"]
                width = updated_dict["width"]
                unit = updated_dict["unit"]
                pieces = updated_dict["pieces"]
                area = calculate_slab_area(length, width, unit, pieces)
                updated_dict["totalSqFt"] = area["sqFt"]
                updated_dict["totalSqMeters"] = area["sqMeters"]

                updated_slab = SlabStock(**updated_dict)
                self.stock[idx] = updated_slab
                return updated_slab
        return None

    def delete_stock(self, slab_id: str, deleted_by: str = "Admin") -> bool:
        slab_to_delete = self.get_stock_by_id(slab_id)
        if not slab_to_delete:
            return False

        # Move to trash
        now = datetime.utcnow()
        expiry = now + timedelta(days=7)

        trash_item = TrashItem(
            id=f"TRASH-{uuid.uuid4().hex[:6].upper()}",
            slab=slab_to_delete,
            deletedAt=now.isoformat(),
            deletedBy=deleted_by,
            expiresAt=expiry.isoformat()
        )
        self.trash.append(trash_item)
        self.stock = [s for s in self.stock if s.id != slab_id]
        return True

    # --- TRASH BIN (7 Days Auto-Purge) ---
    def get_trash_items(self) -> List[TrashItem]:
        self._purge_expired_trash()
        return self.trash

    def restore_trash_item(self, trash_id: str) -> Optional[SlabStock]:
        for t in self.trash:
            if t.id == trash_id:
                self.stock.append(t.slab)
                self.trash = [x for x in self.trash if x.id != trash_id]
                return t.slab
        return None

    def _purge_expired_trash(self):
        now = datetime.utcnow().isoformat()
        self.trash = [t for t in self.trash if t.expiresAt > now]

    # --- CUSTOMER QUERIES ---
    def get_queries(self) -> List[CustomerQuery]:
        return self.queries

    def create_query(self, query: CustomerQuery) -> CustomerQuery:
        self.queries.insert(0, query)
        return query

    # --- ANNOUNCEMENTS ---
    def get_announcements(self) -> List[Announcement]:
        return self.announcements

    def create_announcement(self, ann: Announcement) -> Announcement:
        self.announcements.insert(0, ann)
        return ann

db = Database()
