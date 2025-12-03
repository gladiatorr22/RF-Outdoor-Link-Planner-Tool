# RF Link Planner - Interview Preparation Guide

This document is designed to help you understand the **RF Link Planner** project inside out, preparing you for technical interviews. It covers the project overview, technical stack, core concepts, code architecture, and potential interview questions.

---

## 1. Project Overview

**What is it?**
The RF Link Planner is a web-based tool that allows users to plan point-to-point Radio Frequency (RF) links between towers on a map. It helps visualize whether a connection is feasible based on frequency matching and terrain obstructions (Fresnel Zone).

**Key Features:**
- **Interactive Map:** Users can place towers on a map (using Leaflet).
- **Tower Configuration:** Each tower has a configurable frequency (e.g., 2.4 GHz, 5.8 GHz).
- **Link Creation:** Users can connect two towers. **Constraint:** Links are only allowed if both towers operate on the **same frequency**.
- **Fresnel Zone Visualization:** When a link is selected, the application calculates and draws the **First Fresnel Zone** (an ellipse) to visualize the signal path.
- **Elevation Profile:** Fetches real-world terrain data to show if the ground obstructs the signal (using Open-Elevation API).

---

## 2. Technical Stack

Be ready to explain *why* you chose these technologies.

| Technology | Purpose | Why? |
| :--- | :--- | :--- |
| **React (v19)** | UI Library | Component-based, efficient state management, huge ecosystem. |
| **Vite** | Build Tool | Extremely fast development server and bundling compared to Webpack. |
| **Leaflet / React-Leaflet** | Maps | Lightweight, open-source, easy to integrate with React components. |
| **Tailwind CSS (v4)** | Styling | Utility-first, rapid UI development, responsive design built-in. |
| **Lucide React** | Icons | Clean, consistent SVG icons. |
| **Open-Elevation API** | Data | Free API to get global terrain elevation data. |

---

## 3. Core Concepts & Logic

### A. Radio Frequency (RF) Basics
*You don't need to be a physicist, but know these terms:*
- **Line of Sight (LOS):** A straight line between the transmitter and receiver.
- **Frequency (GHz):** The "channel" the radio communicates on. Higher frequency = higher data rate but shorter range and less penetration.
- **Wavelength ($\lambda$):** Calculated as $\lambda = c / f$, where $c$ is the speed of light ($3 \times 10^8$ m/s).

### B. The Fresnel Zone
This is the most "complex" math in the project.
- **Definition:** An ellipsoidal region around the LOS path. If this area is obstructed (by ground, trees, buildings), the signal strength drops significantly.
- **Formula:** The radius ($r$) of the first Fresnel zone at any point is:
  $$r = \sqrt{\frac{\lambda \cdot d_1 \cdot d_2}{d_1 + d_2}}$$
  - $d_1$: Distance from transmitter.
  - $d_2$: Distance from receiver.
  - $\lambda$: Wavelength.
- **Implementation in `rfUtils.js`:**
  - `calculateFresnelRadius`: Computes the max radius (at the midpoint where $d_1 = d_2$).
  - `generateFresnelPolygon`: Creates a set of latitude/longitude points forming an ellipse to draw on the map.

### C. Geodesic Distance (Haversine Formula)
- Since the Earth is a sphere, we can't use simple Pythagorean distance.
- **Haversine Formula:** Used in `getDistance` to calculate the "as-the-crow-flies" distance between two GPS coordinates (lat/lng) in meters.

---

## 4. Code Architecture & Walkthrough

### **File Structure**
- `src/App.jsx`: Main controller. Manages global state (`towers`, `links`, `interactionMode`).
- `src/rfUtils.js`: Pure functions for math (distance, Fresnel) and API calls (elevation).
- `src/components/`:
  - `MapEvents.jsx`: Handles clicks on the map (placing towers).
  - `TowerMarker.jsx`: Renders individual towers.
  - `LinkLayer.jsx`: Renders the connection line and the Fresnel zone ellipse.
  - `Sidebar.jsx`: UI for editing properties.

### **State Management (`App.jsx`)**
The app uses **local state** (`useState`) because it's simple and sufficient.
- `towers`: Array of objects `{ id, lat, lng, frequency }`.
- `links`: Array of objects `{ id, sourceId, targetId, frequency, ... }`.
- `interactionMode`: Controls what happens when you click (`'view'`, `'add-tower'`, `'connect'`).
- `selectedItem`: Tracks what is currently being edited `{ type: 'tower' | 'link', id: ... }`.

### **Key Workflows**
1.  **Adding a Tower:**
    - User clicks "Add Tower" $\to$ `interactionMode` becomes `'add-tower'`.
    - `MapEvents` detects click $\to$ calls `handleMapClick`.
    - New tower object created $\to$ added to `towers` state.

2.  **Connecting Towers:**
    - User clicks "Connect" $\to$ `interactionMode` becomes `'connect'`.
    - User clicks Tower A $\to$ `connectSourceId` set to A.
    - User clicks Tower B $\to$ App checks `source.frequency === target.frequency`.
    - If match: New link created $\to$ added to `links` state.

3.  **Fetching Elevation (Async):**
    - When a link is clicked (`handleLinkClick`), the app checks if `elevationData` exists.
    - If not, it calls `getElevation` (for endpoints) and `getElevationProfile` (for path).
    - **Optimization:** Data is cached in the link object so we don't re-fetch on every click.

---

## 5. Potential Interview Questions

### **Technical / React**
1.  **Q: Why did you choose `useState` over Redux or Context?**
    *A: The state is relatively flat and only needed in `App.jsx` and passed down one level. Redux would be overkill (boilerplate), and Context wasn't strictly necessary for this depth.*

2.  **Q: How do you handle the asynchronous nature of fetching elevation data?**
    *A: I use `async/await` in the `handleLinkClick` handler. I also implemented a check to see if data is already present to avoid redundant API calls (basic caching).*

3.  **Q: How does the map rendering work?**
    *A: I use `react-leaflet`. It uses the Context API internally to manage the Leaflet instance. I render `TowerMarker` and `LinkLayer` as children of the `MapContainer`, which allows them to access the map context.*

### **Domain / Logic**
4.  **Q: Explain how you draw the Fresnel Zone ellipse on a map.**
    *A: I calculate the radius based on the frequency and distance. Then, I generate a polygon (array of lat/lng points) by calculating offsets from the center point, rotating them to match the bearing (angle) between the two towers.*

5.  **Q: What happens if the towers have different frequencies?**
    *A: The system prevents the connection. In `handleTowerClick`, I explicitly check `source.frequency === target.frequency` and alert the user if they don't match.*

### **Behavioral / Project**
6.  **Q: What was the most challenging part of this project?**
    *A: (Sample Answer) Getting the geometry right for the Fresnel zone visualization. Translating a radius in meters to latitude/longitude offsets requires understanding geodesic math and bearing calculations.*

7.  **Q: How would you scale this application?**
    *A: I would move state to a backend (Node.js/PostgreSQL) to save plans. I'd also implement "clustering" for the map if there were thousands of towers to prevent performance issues.*

---

## 6. Study Checklist
- [ ] **Review `src/rfUtils.js`**: Understand `getDistance` and `generateFresnelPolygon`.
- [ ] **Review `src/App.jsx`**: Trace the `handleTowerClick` logic.
- [ ] **Practice**: Try explaining the "Frequency Mismatch" logic out loud.
- [ ] **Practice**: Explain what a "Fresnel Zone" is in simple terms (football shape where signal travels).
