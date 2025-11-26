# Design Approach & Technical Decisions

## Core Philosophy
We wanted to build an RF Link Planner that feels lightweight yet powerful. I aimed for a modern, map-first experience where the user interacts directly with the terrain.

## Key Design Decisions

### 1. The "Map-First" Architecture
We chose React with Leaflet because it offers the perfect balance of performance and flexibility.
* **Why Leaflet?** It's lightweight and handles vector layers (like our Fresnel zones) beautifully without the massive overhead of heavier GIS libraries.
* **Why SVG?** We used SVG (via Leaflet's standard renderer) for the links and zones. This gives us built-in event handling (clicks, hovers) out of the box, which is much harder to implement with a raw Canvas approach.

### 2. Centralized State Management
We kept the state management simple. All critical data—`towers` and `links`—lives in the top-level `App` component.
* **Decision:** We avoided complex state libraries (like Redux) intentionally. For an application of this scope, passing props down is cleaner, easier to debug, and reduces boilerplate.
* **Benefit:** This makes features like "deleting a tower also deletes its connected links" trivial to implement because the parent component controls both arrays.

### 3. On-Demand Computation
RF calculations can be heavy, especially when fetching elevation data from external APIs.
* **Approach:** We don't calculate everything at once. When you connect two towers, we draw the line immediately (instant feedback). We only fetch the heavy elevation data and render the detailed Fresnel zone when you click the link.
* **Result:** The app feels snappy. You can drop 50 towers and connect them all without waiting for 50 API calls to finish.

### 4. Visual Clarity (The "Minimalist" Aesthetic)
Engineering tools often suffer from information overload. We took a different path:
* **Black & White Markers:** We used high-contrast, minimalist tower icons that stand out against any map tile (satellite or street). They don't have complex colors—they just work.
* **The "Blue Line" Rule:** We stripped away the dashed grey lines and invisible hitboxes. A link is just a solid blue line. It’s simple, predictable, and honest.
* **Fresnel Zone:** We used a semi-transparent orange fill. It clearly indicates the "danger zone" for signal blockage without obscuring the map details underneath.

### 5. Mathematical Precision
We isolated all the math (Haversine distance, Fresnel radius, Ellipse generation) into a pure utility file (`rfUtils.js`).
* **Why?:** This separation of concerns means the UI components don't "know" about physics—they just render data. It keeps the React components clean and makes the math easy to verify or swap out later (e.g., if we wanted to add Earth Bulge calculations).