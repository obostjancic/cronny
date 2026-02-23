# UI Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Elevate Cronny's UI from a functional dev dashboard to a refined, premium dev-tool aesthetic (Linear/Raycast-inspired) while keeping the monospace/dark identity.

**Architecture:** Extract a centralized Mantine theme with JetBrains Mono, muted teal accent, and component-level overrides. Replace the bare root layout with Mantine AppShell (fixed header, no sidebar). Introduce three shared components (PageHeader, DataTable, StatCard) used across all pages. Redesign every page with consistent structure: PageHeader + Paper-wrapped content sections.

**Tech Stack:** React 19, Mantine 7, TanStack Router, TanStack Query, @tabler/icons-react, JetBrains Mono (Google Fonts)

---

### Task 1: Theme Foundation

Create the centralized theme config and load JetBrains Mono.

**Files:**
- Create: `packages/client/src/theme.ts`
- Modify: `packages/client/index.html`
- Modify: `packages/client/src/index.css`
- Modify: `packages/client/src/App.tsx`

**Step 1: Create theme.ts**

Create `packages/client/src/theme.ts` with the full Mantine theme:

```typescript
import { createTheme, rem, MantineColorsTuple } from "@mantine/core";

// Muted teal/cyan accent — 10 shades for Mantine
const teal: MantineColorsTuple = [
  "#e6fcf5",
  "#c3fae8",
  "#96f2d7",
  "#63e6be",
  "#38d9a9",
  "#20c997",
  "#12b886",
  "#0ca678",
  "#099268",
  "#087f5b",
];

export const theme = createTheme({
  fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace',
  primaryColor: "teal",
  defaultRadius: "md",
  colors: {
    teal,
  },
  components: {
    Table: {
      defaultProps: {
        highlightOnHover: true,
        stickyHeader: true,
      },
      styles: {
        th: {
          fontSize: rem(12),
          textTransform: "uppercase" as const,
          letterSpacing: "0.05em",
          color: "var(--mantine-color-dimmed)",
        },
        td: {
          fontSize: rem(13),
        },
      },
    },
    Paper: {
      defaultProps: {
        withBorder: true,
      },
      styles: {
        root: {
          borderColor: "var(--mantine-color-dark-4)",
        },
      },
    },
    Modal: {
      styles: {
        content: {
          borderColor: "var(--mantine-color-dark-4)",
          border: "1px solid var(--mantine-color-dark-4)",
        },
        overlay: {
          backdropFilter: "blur(4px)",
        },
      },
    },
    Badge: {
      defaultProps: {
        variant: "light",
        size: "sm",
        radius: "xl",
      },
    },
    Tabs: {
      defaultProps: {
        variant: "default",
      },
    },
  },
});
```

**Step 2: Add JetBrains Mono to index.html**

In `packages/client/index.html`, add inside `<head>` before `<title>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
```

**Step 3: Update index.css**

Replace `packages/client/src/index.css` contents with:

```css
body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
}

/* Smooth scrolling for the app */
html {
  scroll-behavior: smooth;
}

/* Tighter table rows globally */
.mantine-Table-td,
.mantine-Table-th {
  padding-block: 0.5rem !important;
}
```

**Step 4: Update App.tsx to use extracted theme**

In `packages/client/src/App.tsx`:
- Remove the `createTheme` import and inline theme definition
- Import `theme` from `./theme`
- The rest of App.tsx stays the same

Replace:
```typescript
import { createTheme, MantineProvider } from "@mantine/core";
```
With:
```typescript
import { MantineProvider } from "@mantine/core";
```

Remove:
```typescript
const theme = createTheme({
  /** Put your mantine theme override here */
  fontFamily: "monospace",
  defaultRadius: "md",
  // colors: "dark",
});
```

Add import:
```typescript
import { theme } from "./theme";
```

**Step 5: Verify it compiles**

Run: `cd packages/client && pnpm build`
Expected: Build succeeds with no errors

**Step 6: Commit**

```bash
git add packages/client/src/theme.ts packages/client/index.html packages/client/src/index.css packages/client/src/App.tsx
git commit -m "feat(client): add centralized theme with JetBrains Mono and teal accent"
```

---

### Task 2: AppShell Layout

Replace the bare root layout with Mantine AppShell.

**Files:**
- Modify: `packages/client/src/routes/__root.tsx`

**Step 1: Rewrite __root.tsx**

Replace the entire contents of `packages/client/src/routes/__root.tsx`:

```tsx
import { AppShell, Flex, Group, Loader, Text, UnstyledButton } from "@mantine/core";
import { createRootRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Suspense } from "react";

export const Route = createRootRoute({
  component: RootLayout,
});

function NavLink({ to, label }: { to: string; label: string }) {
  const router = useRouterState();
  const isActive = router.location.pathname === to ||
    (to !== "/" && router.location.pathname.startsWith(to));

  return (
    <UnstyledButton
      component={Link}
      to={to}
      py="xs"
      px="sm"
      style={{
        borderBottom: isActive ? "2px solid var(--mantine-color-teal-6)" : "2px solid transparent",
        color: isActive ? "var(--mantine-color-teal-4)" : "var(--mantine-color-dimmed)",
        fontWeight: isActive ? 600 : 400,
        fontSize: "var(--mantine-font-size-sm)",
        transition: "all 150ms ease",
      }}
    >
      {label}
    </UnstyledButton>
  );
}

function RootLayout() {
  return (
    <AppShell header={{ height: 48 }} padding="xl">
      <AppShell.Header
        style={{
          backgroundColor: "var(--mantine-color-dark-8)",
          borderBottom: "1px solid var(--mantine-color-dark-4)",
        }}
      >
        <Flex h="100%" align="center" px="xl" gap="lg">
          <Text fw={700} size="sm" c="teal.4" mr="md">
            CRONNY
          </Text>
          <Group gap={0}>
            <NavLink to="/" label="Jobs" />
            <NavLink to="/clients" label="Clients" />
          </Group>
        </Flex>
      </AppShell.Header>

      <AppShell.Main>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <Suspense fallback={<Loader size="sm" />}>
            <Outlet />
          </Suspense>
        </div>
      </AppShell.Main>
    </AppShell>
  );
}
```

**Step 2: Verify it compiles**

Run: `cd packages/client && pnpm build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add packages/client/src/routes/__root.tsx
git commit -m "feat(client): replace flat nav with AppShell layout"
```

---

### Task 3: PageHeader Component

Create the reusable PageHeader component used on every page.

**Files:**
- Create: `packages/client/src/components/PageHeader.tsx`

**Step 1: Create PageHeader.tsx**

```tsx
import { Anchor, Breadcrumbs, Flex, Group, Text } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { ReactNode } from "react";

interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface PageHeaderProps {
  breadcrumbs: BreadcrumbItem[];
  actions?: ReactNode;
}

export function PageHeader({ breadcrumbs, actions }: PageHeaderProps) {
  return (
    <Flex
      justify="space-between"
      align="center"
      pb="lg"
      mb="lg"
      style={{ borderBottom: "1px solid var(--mantine-color-dark-4)" }}
    >
      <Breadcrumbs
        separator="/"
        styles={{
          separator: { color: "var(--mantine-color-dimmed)", marginInline: 8 },
        }}
      >
        {breadcrumbs.map((item, index) =>
          item.to ? (
            <Anchor
              component={Link}
              to={item.to}
              key={index}
              size="sm"
              c="dimmed"
              underline="hover"
            >
              {item.label}
            </Anchor>
          ) : (
            <Text key={index} size="sm" fw={600}>
              {item.label}
            </Text>
          )
        )}
      </Breadcrumbs>
      {actions && <Group gap="xs">{actions}</Group>}
    </Flex>
  );
}
```

**Step 2: Verify it compiles**

Run: `cd packages/client && pnpm build`
Expected: Build succeeds (component is not yet imported anywhere, but should compile)

**Step 3: Commit**

```bash
git add packages/client/src/components/PageHeader.tsx
git commit -m "feat(client): add PageHeader component with breadcrumbs and actions"
```

---

### Task 4: StatCard Component

Create the StatCard component for the job detail page.

**Files:**
- Create: `packages/client/src/components/StatCard.tsx`

**Step 1: Create StatCard.tsx**

```tsx
import { Paper, Text } from "@mantine/core";
import { ReactNode } from "react";

interface StatCardProps {
  label: string;
  children: ReactNode;
}

export function StatCard({ label, children }: StatCardProps) {
  return (
    <Paper p="sm" style={{ flex: 1, minWidth: 140 }}>
      <Text size="xs" c="dimmed" tt="uppercase" fw={500} mb={4}>
        {label}
      </Text>
      <Text size="sm" fw={600}>
        {children}
      </Text>
    </Paper>
  );
}
```

**Step 2: Commit**

```bash
git add packages/client/src/components/StatCard.tsx
git commit -m "feat(client): add StatCard component for metric display"
```

---

### Task 5: ResultsTable Redesign

Upgrade ResultsTable with capitalized headers, styled sort indicators, and cleaner layout.

**Files:**
- Modify: `packages/client/src/components/ResultsTable.tsx`

**Step 1: Rewrite ResultsTable.tsx**

Replace the entire contents of `packages/client/src/components/ResultsTable.tsx`:

```tsx
import { JSONObject, Result } from "@cronny/types";
import { ActionIcon, Button, Center, Flex, Group, Paper, Table, Text, Tooltip } from "@mantine/core";
import { IconArrowDown, IconArrowUp, IconArrowsSort, IconExternalLink } from "@tabler/icons-react";
import ReactTimeago from "react-timeago";
import { usePatchResult } from "../api/useResults";
import useOpenJSONInNewTab from "../hooks/useOpenJSONinNewTab";
import useSortableData from "../hooks/useSortableData";
import { formatDate } from "../utils/date/date";
import { formatPrice, formatNumber } from "../utils/format";

const COLUMN_LABELS: Record<string, string> = {
  url: "Link",
  area: "Area",
  day: "Day",
  category: "Category",
  title: "Title",
  createdAt: "Created",
  size: "Size",
  price: "Price",
};

function SortIndicator({ column, sortConfig }: { column: string; sortConfig: { key: string; direction: string } | null }) {
  if (sortConfig?.key !== column) {
    return <IconArrowsSort size={14} style={{ opacity: 0.3 }} />;
  }
  return sortConfig.direction === "ascending"
    ? <IconArrowUp size={14} />
    : <IconArrowDown size={14} />;
}

interface ResultsTableProps {
  rows: (Result & JSONObject)[];
  label?: string;
}

export function ResultsTable({ rows, label }: ResultsTableProps) {
  const { items, requestSort, sortConfig } = useSortableData(rows, {
    key: "createdAt",
    direction: "descending",
  });

  const openJSONInNewTab = useOpenJSONInNewTab();
  const patchResult = usePatchResult();

  if (!rows || rows.length === 0) {
    return (
      <Paper p="xl">
        <Center>
          <Text size="sm" c="dimmed">No results</Text>
        </Center>
      </Paper>
    );
  }

  const allColumns = ["url", "area", "day", "category", "title", "createdAt", "size", "price"];
  const columns = allColumns.filter((column) => rows.some((row) => row[column] !== undefined));

  return (
    <div>
      {label && (
        <Group gap="xs" mb="sm">
          <Text size="sm" fw={600}>{label}</Text>
          <Text size="xs" c="dimmed">({rows.length})</Text>
        </Group>
      )}
      <Paper p={0} style={{ overflow: "hidden" }}>
        <Table>
          <Table.Thead>
            <Table.Tr>
              {columns.map((column) => (
                <Table.Th
                  key={column}
                  onClick={() => requestSort(column)}
                  style={{ cursor: "pointer", userSelect: "none" }}
                >
                  <Group gap={4} wrap="nowrap">
                    {COLUMN_LABELS[column] || column}
                    <SortIndicator column={column} sortConfig={sortConfig} />
                  </Group>
                </Table.Th>
              ))}
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {items.map((row) => (
              <Table.Tr key={row.id}>
                {columns.map((column) => {
                  if (column === "url") {
                    return (
                      <Table.Td key={column}>
                        <Tooltip label="Open listing">
                          <ActionIcon
                            component="a"
                            href={(row[column] as string) ?? "#"}
                            target="_blank"
                            rel="noreferrer"
                            variant="subtle"
                            size="sm"
                          >
                            <IconExternalLink size={16} />
                          </ActionIcon>
                        </Tooltip>
                      </Table.Td>
                    );
                  }
                  if (column === "title") {
                    return (
                      <Table.Td key={column}>
                        <Text size="sm">{row[column]?.toString()}</Text>
                        {row["text"] && (
                          <Text size="xs" c="dimmed" lineClamp={1}>
                            {row["text"]?.toString()}
                          </Text>
                        )}
                      </Table.Td>
                    );
                  }
                  if (column === "createdAt") {
                    return (
                      <Table.Td key={column}>
                        <Text size="sm"><ReactTimeago date={row[column] as string} /></Text>
                      </Table.Td>
                    );
                  }
                  if (column === "day") {
                    return (
                      <Table.Td key={column}>
                        <Text size="sm">{formatDate(row[column] as string)}</Text>
                      </Table.Td>
                    );
                  }
                  if (column === "price") {
                    return (
                      <Table.Td key={column}>
                        <Text size="sm">{formatPrice(row[column] as number)}</Text>
                      </Table.Td>
                    );
                  }
                  if (column === "size") {
                    return (
                      <Table.Td key={column}>
                        <Text size="sm">{formatNumber(row[column] as number)} m²</Text>
                      </Table.Td>
                    );
                  }
                  return (
                    <Table.Td key={column} maw="300px">
                      <Text truncate="end" size="sm">{row[column]?.toString()}</Text>
                    </Table.Td>
                  );
                })}
                <Table.Td>
                  <Group gap={4}>
                    <ChangeResultStateButton onClick={patchResult.mutate} row={row} />
                    <Tooltip label="View JSON">
                      <ActionIcon variant="subtle" size="sm" onClick={() => openJSONInNewTab(row)}>
                        <Text size="xs" fw={500}>{ "{}" }</Text>
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>
    </div>
  );
}

function ChangeResultStateButton(props: {
  onClick: (data: Partial<Result>) => void;
  row: Result;
}) {
  const label = props.row.isHidden ? "Show" : "Hide";

  return (
    <Button
      disabled={props.row.status === "expired" && !props.row.isHidden}
      variant="subtle"
      size="compact-xs"
      onClick={() => {
        props.onClick({
          id: props.row.id,
          jobId: props.row.jobId,
          isHidden: !props.row.isHidden,
        });
      }}
    >
      {label}
    </Button>
  );
}
```

**Step 2: Verify it compiles**

Run: `cd packages/client && pnpm build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add packages/client/src/components/ResultsTable.tsx
git commit -m "feat(client): redesign ResultsTable with capitalized headers and sort icons"
```

---

### Task 6: Jobs List Page Redesign

Redesign the jobs list page with PageHeader, Paper-wrapped table, badges, and icon actions.

**Files:**
- Modify: `packages/client/src/routes/index.tsx`

**Step 1: Rewrite jobs list page**

Replace the entire contents of `packages/client/src/routes/index.tsx`:

```tsx
import { JobWithTiming } from "@cronny/types";
import { ActionIcon, Badge, Button, Group, Paper, Table, Text, Tooltip } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCopy, IconPlus } from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import ReactTimeago from "react-timeago";
import { useGetJobs, usePostJob } from "../api/useJobs";
import useOpenJSONInNewTab from "../hooks/useOpenJSONinNewTab";
import { PageHeader } from "../components/PageHeader";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const jobs = useGetJobs();
  const postJob = usePostJob();
  const openJSONInNewTab = useOpenJSONInNewTab();

  const jobsList = (jobs.data as JobWithTiming[]) ?? [];

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Jobs" }]}
        actions={
          <Button
            component={Link}
            to="/jobs/new"
            size="compact-sm"
            leftSection={<IconPlus size={14} />}
          >
            New Job
          </Button>
        }
      />

      <Paper p={0} style={{ overflow: "hidden" }}>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Strategy</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Last Run</Table.Th>
              <Table.Th>Next Run</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {jobsList.map((job) => (
              <Table.Tr key={job.id}>
                <Table.Td>
                  <Text
                    component={Link}
                    to="/jobs/$jobId"
                    params={{ jobId: String(job.id) }}
                    size="sm"
                    fw={500}
                    c="teal.4"
                    style={{ textDecoration: "none" }}
                  >
                    {job.name}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Badge>{job.strategy}</Badge>
                </Table.Td>
                <Table.Td>
                  {job.enabled ? (
                    <Badge color="green">Active</Badge>
                  ) : (
                    <Badge color="orange">Paused</Badge>
                  )}
                </Table.Td>
                <Table.Td>
                  <Text size="sm">
                    {job.lastRun ? <ReactTimeago date={job.lastRun} /> : "Never"}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">
                    {job.nextRun ? <ReactTimeago date={job.nextRun} /> : "—"}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Group gap={4}>
                    <Tooltip label="View JSON">
                      <ActionIcon
                        variant="subtle"
                        size="sm"
                        onClick={() => openJSONInNewTab(job)}
                      >
                        <Text size="xs" fw={500}>{ "{}" }</Text>
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Duplicate">
                      <ActionIcon
                        variant="subtle"
                        size="sm"
                        onClick={() => {
                          postJob.mutate(
                            { ...job, id: undefined, enabled: false },
                            {
                              onSuccess: () => {
                                notifications.show({
                                  title: "Success",
                                  message: `Duplicated "${job.name}"`,
                                  autoClose: 2000,
                                });
                              },
                              onError: (error) => {
                                notifications.show({
                                  title: "Error",
                                  message: error.message || "Failed to duplicate job",
                                  color: "red",
                                });
                              },
                            }
                          );
                        }}
                      >
                        <IconCopy size={16} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>
    </div>
  );
}
```

**Step 2: Verify it compiles**

Run: `cd packages/client && pnpm build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add packages/client/src/routes/index.tsx
git commit -m "feat(client): redesign jobs list with PageHeader, badges, and icon actions"
```

---

### Task 7: Job Detail Page Redesign

Redesign the job detail page with PageHeader, StatCards, and cleaner results layout.

**Files:**
- Modify: `packages/client/src/routes/jobs/$jobId/index.tsx`

**Step 1: Rewrite job detail page**

Replace the entire contents of `packages/client/src/routes/jobs/$jobId/index.tsx`:

