# SitePulse — Design Specification V1.1

## 1. Project Overview

**Project Name:** SitePulse  
**Version:** V1.1  
**Project Type:** Mapbox / Web GIS Portfolio Project  
**Primary Goal:** Build a polished, map-centric infrastructure operations workspace suitable for an Upwork portfolio, with enough spatial interaction to demonstrate practical GIS capability rather than only map visualization.

This project is intentionally separate from a full-stack admin system. The focus is on **Mapbox GL JS interaction, geospatial visualization, map/list/detail synchronization, filtering, lightweight spatial analysis, vector/raster layer handling, and polished SaaS UI design**.

The application should feel like a real commercial B2B GIS product rather than a generic admin dashboard.

---

## 2. Product Positioning

SitePulse is an infrastructure monitoring workspace for visualizing distributed sites across a geographic region.

Typical use cases:

- Infrastructure site monitoring
- Utility / substation management
- Field operations
- Asset tracking
- Regional operations overview
- Project status visualization
- Location intelligence

Primary portfolio message:

> I can build production-style interactive Mapbox applications with GeoJSON layers, clustering, filtering, spatial overlays, spatial selection and measurement, raster layers, geocoding, export workflows, and synchronized business UI.

---

## 3. Core Design Principle

The **map is the primary workspace**.

Avoid:

- Large generic admin navigation menus
- Unrelated modules such as Settings, Reports, Teams, Documents, etc.
- Overly decorative "command center" styling
- Dense government-style dashboard visuals
- Excessive charts
- Back-office CRUD screens

The interface should be based on three clearly separated work areas:

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

### V1.1 Interaction Principle

V1.1 adds GIS tools without turning the screen into a desktop GIS clone.

Rules:

- Normal site selection remains the default interaction mode
- Only one analysis tool can be active at a time
- Temporary analysis geometry must be easy to clear
- Spatial tools appear as compact map controls, not as a new global navigation module
- Analysis results should reuse the existing site list / KPI / detail language where possible
- Prefer a few obvious GIS capabilities over a large toolbox of partially implemented controls

Priority order:

```text
Map + Site Synchronization
        ↓
Spatial Selection / Nearby
        ↓
Measurement
        ↓
Raster / Viewport Search / Export
```

---

## 4. Recommended Tech Stack

### Core

- Next.js
- App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Mapbox GL JS
- Turf.js
- Lucide React

### Optional

- Mapbox Search / Geocoding API for location search
- ECharts for small KPI trend charts
- Zustand if shared state becomes difficult with React state
- TanStack Query only if a real API is added later

### V1.1 Portfolio Version

Do **not** add:

- Authentication
- Database
- Redis
- ORM
- User management
- Real backend APIs

Use local mock data, GeoJSON, client-side Turf.js analysis, and public/demo-safe raster tiles. No application backend is required for V1.1.

---

## 5. Desktop Layout

Target desktop viewport:

```text
1440 × 900
1920 × 1080
```

The design should remain usable from approximately 1280 px width upward.

### Main Grid

Recommended dimensions:

```text
Left site panel:       290–310 px
Center map workspace:  flex: 1
Right detail panel:    320–350 px
```

Suggested implementation:

```tsx
<div className="flex h-screen w-full overflow-hidden bg-background">
  <aside className="w-[300px] shrink-0 border-r">
    {/* Site Panel */}
  </aside>

  <main className="min-w-0 flex-1">
    {/* Toolbar + KPI + Map */}
  </main>

  <aside className="w-[340px] shrink-0 border-l">
    {/* Site Detail */}
  </aside>
</div>
```

---

# 6. Left Panel — Site Workspace

The left panel is a **business panel**, not global navigation.

## Header

Display:

```text
SitePulse
Infrastructure Monitoring Workspace
```

Optional small logo:

- location pin
- pulse / activity
- abstract infrastructure icon

Use Lucide icons where possible.

---

## Search

A full-width site search field:

```text
Search sites...
```

Search by:

- Site name
- City
- County
- Region

