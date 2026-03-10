# UI Design: Header + Central Banner for Card Links

This document describes how two UI requirements are implemented: keeping the header visible when opening card links, and loading the card target in the central banner only (no full-page navigation, no new tab).

---

## 1. Keep header apparent when clicking on card sites

### Requirement
When the user clicks an "Open app" link on a solution card (or "Explore GARV"), the portal header must remain visible. The user should stay in the portal context and always see the app title, customer name, logo, and header actions (theme, settings).

### How it was implemented

- **Single layout for all in-app navigation**  
  All authenticated content is rendered inside `MainLayout` (`src/components/MainLayout.tsx`). The layout is a fixed structure:
  - **Header** (top, always visible)
  - **Sidebar** (left)
  - **Main content area** (`<main>` with `<Outlet />`)

- **Routing keeps the layout mounted**  
  Card links do not navigate away from the app or open a new window. They use React Router and render under the same layout:
  - **Landing:** `/` → `LandingPage` (cards grid).
  - **Card link:** `/view?url=<encoded-url>` → `EmbeddedAppPage` (central banner).

  Because both routes are children of the same `MainLayout` route (`src/App.tsx`), the **Header** (and Sidebar) stay mounted and visible when the user clicks a card. Only the main content area (the `Outlet`) switches from the landing content to the embedded view.

- **No full-page redirect, no `target="_blank"`**  
  Card links use `<Link to={...}>` to `/view?url=...`, so the browser stays on the portal origin and the layout (including the header) is never replaced.

**Relevant files**
- `src/App.tsx` — route tree with `MainLayout` and nested `index` / `view` routes.
- `src/components/MainLayout.tsx` — layout that always renders `Header` and then `Outlet` for the active route.

---

## 2. Card link page loads in central banner only

### Requirement
Clicking a card link should load the card’s target URL (e.g. a Databricks app) only in the central content area (the “banner”), not as a full-page navigation and not in a new tab.

### How it was implemented

- **Dedicated route and component**  
  The route `/view` is handled by `EmbeddedAppPage` (`src/pages/EmbeddedAppPage.tsx`). The `url` query parameter carries the card’s target URL (e.g. `https://agent-airops-....databricksapps.com/`).

- **Central banner = main content area**  
  `EmbeddedAppPage` is rendered inside the layout’s `<main>` (the `Outlet`). So the “central banner” is exactly that main area: below the header, beside the sidebar, with flex/grow so it fills the remaining space.

- **Iframe for the external URL**  
  The target URL is loaded inside an `<iframe>`:
  - `src={url}` so the card’s app loads in this iframe.
  - The iframe is the only content in the central area for this route (plus a small toolbar with reload/instructions).
  - Styling (`min-h-0 flex-1`, `minHeight: 60vh`) makes the iframe fill the central banner.

- **Cards point to the embed route, not the external URL**  
  In `LandingPage`, each solution card and the “Explore GARV” link use:
  - `to={/view?url=${encodeURIComponent(url)}}` (React Router `Link`),
  - not `href={url}` with `target="_blank"`.

  So the browser never navigates the top-level window to the external site; only the iframe in the central banner loads it.

**Relevant files**
- `src/pages/LandingPage.tsx` — `Link` to `/view?url=...` for each card and for “Explore GARV”.
- `src/pages/EmbeddedAppPage.tsx` — reads `url` from query, validates it, renders the iframe in the central area and a reload/instruction bar.
- `src/components/MainLayout.tsx` — defines the main content column and `Outlet` where `EmbeddedAppPage` is rendered.

---

## Summary

| Requirement | Implementation |
|------------|----------------|
| **Header always visible** | All card navigation is under `MainLayout`; card links use `<Link>` to `/view?url=...`, so only the main content changes and the header (and sidebar) stay visible. |
| **Card link in central banner only** | `/view` route renders `EmbeddedAppPage`, which displays the card’s URL in an iframe inside the layout’s main content area; cards link to this route with the URL in the query string. |