```tsx
import { Result } from "@cronny/types";
import {
  ActionIcon,
  Badge,
  Button,
  Flex,
  Group,
  Modal,
  Paper,
  rem,
  Tabs,
  Text,
  Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IconClockCancel,
  IconEyeOff,
  IconFilterOff,
  IconPencil,
  IconPlayerPlay,
  IconTrash,
} from "@tabler/icons-react";
import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import ReactTimeago, { Formatter } from "react-timeago";

const shortFormatter: Formatter = (value, unit, suffix) => {
  const unitMap: Record<string, string> = {
    second: "s",
    minute: "m",
    hour: "h",
    day: "d",
    week: "w",
    month: "mo",
    year: "y",
  };
  const short = unitMap[unit] || unit;
  return suffix === "ago" ? `${value}${short} ago` : `${value}${short}`;
};

import { useDeleteJob, useGetJob } from "../../../api/useJobs";
import { useDeleteResults } from "../../../api/useResults";
import { usePostRun } from "../../../api/useRuns";
import { JobFormV2 } from "../../../components/job-form";
import { PageHeader } from "../../../components/PageHeader";
import { ResultsTable } from "../../../components/ResultsTable";
import { StatCard } from "../../../components/StatCard";

export const Route = createFileRoute("/jobs/$jobId/")({
  component: () => <JobDetailsPage />,
});

const iconStyle = { width: rem(16), height: rem(16) };

function JobDetailsPage() {
  const { jobId } = useParams({ from: "/jobs/$jobId/" });
  const { data: jobDetails } = useGetJob(jobId);
  const navigate = useNavigate();

  const { results, runs, ...job } = jobDetails;

  const postRun = usePostRun();
  const deleteResults = useDeleteResults();
  const deleteJob = useDeleteJob();

  const [opened, { open, close }] = useDisclosure(false);

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete "${job.name}"? This cannot be undone.`)) {
      await deleteJob.mutateAsync(job.id);
      notifications.show({
        title: "Deleted",
        message: `Job "${job.name}" has been deleted`,
        autoClose: 2000,
      });
      navigate({ to: "/" });
    }
  };

  const activeResults = results.filter((r: Result) => !r.isHidden && r.status === "active");
  const hiddenResults = results.filter((r: Result) => r.isHidden);
  const filteredResults = results.filter((r: Result) => !r.isHidden && r.status === "filtered");
  const expiredResults = results.filter((r: Result) => !r.isHidden && r.status === "expired");

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: "Jobs", to: "/" },
          { label: job.name },
        ]}
        actions={
          <Group gap="xs">
            <Tooltip label="Edit job">
              <ActionIcon variant="subtle" size="md" onClick={open}>
                <IconPencil style={iconStyle} />
              </ActionIcon>
            </Tooltip>
            <Button
              size="compact-sm"
              leftSection={<IconPlayerPlay size={14} />}
              loading={postRun.isPending}
              onClick={() => {
                postRun.mutate(job.id, {
                  onSuccess: () => {
                    notifications.show({
                      title: "Success",
                      message: "Run has been started",
                      autoClose: 2000,
                    });
                  },
                  onError: (error) => {
                    notifications.show({
                      title: "Error",
                      message: error.message || "Failed to start run",
                      color: "red",
                    });
                  },
                });
              }}
            >
              Run Now
            </Button>
            <Button
              size="compact-sm"
              variant="subtle"
              loading={deleteResults.isPending}
              onClick={() => {
                if (confirm("Are you sure you want to clear the results?")) {
                  deleteResults.mutate(job.id, {
                    onSuccess: () => {
                      notifications.show({
                        title: "Success",
                        message: "Cleared results",
                        autoClose: 2000,
                      });
                    },
                    onError: (error) => {
                      notifications.show({
                        title: "Error",
                        message: error.message || "Failed to clear results",
                        color: "red",
                      });
                    },
                  });
                }
              }}
            >
              Clear Results
            </Button>
            <Tooltip label="Delete job">
              <ActionIcon variant="subtle" color="red" size="md" onClick={handleDelete}>
                <IconTrash style={iconStyle} />
              </ActionIcon>
            </Tooltip>
          </Group>
        }
      />

      {/* Stat cards */}
      <Flex gap="md" mb="lg" wrap="wrap">
        <StatCard label="Status">
          {job.enabled ? (
            <Badge color="green">Active</Badge>
          ) : (
            <Badge color="orange">Paused</Badge>
          )}
        </StatCard>
        <StatCard label="Strategy">
          <Badge>{job.strategy}</Badge>
        </StatCard>
        <StatCard label="Schedule">
          {job.cron}
        </StatCard>
        <StatCard label="Last Run">
          {runs[0]?.start ? (
            <ReactTimeago date={runs[0].start} formatter={shortFormatter} />
          ) : (
            "Never"
          )}
        </StatCard>
        {jobDetails.nextRun && (
          <StatCard label="Next Run">
            <ReactTimeago date={jobDetails.nextRun} formatter={shortFormatter} />
          </StatCard>
        )}
      </Flex>

      {/* Active results */}
      <ResultsTable
        rows={activeResults.map((r: Result) => ({ ...r.data, ...r }))}
        label="Active Results"
      />

      {/* Secondary results tabs */}
      <Paper p={0} mt="xl" style={{ overflow: "hidden" }}>
        <Tabs defaultValue="hidden">
          <Tabs.List>
            <Tabs.Tab
              value="hidden"
              leftSection={<IconEyeOff style={iconStyle} />}
            >
              Hidden ({hiddenResults.length})
            </Tabs.Tab>
            <Tabs.Tab
              value="filtered"
              leftSection={<IconFilterOff style={iconStyle} />}
            >
              Filtered ({filteredResults.length})
            </Tabs.Tab>
            <Tabs.Tab
              value="expired"
              leftSection={<IconClockCancel style={iconStyle} />}
            >
              Expired ({expiredResults.length})
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="hidden" p="sm">
            <ResultsTable rows={hiddenResults.map((r: Result) => ({ ...r.data, ...r }))} />
          </Tabs.Panel>
          <Tabs.Panel value="filtered" p="sm">
            <ResultsTable rows={filteredResults.map((r: Result) => ({ ...r.data, ...r }))} />
          </Tabs.Panel>
          <Tabs.Panel value="expired" p="sm">
            <ResultsTable rows={expiredResults.map((r: Result) => ({ ...r.data, ...r }))} />
          </Tabs.Panel>
        </Tabs>
      </Paper>

      <Modal opened={opened} onClose={close} title={`Edit: ${job.name}`} size="90%">
        <JobFormV2 initialValues={job} onSubmit={close} isEdit={true} />
      </Modal>
    </div>
  );
}
```

**Step 2: Verify it compiles**

Run: `cd packages/client && pnpm build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add packages/client/src/routes/jobs/\$jobId/index.tsx
git commit -m "feat(client): redesign job detail with StatCards, PageHeader, and tab counts"
```

---

### Task 8: Clients List Page Redesign

Redesign with PageHeader, Paper table, badge pills for allowed jobs, and truncated API keys.

**Files:**
- Modify: `packages/client/src/routes/clients/index.tsx`

**Step 1: Rewrite clients list page**

Replace the entire contents of `packages/client/src/routes/clients/index.tsx`:

```tsx
import {
  ActionIcon,
  Badge,
  Button,
  CopyButton,
  Group,
  Modal,
  Paper,
  Table,
  Text,
  Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconCheck, IconCopy, IconPlus } from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useGetClients } from "../../api/useClients";