---

## Status Filter Chips

Example:

```text
● Active 12
● Delayed 3
● Planned 3
```

Compact horizontal filter buttons.

Selected filters should have a subtle filled state.

---

## Result Summary

Example:

```text
18 sites shown                       Sort: Status
```

Do not make this visually dominant.

---

## Site List Item

Each item contains:

```text
● North Ridge Station
  King County, WA
```

Optional right chevron.

States:

### Default
- White / transparent background
- Light divider
- Status dot

### Hover
- Very light neutral or blue background
- Pointer cursor

### Selected
- Pale blue background
- Blue border or outline
- Stronger title color

Do not use oversized shadows.

---

## Suggested Site Data

Use approximately 30–50 sites internally so clustering is meaningful.

Example visible names:

- North Ridge Station
- Willamette Bridge
- Spokane Hub
- Boise Water Facility
- Blue Mountain Wind
- Columbia Substation
- Cascade Solar Farm
- Lewiston Pump Station
- East River Hub
- Delta Storage Yard
- Highland Pump Station

---

## Collapse Control

At the bottom:

```text
<< Collapse
```

Collapsing can reduce the panel to a narrow icon rail.

This is optional for V1.1.

---

# 7. Center Workspace

## Page Header

Title:

```text
Infrastructure Operations Map
```

No marketing hero section.

Keep it compact.

---

# 8. Top Toolbar

Toolbar should remain one line on desktop.

Recommended controls:

```text
Status: All
Region: All
Activity Date: May 1 – May 31
Map Style: Light
Layers
Search location...
```

The toolbar location search is intentionally different from the left-panel site search:

- Left panel: searches SitePulse business records
- Top toolbar: geocodes real-world place names and moves the map

Recommended order:

```text
[Status] [Region] [Activity Date] [Map Style] [Layers]     [Search location...]
```

`Activity Date` filters `SiteActivity` records. It must not exist as a decorative control with no data semantics. If activity filtering is deferred, hide the date control instead of showing a non-functional UI.

Use shadcn components:

- `Select`
- `Button`
- `DropdownMenu`
- `Popover`
- `Input`

Avoid giant filter bars.

---

# 9. KPI Strip

The KPI cards are secondary to the map.

Use a compact row. Default site-focused mode:

```text
Total Sites     Active       Completed       Delayed
18              12           3               3
100%            67%          17%             17%
```

When an `Activity Date` filter is active, one or two metrics may switch to activity-aware values, for example:

```text
Sites Shown     Inspections     Work Orders     Delayed
18              24              7               3
```

Do not add more cards just to expose every metric.

Each card can include:

- icon
- metric
- small percentage
- subtle accent ring/background

Recommended colors:

- Total: Blue
- Active: Green
- Completed: Cyan
- Delayed: Orange

Avoid large decorative charts unless needed.

---

# 10. Main Map

The map must take most of the center column height.

Recommended basemap:

```text
mapbox://styles/mapbox/light-v11
```

Initial region:

- Washington
- Oregon
- Idaho
- Pacific Northwest

Example center:

```ts
center: [-120.5, 45.8]
zoom: 5
```

---

## Map Layers

Use **Mapbox native GeoJSON sources and layers** instead of a large number of DOM markers.

Required portfolio features:

### Site Layer

GeoJSON Point source.

Render with:

```text
circle layer
```

or symbol layer.

Status colors:

```text
Active      Green
Delayed     Orange / Red
Planned     Purple
Completed   Blue / Cyan
```

---

## Clustering

Enable Mapbox clustering:

```ts
cluster: true
clusterRadius: 50
clusterMaxZoom: 14
```

Recommended layers:

```text
clusters
cluster-count
unclustered-point
```

Cluster size/color may vary by point count.

---

## Selected Site State

Selected point should visually stand out using:

- larger radius
- blue outer halo
- white outline
- label bubble

Example:

```text
North Ridge Station
```

Do not overuse glow effects.

---

## Hover State

On hover:

