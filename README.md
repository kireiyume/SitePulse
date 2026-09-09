# SitePulse

**SitePulse** is a map-centric infrastructure operations workspace built as a **Web GIS / Mapbox portfolio project**.

It is designed to demonstrate practical GIS application development beyond basic map markers: GeoJSON rendering, clustering, synchronized map/business UI, filtering, spatial analysis, vector/raster layers, geocoding, measurement, and export workflows.

> **Portfolio goal:** build a polished, production-style Mapbox application for infrastructure monitoring, field operations, asset tracking, and location intelligence.

**Live Demo:** https://sitepulse.20241210.xyz/

---

## Overview

SitePulse uses a three-panel workspace with the map as the primary product surface:

```text
┌─────────────────┬──────────────────────────────────────┬───────────────────┐
│                 │              Top Toolbar             │                   │
│                 ├──────────────────────────────────────┤                   │
│                 │              KPI Strip               │                   │
│   Site Panel    ├──────────────────────────────────────┤   Detail Panel    │
│                 │                                      │                   │
│                 │               Map                    │                   │
│                 │                                      │                   │
└─────────────────┴──────────────────────────────────────┴───────────────────┘
```

Typical use cases:

- Infrastructure site monitoring
- Utility / substation management
- Field operations
- Asset tracking
- Regional operations overview
- Project status visualization
- Location intelligence

---

## Core Features

### Map / List / Detail Synchronization

The site list, Mapbox features, and detail panel share the same selected-site state.

```text
Site List
   ↓
selectedSiteId
   ↓
Map flyTo
   ↓
Selected Map Feature
   ↓
Detail Panel
```

Clicking a map feature also updates the list selection, scrolls the corresponding item into view, and refreshes the detail panel.

### GeoJSON + Clustering

- Native Mapbox GeoJSON sources and layers
- Status-based point styling
- Cluster circles and counts
- Click-to-zoom clusters
- Hover and selected-feature states

### Vector Layers

- Site point layer
- Connection / network LineString layer
- Operational / service area Polygon layer
- Layer visibility controls

### Filters + KPI Synchronization

Filters update the map, site list, result count, and KPI strip together.

- Site search
- Status filter
- Region filter
- Activity date filter
- Visible map area filter

### Map Styles

- Light
- Dark
- Satellite

---

## V1.1 GIS Capabilities

SitePulse V1.1 expands the project from a polished Mapbox interface into a lightweight interactive GIS workspace.

### Spatial Selection

Select infrastructure sites with polygon / box geometry and evaluate matching features client-side with Turf.js.

```text
Draw Area
   ↓
Find Sites Inside Geometry
   ↓
Update Analysis Selection
   ↓
Show Site Count / Status Summary
```

### Nearby / Buffer Analysis

Run proximity analysis around a selected site using configurable search distances.

```text
Selected Site
   ↓
25 / 50 / 100 km Radius
   ↓
Turf.js Analysis
   ↓
Nearby Site Results
```

### Measurement

- Distance measurement
- Area measurement
- Temporary measurement geometry
- Clear / reset analysis state

### Location Search / Geocoding

The top toolbar searches geographic locations independently from the business-record search in the left panel.

```text
Site Search      → Search SitePulse records
Location Search  → Search real-world locations and move the map
```

### Search This Area

Use the current Mapbox viewport as a spatial filter after panning or zooming.

```text
map.getBounds()
      ↓
Filter Sites by Bounding Box
      ↓
Update List + KPI + Map
```

### Raster / Tile Overlay

V1.1 supports a non-basemap raster/data layer with:

- Visibility control
- Opacity control
- Mixed vector/raster rendering

### Export

Filtered or spatially selected results can be exported as:

- CSV
- GeoJSON `FeatureCollection<Point>`

---

## Tech Stack

- **Next.js** — App Router
- **React**
- **TypeScript**
- **Mapbox GL JS**
- **Turf.js**
- **Tailwind CSS**
- **shadcn/ui**
- **Lucide React**

Optional supporting tools:

- Mapbox Search / Geocoding API
- ECharts
- Zustand
- TanStack Query

---

## Project Structure

```text
src/
├─ app/
│  ├─ globals.css
│  ├─ layout.tsx
│  └─ page.tsx
│
├─ components/
│  ├─ dashboard/
│  ├─ map/
│  ├─ sites/
│  └─ ui/
│
├─ data/
│  ├─ sites.ts
│  ├─ sites.geojson
│  ├─ routes.geojson
│  ├─ regions.geojson
│  └─ raster-layers.ts
│
├─ hooks/
├─ lib/
└─ types/
```

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/kireiyume/SitePulse.git
cd SitePulse
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Mapbox

Create `.env.local` and add your Mapbox public access token.

```env
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_public_access_token
```

> If your local implementation uses a different environment variable name, update this value accordingly.

### 4. Start the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## Design Principles

1. **The map is the product.**
2. Business UI supports spatial workflows rather than competing with the map.
3. GIS tools stay compact and task-oriented.
4. Only one analysis mode should be active at a time.
5. Temporary analysis geometry must be easy to clear.
6. Status is not communicated by color alone.
7. Desktop presentation quality is prioritized for portfolio screenshots and demo videos.

Visual hierarchy:

```text
Map
 ↓
Site Interaction
 ↓
Spatial Analysis
 ↓
Filters
 ↓
Selected Site Details
 ↓
Statistics
```

---

## V1.1 Roadmap

The V1.1 scope includes:

- [ ] Polygon / box spatial selection
- [ ] Nearby / buffer analysis
- [ ] Distance measurement
- [ ] Area measurement
- [ ] Location geocoding
- [ ] Search This Area
- [ ] Raster / tile overlay
- [ ] Raster opacity control
- [ ] CSV export
- [ ] GeoJSON export
- [ ] Analysis loading / empty / error states
- [ ] Final polish for 1440×900 and 1920×1080

Update this checklist as features are completed so the README always matches the live demo.

---

## Scope Boundary

SitePulse V1.1 intentionally stays focused on frontend Web GIS interaction. It does **not** require:

- Authentication
- Role-based access control
- User management
- CRUD administration screens
- PostgreSQL / PostGIS backend queries
- Redis
- ORM
- File-management backend
- Work-order backend
- Notification infrastructure
- Real-time WebSockets

Those capabilities are better suited to a separate full-stack / GeoOps portfolio project.

---

## Portfolio Focus

SitePulse is built to communicate one clear capability:

> **I can build polished, practical, production-style Web GIS applications with Mapbox — not just place markers on a map.**

The project highlights:

- Mapbox GL JS interaction
- GeoJSON layers
- Clustering
- Map / list / detail synchronization
- Filtering
- Spatial selection
- Proximity analysis
- Measurement
- Vector and raster layers
- Geocoding
- Data export
- B2B SaaS-style map UX

---

Built by **kireiyume** as a Web GIS / Mapbox portfolio project.