import { useGetJobs } from "../../api/useJobs";
import { EditClientForm } from "../../components/EditClientForm";
import { PageHeader } from "../../components/PageHeader";

export const Route = createFileRoute("/clients/")({
  component: Clients,
});

function Clients() {
  const [opened, { open, close }] = useDisclosure(false);
  const { data: clients = [] } = useGetClients();
  const { data: jobs = [] } = useGetJobs();

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Clients" }]}
        actions={
          <Button
            size="compact-sm"
            leftSection={<IconPlus size={14} />}
            onClick={open}
          >
            Add Client
          </Button>
        }
      />

      <Paper p={0} style={{ overflow: "hidden" }}>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>API Key</Table.Th>
              <Table.Th>Allowed Jobs</Table.Th>
              <Table.Th>Status</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {clients.map((client) => (
              <Table.Tr key={client.id}>
                <Table.Td>
                  <Text
                    component={Link}
                    to="/clients/$clientId"
                    params={{ clientId: String(client.id) }}
                    size="sm"
                    fw={500}
                    c="teal.4"
                    style={{ textDecoration: "none" }}
                  >
                    {client.name}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Group gap={4}>
                    <Text size="xs" c="dimmed" ff="monospace">
                      {client.apiKey.slice(0, 12)}...
                    </Text>
                    <CopyButton value={client.apiKey}>
                      {({ copied, copy }) => (
                        <Tooltip label={copied ? "Copied" : "Copy API key"}>
                          <ActionIcon variant="subtle" size="sm" onClick={copy}>
                            {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                          </ActionIcon>
                        </Tooltip>
                      )}
                    </CopyButton>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Group gap={4}>
                    {client.allowedJobs?.map((jobId) => {
                      const job = jobs.find((j) => j.id === jobId);
                      if (!job) return null;
                      return (
                        <Badge key={jobId} size="xs">
                          {job.name}
                        </Badge>
                      );
                    })}
                  </Group>
                </Table.Td>
                <Table.Td>
                  {client.enabled ? (
                    <Badge color="green">Active</Badge>
                  ) : (
                    <Badge color="gray">Disabled</Badge>
                  )}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>

      <Modal opened={opened} onClose={close} title="New Client" size="lg">
        <EditClientForm initialValues={null} onSubmit={close} />
      </Modal>
    </div>
  );
}
```

**Step 2: Verify it compiles**

Run: `cd packages/client && pnpm build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add packages/client/src/routes/clients/index.tsx
git commit -m "feat(client): redesign clients list with PageHeader, copy buttons, and badge pills"
```

---

### Task 9: Client Detail Page Redesign

Redesign with PageHeader, breadcrumbs, and Paper-wrapped config sections.

**Files:**
- Modify: `packages/client/src/routes/clients/$clientId.tsx`

**Step 1: Rewrite client detail page**

Replace the entire contents of `packages/client/src/routes/clients/$clientId.tsx`:

```tsx
import {
  ActionIcon,
  Badge,
  CopyButton,
  Group,
  Modal,
  Paper,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconCheck, IconCopy, IconPencil } from "@tabler/icons-react";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { useGetClient } from "../../api/useClients";
import { useGetJobs } from "../../api/useJobs";
import { EditClientForm } from "../../components/EditClientForm";
import { PageHeader } from "../../components/PageHeader";

export const Route = createFileRoute("/clients/$clientId")({
  component: ClientDetailsPage,
});

function ClientDetailsPage() {
  const { clientId } = useParams({ from: "/clients/$clientId" });
  const { data: client } = useGetClient(+clientId);
  const [opened, { open, close }] = useDisclosure(false);
  const { data: jobs = [] } = useGetJobs();

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: "Clients", to: "/clients" },
          { label: client.name },
        ]}
        actions={
          <Tooltip label="Edit client">
            <ActionIcon variant="subtle" size="md" onClick={open}>
              <IconPencil size={16} />
            </ActionIcon>
          </Tooltip>
        }
      />

      <Stack gap="md">
        <Paper p="md">
          <Group justify="space-between" mb="sm">
            <Text size="xs" c="dimmed" tt="uppercase" fw={500}>Status</Text>
            {client.enabled ? (
              <Badge color="green">Active</Badge>
            ) : (
              <Badge color="gray">Disabled</Badge>
            )}
          </Group>

          <Group justify="space-between" mb="sm">
            <Text size="xs" c="dimmed" tt="uppercase" fw={500}>API Key</Text>
            <Group gap={4}>
              <Text size="sm" ff="monospace">{client.apiKey}</Text>
              <CopyButton value={client.apiKey}>
                {({ copied, copy }) => (
                  <Tooltip label={copied ? "Copied" : "Copy"}>
                    <ActionIcon variant="subtle" size="sm" onClick={copy}>
                      {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                    </ActionIcon>
                  </Tooltip>
                )}
              </CopyButton>
            </Group>
          </Group>

          <Group justify="space-between" align="flex-start">
            <Text size="xs" c="dimmed" tt="uppercase" fw={500}>Allowed Jobs</Text>
            <Group gap={4}>
              {client.allowedJobs?.map((jobId) => {
                const job = jobs.find((j) => j.id === jobId);
                if (!job) return null;
                return <Badge key={jobId} size="xs">{job.name}</Badge>;
              })}
              {(!client.allowedJobs || client.allowedJobs.length === 0) && (
                <Text size="sm" c="dimmed">None</Text>
              )}
            </Group>
          </Group>
        </Paper>
      </Stack>

      <Modal opened={opened} onClose={close} title={`Edit: ${client.name}`} size="lg">
        <EditClientForm initialValues={client} onSubmit={close} />
      </Modal>
    </div>
  );
}
```

**Step 2: Verify it compiles**

Run: `cd packages/client && pnpm build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add packages/client/src/routes/clients/\$clientId.tsx
git commit -m "feat(client): redesign client detail with PageHeader and Paper config"
```

---

### Task 10: New Job Page Redesign

Add PageHeader with breadcrumbs.

**Files:**
- Modify: `packages/client/src/routes/jobs/new.tsx`

**Step 1: Rewrite new job page**

Replace the entire contents of `packages/client/src/routes/jobs/new.tsx`:

```tsx
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { JobFormV2 } from "../../components/job-form";
import { PageHeader } from "../../components/PageHeader";