- cursor becomes pointer
- point radius slightly increases
- opacity / stroke changes
- optional lightweight tooltip

Prefer `feature-state` when appropriate.

---

# 11. Map Controls

Use Mapbox controls or custom controls.

Recommended navigation controls:

- Zoom +
- Zoom -
- Fit to results
- Layers
- Geolocate optional

Recommended GIS tool controls for V1.1:

- Select area
- Buffer / Nearby
- Measure distance
- Measure area
- Clear analysis

Keep GIS tools visually separate from basic zoom controls. Use compact icon buttons with tooltips and clear active states.

Place controls vertically on the upper-left side of the map, or split navigation and analysis tools into two compact groups.

---

# 12. Legend

Bottom-center or bottom-left floating legend.

Example:

```text
● Active
● On Hold
● Delayed
● Planned
● Completed
○ Cluster
```

Use a white floating container with subtle shadow.

---

# 13. Route / Network Layer

Add LineString GeoJSON to demonstrate line rendering.

Use cases:

- site connection network
- utility link
- operational route
- transmission connection

Style:

```text
blue / cyan dashed line
medium-low opacity
```

Avoid unrealistic excessive crossings.

---

# 14. Polygon Layer

Add one or two polygon overlays.

Possible concepts:

- Operational Region
- Coverage Area
- Service Zone
- Maintenance Area

Style:

```text
fill opacity: 0.12–0.20
outline opacity: medium
```

Selected region can become slightly stronger.

---

# 15. Right Detail Panel

Right panel displays the currently selected site.

## Header

Example:

```text
● Active

North Ridge Station
King County, Washington
```

Optional close icon:

```text
X
```

Closing the panel may clear selection.

---

## Site Metadata

Fields:

```text
Site ID        NRG-001
Site Type      Substation
Manager        Alex Morgan
Region         Puget Sound
Last Update    May 12, 2024 10:30 AM
```

Use two-column alignment.

Labels should be subdued.

Values should be visually stronger.

---

# 16. Completion Section

Example:

```text
Completion                         68%

█████████████────────

✓ On Track          Estimated: Jun 30, 2024
```

Use shadcn `Progress`.

---

# 17. Recent Activity

Show 3 items.

Example:

```text
Inspection completed
Electrical systems inspection
May 12, 2024 10:30 AM
```

```text
Work order updated
WO-2456 · Panel installation
May 11, 2024 02:15 PM
```

```text
Photo added
Site progress photo
May 10, 2024 04:45 PM
```

Use Lucide icons.

---

# 18. Quick Actions

2 × 2 grid:

```text
View Details       Work Orders
Add Inspection     Create Report
```

For Portfolio V1.1 these buttons can be visual only or show a simple toast/modal.

They do not need full workflow implementation.

---

# 19. Core Interaction Model

The most important portfolio interaction is:

```text
Site List
   ↓
selectedSiteId
   ↓
Map flyTo
   ↓
Selected Map Feature
   ↓
Right Detail Panel
```

And the reverse:

```text
Map Feature Click
   ↓
selectedSiteId
   ↓
Site List Highlight
   ↓
scrollIntoView()
   ↓
Right Detail Panel
```

All three regions must share the same selected state.

---

# 20. Site Search Interaction

User types:

```text
ridge
```

Result:

- Left list filters
- Map points filter
- KPI statistics update
- Map optionally fits filtered features

If zero results:

```text
No matching sites
Try changing your filters.
```

---

# 21. Status Filter Interaction

Example:

```text
Status: Active
```

Update:

- Map
- Site list
- KPI values
- result count

Optionally run:

```ts
map.fitBounds(...)
```

for filtered results.

---

# 22. Region Filter

Example options:

```text
All Regions
Puget Sound
Columbia Basin
Willamette Valley
Eastern Washington
Central Oregon
Idaho Operations
```

---

# 23. Map Style Switcher

Recommended options:

```text
Light
Dark
Satellite
```

Mapbox styles:

