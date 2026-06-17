"use client";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Stack,
  Group,
  Text,
  Box,
  Badge,
  Center,
  Loader,
} from "@mantine/core";
import {
  IconCoinFilled,
  IconChartPie,
  IconUserCheck,
  IconLogin2,
  IconActivity,
} from "@tabler/icons-react";
import { apiFetch, notifyError } from "@/lib/apiClient";
import { initialStateType } from "../../types";

interface Activity {
  _id: string;
  type: string;
  description: string;
  referenceModel: "User" | "Contribution" | "Allocation" | null;
  createdAt: string;
}

const EVENT_CONFIG: Record<
  string,
  { icon: React.ReactNode; color: string; badgeColor: string; label: string }
> = {
  contribution_made: {
    icon: <IconCoinFilled size={14} color="white" />,
    color: "#f76707",
    badgeColor: "orange",
    label: "Contribution",
  },
  allocated_funds: {
    icon: <IconChartPie size={14} color="white" stroke={1.5} />,
    color: "#7950f2",
    badgeColor: "violet",
    label: "Allocation",
  },
  user_signed_up: {
    icon: <IconUserCheck size={14} color="white" stroke={1.5} />,
    color: "#0ca678",
    badgeColor: "teal",
    label: "Signup",
  },
  user_logges_in: {
    icon: <IconLogin2 size={14} color="white" stroke={1.5} />,
    color: "#228be6",
    badgeColor: "blue",
    label: "Login",
  },
};

const FALLBACK_CONFIG = {
  icon: <IconActivity size={14} color="white" stroke={1.5} />,
  color: "#868e96",
  badgeColor: "gray",
  label: "Event",
};

const ActivityFeed = ({ limit }: { limit?: number }) => {
  const token = useSelector((state: initialStateType) => state.token);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    const fetchActivities = async () => {
      try {
        const res = await apiFetch("/activity/all", token);
        const data = await res.json();
        if (res.ok) setActivities(data.activities ?? []);
        else notifyError(data.message || "Failed to load activities");
      } catch (err) {
        if (err instanceof Error && err.message !== "UNAUTHORIZED")
          notifyError("Failed to load activities");
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, [token]);

  const displayed = limit ? activities.slice(0, limit) : activities;

  if (loading) {
    return (
      <Center h={120}>
        <Loader size="sm" color="blue" />
      </Center>
    );
  }

  if (displayed.length === 0) {
    return (
      <Center h={120}>
        <Stack align="center" gap={6}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "#86869618",
              border: "1.5px solid #86869640",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconActivity size={22} color="#868e96" stroke={1.5} />
          </div>
          <Text fw={600} fz="sm" c="#374151">
            No activity yet
          </Text>
          <Text c="#9ca3af" fz="xs" ta="center" maw={220}>
            Activity will appear here once you start making contributions.
          </Text>
        </Stack>
      </Center>
    );
  }

  return (
    <Stack gap={0}>
      {displayed.map((activity, i) => {
        const cfg = EVENT_CONFIG[activity.type] ?? FALLBACK_CONFIG;
        const isLast = i === displayed.length - 1;
        return (
          <Group
            key={activity._id}
            align="flex-start"
            gap="sm"
            wrap="nowrap"
            pb={isLast ? 0 : "sm"}
            style={{ position: "relative" }}
          >
            {!isLast && (
              <div
                style={{
                  position: "absolute",
                  left: 14,
                  top: 30,
                  width: 1,
                  height: "calc(100% - 16px)",
                  background: "#e9ecef",
                }}
              />
            )}
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: cfg.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: `0 2px 8px ${cfg.color}44`,
              }}
            >
              {cfg.icon}
            </div>
            <Box style={{ minWidth: 0, flex: 1, paddingTop: 2 }}>
              <Group gap="xs" wrap="nowrap" justify="space-between">
                <Text
                  fz="sm"
                  fw={500}
                  c="#1a1a2e"
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {activity.description}
                </Text>
                <Badge
                  variant="light"
                  size="xs"
                  color={cfg.badgeColor}
                  style={{ flexShrink: 0 }}
                >
                  {cfg.label}
                </Badge>
              </Group>
              <Text fz="xs" c="dimmed" mt={2}>
                {new Date(activity.createdAt).toLocaleDateString("en-CA", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </Box>
          </Group>
        );
      })}
    </Stack>
  );
};

export default ActivityFeed;
