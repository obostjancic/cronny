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