```text
mapbox://styles/mapbox/light-v11
mapbox://styles/mapbox/dark-v11
mapbox://styles/mapbox/satellite-streets-v12
```

When switching style, custom sources/layers may need to be re-added after `style.load`.

---

# 24. Layers Menu

Example toggles:

```text
Sites              ON
Clusters           ON
Connections        ON
Operational Areas  ON
Terrain / Risk     OFF
```

Optional:

```text
Labels             ON
```

Raster/data layers may expose an opacity control:

```text
Terrain / Risk
Opacity  ─────●──── 65%
```

This is a strong portfolio feature because it demonstrates mixed vector/raster layer control rather than only point markers.

---

# 25. Spatial Selection — Draw / Box Select

V1.1 should include at least one user-driven spatial selection workflow.

Preferred implementation:

- Polygon drawing for the portfolio demo
- Optional rectangle / box selection if implementation remains simple
- Turf.js for point-in-polygon evaluation

Interaction:

```text
Activate Select Area
      ↓
Draw polygon on map
      ↓
Find visible/filtered sites inside polygon
      ↓
Highlight selected sites
      ↓
Update selection summary
```

Example result summary:

```text
14 sites selected
9 Active · 3 Delayed · 2 Planned
```

Requirements:

- Selection must respect current Status / Region / Search filters
- Selected analysis results are visually different from the single `selectedSiteId`
- Clicking one result can still set `selectedSiteId` and open the detail panel
- `Clear analysis` removes the drawn geometry and selected result set
- Do not create a full edit/save geometry workflow

Recommended Turf.js operations:

```ts
booleanPointInPolygon()
pointsWithinPolygon()
```

Portfolio value:

> Demonstrates that the application can query features spatially, not only display them.

---

# 26. Buffer / Nearby Analysis

Add a lightweight proximity analysis tool.

Primary workflow:

```text
Select a site
      ↓
Choose Nearby
      ↓
Radius: 25 / 50 / 100 km
      ↓
Create temporary buffer
      ↓
List nearby sites ordered by distance
```

Example:

```text
Nearby Sites · 50 km

Lake Station          12.4 km
North Hub             26.8 km
Cascade Facility      41.2 km
```

Map behavior:

- render a temporary translucent buffer polygon
- highlight matching sites
- optionally fit bounds to the buffer/results
- keep the selected site visually dominant

Recommended Turf.js operations:

```ts
buffer()
distance()
```

Do not persist buffers in V1.1.

---

# 27. Measurement Tools

Provide two compact tools:

```text
Measure Distance
Measure Area
```

## Distance

User clicks two or more map points.

Display total distance using sensible units:

```text
47.3 km
```

## Area

User draws a polygon.

Display:

```text
128.4 km²
```

Recommended Turf.js operations:

```ts
length()
area()
```

Requirements:

- active tool state must be obvious
- Escape or Clear exits measurement mode
- measurements are temporary
- analysis tools should not interfere with normal marker click selection

---

# 28. Location Search / Geocoder

The top toolbar search field should perform real-world location search rather than duplicate the site list search.

Placeholder:

```text
Search location...
```

Example queries:

- Seattle
- Portland
- Spokane
- Boise

Interaction:

```text
Search location
      ↓
Geocoding result
      ↓
map.flyTo() / map.fitBounds()
      ↓
Optional location pin
```

Use Mapbox Search / Geocoding API when available.

Keep responsibilities separate:

```text
Left panel search   → SitePulse site records
Toolbar search      → Geographic places / addresses
```

Do not merge both search behaviors into one ambiguous input.

---

# 29. Viewport Search — Search This Area

Add a commercial map-style viewport workflow.

When the user pans or zooms far enough from the current result bounds, show:

```text
[ Search this area ]
```

On click:

```text
map.getBounds()
      ↓
Filter current Site dataset by bounding box
      ↓
Update site list
      ↓
Update KPI strip
```

Optional toggle:

```text
☐ Update results as map moves
```

V1.1 default should prefer the explicit `Search this area` button so that normal map exploration does not constantly change business results.

