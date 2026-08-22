# GlobeTrotter — Indian Localization, INR Currency, IST Time, Custom Photo Upload & Interactive India Map

This plan transforms GlobeTrotter into an authentic, rich Indian travel planning ecosystem with Indian Rupee (₹) currency, Indian Standard Time (IST) formatting, direct personal photo file uploading from the user's PC, top Indian tourist destinations and itineraries, and a responsive interactive India Tourism Map.

---

## User Review Required

> [!IMPORTANT]
> **Key Enhancements**:
> 1. **Currency**: All monetary values across every screen, budget calculation, activity costs, target budgets, and charts will use Indian Rupee (**₹**) formatted with Indian numbering (`en-IN`, e.g., ₹2,50,000).
> 2. **Time & Dates**: All dates and time stamps formatted for Indian Standard Time (IST / Asia/Kolkata) in `DD MMM YYYY` format (e.g., `22 Aug 2026`).
> 3. **Custom Photo Upload**: Support direct file selection from your device (`<input type="file">` + base64 `FileReader`) in Profile and Registration, allowing you to upload your own picture from your computer!
> 4. **Interactive India Tourism Map**: High-detail interactive SVG/Pin map of India showcasing famous tourist regions (North, West, South, East, Islands) with clickable pins for instant trip planning.
> 5. **Indian Catalog & Seed Data**: Authentic Indian destinations (Goa, Jaipur, Kerala, Manali, Ladakh, Varanasi, Udaipur, Rishikesh, Mumbai, Agra, Hampi, Andaman) with real INR costs, activities, and pre-built Indian itineraries.

---

## Proposed Changes

### 1. Database & Seed Data (`backend/`)

#### [MODIFY] [seed.js](file:///C:/Users/01/.gemini/antigravity/scratch/globetrotter/backend/src/database/seed.js)
- Populate top Indian cities: Goa, Jaipur, Manali, Alleppey (Kerala), Munnar, Varanasi, Leh (Ladakh), Mumbai, Udaipur, Rishikesh, Agra, Andaman, Hampi.
- Populate authentic Indian activities in INR (e.g., Houseboat stay in Alleppey: ₹8,500, Scuba diving in Goa: ₹2,500, Desert safari & camp in Jaisalmer: ₹3,500, Ganga Aarti VIP boat in Varanasi: ₹600, Amber Fort & Elephant ride in Jaipur: ₹800, Taj Mahal sunrise guided tour: ₹500, etc.).
- Pre-built Indian demo trips:
  - *"Royal Rajasthan Heritage Trail"* (Jaipur, Udaipur, Jodhpur)
  - *"God's Own Country: Kerala Backwaters & Tea Gardens"* (Munnar, Alleppey, Kochi)
  - *"Himalayan Adventure: Manali & Leh Ladakh"* (Manali, Leh, Nubra Valley)
- Indian Demo Users:
  - Traveler: `rahul@globetrotter.in` / `Rahul@123`
  - Admin: `priya@globetrotter.in` / `Priya@123`

---

### 2. Frontend Utilities & Components (`frontend/`)

#### [NEW] [formatters.js](file:///C:/Users/01/.gemini/antigravity/scratch/globetrotter/frontend/src/utils/formatters.js)
- `formatINR(amount)`: Formats numbers as `₹1,50,000` using `Intl.NumberFormat('en-IN')`.
- `formatISTDate(dateString)`: Formats dates according to Indian Standard Time conventions (`DD MMM YYYY`).
- `formatISTTime(timeString)`: Formats 12-hour AM/PM IST time.

#### [NEW] [IndiaMap.jsx](file:///C:/Users/01/.gemini/antigravity/scratch/globetrotter/frontend/src/components/common/IndiaMap.jsx)
- Interactive India Map component featuring Indian states, regional zones (North Himalayas, Golden Triangle, Western Ghats & Beaches, Southern Backwaters, Cultural East), and interactive hotspots with live tooltips (name, state, average cost in ₹, top activities, and "+ Plan Trip Here" action).

#### [MODIFY] [Profile.jsx](file:///C:/Users/01/.gemini/antigravity/scratch/globetrotter/frontend/src/pages/Profile.jsx)
- Add direct image file uploader with file dialog (`Choose from Computer`), instant circular preview, image compression/resizing, and profile save.
- Display all trips and stats with INR (`₹`) and IST date formatting.

#### [MODIFY] [Register.jsx](file:///C:/Users/01/.gemini/antigravity/scratch/globetrotter/frontend/src/pages/Register.jsx)
- Add "Upload Your Own Photo" file picker button in addition to Indian traveler avatars.

#### [MODIFY] [Dashboard.jsx](file:///C:/Users/01/.gemini/antigravity/scratch/globetrotter/frontend/src/pages/Dashboard.jsx)
- Embed the Interactive India Map section.
- Top Regional Indian Selections (Goa, Jaipur, Manali, Kerala, Ladakh).
- Show INR currency throughout.

#### [MODIFY] [CreateTrip.jsx](file:///C:/Users/01/.gemini/antigravity/scratch/globetrotter/frontend/src/pages/CreateTrip.jsx)
- Place picker updated with Indian cities and suggested activities in INR.

#### [MODIFY] [BuildItinerary.jsx](file:///C:/Users/01/.gemini/antigravity/scratch/globetrotter/frontend/src/pages/BuildItinerary.jsx)
- Update section budget inputs, activity creation, and display in INR (`₹`).

#### [MODIFY] [ItineraryView.jsx](file:///C:/Users/01/.gemini/antigravity/scratch/globetrotter/frontend/src/pages/ItineraryView.jsx)
- Update timeline, expense boxes, and Recharts pie/bar charts with `formatINR`.
- Overbudget alert formatted in ₹.

#### [MODIFY] [MyTrips.jsx](file:///C:/Users/01/.gemini/antigravity/scratch/globetrotter/frontend/src/pages/MyTrips.jsx), [SearchExplore.jsx](file:///C:/Users/01/.gemini/antigravity/scratch/globetrotter/frontend/src/pages/SearchExplore.jsx), [AdminPanel.jsx](file:///C:/Users/01/.gemini/antigravity/scratch/globetrotter/frontend/src/pages/AdminPanel.jsx), [PublicTripView.jsx](file:///C:/Users/01/.gemini/antigravity/scratch/globetrotter/frontend/src/pages/PublicTripView.jsx), [Login.jsx](file:///C:/Users/01/.gemini/antigravity/scratch/globetrotter/frontend/src/pages/Login.jsx)
- Update currencies, demo buttons (`rahul@globetrotter.in` & `priya@globetrotter.in`), and price filters in INR (`₹0 - ₹2,000`, `₹2,000 - ₹10,000`, `₹10,000+`).

---

## Verification Plan

### Automated & API Verification
1. Run backend database re-seeding with Indian catalog: `node src/database/seed.js`.
2. Run backend test suite: verify all endpoints return Indian destinations and INR figures.
3. Test photo upload payload persistence (base64 data URL) in `/api/users/me`.

### Manual Browser Verification
1. Open `http://localhost:3000`.
2. Check Dashboard: verify Indian hero imagery, **Interactive India Map** with clickable destination pins, and Top 5 Indian Regional Selections in `₹`.
3. Check Profile: click "Upload Photo" -> pick an image from local PC -> verify instant preview and save.
4. Check Create Trip: select "Goa" or "Jaipur", verify suggested Indian activities in `₹`.
5. Check Itinerary View & Budget: verify Day timeline, connecting arrows, and Recharts budget graph with `₹` formatting.
6. Check Public Shared View: verify Indian itinerary with `₹` and social share buttons.
