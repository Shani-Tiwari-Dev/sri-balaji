# 🏛️ Sri Balaji Granites - Python + HTML/CSS + Supabase Edition

Complete Python (Flask) web application with pure HTML, CSS, JavaScript, and **Supabase (PostgreSQL Cloud Database)** backend integration for **Sri Balaji Granites & Marbles (Kishangarh)**.

---

## 📁 Project Structure

```text
python_supabase_project/
├── app.py                      # Flask backend with Supabase API integration
├── requirements.txt            # Python dependencies (flask, supabase, etc.)
├── .env.example                # Supabase URL & Key configuration
├── supabase_schema.sql         # Ready-to-run Supabase PostgreSQL tables & RLS
├── templates/
│   ├── index.html              # Customer Showroom & Quotation portal
│   └── admin.html              # Staff & Admin ERP Dashboard
└── static/
    ├── css/
    │   └── style.css           # Custom CSS styles
    └── js/
        ├── main.js             # Public showroom logic & WhatsApp quote
        └── admin.js            # ERP management, Supabase sync, Calculator
```

---

## ⚡ How to Setup Supabase Database (100% Free)

1. Go to [https://supabase.com](https://supabase.com) and create a free project (e.g., `sri-balaji-granites`).
2. Open **SQL Editor** in your Supabase Dashboard.
3. Open the file `supabase_schema.sql`, copy all SQL code, paste it into the Supabase SQL editor, and click **RUN**.
   - This creates all 4 tables: `slabs`, `customer_queries`, `trash_items`, `announcements`.
4. Go to **Project Settings ➔ API** in Supabase, and copy:
   - **Project URL**
   - **anon / service_role API Key**

---

## 🚀 How to Run Locally

1. Open your terminal inside this folder:
```bash
cd python_supabase_project
```

2. Create virtual environment & install requirements:
```bash
python3 -m venv venv
source venv/bin/activate    # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. Setup your `.env` file:
```bash
cp .env.example .env
```
Edit `.env` and paste your `SUPABASE_URL` and `SUPABASE_KEY`.

4. Start the Python server:
```bash
python app.py
```
Open **http://localhost:5000** in your browser!

---

## 🔑 Default Staff & Admin Logins

- **Super Admin**: Username `admin` / Password `Shayam@123`
- **Yard Manager 1**: Username `manager1` / Password `Shayam@123`
- **Yard Manager 2**: Username `manager2` / Password `Shayam@123`
- **Yard Manager 3**: Username `manager3` / Password `Shayam@123`

---

## 🌐 Deploy to Vercel / Render / Railway

- **Vercel**: Deploy with Python runtime enabled.
- **Render.com / Railway**: Create a Web Service, set build command to `pip install -r requirements.txt` and start command to `gunicorn app:app`. Set environment variables `SUPABASE_URL` and `SUPABASE_KEY`.
