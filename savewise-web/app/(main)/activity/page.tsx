"use client";
import { Card, Group, Text, ThemeIcon } from "@mantine/core";
import { IconHistory } from "@tabler/icons-react";
import ActivityFeed from "@/components/ActivityFeed";

const ActivityPage = () => {
  return (
    <Card radius="md" withBorder p="lg" shadow="xs" m="md">
      <Group gap="xs" mb="lg">
        <ThemeIcon size="sm" radius="xl" variant="light" color="blue">
          <IconHistory size={12} />
        </ThemeIcon>
        <Text fw={700} fz="md">
          Activity Log
        </Text>
      </Group>
      <ActivityFeed />
    </Card>
  );
};

export default ActivityPage;
