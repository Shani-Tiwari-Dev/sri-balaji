import sys
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import router

app = FastAPI(
    title="Sri Balaji Granites & Marbles API",
    description="Python FastAPI Backend for Inventory Management, Area/Rate Calculations, Order Processing & Analytics",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for all origins (or React frontend origin)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routes
app.include_router(router)

@app.get("/")
def read_root():
    return {
        "app": "Sri Balaji Granites & Marbles Python Backend",
        "status": "Online",
        "documentation": "/docs",
        "endpoints": [
            "/api/stock",
            "/api/calculate",
            "/api/queries",
            "/api/announcements",
            "/api/auth/login",
            "/api/trash",
            "/api/export/csv",
            "/api/whatsapp/link"
        ]
    }

if __name__ == "__main__":
    print("Starting Sri Balaji Granites Python FastAPI Server on http://0.0.0.0:8000...")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
