# Atelier — Productivity Dashboard

A modern, editorial productivity dashboard and task architecture built with pure vanilla web technologies. Inspired by high-end editorial design and modern productivity workspaces, **Atelier** transforms task tracking into a refined, high-performance portfolio application.

---

## Overview

Atelier was engineered to demonstrate foundational frontend mastery without relying on heavyweight frameworks or third-party runtime dependencies. It features complete task lifecycle management, multi-criteria filtering, live analytics with visual progress indicators, an interactive monthly calendar engine, custom category orchestration, and a dual-theme system (Light & Dark) with zero theme flicker (FOUC).

---

## Editorial Design & Color Palette

The interface is styled around a bespoke luxury palette with strict adherence to WCAG AA contrast standards:

| Color Name | Hex Code | Purpose |
| :--- | :--- | :--- |
| **Deep Burgundy** | `#572633` | Brand monogram, primary buttons, active tabs, strong emphasis |
| **Soft Cream** | `#F7F2EA` | Light mode canvas, dark mode high-contrast typography |
| **Rose Gold** | `#C18E83` | Focus outlines, accent highlights, progress rings, dark mode accents |
| **Charcoal** | `#292326` | Light mode text, dark mode surfaces, toast notifications |
| **Muted Blush** | `#E7D5D2` | Card borders, secondary surface tints, pill backgrounds |

---

## Key Features

### 1. Task Lifecycle Management
- **Full CRUD Support**: Create, view, edit, complete, reopen, and delete tasks.
- **Title & Description**: Detailed descriptions with expandable layout.
- **Form Validation**: Clean validation preventing blank titles, with inline guidance.
- **Destructive Action Safety**: Custom accessible modal confirmation for task deletion, plus a 4-second "Undo" toast.
- **Dynamic Empty States**: Context-aware empty state messaging tailored to search terms, overdue status, or today's agenda.

### 2. Comprehensive Task Metadata
Each task records:
- `id`: Unique identifier
- `title` & legacy `text`: Preserves 100% backward compatibility
- `description`: Optional rich notes
- `priority`: `high`, `medium`, or `low` with color-coded badges
- `category`: Assigned tag (default or custom)
- `dueDate` & `dueTime`: Scheduled deadline with relative badges (`Today`, `Tomorrow`, `Overdue by X days`)
- `completed`: Completion flag
- `createdAt` & `updatedAt`: Timestamps formatted cleanly

### 3. Analytics Dashboard
- Live tracking of **Total Tasks**, **Completed**, **Pending**, and **Overdue**.
- Real-time completion percentage calculation.
- Dual visual progress indicators:
  - SVG circular radial progress ring.
  - Linear animated progress bar with accessible `role="progressbar"`.

### 4. Search, Filtering & Sorting
- **Instant Search**: Real-time substring matching across both task titles and descriptions (`Ctrl+K` or `/` shortcut).
- **Status Filter Tabs**: All, Today, Upcoming, Overdue, Completed, Pending (with live badge counters).
- **Category Filter**: Filter by default or custom categories.
- **Priority Filter**: High, Medium, Low.
- **6 Sorting Orders**: Due Date (Earliest / Latest), Priority (High to Low), Created Date (Newest / Oldest), and Alphabetical (A - Z).
- **Unified Querying**: All search, status, category, priority, and sort criteria operate together in tandem.

### 5. Custom Categories
- Pre-loaded with standard productivity categories: `Personal`, `Study`, `College`, and `Projects`.
- Built-in Category Manager modal to create custom categories.
- Delete custom categories without affecting default categories.
- Automatic synchronization across filters and task creation forms.

### 6. Interactive Dual Views (List & Calendar)
- **List View**: Chronological task cards with priority badges, overdue alerts, and quick actions.
- **Monthly Calendar Engine**:
  - Full 7-column calendar grid with month navigation (`< Prev`, `Today`, `Next >`).
  - Day cells display task dots and priority pills.
  - Selected day activates an **Agenda Drawer** displaying all tasks scheduled for that date, with a quick "+ Add Task for This Date" shortcut.
  - Fully responsive and horizontally scrollable on mobile viewports.

