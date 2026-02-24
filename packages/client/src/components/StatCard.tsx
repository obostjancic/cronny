import { Paper, Text } from "@mantine/core";
import { ReactNode } from "react";

interface StatCardProps {
  label: string;
  children: ReactNode;
}

export function StatCard({ label, children }: StatCardProps) {
  return (
    <Paper p="sm">
      <Text size="xs" c="dimmed" tt="uppercase" fw={500} mb={4}>
        {label}
      </Text>
      <Text size="sm" fw={600}>
        {children}
      </Text>
    </Paper>
  );
}
