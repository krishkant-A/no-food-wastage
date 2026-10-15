# No_Food_Wastage 🍲
### Hyperlocal Surplus Meal Tracking & Verified Redistribution Platform

**No_Food_Wastage** is a full-stack, real-time application connecting **Commercial Food Donors** (banquet halls, caterers, restaurants, bakeries), **Volunteer Couriers**, and **Beneficiary Shelters & NGOs** to eliminate edible food waste through rapid, verified hyperlocal redistribution.

---

## 🌟 Key Features

### 1. 📍 Hyperlocal Radar & Real-Time OpenStreetMap
- **Proximity Filtering**: Filter surplus meals by radius (2 km, 5 km, 10 km, 20 km) with live Haversine distance calculations.
- **Dynamic Urgency Countdown**: Color-coded freshness pins on the map:
  - 🔴 **Critical (< 1.5 hours)**: Urgent rescue needed before safe consumption expiration.
  - 🟡 **High Priority (1.5 - 4 hours)**: Standard cooked food batch.
  - 🟢 **Extended Window (> 4 hours)**: Bakery goods, fresh produce, and ambient items.
- **Visual Delivery Corridors**: Dashed route lines between donors and target shelters when a rescue is underway.

### 2. 👨‍🍳 Commercial Donor Portal
- **Surplus Intake Wizard**: Fast listing form with one-click presets (*Banquet Feast*, *Bakery Bread*, *Organic Bowls*).
- **Food Safety Specs**: Dietary tags (*Pure Veg*, *Vegan*, *Non-Veg*, *Jain*), thermal storage conditions (*Hot Insulated >60°C*, *Chilled <4°C*, *Ambient*), allergens, weight (kg), and portions.
- **Secure Handover OTP**: Displays an authenticated 4-digit PIN to present to the courier on physical collection.

### 3. 🛵 Volunteer Courier Dispatch Hub
- **Claim & Route**: Reserve available surplus meals and assign destination shelters with one click.
- **Step 1: Physical Pickup Verification**: 4-digit OTP entry keypad ensures only verified couriers receive the food from donors.
- **Step 2: Drop-off Confirmation**: Complete delivery with arrival notes, awarding volunteer badges and karma points.

### 4. 🏠 Beneficiary / NGO Shelter Hub
- **Capacity & Needs Tracker**: Monitor shelter occupancy and incoming deliveries with estimated ETAs.
- **Broadcast Demands**: Post specific meal requests (e.g., *"Dinner needed for 50 night shelter residents"*) to guide donor distributions.

### 5. 📊 Environmental & Community Impact Analytics
- **Live Counter Metrics**:
  - Total Meals Rescued
  - Kilograms of Food Diverted from Landfills
  - Greenhouse Gas Emissions Averted (calculated via EPA conversion: ~2.5 kg CO₂e per kg food saved)
  - Virtual Water Conserved (~1,000 L water footprint per kg food)
- **Donor & Courier Leaderboards**: Celebrating top contributors.
- **Verified Audit Trail**: Transparent log of all completed distributions.

---

## 🚀 Running the Project

### Prerequisites
- Node.js LTS (v18+ or v24+) installed.

### Fast Launch (Both Backend & Frontend)
From the root directory (`C:\Users\LENOVO\.gemini\antigravity\scratch\no-food-wastage`):

```bash
npm run dev
```

Or run the services individually:

```bash
# Terminal 1: Start Express API server (Port 5000)
npm run server

# Terminal 2: Start Vite React Frontend (Port 3000)
npm run client
```

Open your browser at: **[http://localhost:3000](http://localhost:3000)**

---

## 📂 Project Architecture

```
no-food-wastage/
├── package.json              # Unified dev scripts using concurrently
├── README.md
├── server/                   # Backend Node.js & Express API
│   ├── package.json
│   ├── server.js             # Express REST API + Server-Sent Events (SSE)
│   ├── db.js                 # ACID-safe JSON database + Haversine distance engine
│   └── data/
│       └── db.json           # Persisted state & realistic demo dataset
└── client/                   # Frontend React + Vite + Tailwind CSS
    ├── index.html
    ├── vite.config.js        # Tailwind v4 plugin + API reverse proxy
    ├── package.json
    └── src/
        ├── App.jsx           # Main coordinator & tab switcher
        ├── index.css         # Tailwind v4 & Leaflet custom map markers
        ├── components/
        │   ├── Navbar.jsx           # Header, role switcher & live sync indicator
        │   ├── HyperlocalMap.jsx    # Interactive Leaflet OpenStreetMap with divIcons
        │   ├── DonorPortal.jsx      # Surplus meal posting & OTP display
        │   ├── VolunteerHub.jsx     # Radar feed, pickup verification & drop-off
        │   ├── NgoManager.jsx       # Shelter occupancy & meal demand broadcaster
        │   ├── ImpactDashboard.jsx  # Impact statistics, charts & audit logs
        │   ├── ClaimModal.jsx       # Courier & destination assignment modal
        │   └── OtpModal.jsx         # 4-digit PIN verification modal
        ├── services/
        │   └── api.js        # REST client & SSE real-time stream listener
        └── utils/
            └── helpers.js    # Countdown timers, badges & formatting
```