This behavior should cooperate with Status / Region / text search filters.

---

# 30. Raster / Tile Overlay

Add at least one non-basemap raster/data layer to demonstrate mixed geospatial rendering.

Possible portfolio-safe concepts:

- Terrain / elevation shading
- Weather / precipitation tiles
- Operational risk heat surface
- Satellite-derived demo overlay

Implementation can use an XYZ raster tile source.

Example Mapbox source/layer concept:

```ts
map.addSource("risk-raster", {
  type: "raster",
  tiles: ["https://.../{z}/{x}/{y}.png"],
  tileSize: 256,
});
```

Layer menu behavior:

- visibility ON/OFF
- opacity slider
- attribution preserved where required

Do not build GeoTIFF processing infrastructure for V1.1 unless the source is already easy to host/use.

---

# 31. Export Filtered / Selected Results

Add client-side export for the current working result set.

Menu:

```text
Export
├─ CSV
└─ GeoJSON
```

Export priority:

1. Spatially selected sites, if an analysis selection exists
2. Otherwise the currently filtered site set

CSV suggested fields:

```text
id
name
status
region
type
city
state
latitude
longitude
completion
lastUpdated
```

GeoJSON should export valid `FeatureCollection<Point>` data.

Requirements:

- client-side only
- no backend job system
- clear filename, for example:

```text
sitepulse-puget-sound-active-2026-09-09.csv
```

Portfolio value:

> Demonstrates the complete GIS workflow: filter / analyze / select / export.

---

# 32. Data Model

## TypeScript

```ts
export type SiteStatus =
  | "active"
  | "delayed"
  | "planned"
  | "completed"
  | "on-hold";

export interface Site {
  id: string;
  name: string;

  city: string;
  state: string;
  county?: string;

  region: string;
  type: string;
  manager: string;

  status: SiteStatus;

  longitude: number;
  latitude: number;

  completion: number;
  lastUpdated: string;
  estimatedCompletion?: string;
}

export type SiteActivityType =
  | "inspection"
  | "maintenance"
  | "work-order"
  | "photo"
  | "status-change";

export interface SiteActivity {
  id: string;
  siteId: string;
  type: SiteActivityType;
  timestamp: string;
  title: string;
  description?: string;
}

export interface NearbySiteResult {
  siteId: string;
  distanceKm: number;
}

export type AnalysisMode =
  | "none"
  | "select-area"
  | "nearby"
  | "measure-distance"
  | "measure-area";
```

State concepts should remain distinct:

```text
selectedSiteId
filteredSiteIds
analysisSelectedSiteIds
analysisMode
activityDateRange
```

Do not overload `selectedSiteId` to represent multi-feature analysis selection.

---

# 33. Suggested Project Structure

```text
src/
├─ app/
│  ├─ globals.css
│  ├─ layout.tsx
│  └─ page.tsx
│
├─ components/
│  ├─ dashboard/
│  │  ├─ stats-strip.tsx
│  │  └─ toolbar.tsx
│  │
│  ├─ map/
│  │  ├─ map-view.tsx
│  │  ├─ map-controls.tsx
│  │  ├─ map-analysis-tools.tsx
│  │  ├─ map-legend.tsx
│  │  ├─ map-layer-menu.tsx
│  │  ├─ location-search.tsx
│  │  └─ search-this-area.tsx
│  │
│  ├─ analysis/
│  │  ├─ analysis-summary.tsx
│  │  ├─ nearby-results.tsx
│  │  └─ measurement-label.tsx
│  │
│  ├─ sites/
│  │  ├─ site-panel.tsx
│  │  ├─ site-list.tsx
│  │  ├─ site-list-item.tsx
│  │  └─ site-detail-panel.tsx
│  │
│  └─ ui/
│
├─ data/
│  ├─ sites.ts
│  ├─ activities.ts
│  ├─ sites.geojson
│  ├─ routes.geojson
│  ├─ regions.geojson
│  └─ raster-layers.ts
│
├─ hooks/
│  ├─ use-site-selection.ts
│  ├─ use-site-filters.ts
│  └─ use-map-analysis.ts
│
├─ lib/
│  ├─ mapbox.ts
│  ├─ geo.ts
│  ├─ analysis.ts
│  └─ export.ts
│
└─ types/
   ├─ site.ts
   └─ analysis.ts
```

