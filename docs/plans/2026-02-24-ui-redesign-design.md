# UI Redesign: Refined Dev-Tool Polish

**Date**: 2026-02-24
**Direction**: Keep monospace/dark identity, elevate to premium dev-tool aesthetic (Linear, Raycast, Warp)
**Scope**: Full layout redesign — theme, app shell, shared components, all pages, forms

---

## 1. Theme & Visual Foundation

### Font
- Primary: `JetBrains Mono` (Google Fonts)
- Fallback: `"Fira Code", "Cascadia Code", monospace`

### Accent Color
- Muted cyan/teal as custom primary, replacing Mantine default blue
- Used for: focused inputs, active tabs, links, primary buttons

### Component Overrides (in Mantine theme)
- **Table**: tighter row padding, subtle 1px `dark.5` row borders, slightly smaller font
- **Button**: compact variants get subtle border on hover instead of background change
- **Tabs**: underline indicator style
- **Paper**: default subtle border (1px `dark.5`), no shadow
- **Badge**: smaller, pill-shaped
- **Modal**: backdrop blur, subtle border

### Spacing
- Page padding: `xl`
- Section gaps: `lg`
- Within-section gaps: `md`

---

## 2. App Shell & Navigation

### Structure
```
┌──────────────────────────────────────────────────┐
│  CRONNY    [Jobs]  [Clients]           (dark.8)   │  ← 48px fixed header
├──────────────────────────────────────────────────┤
│  Jobs / Willhaben Wien               [Edit] [Run] │  ← PageHeader (per-page)
├──────────────────────────────────────────────────┤
│                                                    │
│  (page content, max-width 1400px centered)         │
│                                                    │
└──────────────────────────────────────────────────┘
```

- Mantine `AppShell` with fixed header, no sidebar
- Header: app name left, nav links with active underline indicators
- Content: max-width 1400px, centered, generous padding
- Tables can break out to full width within the content area

---

## 3. Shared Components

### PageHeader
- Props: `title`, `breadcrumbs: {label, to?}[]`, `actions: ReactNode`
- Breadcrumbs are links except the last item (current page)
- Actions right-aligned
- Subtle bottom border separating from content
- Used on every page

### DataTable
- Wraps Mantine `Table` with:
  - Capitalized column labels (`createdAt` -> `Created`)
  - Styled sort indicators (not raw text arrows)
  - Consistent row height and cell padding
  - Centered "No results" empty state
  - Optional row count badge in header area

### StatCard
- `Paper` with label (dimmed, small) and value (bold)
- Used in a horizontal row on job detail page
- Shows: Status, Strategy, Schedule, Last Run / Next Run

---

## 4. Page Redesigns

### Jobs List (`/`)
- PageHeader: title "Jobs", action: "New Job" button (proper styled button)
- Table in `Paper` container
- Strategy column: colored `Badge`
- Actions: icon buttons (copy for duplicate, braces for JSON) with tooltips
- Result count badge near title

### Job Detail (`/jobs/$jobId`)
- PageHeader: breadcrumbs `Jobs / {name}`, actions: Edit (icon), Run (primary), Delete (red icon)
- StatCard row: Status, Strategy, Schedule, Last Run / Next Run
- Active results in Paper-wrapped DataTable with section label "Active Results (n)"
- Secondary results in Tabs (underline variant) with counts in tab labels

### Clients List (`/clients`)
- PageHeader: title "Clients", action: "Add Client" button
- Table in Paper container
- API key: truncated with copy button
- Allowed jobs: Badge pills

### Client Detail (`/clients/$clientId`)
- PageHeader: breadcrumbs `Clients / {name}`, action: Edit
- Config in Paper section

### New Job (`/jobs/new`)
- PageHeader: breadcrumbs `Jobs / New Job`
- Form sections in Paper containers with section labels

---

## 5. Forms Polish

### JobFormV2 Layout
- Each section (Strategy & Params, Filters, Geo, Notifications, Schedule) in `Paper` with bold section label
- `lg` gap between sections
- Strategy description shown as dimmed helper text below selector

### UI/JSON Toggle
- Segmented control (`UI | JSON`) at top-right of form, replacing Switch

### Filter Builder
- Tighter inline row layout per filter
- "Add Filter" as subtle outlined button

### Notification Config
- Collapsible blocks per notification, header shows type name

### Submit
- Sticky bottom bar with submit button, always visible on long forms

---

## Files Affected (estimated)

### New files
- `components/PageHeader.tsx`
- `components/DataTable.tsx`
- `components/StatCard.tsx`
- `theme.ts` (extracted from App.tsx)

### Modified files
- `App.tsx` — import theme, add Google Font link
- `routes/__root.tsx` — AppShell layout
- `routes/index.tsx` — jobs list redesign
- `routes/jobs/$jobId/index.tsx` — job detail redesign
- `routes/jobs/new.tsx` — form page layout
- `routes/clients/index.tsx` — clients list redesign
- `routes/clients/$clientId.tsx` — client detail redesign
- `components/ResultsTable.tsx` — integrate DataTable or apply same patterns
- `components/job-form/JobFormV2.tsx` — section layout, toggle, sticky submit
- `components/job-form/DataFilterBuilder.tsx` — spacing cleanup
- `components/job-form/NotifyConfigForm.tsx` — collapsible blocks
- `components/job-form/StrategySelector.tsx` — description text
- `components/job-form/StrategyParamsForm.tsx` — spacing consistency
- `components/job-form/GeoFilterSection.tsx` — Paper wrapping
- `components/EditClientForm.tsx` — consistent styling
- `index.css` — Google Font import, any global resets
- `index.html` — Google Font preload (optional)
