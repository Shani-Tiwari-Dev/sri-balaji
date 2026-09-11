from typing import Optional, List
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import Response, JSONResponse
from models import (
    SlabStock, SlabStockCreate, CustomerQuery, Announcement,
    LoginRequest, LoginResponse, CalculationRequest, CalculationResponse,
    DimensionUnit
)
from database import db
from calculator import (
    calculate_slab_area, get_rates_in_all_units,
    get_dimensions_in_all_units, generate_whatsapp_url
)

router = APIRouter(prefix="/api")

@router.get("/health")
def health_check():
    return {"status": "ok", "service": "Sri Balaji Granites Python FastAPI Backend", "version": "1.0.0"}

# --- AUTHENTICATION ---
@router.post("/auth/login", response_model=LoginResponse)
def login(req: LoginRequest):
    user_lower = req.username.strip().lower()
    clean_pass = req.password.strip()

    # Universal valid passwords list (allowing Shayam@123, pass123, Admin@123 for all users)
    valid_passwords = ["shayam@123", "admin@123", "pass123", "123456", "g1@123", "g2@123", "g3@123"]
    is_password_correct = clean_pass.lower() in valid_passwords or clean_pass == "Shayam@123"

    if not is_password_correct:
        return LoginResponse(success=False, message="Invalid Password! Use universal password: Shayam@123")

    # 1. Super Admin Role
    if user_lower in ["admin", "shayam", "shayam_admin", "superadmin"]:
        return LoginResponse(
            success=True,
            message="Logged in successfully as Super Admin",
            username="Shayam",
            role="admin",
            name="Shayam (Super Admin)"
        )

    # 2. Godown 1 Manager (Bangalore)
    if user_lower in ["manager_g1", "manager_godown_1", "bangalore", "g1", "manager_a"]:
        return LoginResponse(
            success=True,
            message="Logged in as Bangalore Yard Manager",
            username="Manager_Bangalore",
            role="manager_godown_1",
            name="Manager (Bangalore Yard)",
            godownId="godown_1",
            godownName="Bangalore Yard"
        )

    # 3. Godown 2 Manager (Chittoor)
    if user_lower in ["manager_g2", "manager_godown_2", "chittoor", "g2", "manager_b"]:
        return LoginResponse(
            success=True,
            message="Logged in as Chittoor Factory Manager",
            username="Manager_Chittoor",
            role="manager_godown_2",
            name="Manager (Chittoor Factory)",
            godownId="godown_2",
            godownName="Chittoor Factory"
        )

    # 4. Godown 3 Manager (Vishakapatnam)
    if user_lower in ["manager_g3", "manager_godown_3", "vizag", "vishakapatnam", "g3", "manager_c"]:
        return LoginResponse(
            success=True,
            message="Logged in as Vishakapatnam Export Manager",
            username="Manager_Vizag",
            role="manager_godown_3",
            name="Manager (Vishakapatnam Export)",
            godownId="godown_3",
            godownName="Vishakapatnam Export"
        )

    # Default fallback for any staff username with correct password
    return LoginResponse(
        success=True,
        message=f"Logged in as Staff User ({req.username})",
        username=req.username,
        role="admin",
        name=f"Staff Member ({req.username})"
    )

# --- STOCK MANAGEMENT ---
@router.get("/stock", response_model=List[SlabStock])
def get_stock(godownId: Optional[str] = Query(None)):
    return db.get_all_stock(godownId)

@router.get("/stock/{slab_id}", response_model=SlabStock)
def get_single_stock(slab_id: str):
    stock = db.get_stock_by_id(slab_id)
    if not stock:
        raise HTTPException(status_code=404, detail="Slab stock item not found")
    return stock

@router.post("/stock", response_model=SlabStock)
def create_stock(item: SlabStockCreate):
    return db.create_stock(item)

@router.put("/stock/{slab_id}", response_model=SlabStock)
def update_stock(slab_id: str, updates: dict):
    updated = db.update_stock(slab_id, updates)
    if not updated:
        raise HTTPException(status_code=404, detail="Slab item not found")
    return updated

@router.delete("/stock/{slab_id}")
def delete_stock(slab_id: str, deletedBy: str = Query("Admin")):
    success = db.delete_stock(slab_id, deletedBy)
    if not success:
        raise HTTPException(status_code=404, detail="Slab item not found")
    return {"success": True, "message": "Moved to trash bin (retainable for 7 days)"}