Do not split files unnecessarily. The structure above is a guide, not a requirement to create every file before the feature exists.

---

# 34. Visual Tokens

## Background

```text
Page background:       #FFFFFF
Secondary background:  #F8FAFC
Panel border:          #E2E8F0
```

## Text

```text
Primary:   #0F172A
Secondary: #475569
Muted:     #94A3B8
```

## Brand / Selection

```text
Blue:      #2563EB
Blue pale: #EFF6FF
```

## Status

```text
Active:    #22C55E
Delayed:   #F97316
Planned:   #9333EA
Completed: #0EA5E9
On Hold:   #EAB308
```

Exact values can be adjusted to fit the Mapbox style.

---

# 35. Typography

Recommended font:

```text
Inter
```

Fallback:

```text
system-ui
Arial
sans-serif
```

Suggested hierarchy:

```text
Page title:        24–28 px / semibold
Panel title:       18–20 px / semibold
List title:        14 px / medium
Body:              13–14 px
Muted metadata:    12 px
KPI metric:        22–26 px / semibold
```

---

# 36. Border Radius

Avoid excessive "bubble UI".

Recommended:

```text
Cards:       10–12 px
Buttons:      8 px
Inputs:       8 px
Small badges: 6–999 px depending on pill style
```

---

# 37. Shadows

Use subtle shadows only for floating map UI.

Example:

```css
box-shadow:
  0 1px 2px rgb(0 0 0 / 0.05),
  0 4px 12px rgb(0 0 0 / 0.06);
```

Main panels should mostly rely on borders.

---

# 38. Responsive Behavior

The primary target is desktop.

## >= 1280 px

Full three-panel layout.

## 1024–1279 px

- Left panel can narrow
- Right detail panel can overlay map
- KPI cards remain compact

## < 1024 px

Portfolio support only.

Possible behavior:

- Left site panel becomes drawer
- Right detail becomes drawer
- Map fills screen

Do not spend excessive development time on mobile unless needed.

---

# 39. Accessibility

Minimum requirements:

- Buttons use semantic elements
- Inputs have accessible labels
- Keyboard focus states are visible
- Status is not represented by color alone
- Icon-only buttons have `aria-label`
- Detail panel close button supports keyboard activation

---

# 40. Development Sequence

## Phase 1 — Project Setup

- Create Next.js app
- Configure Tailwind
- Initialize shadcn/ui
- Install Mapbox GL JS
- Install Turf.js
- Install Lucide React
- Configure `.env.local`

---

## Phase 2 — Static Layout

Build without Mapbox first:

- Three-column shell
- Site panel
- Toolbar
- KPI strip
- Map placeholder
- Detail panel

Goal:

> Match the approved design structure before geospatial logic is introduced.

---

## Phase 3 — Mock Data

Create:

- `sites.ts`
- `activities.ts`
- `sites.geojson`
- `routes.geojson`
- `regions.geojson`
- raster layer configuration

Use 30–50 sites and enough activity records to make date filtering meaningful.

---

## Phase 4 — Mapbox Integration

Implement:

- Map creation
- Light basemap
- Pacific Northwest initial view
- Navigation controls
- Proper cleanup on unmount

---

## Phase 5 — Site Layer

Implement:

- GeoJSON source
- Unclustered point layer
- status styling
- click interaction
- hover interaction

---

## Phase 6 — Cluster

Implement:

- cluster source
- cluster circles
- cluster count
- zoom into cluster on click

---

## Phase 7 — Selection Synchronization

Implement:

```text
Left List → Map
Map → Left List
Selection → Detail Panel
```

Also implement:

