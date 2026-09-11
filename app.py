import os
import json
from datetime import datetime, timedelta
from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "sri_balaji_granites_secret_2026")

# Supabase Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

supabase = None
if SUPABASE_URL and SUPABASE_KEY:
    try:
        from supabase import create_client, Client
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("Connected to Supabase successfully!")
    except Exception as e:
        print(f"Supabase connection warning: {e}")

# In-Memory / Local Storage Fallback if Supabase is not yet configured with API keys
MOCK_SLABS = [
    {
        "id": "1",
        "godown_id": "godown_1",
        "godown_name": "Godown 1 (Industrial Area Yard)",
        "block_number": "SBG-BLK-101",
        "title": "Black Galaxy Granite (Gold Star)",
        "category": "Granite",
        "image_url": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
        "length": 10.0,
        "width": 6.0,
        "unit": "feet",
        "pieces": 42,
        "total_sq_ft": 2520.0,
        "total_sq_meters": 234.11,
        "thickness_mm": 18,
        "finish": "Polished",
        "price_per_sq_ft": 185.0,
        "is_sold": False,
        "lot_name": "Ongole Premium Lot 14",
        "created_at": datetime.utcnow().isoformat()
    },
    {
        "id": "2",
        "godown_id": "godown_2",
        "godown_name": "Godown 2 (Kishangarh Bypass Gallery)",
        "block_number": "SBG-BLK-102",
        "title": "Statuario Extra White Italian Marble",
        "category": "Italian Marble",
        "image_url": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
        "length": 9.5,
        "width": 5.5,
        "unit": "feet",
        "pieces": 28,
        "total_sq_ft": 1463.0,
        "total_sq_meters": 135.91,
        "thickness_mm": 18,
        "finish": "Polished",
        "price_per_sq_ft": 750.0,
        "is_sold": False,
        "lot_name": "Carrara Direct Import 08",
        "created_at": datetime.utcnow().isoformat()
    },
    {
        "id": "3",
        "godown_id": "godown_3",
        "godown_name": "Godown 3 (Makrana Highway Yard)",
        "block_number": "SBG-BLK-103",
        "title": "Makrana Pure White Albeta Marble",
        "category": "Indian Marble",
        "image_url": "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80",
        "length": 8.0,
        "width": 4.5,
        "unit": "feet",
        "pieces": 60,
        "total_sq_ft": 2160.0,
        "total_sq_meters": 200.67,
        "thickness_mm": 16,
        "finish": "Polished",
        "price_per_sq_ft": 320.0,
        "is_sold": False,
        "lot_name": "Makrana Dungri Lot 03",
        "created_at": datetime.utcnow().isoformat()
    }
]

MOCK_ANNOUNCEMENTS = [
    {
        "id": "a1",
        "title": "New Ongole Black Galaxy Slabs Unloaded",
        "message": "Over 25,000 Sq.Ft fresh premium export quality Black Galaxy Granite lot now available at Godown 1.",
        "type": "arrival",
        "is_active": True
    },
    {
        "id": "a2",
        "title": "Direct Factory Discount on Makrana Albeta",
        "message": "Special trade discount of ₹25/sq.ft for full truckload dispatch this month.",
        "type": "offer",
        "is_active": True
    }
]

MOCK_QUERIES = []
MOCK_TRASH = []

STAFF_USERS = {
    "admin": {"password": "Shayam@123", "role": "admin", "name": "Shayam (Super Admin)", "godown_id": None},
    "Shayam": {"password": "Shayam@123", "role": "admin", "name": "Shayam (Super Admin)", "godown_id": None},
    "manager1": {"password": "Shayam@123", "role": "manager_godown_1", "name": "Yard Manager 1", "godown_id": "godown_1"},
    "manager2": {"password": "Shayam@123", "role": "manager_godown_2", "name": "Yard Manager 2", "godown_id": "godown_2"},
    "manager3": {"password": "Shayam@123", "role": "manager_godown_3", "name": "Yard Manager 3", "godown_id": "godown_3"},
}


# ==============================================================================
# 🌐 WEB PAGE ROUTES
# ==============================================================================

