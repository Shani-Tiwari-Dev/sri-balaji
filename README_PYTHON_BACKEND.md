# Sri Balaji Granites & Marbles - Python Backend API

FastAPI-based Python backend for **Sri Balaji Granites & Marbles** inventory management, stone slab area calculation, rate unit conversions, customer query tracking, and export reporting.

---

## 🚀 Features

- **FastAPI Framework**: High-performance, asynchronous REST API with auto-generated Swagger UI (`/docs`).
- **Slab Area & Rate Calculation Engine**: Automatically calculates Sq.Ft, Sq.Meters, and Sq.Cm based on length, width, unit (meters, cm, feet, inches), and pieces.
- **Multi-Godown Inventory Management**: Filter, create, update, and soft-delete slab inventory across Bangalore Yard, Chittoor Factory, and Vishakapatnam Port Yard.
- **7-Day Trash Auto-Purge**: Soft-deleted inventory items are stored in a trash bin with auto-expiry.
- **Customer Inquiry & WhatsApp Link Generator**: Automatically generates formatted WhatsApp messages for instant customer rate quotes.
- **CSV Stock Report Export**: Dynamic downloadable stock report in `.csv` format.
- **Multi-Role Authentication**: Super Admin (`Shayam`) and Yard Manager endpoints.

---

## 🛠️ How to Run locally with Python

### 1. Install Dependencies

```bash
cd python_backend
pip install -r requirements.txt
```

### 2. Start the FastAPI Server

```bash
python main.py
```

*or with uvicorn:*

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

---

## 📖 API Documentation & Interactive Testing

Once the server is running, visit:
- **Interactive Swagger UI**: `http://localhost:8000/docs`
- **ReDoc Documentation**: `http://localhost:8000/redoc`

---

## 🔌 API Endpoints Summary

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | API Root Status & Docs link |
| `GET` | `/api/health` | Health Check |
| `POST` | `/api/auth/login` | Admin & Manager Login Authentication |
| `GET` | `/api/stock` | Get all slab inventory (filter by `godownId`) |
| `POST` | `/api/stock` | Add new granite/marble block stock |
| `PUT` | `/api/stock/{id}` | Update existing stock details |
| `DELETE` | `/api/stock/{id}` | Soft delete slab to 7-day Trash Bin |
| `POST` | `/api/calculate` | Compute Sq.Ft, Sq.Meters, Sq.Cm & Rate conversions |
| `GET` | `/api/queries` | List customer order queries |
| `POST` | `/api/queries` | Submit new customer query |
| `GET` | `/api/announcements` | Fetch active promotional banners |
| `GET` | `/api/trash` | View soft-deleted trash items |
| `POST` | `/api/trash/restore/{id}` | Restore slab back to active stock |
| `POST` | `/api/whatsapp/link` | Generate WhatsApp rate inquiry link |
| `GET` | `/api/export/csv` | Download stock inventory report in CSV format |

---

## 🔐 Credentials Summary

- **Super Admin**: Username: `Shayam` | Password: `Shayam@123`
- **Manager Godown 1**: Username: `manager_g1` | Password: `G1@123`
- **Manager Godown 2**: Username: `manager_g2` | Password: `G2@123`
- **Manager Godown 3**: Username: `manager_g3` | Password: `G3@123`
