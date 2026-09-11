import math
from urllib.parse import quote
from typing import List, Dict, Any
from models import DimensionUnit, SlabStock

def calculate_slab_area(length: float, width: float, unit: DimensionUnit, pieces: int = 1) -> Dict[str, float]:
    """
    Calculates Total Square Feet, Square Meters, and Square Centimeters 
    for given length, width, unit, and piece count in Python.
    """
    if length <= 0 or width <= 0 or pieces <= 0:
        return {"sqFt": 0.0, "sqMeters": 0.0, "sqCm": 0.0}

    length_inches = 0.0
    width_inches = 0.0

    if unit == DimensionUnit.METERS:
        length_inches = length * 39.3701
        width_inches = width * 39.3701
    elif unit == DimensionUnit.CENTIMETERS:
        length_inches = length / 2.54
        width_inches = width / 2.54
    elif unit == DimensionUnit.FEET:
        length_inches = length * 12.0
        width_inches = width * 12.0
    elif unit == DimensionUnit.INCHES:
        length_inches = length
        width_inches = width

    # 1 Sq Ft = 144 Sq Inches
    sq_ft_per_piece = (length_inches * width_inches) / 144.0
    total_sq_ft = round(sq_ft_per_piece * pieces, 2)

    # 1 Sq Ft = 0.092903 Sq Meters
    total_sq_meters = round(total_sq_ft * 0.092903, 2)

    # 1 Sq Ft = 929.03 Sq Centimeters
    total_sq_cm = round(total_sq_ft * 929.03, 0)

    return {
        "sqFt": total_sq_ft,
        "sqMeters": total_sq_meters,
        "sqCm": total_sq_cm
    }

def get_rates_in_all_units(price_per_sq_ft: float) -> Dict[str, float]:
    """
    Calculates rate conversions per Sq Ft, Sq Meter, and Sq Cm.
    """
    per_sq_ft = round(price_per_sq_ft, 2)
    per_sq_meter = round(price_per_sq_ft * 10.76391, 2)
    per_sq_cm = round(price_per_sq_ft / 929.0304, 3)

    return {
        "perSqFt": per_sq_ft,
        "perSqMeter": per_sq_meter,
        "perSqCm": per_sq_cm
    }

def get_dimensions_in_all_units(length: float, width: float, unit: DimensionUnit) -> Dict[str, str]:
    """
    Returns formatted dimension strings in Meters, Centimeters, and Feet.
    """
    length_in_meters = 0.0
    width_in_meters = 0.0

    if unit == DimensionUnit.METERS:
        length_in_meters = length
        width_in_meters = width
    elif unit == DimensionUnit.CENTIMETERS:
        length_in_meters = length / 100.0
        width_in_meters = width / 100.0
    elif unit == DimensionUnit.FEET:
        length_in_meters = length * 0.3048
        width_in_meters = width * 0.3048
    elif unit == DimensionUnit.INCHES:
        length_in_meters = length * 0.0254
        width_in_meters = width * 0.0254

    length_feet = round(length_in_meters * 3.28084, 2)
    width_feet = round(width_in_meters * 3.28084, 2)

    length_cm = round(length_in_meters * 100)
    width_cm = round(width_in_meters * 100)

    l_m = round(length_in_meters, 2)
    w_m = round(width_in_meters, 2)

    return {
        "meters": f"{l_m} x {w_m} m",
        "centimeters": f"{length_cm} x {width_cm} cm",
        "feet": f"{length_feet} x {width_feet} ft"
    }

def generate_whatsapp_url(
    client_name: str,
    mobile_number: str,
    requirement: str,
    selected_slabs: List[Dict[str, Any]],
    total_sq_ft_required: float = 0.0,
    dimension_unit: str = "feet"
) -> str:
    """
    Generates a pre-filled WhatsApp click-to-chat URL for Sri Balaji Granites inquiries.
    """
    phone = "919828400811"

    slab_lines = []
    total_estimated_value = 0.0

    for idx, s in enumerate(selected_slabs, 1):
        title = s.get("title", "Granite/Marble Slab")
        category = s.get("category", "Natural Stone")
        block = s.get("blockNumber", "N/A")
        length = s.get("length", 0)
        width = s.get("width", 0)
        unit = s.get("unit", "feet")
        pieces = s.get("pieces", 1)
        total_sq_ft = s.get("totalSqFt", 0)
        price = s.get("pricePerSqFt", 0)
        godown = s.get("godownName", "Yard")

        total_estimated_value += total_sq_ft * price

        line = (
            f"{idx}. *{title}* ({category})\n"
            f"   - Block: {block}\n"
            f"   - Size: {length} x {width} {unit} ({pieces} pcs = {total_sq_ft} Sq.Ft)\n"
            f"   - Rate: ₹{price}/Sq.Ft\n"
            f"   - Location: {godown}"
        )
        slab_lines.append(line)

    slab_list_text = "\n\n".join(slab_lines) if slab_lines else "General inquiry for Granite & Marble stock"

    text = (
        "*SRI BALAJI GRANITES & MARBLES*\n"
        "*Customer Inquiry & Rate Request*\n\n"
        f"👤 *Customer Name:* {client_name or 'Valued Customer'}\n"
        f"📱 *Customer Phone:* {mobile_number or 'Not provided'}\n"
        f"📝 *Requirement:* {requirement or 'Rate & stock inquiry'}\n"
        + (f"📐 *Required Quantity:* {total_sq_ft_required} Sq.Ft ({dimension_unit})\n" if total_sq_ft_required > 0 else "")
        + f"\n*Selected Slabs ({len(selected_slabs)} Items):*\n"
        f"{slab_list_text}\n\n"
        + (f"💰 *Estimated Total Cost:* ₹{int(total_estimated_value):,}\n\n" if total_estimated_value > 0 else "")
        + "📍 *Locations:* Bangalore Yard | Chittoor Factory | Vishakapatnam Export\n"
        "📞 *Call/WhatsApp:* +91 9828400811 / +91 9982749180\n\n"
        "_Sent via Sri Balaji Granites Python API_"
    )

    encoded_text = quote(text)
    return f"https://wa.me/{phone}?text={encoded_text}"