@app.route("/")
def index():
    """Customer Catalog & Showroom Page"""
    return render_template("index.html")

@app.route("/admin")
@app.route("/staff")
def admin_page():
    """Staff & Admin ERP Dashboard Page"""
    return render_template("admin.html")


# ==============================================================================
# 📡 REST API ENDPOINTS (SUPABASE INTEGRATED)
# ==============================================================================

@app.route("/api/slabs", methods=["GET"])
def get_slabs():
    """Fetch all available slabs from Supabase (or fallback)"""
    if supabase:
        try:
            response = supabase.table("slabs").select("*").order("created_at", desc=True).execute()
            return jsonify(response.data)
        except Exception as e:
            print(f"Error fetching slabs from Supabase: {e}")
    return jsonify(MOCK_SLABS)


@app.route("/api/announcements", methods=["GET"])
def get_announcements():
    """Fetch active yard announcements"""
    if supabase:
        try:
            response = supabase.table("announcements").select("*").eq("is_active", True).execute()
            return jsonify(response.data)
        except Exception as e:
            print(f"Error fetching announcements from Supabase: {e}")
    return jsonify(MOCK_ANNOUNCEMENTS)


@app.route("/api/enquiry", methods=["POST"])
def submit_enquiry():
    """Submit a customer enquiry into Supabase"""
    data = request.json or {}
    new_query = {
        "order_number": f"SBG-ORD-{datetime.utcnow().strftime('%y%m%d')}-{len(MOCK_QUERIES)+1:03d}",
        "client_name": data.get("client_name", "Customer"),
        "mobile_number": data.get("mobile_number", ""),
        "delivery_address": data.get("delivery_address", ""),
        "preferred_godown": data.get("preferred_godown", "any"),
        "requirement": data.get("requirement", ""),
        "dimension_unit": data.get("dimension_unit", "feet"),
        "requested_quantity_sq_ft": float(data.get("requested_quantity_sq_ft", 0)),
        "selected_slab_ids": data.get("selected_slab_ids", []),
        "total_estimated_cost": float(data.get("total_estimated_cost", 0)),
        "status": "Pending",
        "created_at": datetime.utcnow().isoformat()
    }

    if supabase:
        try:
            res = supabase.table("customer_queries").insert(new_query).execute()
            return jsonify({"status": "success", "data": res.data}), 201
        except Exception as e:
            print(f"Error inserting enquiry to Supabase: {e}")

    MOCK_QUERIES.insert(0, new_query)
    return jsonify({"status": "success", "data": [new_query]}), 201


@app.route("/api/admin/login", methods=["POST"])
def admin_login():
    """Authenticate staff / admin"""
    data = request.json or {}
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()

    user = STAFF_USERS.get(username)
    if user and user["password"] == password:
        session["user"] = {
            "username": username,
            "role": user["role"],
            "name": user["name"],
            "godown_id": user["godown_id"]
        }
        return jsonify({"status": "success", "user": session["user"]})

    return jsonify({"status": "error", "message": "Invalid username or password"}), 401


@app.route("/api/admin/session", methods=["GET"])
def check_session():
    """Get active staff session"""
    return jsonify({"user": session.get("user")})


@app.route("/api/admin/logout", methods=["POST"])
def admin_logout():
    """Clear staff session"""
    session.pop("user", None)
    return jsonify({"status": "success"})