- `flyTo`
- `scrollIntoView`
- selected feature styling

---

## Phase 8 — Routes, Polygons, and Layer Control

Implement:

- connection LineString
- service area polygons
- layer visibility toggles
- raster tile overlay
- raster opacity control

---

## Phase 9 — Filters and Search

Implement:

- Site text search
- Status
- Region
- Activity Date
- Map style
- Layers
- Location geocoder

KPI counts must update consistently.

---

## Phase 10 — Spatial Selection

Implement:

- polygon or box selection
- point-in-polygon analysis
- selected result summary
- clear analysis

---

## Phase 11 — Nearby / Buffer

Implement:

- selected-site buffer
- radius options
- nearby site result list
- distance sorting

---

## Phase 12 — Measurement

Implement:

- distance measurement
- area measurement
- temporary labels
- Escape / clear behavior

---

## Phase 13 — Viewport Search and Export

Implement:

- `Search this area`
- bounding-box filtering
- CSV export
- GeoJSON export

---

## Phase 14 — Polish

Improve:

- spacing
- typography
- selected states
- analysis tool states
- transitions
- empty states
- loading state
- map resizing
- overflow
- error handling for geocoding/raster loading
- visual consistency

---

# 41. Suggested Codex Workflow

Do not ask Codex to generate the entire project in one request.

Recommended task sequence:

```text
Task 1
Create the three-column static SitePulse page layout.

Task 2
Implement the independent site panel and site list.

Task 3
Implement the toolbar and compact KPI strip.

Task 4
Implement the selected-site detail panel and mock activity data.

Task 5
Integrate Mapbox GL JS into the center workspace.

Task 6
Render site points from GeoJSON.

Task 7
Implement Mapbox clustering.

Task 8
Implement synchronized site selection between list, map, and detail panel.

Task 9
Add polygon, line, and raster layers with layer toggles and raster opacity.

Task 10
Implement site search, status filter, region filter, activity date filter, and map style switching.

Task 11
Implement Mapbox location geocoding in the toolbar.

Task 12
Implement polygon/box spatial selection with Turf.js and show an analysis summary.

Task 13
Implement nearby-site buffer analysis and distance-sorted results.

Task 14
Implement distance and area measurement tools.

Task 15
Implement Search This Area using the current map bounds.

Task 16
Implement CSV and GeoJSON export for analysis-selected or filtered results.

Task 17
Polish all normal, selected, loading, empty, and analysis states to match the design specification.
```

Review in the browser after every task.

Do not start a later GIS tool until normal map click / list synchronization still works correctly after the previous task.

---

# 42. Acceptance Criteria

The SitePulse V1.1 portfolio project is ready when all of the following work:

## Core UI / Map

- [ ] SitePulse page matches the approved three-panel architecture
- [ ] No generic admin navigation sidebar exists
- [ ] Site list is an independent workspace panel
- [ ] Map is the dominant visual element
- [ ] Mapbox GL JS renders correctly
- [ ] Sites render from GeoJSON
- [ ] Clustering works
- [ ] Cluster count is visible
- [ ] Cluster click zooms in
- [ ] Site hover state works
- [ ] Site click selects the site
- [ ] Site list click flies the map to the site
- [ ] Map click selects the corresponding site in the list
- [ ] Selected list item scrolls into view
- [ ] Right detail panel updates correctly

## Layers / Filters

- [ ] Polygon layer exists
- [ ] Line / network layer exists
- [ ] At least one raster/data tile layer exists
- [ ] Raster visibility toggle works
- [ ] Raster opacity works
- [ ] Status filter works
- [ ] Region filter works
- [ ] Site search works
- [ ] Activity Date has real `SiteActivity` semantics or is hidden
- [ ] KPI counts update with filters
- [ ] Map style switch works
- [ ] Custom layers survive / re-add correctly after style changes
- [ ] Layer toggles work
- [ ] Map legend exists

## V1.1 GIS Interaction

