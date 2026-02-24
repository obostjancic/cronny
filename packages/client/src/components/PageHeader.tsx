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
      wrap="wrap"
      gap="sm"
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
      {actions && <Group gap="xs" wrap="wrap">{actions}</Group>}
    </Flex>
  );
}
