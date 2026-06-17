import { Stack, Text } from "@mantine/core";
import { IconClipboardList } from "@tabler/icons-react";

const ActivityPage = () => {
  return (
    <Stack align="center" justify="center" style={{ minHeight: "60vh" }} gap="md">
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: "#f1f5f9",
          border: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <IconClipboardList size={38} color="#94a3b8" stroke={1.5} />
      </div>
      <Stack align="center" gap={4}>
        <Text fw={600} size="lg" c="#374151">
          No activity yet
        </Text>
        <Text c="#9ca3af" size="sm" ta="center" maw={280}>
          Your account activity will appear here once you start making
          contributions.
        </Text>
      </Stack>
    </Stack>
  );
};

export default ActivityPage;