export const Route = createFileRoute("/jobs/new")({
  component: () => <NewJobPage />,
});

function NewJobPage() {
  const navigate = useNavigate();

  const handleSubmit = () => {
    navigate({ to: "/" });
  };

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: "Jobs", to: "/" },
          { label: "New Job" },
        ]}
      />
      <JobFormV2 onSubmit={handleSubmit} isEdit={false} />
    </div>
  );
}
```

**Step 2: Verify it compiles**

Run: `cd packages/client && pnpm build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add packages/client/src/routes/jobs/new.tsx
git commit -m "feat(client): add PageHeader to new job page"
```

---

### Task 11: JobFormV2 Polish

Replace the Switch toggle with SegmentedControl, add Paper section wrappers, and sticky submit bar.

**Files:**
- Modify: `packages/client/src/components/job-form/JobFormV2.tsx`

**Step 1: Rewrite JobFormV2**

In `packages/client/src/components/job-form/JobFormV2.tsx`, make these changes:

1. Replace `Switch` import with `SegmentedControl` in the imports
2. Remove `Divider` from imports (no longer needed)
3. Add `Paper` to imports
4. Replace the Switch toggle section with a SegmentedControl
5. Wrap form sections in Paper containers
6. Add sticky submit bar

Change the imports to:
```typescript
import {
  Accordion,
  Button,
  Checkbox,
  Group,
  JsonInput,
  NumberInput,
  Paper,
  SegmentedControl,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
```

Replace the form JSX (the `return` in the `JobFormV2` function, from line 308 to line 485) with:

```tsx
  return (
    <form onSubmit={form.onSubmit(handleFormSubmit)}>
      <Stack gap="lg">
        <Group justify="flex-end">
          <SegmentedControl
            size="xs"
            value={advancedMode ? "json" : "ui"}
            onChange={(v) => setAdvancedMode(v === "json")}
            data={[
              { label: "UI", value: "ui" },
              { label: "JSON", value: "json" },
            ]}
          />
        </Group>

        <Paper p="md">
          <Text size="xs" c="dimmed" tt="uppercase" fw={500} mb="sm">
            Job Configuration
          </Text>
          <Stack gap="md">
            <StrategySelector
              value={form.values.strategy}
              onChange={(value) => {
                form.setFieldValue("strategy", value);
                form.setFieldValue("strategyParams", {});
              }}
              error={form.errors.strategy as string}
            />
            <TextInput
              label="Name"
              placeholder="Job name"
              required
              {...form.getInputProps("name")}
            />
            <Checkbox
              label="Paused"
              checked={!form.values.enabled}
              onChange={(e) => form.setFieldValue("enabled", !e.currentTarget.checked)}
            />
            <TextInput
              label="Cron Expression"
              placeholder="0 9 * * *"
              description="Standard cron expression (minute hour day month weekday)"
              required
              {...form.getInputProps("cron")}
            />
            <NumberInput
              label="Max Results"
              description="Maximum number of results to keep per run"
              min={1}
              max={1000}
              {...form.getInputProps("maxResults")}
            />
          </Stack>
        </Paper>

        <Paper p="md">
          <Text size="xs" c="dimmed" tt="uppercase" fw={500} mb="sm">
            Strategy Parameters
          </Text>
          {advancedMode ? (
            <Stack gap="md">
              <JsonInput
                label="Params (JSON)"
                placeholder="{}"
                formatOnBlur
                autosize
                minRows={4}
                maxRows={15}
                value={rawParams}
                onChange={setRawParams}
              />
              <JsonInput
                label="Notify (JSON)"
                placeholder="{}"
                formatOnBlur
                autosize
                minRows={4}
                maxRows={10}
                value={rawNotify}
                onChange={setRawNotify}
              />
            </Stack>
          ) : (
            <>
              {selectedSchema ? (
                <StrategyParamsForm
                  schema={selectedSchema}
                  values={form.values.strategyParams}
                  onChange={(values) => form.setFieldValue("strategyParams", values)}
                  onUrlExtracted={supportsGeo ? handleUrlExtracted : undefined}
                />
              ) : (
                <Text size="sm" c="dimmed">
                  Select a strategy to configure parameters
                </Text>
              )}
            </>
          )}
        </Paper>

        {!advancedMode && selectedSchema && (supportsFilters || supportsGeo) && (
          <Accordion variant="separated" defaultValue="">
            {supportsFilters && (
              <Accordion.Item value="filters">
                <Accordion.Control>Data Filters</Accordion.Control>
                <Accordion.Panel>
                  <DataFilterBuilder
                    filters={form.values.dataFilters}
                    onChange={(filters) => form.setFieldValue("dataFilters", filters)}
                  />
                </Accordion.Panel>
              </Accordion.Item>
            )}

            {supportsGeo && (
              <Accordion.Item value="geo">
                <Accordion.Control>Geographic Filter</Accordion.Control>
                <Accordion.Panel>
                  <GeoFilterSection
                    filterType={form.values.geoFilterType}
                    polygonPoints={form.values.polygonPoints}
                    radiusCenter={form.values.radiusCenter}
                    radius={form.values.radius}
                    onFilterTypeChange={(type) => form.setFieldValue("geoFilterType", type)}
                    onPolygonChange={(points) => form.setFieldValue("polygonPoints", points)}
                    onRadiusCenterChange={(center) => form.setFieldValue("radiusCenter", center)}
                    onRadiusChange={(radius) => form.setFieldValue("radius", radius)}
                  />
                </Accordion.Panel>
              </Accordion.Item>
            )}

            <Accordion.Item value="notify">
              <Accordion.Control>Notifications</Accordion.Control>
              <Accordion.Panel>
                <NotifyConfigForm
                  value={form.values.notifyConfigs}
                  onChange={(configs) => form.setFieldValue("notifyConfigs", configs)}
                />
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        )}

        {!advancedMode && selectedSchema && !supportsFilters && !supportsGeo && (
          <Accordion variant="separated" defaultValue="">
            <Accordion.Item value="notify">
              <Accordion.Control>Notifications</Accordion.Control>
              <Accordion.Panel>
                <NotifyConfigForm
                  value={form.values.notifyConfigs}
                  onChange={(configs) => form.setFieldValue("notifyConfigs", configs)}
                />
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        )}

        <Paper
          p="md"
          style={{
            position: "sticky",
            bottom: 0,
            zIndex: 10,
            borderTop: "1px solid var(--mantine-color-dark-4)",
            backgroundColor: "var(--mantine-color-dark-7)",
          }}
        >
          <Group justify="flex-end">
            <Button disabled={isLoading} type="submit">
              {isEdit ? "Save Changes" : "Create Job"}
            </Button>
          </Group>
        </Paper>
      </Stack>
    </form>
  );
```

**Step 2: Verify it compiles**

Run: `cd packages/client && pnpm build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add packages/client/src/components/job-form/JobFormV2.tsx
git commit -m "feat(client): polish JobFormV2 with SegmentedControl, Paper sections, sticky submit"
```

---

### Task 12: Delete Unused Table Component

The `components/Table.tsx` wrapper is no longer used since we set table defaults in the theme.

**Files:**
- Delete: `packages/client/src/components/Table.tsx`

**Step 1: Verify Table.tsx is unused**

Search for imports of `Table` from `../components/Table` or similar. The Mantine `Table` is imported directly everywhere, so this wrapper is dead code.

Run: `grep -r "components/Table" packages/client/src/ --include="*.tsx" --include="*.ts"`

Expected: No results (or only `Table.tsx` itself)

**Step 2: Delete the file**

```bash
rm packages/client/src/components/Table.tsx
```

**Step 3: Verify build still works**

Run: `cd packages/client && pnpm build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add packages/client/src/components/Table.tsx
git commit -m "chore(client): remove unused Table wrapper component"
```

---

### Task 13: Final Visual QA and Tweaks

Start the dev server, visually inspect all pages, and fix any issues.

**Files:**
- Potentially any of the above

**Step 1: Start dev server**

Run: `cd /Users/ogi/repos/cronny && pnpm dev`

**Step 2: Check each page**

Visit each route and verify:
1. `/` — Jobs list: PageHeader, Paper table, badges, icon actions
2. `/jobs/new` — New job: breadcrumbs, form sections in Paper, SegmentedControl, sticky submit
3. `/jobs/{id}` — Job detail: breadcrumbs, stat cards, results table, tabs with counts
4. `/clients` — Clients list: PageHeader, Paper table, truncated API keys, badge pills
5. `/clients/{id}` — Client detail: breadcrumbs, Paper config section

**Step 3: Fix any issues found**

Common things to check:
- Nav link active state works correctly (Jobs active on `/`, `/jobs/*`; Clients active on `/clients/*`)
- Breadcrumbs link correctly
- Table styling looks consistent
- Dark backgrounds and borders look right
- Font loads properly (JetBrains Mono visible)
- Mobile/narrow viewport doesn't break layout

**Step 4: Commit any fixes**

```bash
git add -A
git commit -m "fix(client): visual QA fixes for UI redesign"
```
