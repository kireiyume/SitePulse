# SitePulse — Design Specification

## 1. Project Overview

**Project Name:** SitePulse  
**Project Type:** Mapbox / Web GIS Portfolio Project  
**Primary Goal:** Build a polished, map-centric infrastructure operations workspace suitable for an Upwork portfolio.

This project is intentionally separate from a full-stack admin system. The focus is on **Mapbox GL JS interaction, geospatial visualization, map/list/detail synchronization, filtering, and polished SaaS UI design**.

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

> I can build production-style interactive Mapbox applications with GeoJSON layers, clustering, filtering, spatial overlays, and synchronized business UI.

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

---

## 4. Recommended Tech Stack

### Core

- Next.js
- App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Mapbox GL JS
- Lucide React

### Optional

- ECharts for small KPI trend charts
- Zustand if shared state becomes difficult with React state
- TanStack Query only if a real API is added later

### First Portfolio Version

Do **not** add:

- Authentication
- Database
- Redis
- ORM
- User management
- Real backend APIs

Use local mock data and GeoJSON.

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

This is optional for V1.

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
Date Range: May 1 – May 31
Map Style: Light
Layers
Search map...
```

Order can be:

```text
[Status] [Region] [Date Range] [Map Style] [Layers]     [Search]
```

or

```text
[Search] [Status] [Region] [Date Range] [Map Style] [Layers]
```

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

Use a compact row:

```text
Total Sites     Active       Completed       Delayed
18              12           3               3
100%            67%          17%             17%
```

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

Recommended:

- Zoom +
- Zoom -
- Fit to results
- Layers
- Geolocate optional

Place controls vertically on the upper-left side of the map.

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

For Portfolio V1 these buttons can be visual only or show a simple toast/modal.

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
Sites            ON
Clusters         ON
Connections      ON
Operational Areas ON
```

Optional:

```text
Labels           ON
```

This is a strong portfolio feature.

---

# 25. Data Model

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
```

---

# 26. Suggested Project Structure

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
│  │  ├─ map-legend.tsx
│  │  └─ map-layer-menu.tsx
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
│  ├─ sites.geojson
│  ├─ routes.geojson
│  └─ regions.geojson
│
├─ hooks/
│  └─ use-site-selection.ts
│
├─ lib/
│  ├─ mapbox.ts
│  └─ geo.ts
│
└─ types/
   └─ site.ts
```

Do not split files unnecessarily.

---

# 27. Visual Tokens

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

# 28. Typography

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

# 29. Border Radius

Avoid excessive "bubble UI".

Recommended:

```text
Cards:       10–12 px
Buttons:      8 px
Inputs:       8 px
Small badges: 6–999 px depending on pill style
```

---

# 30. Shadows

Use subtle shadows only for floating map UI.

Example:

```css
box-shadow:
  0 1px 2px rgb(0 0 0 / 0.05),
  0 4px 12px rgb(0 0 0 / 0.06);
```

Main panels should mostly rely on borders.

---

# 31. Responsive Behavior

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

# 32. Accessibility

Minimum requirements:

- Buttons use semantic elements
- Inputs have accessible labels
- Keyboard focus states are visible
- Status is not represented by color alone
- Icon-only buttons have `aria-label`
- Detail panel close button supports keyboard activation

---

# 33. Development Sequence

## Phase 1 — Project Setup

- Create Next.js app
- Configure Tailwind
- Initialize shadcn/ui
- Install Mapbox GL JS
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
- `sites.geojson`
- `routes.geojson`
- `regions.geojson`

Use 30–50 sites.

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

## Phase 8 — Routes and Polygons

Implement:

- connection LineString
- service area polygons
- layer visibility toggles

---

## Phase 9 — Filters

Implement:

- Search
- Status
- Region
- Map style
- Layers

KPI counts must update.

---

## Phase 10 — Polish

Improve:

- spacing
- typography
- selected states
- transitions
- empty states
- loading state
- map resizing
- overflow
- visual consistency

---

# 34. Suggested Codex Workflow

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
Implement the selected-site detail panel.

Task 5
Integrate Mapbox GL JS into the center workspace.

Task 6
Render site points from GeoJSON.

Task 7
Implement Mapbox clustering.

Task 8
Implement synchronized site selection between list, map, and detail panel.

Task 9
Add polygon and line layers.

Task 10
Implement search, status filter, region filter, layer toggles, and map style switching.

Task 11
Polish the page to match the design specification.
```

Review in the browser after every task.

---

# 35. Acceptance Criteria

The portfolio project is ready when all of the following work:

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
- [ ] Polygon layer exists
- [ ] Line / network layer exists
- [ ] Status filter works
- [ ] Region filter works
- [ ] Site search works
- [ ] KPI counts update with filters
- [ ] Map style switch works
- [ ] Layer toggles work
- [ ] Map legend exists
- [ ] Empty search state is handled
- [ ] Desktop layout works at 1440×900
- [ ] Desktop layout works at 1920×1080
- [ ] UI looks polished enough for screenshots and demo video

---

# 36. Portfolio Presentation

Recommended screenshots:

### Screenshot 1 — Main View
Show full SitePulse workspace.

### Screenshot 2 — Selected Site
Highlight:
- selected site
- flyTo result
- detail panel

### Screenshot 3 — Clustering / Layers
Show:
- cluster markers
- polygons
- route lines
- layer menu

### Screenshot 4 — Filtered View
Show:
- Status filter
- reduced list
- updated KPI
- map fitBounds

---

# 37. Demo Video Sequence

Ideal length:

```text
30–60 seconds
```

Suggested sequence:

1. Open the SitePulse map
2. Search for a site
3. Click a site in the left list
4. Map flies to the site
5. Selected marker highlights
6. Detail panel updates
7. Click another marker directly on the map
8. Site list selection changes
9. Apply an Active status filter
10. Map and KPIs update
11. Toggle polygon / route layers
12. Switch from Light to Satellite map style

This demonstrates the most valuable Mapbox skills quickly.

---

# 38. Scope Boundary

The first portfolio release is intentionally not a full enterprise platform.

Do not add until the portfolio version is complete:

- Login
- Role-based access
- CRUD forms
- PostgreSQL
- PostGIS queries
- Redis
- File upload
- Reporting backend
- Notification system
- Work-order backend
- Real-time WebSockets

Those features can be added in a later version only if they create additional portfolio value.

---

# 39. Final Design Goal

The finished SitePulse page should communicate:

> A developer who can build polished, practical, production-style Mapbox / Web GIS interfaces — not just place markers on a map.

The visual hierarchy should always remain:

```text
Map
↓
Site interaction
↓
Filters
↓
Selected site details
↓
Statistics
```

The map is the product.
