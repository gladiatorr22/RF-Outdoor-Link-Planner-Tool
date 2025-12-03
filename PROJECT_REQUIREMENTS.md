Task: Build a Simplified RF Outdoor Link Planner Tool
Objective
You are tasked with creating a web-based tool that allows users to plan simple point-to-point RF links between towers on a map.

Even if you are not familiar with RF (Radio Frequency) concepts or link planner tools, you should be able to complete this task by following the instructions. The goal is to demonstrate your frontend development skills, UI/UX design, core JavaScript knowledge, and ability to handle geometric calculations.

Features & Requirements
Your tool should have the following functionality:

1. Map with Towers
Display a map (any map library with Google Maps or Open Street maps or any map data of your choice).

Users can click on the map to place towers.

Each tower should have a configurable frequency (in GHz).

2. Point-to-Point Links
Users can connect two towers by drawing a line between them (point-to-point link).

Constraint: Two towers can only be connected if their frequencies match.

3. Fresnel Zone Visualization
Fetch the elevation of the terrain between two towers and calculate the fresnel zone. (you can use Open-Elevation or any other API for elevation data)

When a user clicks on a link, show the first Fresnel zone as an ellipse around the link.

Use the folowing formula to calculate the First Fresnel zone
First Fresnel zone radius:
r = sqrt( (λ * d1 * d2) / (d1 + d2) )

Where:
  • r  = radius of the first Fresnel zone at a point (meters)
  • λ  = wavelength of the signal (meters). λ = c / f
  • d1 = distance from the transmitter to the point (meters)
  • d2 = distance from the receiver to the point (meters)

Constants / units:
  • c = speed of light = 3 × 10^8 m/s
  • f = frequency in Hz (if you accept MHz/GHz in UI, convert: 1 MHz = 1e6 Hz, 1 GHz = 1e9 Hz)
      Example: 5 GHz = 5e9 Hz → λ = 3e8 / 5e9 = 0.06 m
      
You do not need to make the Fresnel zone perfectly accurate; a simplified 2D ellipse around the line connecting towers is sufficient.

Technical Requirements
Frontend Only

Use vanilla JavaScript or React, HTML, and CSS.

You may use a simple map library (like Leaflet / Google Maps / OpenLayers) for convenience.

Tower Configuration

Users can edit frequency for each tower.

UI should prevent connecting towers with different frequencies.

Drawing Links

Users should be able to click one tower, then another to form a link.

Links should be visually drawn on the map (lines or curves).

Fresnel Zone

Clicking a link should display the first Fresnel zone as an ellipse around the link line.

Use canvas or SVG for visualization.

Usability

Towers and links should be clickable or selectable.

Users should be able to remove or reconfigure towers/links.

Optional: Display link distance and frequency on hover.

Responsiveness

The tool should work on desktop and tablet screens.

Notes about the terminologies
Frequency: Think of it as a “channel number” for the tower; only towers on the same channel can communicate.

Fresnel zone: This is a geometric area around the link. You only need to draw an ellipse based on the formula; you don’t need advanced RF physics knowledge.

Link: Simply a line connecting two towers. The Fresnel zone ellipse should appear around this line when clicked.

Focus on code structure, UI, and functionality, not on perfect RF simulation. This is mainly a frontend and geometry visualization task.

Deliverables
Source code uploaded in a public GitHub repository

Host your application in a free hosting platform like vercel

Brief description of your approach and design decisions. code quality, clarity, usability, and working features rather than perfection.