### 7. Dual Theme (Light & Dark Mode)
- One-click theme toggle in header.
- Persistent user preference stored in `localStorage` (`todo_theme`).
- Respects system `prefers-color-scheme` on first launch.
- Pre-render inline script in `<head>` ensures zero theme flash (FOUC).

### 8. Data Persistence & Backward Compatibility
- Reads and writes to `localStorage` under the `"tasks"` key.
- Gracefully migrates older tasks (e.g. `{ text: "...", completed: boolean }`) into the upgraded schema without data loss.
- Resilient JSON parsing with try/catch fallbacks.
- Never injects mock data or overwrites existing user data.
- Entirely client-side with zero external database dependencies.

### 9. UX & Accessibility (a11y)
- Accessible skip link (`Skip to main content`).
- ARIA landmarks (`role="banner"`, `role="tablist"`, `role="tabpanel"`, `role="dialog"`, `role="status"`).
- Keyboard shortcuts:
  - `Ctrl + K` or `/` : Jump to search input
  - `N` : Open New Task modal
  - `Esc` : Close any active modal
- Focus management: Traps focus within open modals and restores focus upon closing.
- Visible focus rings (`outline: 2px solid var(--rose-gold)`).
- Respects `@media (prefers-reduced-motion: reduce)` to disable transitions for sensitive users.

---

## Technologies Used

- **HTML5**: Semantic elements, accessible form controls, inline SVG vector icons.
- **CSS3**: Custom properties (CSS variables), Flexbox, CSS Grid, media queries, keyframe animations.
- **JavaScript (ES6+)**: Vanilla DOM manipulation, Web Storage API, Event delegation, Date arithmetic.
- **Node.js**: Embedded test runner for unit and DOM integration verification.

---

## Local Setup & Development

No complex build steps, compilers, or heavy node modules are required.

### 1. Clone the repository
```bash
git clone https://github.com/Athravpathak-git/ToDo-List.git
cd ToDo-List
```

### 2. Run Locally
You can open `index.html` directly in any modern browser:

**Using Python:**
```bash
python -m http.server 8000
```
Then visit `http://localhost:8000` in your browser.

**Using Node / npx:**
```bash
npx serve .
```

### 3. Running Automated Tests
The repository includes a suite of unit and DOM integration tests that verify schema migration, overdue calculations, multi-filter logic, and UI event binding:

```bash
npm test
```
*Alternatively, run with Node directly:*
```bash
node tests/unit.test.js
node tests/integration.test.js
```

---

## Screenshot Guidance

When capturing screenshots for your developer portfolio or project showcase, consider the following views:

1. **Dashboard Overview (Light Mode)**: Capture the header, metrics cards, progress ring, and task list with active tasks.
2. **Dashboard Overview (Dark Mode)**: Switch to Dark Theme to showcase the burgundy and charcoal contrast.
3. **Monthly Calendar View**: Switch to the Calendar tab showing scheduled tasks and the selected date agenda drawer.
4. **Task Creation Modal**: Display the modal with priority selection, date pickers, and category dropdown.
5. **Mobile Viewport**: Emulate an iPhone or Android screen in DevTools to demonstrate responsive stacking and touch controls.

*(Place captured PNG images into a `/docs/screenshots/` folder and link them here if desired).*

---

## Deployment Instructions

Because Atelier is a static application, it can be deployed for free to any static hosting provider:

### Option A: GitHub Pages
1. Go to your repository settings on GitHub.
2. Navigate to **Pages** in the left sidebar.
3. Under **Branch**, select `main` and root directory `/`, then click **Save**.
4. GitHub Pages will publish the site at `https://<username>.github.io/<repo-name>/`.

### Option B: Vercel
1. Import the repository in [Vercel](https://vercel.com).
2. Keep the default settings (Framework preset: **Other**).
3. Click **Deploy**.

### Option C: Netlify
1. Connect your repository in [Netlify](https://netlify.com).
2. Set build command to empty and publish directory to `.`.
3. Click **Deploy Site**.

---

## License

This project is licensed under the [MIT License](LICENSE).