- [ ] Polygon or box spatial selection works
- [ ] Spatial selection highlights matching sites
- [ ] Analysis result count/status summary works
- [ ] Nearby / buffer analysis works from a selected site
- [ ] Nearby results are ordered by distance
- [ ] Distance measurement works
- [ ] Area measurement works
- [ ] Clear analysis resets temporary geometries and analysis results
- [ ] Analysis tools do not break normal marker selection

## Search / Viewport / Export

- [ ] Toolbar location geocoder works
- [ ] Site search and location search remain clearly separate
- [ ] Search This Area uses the visible map bounds
- [ ] Viewport results cooperate with other filters
- [ ] CSV export works
- [ ] GeoJSON export works
- [ ] Spatial selection is exported before generic filtered results when present

## Product Quality

- [ ] Empty search state is handled
- [ ] No-results spatial analysis state is handled
- [ ] Geocoder failure/empty state is handled
- [ ] Desktop layout works at 1440×900
- [ ] Desktop layout works at 1920×1080
- [ ] UI looks polished enough for screenshots and demo video
- [ ] No fake/non-functional primary controls are visible in the final demo

---

# 43. Portfolio Presentation

Recommended screenshots:

### Screenshot 1 — Main View
Show full SitePulse workspace with the map dominant.

### Screenshot 2 — Selected Site
Highlight:
- selected site
- flyTo result
- list synchronization
- detail panel

### Screenshot 3 — Clustering / Mixed Layers
Show:
- cluster markers
- operational polygons
- route lines
- raster overlay
- layer menu

### Screenshot 4 — Spatial Selection
Show:
- user-drawn selection polygon
- highlighted sites inside polygon
- analysis summary

### Screenshot 5 — Nearby Analysis
Show:
- selected site
- 50 km buffer
- nearby site highlights
- distance-ordered result list

### Screenshot 6 — Filter / Search / Export
Show:
- Status / Region filter
- reduced site list
- updated KPI
- Search This Area or geocoder context
- Export menu

The strongest portfolio screenshots are Screenshot 1, 4, and 5. Do not publish every screenshot if the portfolio page becomes visually repetitive.

---

# 44. Demo Video Sequence

Ideal length:

```text
45–75 seconds
```

Suggested sequence:

1. Open the SitePulse map
2. Search for a site in the left panel
3. Click the site and show `flyTo` + detail synchronization
4. Click another marker directly on the map and show the list update
5. Apply an Active status filter and show KPI/list/map synchronization
6. Use toolbar location search for Seattle or Portland
7. Draw a polygon around a group of sites
8. Show the selected-site count and status summary
9. Clear analysis and select one site
10. Run Nearby analysis with a 50 km buffer
11. Show distance-sorted nearby results
12. Briefly measure one distance or area
13. Toggle the raster/data layer and adjust opacity
14. Click Search This Area after a map pan
15. Open Export and show CSV / GeoJSON options
16. Switch from Light to Satellite map style

Do not linger on every control. The demo should emphasize three messages:

```text
Map interaction is synchronized with business UI.
Spatial analysis is functional.
The application handles multiple GIS data/layer types.
```

---

# 45. Scope Boundary

SitePulse V1.1 is intentionally not a full enterprise platform.

Do not add until the V1.1 portfolio version is complete:

- Login
- Role-based access
- CRUD forms
- PostgreSQL
- PostGIS queries
- Redis
- Persistent file upload / file management backend
- Reporting backend
- Notification system
- Work-order backend
- Real-time WebSockets

Those features can be added in a later version only if they create additional portfolio value.

A small amount of client-side temporary drawing and client-side export is part of V1.1 and does **not** count as CRUD or backend file management.

---

# 46. Final Design Goal

The finished SitePulse page should communicate:

> A developer who can build polished, practical, production-style Mapbox / Web GIS interfaces with real spatial interaction — not just place markers on a map.

The visual hierarchy should always remain:

```text
Map
↓
Site interaction
↓
Spatial analysis
↓
Filters / layers
↓
Selected site details
↓
Statistics / export
```

The map is the product.
