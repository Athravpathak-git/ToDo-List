# AthravOS — Your Personal Productivity Space

A modern, clean productivity workspace designed to organize tasks, manage your time, and track your progress with elegance and clarity. Built with pure vanilla web technologies, **AthravOS** provides a distinctive, refined workspace that turns daily task management into an intuitive, productive experience.

Live Website: [https://athravpathak-git.github.io/ToDo-List/](https://athravpathak-git.github.io/ToDo-List/)

---

## Brand Identity & Design System

AthravOS features a distinctive visual identity built on organic, warm tones designed for high focus and zero visual fatigue:

| Color Name | Hex Code | Role in AthravOS |
| :--- | :--- | :--- |
| **Warm Ivory** | `#F7F5F0` | Clean, warm canvas background for light mode |
| **White Cards** | `#FFFFFF` | Elevated surface containers with soft borders |
| **Forest Green** | `#315C46` | Primary brand accent, action buttons, active navigation states |
| **Sage Green** | `#A8B9A0` | Secondary highlights, subtle badges, active indicators |
| **Charcoal** | `#252923` | High-contrast, crystal-clear typography |
| **Warm Grey** | `#77776F` | Secondary labels, muted timestamps, and icons |
| **Soft Beige** | `#E8E4DA` | Structural dividers, card borders, and input strokes |
| **Coral** | `#D97757` | High-priority task badges and urgent overdue indicators |

---

## Redesigned Navigation Experience

AthravOS introduces a completely redesigned navigation system:

### Desktop Navigation
- **Custom Productivity Icon & Wordmark**: Proprietary geometric check/spark brand mark paired with the AthravOS wordmark.
- **Dedicated Section Links**:
  - **Dashboard / Today**: Focuses on today's priorities and dashboard metrics.
  - **All Tasks**: Instantly displays all workspace tasks with sorting and filtering.
  - **Calendar**: Navigates to the interactive monthly calendar engine.
  - **Categories**: Opens the Category Manager modal.
- **Search Control**: Real-time filtering across titles and descriptions with keyboard shortcut hint (`Ctrl+K` or `/`).
- **Prominent Action Button**: Forest Green `+ New Task` button.
- **Theme Toggle**: One-click switch between Warm Ivory (Light) and Deep Forest-Charcoal (Dark).

### Mobile Navigation
- **Responsive Top Header**: AthravOS logo, theme toggle, and hamburger toggle.
- **Slide-Down Mobile Drawer**: Full-width navigation links and workspace stats overview.
- **Sticky Thumb-Friendly Bottom Navigation**: Dedicated 4-tab bottom bar (`Today`, `Tasks`, `Calendar`, `Categories`) providing 1-tap access on touch devices with zero text clipping or horizontal scrolling.

---

## Core Features

### 1. Task Lifecycle Management
- **Full CRUD Operations**: Create, view, edit, complete, reopen, and delete tasks.
- **Title Validation**: Immediate feedback on required task titles without abrupt alerts.
- **Destructive Action Safety**: Accessible delete confirmation modal with a 4-second "Undo" toast notification.
- **Contextual Empty States**: Custom illustrations and guidance when filters yield no results.

### 2. Task Details & Compatibility
- Supported metadata: `id`, `title`, legacy `text`, `description`, `priority` (`high` [Coral], `medium`, `low`), `category`, `dueDate`, `dueTime`, `completed`, `createdAt`, `updatedAt`.
- **100% Backward Compatible**: Reads existing localStorage tasks seamlessly without data corruption.

### 3. Analytics Dashboard
- Live counters for **Total Tasks**, **Completed**, **Pending**, and **Overdue**.
- Real-time completion rate calculation.
- **Dual Visual Indicators**: Animated SVG radial progress circle and linear progress bar with `role="progressbar"`.

### 4. Multi-Criteria Filtering, Search & Sorting
- **Status Filters**: All, Today, Upcoming, Overdue, Completed, Pending (with live count badges).
- **Category Filter**: Filter by default or custom categories.
- **Priority Filter**: High, Medium, Low.
- **6 Sort Modes**: Due Date (Asc/Desc), Priority (High to Low), Created Date (Newest/Oldest), Alphabetical (A–Z).
- Filters operate simultaneously in tandem.

### 5. Categories Engine
- Default tags: `Personal`, `Study`, `College`, and `Projects`.
- Custom Category Manager modal allowing users to create and delete custom categories.
- Persistent in `localStorage`.

### 6. Interactive Calendar View
- 7-column monthly calendar grid with `< Prev`, `Today`, `Next >` navigation.
- Date cells display task indicators (highlighting Coral for high-priority or overdue tasks).
- Interactive **Agenda Drawer** displaying all tasks for the selected date with a quick "+ Add Task for This Date" shortcut.

### 7. Dual Theme (Light & Dark Mode)
- Custom Warm Ivory and Deep Forest-Charcoal themes.
- Persisted in `localStorage` under `todo_theme`.
- Preload script prevents theme flashes (FOUC).

### 8. Accessibility & Keyboard Shortcuts
- Semantic HTML5 landmark structure.
- Shortcuts:
  - `Ctrl + K` or `/` : Focus search input
  - `N` : Open New Task modal
  - `Esc` : Close any active modal or drawer
- Focus management: Trapped focus inside modals with visible `:focus-visible` ring.

---

## Technologies Used

- **HTML5**: Semantic structure, accessibility landmarks, inline vector SVGs.
- **CSS3**: Custom properties (CSS variables), CSS Grid, Flexbox, media queries.
- **JavaScript (ES6+)**: Vanilla DOM manipulation, Web Storage API, Event delegation.
- **Node.js**: Embedded test runner for unit and integration testing.

---

## Local Setup & Development

### 1. Clone the repository
```bash
git clone https://github.com/Athravpathak-git/ToDo-List.git
cd ToDo-List
```

### 2. Run Locally
Start a local development server on port 3003:

**Using Python:**
```bash
python -m http.server 3003
```
Then visit `http://localhost:3003` in your browser.

**Using npm:**
```bash
npm start
```

### 3. Running Automated Tests
Run unit and DOM integration tests:

```bash
npm.cmd test
```
*Or using Node directly:*
```bash
node tests/unit.test.js
node tests/integration.test.js
```

---

## Deployment

AthravOS is deployed live on GitHub Pages:
**[https://athravpathak-git.github.io/ToDo-List/](https://athravpathak-git.github.io/ToDo-List/)**

To deploy your own copy to GitHub Pages:
1. Navigate to repository **Settings** > **Pages**.
2. Under **Build and deployment** > **Branch**, select `main` and directory `/ (root)`.
3. Save to publish.

---

## License

This project is licensed under the [MIT License](LICENSE).
