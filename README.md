# Spotter ELD Trip Planner

A full-stack logistics planning application that generates **route plans, driver schedules, and ELD-style daily log sheets** from simple trip inputs.

This project was built for the Spotter AI Full Stack Engineer assessment. The goal was to design a system that takes trip details and automatically produces a **compliant driver schedule and electronic logbook records**, similar to what modern trucking platforms provide to drivers and dispatchers.

The application combines a **Django backend** that performs routing and scheduling with a **React + Material UI frontend** that visualizes the trip, schedule, and log sheets.

---

# Features

### Trip Planning
Users enter:

- Current location  
- Pickup location  
- Dropoff location  
- Current cycle usage (hours used in the driver's 70-hour cycle)

The system then:

1. Geocodes the locations  
2. Generates a driving route  
3. Calculates distance and estimated driving time  
4. Builds a driver schedule that respects Hours-of-Service rules  

---

### Hours-of-Service Compliance

The scheduler models core FMCSA rules for property-carrying drivers:

- Maximum **11 hours driving** per duty period  
- **14 hour duty window**  
- **30 minute break after 8 hours of driving**  
- **10 hour off-duty reset**  
- **70 hour / 8 day cycle tracking**

Additional planning assumptions:

- Pickup duration: **1 hour**  
- Dropoff duration: **1 hour**  
- Fueling at least **once every 1000 miles**

The application inserts breaks, fuel stops, and rest periods automatically.

---

### Route Visualization

The results page displays:

- Interactive route map
- Start / pickup / dropoff markers
- Break and fuel stops
- Route distance and duration

The map automatically adjusts to show the entire trip.

---

### Driver Schedule Timeline

The trip is converted into a chronological schedule including:

- Driving segments
- Pickup and dropoff work
- Rest breaks
- Fuel stops
- Sleeper berth time

Each event includes:

- Start time
- End time
- Duty status
- Location
- Duration

This provides a clear operational view of the entire trip plan.

---

### ELD Daily Log Sheets

The system converts the timeline into **ELD-style log sheets**.

Each log sheet contains:

- A 24-hour grid
- Four duty status rows  
  - Off Duty  
  - Sleeper Berth  
  - Driving  
  - On Duty (Not Driving)
- Visual duty segments
- Daily totals
- Remarks for status changes
- Miles driven

These logs are automatically generated from the schedule.

---

### PDF Export

All generated log sheets can be exported as a **multi-page PDF**.  
Each page contains a printable logbook format suitable for review or record keeping.

---

# Tech Stack

**Frontend**

- React
- TypeScript
- Material UI
- Leaflet (map rendering)

**Backend**

- Django
- Django REST Framework
- OpenRouteService (routing)
- OpenStreetMap Nominatim (geocoding)
- ReportLab (PDF generation)

---

# Project Structure

```

spotter-eld/
backend/
config/
trip/
api/
services/
frontend/
src/
components/
pages/
api/
types/

```

Backend services handle routing, scheduling, log generation, and PDF export, while the frontend provides a dashboard interface for trip planning and visualization.

---

# Running the Project

## Backend

```

cd backend
python -m venv .venv
..venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

```

Backend runs at:

```

[http://localhost:8000](http://localhost:8000)

```

Create a `.env` file in the backend folder:

```

ORS_API_KEY=your_openrouteservice_key
DJANGO_DEBUG=1
FRONTEND_ORIGIN=[http://localhost:5173](http://localhost:5173)

```

---

## Frontend

```

cd frontend
npm install
npm run dev

```

Frontend runs at:

```

[http://localhost:5173](http://localhost:5173)

```

Create `.env` in the frontend folder:

```

VITE_API_BASE=[http://localhost:8000](http://localhost:8000)

```

---

# API Endpoints

### Health Check
```

GET /api/health

```

### Plan Trip
```

POST /api/plan-trip

```

Input example:

```

{
"currentLocation": "Chicago, IL",
"pickupLocation": "Milwaukee, WI",
"dropoffLocation": "Indianapolis, IN",
"cycleUsedHours": 12
}

```

Returns route information, stops, schedule events, and daily logs.

### Generate Logs PDF
```

POST /api/logs-pdf

```

Returns a downloadable PDF containing all generated log sheets.

---

# Design Notes

This project focuses on demonstrating:

- Routing integration
- Hours-of-Service scheduling logic
- Driver logbook generation
- Full-stack application design
- Clean, modular service architecture

The backend is intentionally stateless and computes trip plans dynamically without storing them in a database.