@app.route("/api/admin/slabs", methods=["POST"])
def add_slab():
    """Add a new marble/granite slab to Supabase"""
    data = request.json or {}
    length = float(data.get("length", 0))
    width = float(data.get("width", 0))
    pieces = int(data.get("pieces", 1))
    unit = data.get("unit", "feet")

    # Calculate total sq ft
    sq_ft_per_piece = length * width
    if unit == "inches":
        sq_ft_per_piece = (length * width) / 144.0
    elif unit == "meters":
        sq_ft_per_piece = (length * width) * 10.7639
    elif unit == "centimeters":
        sq_ft_per_piece = (length * width) / 929.03

    total_sq_ft = round(sq_ft_per_piece * pieces, 2)
    total_sq_meters = round(total_sq_ft * 0.092903, 2)

    new_slab = {
        "godown_id": data.get("godown_id", "godown_1"),
        "godown_name": data.get("godown_name", "Godown 1 (Industrial Area Yard)"),
        "block_number": data.get("block_number", f"SBG-BLK-{len(MOCK_SLABS)+101}"),
        "title": data.get("title", "Premium Slab"),
        "category": data.get("category", "Granite"),
        "image_url": data.get("image_url", "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"),
        "length": length,
        "width": width,
        "unit": unit,
        "pieces": pieces,
        "total_sq_ft": total_sq_ft,
        "total_sq_meters": total_sq_meters,
        "thickness_mm": int(data.get("thickness_mm", 18)),
        "finish": data.get("finish", "Polished"),
        "price_per_sq_ft": float(data.get("price_per_sq_ft", 150)),
        "is_sold": bool(data.get("is_sold", False)),
        "lot_name": data.get("lot_name", ""),
        "created_at": datetime.utcnow().isoformat()
    }

    if supabase:
        try:
            res = supabase.table("slabs").insert(new_slab).execute()
            return jsonify({"status": "success", "data": res.data}), 201
        except Exception as e:
            print(f"Error inserting slab to Supabase: {e}")

    new_slab["id"] = str(len(MOCK_SLABS) + 1)
    MOCK_SLABS.insert(0, new_slab)
    return jsonify({"status": "success", "data": [new_slab]}), 201


@app.route("/api/admin/slabs/<slab_id>", methods=["PUT", "DELETE"])
def update_or_delete_slab(slab_id):
    """Update or Soft-Delete slab"""
    if request.method == "PUT":
        data = request.json or {}
        if supabase:
            try:
                res = supabase.table("slabs").update(data).eq("id", slab_id).execute()
                return jsonify({"status": "success", "data": res.data})
            except Exception as e:
                print(f"Error updating slab in Supabase: {e}")
        for s in MOCK_SLABS:
            if str(s.get("id")) == str(slab_id):
                s.update(data)
                return jsonify({"status": "success", "data": [s]})

    elif request.method == "DELETE":
        # Move to Trash (7-day recovery)
        slab_to_delete = None
        for s in MOCK_SLABS:
            if str(s.get("id")) == str(slab_id):
                slab_to_delete = s
                break

        if supabase:
            try:
                # Get slab data first
                s_res = supabase.table("slabs").select("*").eq("id", slab_id).execute()
                if s_res.data:
                    slab_data = s_res.data[0]
                    # Insert into trash
                    supabase.table("trash_items").insert({
                        "slab_id": slab_id,
                        "slab_data": slab_data,
                        "deleted_at": datetime.utcnow().isoformat(),
                        "deleted_by": session.get("user", {}).get("username", "admin"),
                        "expires_at": (datetime.utcnow() + timedelta(days=7)).isoformat()
                    }).execute()
                    # Delete from slabs
                    supabase.table("slabs").delete().eq("id", slab_id).execute()
                    return jsonify({"status": "success"})
            except Exception as e:
                print(f"Error deleting slab from Supabase: {e}")

        if slab_to_delete:
            MOCK_SLABS.remove(slab_to_delete)
            MOCK_TRASH.insert(0, {
                "id": str(len(MOCK_TRASH)+1),
                "slab_id": slab_id,
                "slab_data": slab_to_delete,
                "deleted_at": datetime.utcnow().isoformat(),
                "expires_at": (datetime.utcnow() + timedelta(days=7)).isoformat()
            })
        return jsonify({"status": "success"})


@app.route("/api/admin/queries", methods=["GET"])
def get_admin_queries():
    """Fetch customer enquiries for ERP dashboard"""
    if supabase:
        try:
            res = supabase.table("customer_queries").select("*").order("created_at", desc=True).execute()
            return jsonify(res.data)
        except Exception as e:
            print(f"Error fetching queries from Supabase: {e}")
    return jsonify(MOCK_QUERIES)


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
