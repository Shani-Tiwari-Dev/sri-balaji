from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime

class GodownId(str, Enum):
    GODOWN_1 = "godown_1"
    GODOWN_2 = "godown_2"
    GODOWN_3 = "godown_3"
    GODOWN_A = "godown_a"
    GODOWN_B = "godown_b"
    GODOWN_C = "godown_c"

class CategoryType(str, Enum):
    ITALIAN_MARBLE = "Italian Marble"
    INDIAN_MARBLE = "Indian Marble"
    GRANITE = "Granite"
    QUARTZ = "Quartz"
    ONYX = "Onyx"
    SANDSTONE = "Sandstone"

class DimensionUnit(str, Enum):
    METERS = "meters"
    CENTIMETERS = "centimeters"
    FEET = "feet"
    INCHES = "inches"

class FinishType(str, Enum):
    POLISHED = "Polished"
    HONED = "Honed"
    LEATHERED = "Leathered"
    FLAMED = "Flamed"
    LAPPATO = "Lappato"

class SlabStock(BaseModel):
    id: str
    godownId: GodownId
    godownName: str
    blockNumber: str
    title: str
    category: CategoryType
    imageUrl: str
    length: float
    width: float
    unit: DimensionUnit
    pieces: int
    totalSqFt: float
    totalSqMeters: float
    thicknessMm: int
    finish: FinishType
    pricePerSqFt: float
    isSold: bool = False
    lotName: Optional[str] = None
    createdAt: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class SlabStockCreate(BaseModel):
    godownId: GodownId
    godownName: str
    blockNumber: str
    title: str
    category: CategoryType
    imageUrl: Optional[str] = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
    length: float
    width: float
    unit: DimensionUnit
    pieces: int
    thicknessMm: int
    finish: FinishType
    pricePerSqFt: float
    lotName: Optional[str] = None

class TrashItem(BaseModel):
    id: str
    slab: SlabStock
    deletedAt: str
    deletedBy: str
    expiresAt: str

class CustomerQuery(BaseModel):
    id: str
    orderNumber: Optional[str] = None
    clientName: str
    mobileNumber: str
    deliveryAddress: Optional[str] = None
    preferredGodown: Optional[str] = "any"
    requirement: str
    dimensionUnit: DimensionUnit
    requestedQuantitySqFt: float
    selectedSlabs: List[SlabStock] = []
    totalEstimatedCost: Optional[float] = 0.0
    status: str = "Pending"  # Pending, Contacted, Quoted, Closed
    createdAt: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    notes: Optional[str] = None

class Announcement(BaseModel):
    id: str
    title: str
    message: str
    isActive: bool = True
    date: str = Field(default_factory=lambda: datetime.utcnow().strftime("%Y-%m-%d"))
    type: str = "general"  # offer, arrival, general

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    success: bool
    message: str
    username: Optional[str] = None
    role: Optional[str] = None
    name: Optional[str] = None
    godownId: Optional[str] = None
    godownName: Optional[str] = None

class CalculationRequest(BaseModel):
    length: float
    width: float
    unit: DimensionUnit
    pieces: int = 1
    pricePerSqFt: Optional[float] = 0.0

class CalculationResponse(BaseModel):
    sqFt: float
    sqMeters: float
    sqCm: float
    dimensionsMeters: str
    dimensionsCm: str
    dimensionsFeet: str
    ratePerSqFt: float
    ratePerSqMeter: float
    ratePerSqCm: float
    estimatedTotalCost: float