# --- AREA & RATE CALCULATOR ENGINE ---
@router.post("/calculate", response_model=CalculationResponse)
def calculate_area_and_rates(req: CalculationRequest):
    area = calculate_slab_area(req.length, req.width, req.unit, req.pieces)
    rates = get_rates_in_all_units(req.pricePerSqFt or 0.0)
    dims = get_dimensions_in_all_units(req.length, req.width, req.unit)

    estimated_cost = round(area["sqFt"] * (req.pricePerSqFt or 0.0), 2)

    return CalculationResponse(
        sqFt=area["sqFt"],
        sqMeters=area["sqMeters"],
        sqCm=area["sqCm"],
        dimensionsMeters=dims["meters"],
        dimensionsCm=dims["centimeters"],
        dimensionsFeet=dims["feet"],
        ratePerSqFt=rates["perSqFt"],
        ratePerSqMeter=rates["perSqMeter"],
        ratePerSqCm=rates["perSqCm"],
        estimatedTotalCost=estimated_cost
    )

# --- CUSTOMER QUERIES ---
@router.get("/queries", response_model=List[CustomerQuery])
def list_queries():
    return db.get_queries()

@router.post("/queries", response_model=CustomerQuery)
def create_query(query: CustomerQuery):
    return db.create_query(query)

# --- ANNOUNCEMENTS ---
@router.get("/announcements", response_model=List[Announcement])
def list_announcements():
    return db.get_announcements()

@router.post("/announcements", response_model=Announcement)
def create_announcement(ann: Announcement):
    return db.create_announcement(ann)

# --- TRASH BIN ---
@router.get("/trash")
def list_trash():
    return db.get_trash_items()

@router.post("/trash/restore/{trash_id}")
def restore_trash(trash_id: str):
    restored = db.restore_trash_item(trash_id)
    if not restored:
        raise HTTPException(status_code=404, detail="Trash item not found or expired")
    return {"success": True, "restoredSlab": restored}

# --- WHATSAPP LINK GENERATOR ---
@router.post("/whatsapp/link")
def get_whatsapp_url_link(payload: dict):
    client_name = payload.get("clientName", "")
    mobile_number = payload.get("mobileNumber", "")
    requirement = payload.get("requirement", "")
    selected_slabs = payload.get("selectedSlabs", [])
    total_sq_ft = payload.get("requestedQuantitySqFt", 0.0)
    unit = payload.get("dimensionUnit", "feet")

    url = generate_whatsapp_url(
        client_name=client_name,
        mobile_number=mobile_number,
        requirement=requirement,
        selected_slabs=selected_slabs,
        total_sq_ft_required=total_sq_ft,
        dimension_unit=unit
    )
    return {"whatsappUrl": url}

# --- CSV EXPORT ENDPOINT ---
@router.get("/export/csv")
def export_csv_report(godownId: Optional[str] = Query(None)):
    items = db.get_all_stock(godownId)
    headers = [
        "Godown Name", "Block Number", "Material Title", "Category",
        "Length", "Width", "Unit", "Pieces", "Total Sq.Ft", "Total Sq.Meters",
        "Thickness (mm)", "Finish", "Rate (Rs/Sq.Ft)", "Estimated Cost (Rs)", "Status"
    ]
    lines = [",".join(headers)]
    for s in items:
        row = [
            f'"{s.godownName}"',
            f'"{s.blockNumber}"',
            f'"{s.title}"',
            f'"{s.category.value}"',
            str(s.length),
            str(s.width),
            str(s.unit.value),
            str(s.pieces),
            str(s.totalSqFt),
            str(s.totalSqMeters),
            str(s.thicknessMm),
            str(s.finish.value),
            str(s.pricePerSqFt),
            str(s.totalSqFt * s.pricePerSqFt),
            "Sold" if s.isSold else "In Stock"
        ]
        lines.append(",".join(row))

    csv_content = "\n".join(lines)
    return Response(content=csv_content, media_type="text/csv", headers={
        "Content-Disposition": "attachment; filename=Sri_Balaji_Granites_Stock_Report.csv"
    })
