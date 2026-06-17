"use client";
import React, { useEffect, useState } from "react";
import {
  Card,
  Text,
  Slider,
  Group,
  Stack,
  Box,
  ThemeIcon,
  Badge,
  Progress,
  Button,
  Divider,
  SimpleGrid,
  RingProgress,
  Center,
  Skeleton,
  Alert,
} from "@mantine/core";
import {
  IconTrendingUp,
  IconChartBar,
  IconCash,
  IconBuildingSkyscraper,
  IconWorld,
  IconScale,
  IconChartLine,
  IconCoins,
  IconCheck,
  IconAlertCircle,
  IconCircleCheckFilled,
  IconLeaf,
  IconBolt,
} from "@tabler/icons-react";
import { useSelector ,useDispatch} from "react-redux";
import { initialStateType } from "../../types";
import { setUser } from "@/state";

type Fund = {
  _id: string;
  name: string;
  description: string;
};

const FUND_THEMES = [
  {
    gradient: ["#228be6", "#15aabf"] as [string, string],
    Icon: IconTrendingUp,
    bg: "linear-gradient(135deg, #228be6 0%, #15aabf 100%)",
  },
  {
    gradient: ["#7c3aed", "#a855f7"] as [string, string],
    Icon: IconChartLine,
    bg: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
  },
  {
    gradient: ["#059669", "#34d399"] as [string, string],
    Icon: IconLeaf,
    bg: "linear-gradient(135deg, #059669 0%, #34d399 100%)",
  },
  {
    gradient: ["#dc2626", "#f97316"] as [string, string],
    Icon: IconBolt,
    bg: "linear-gradient(135deg, #dc2626 0%, #f97316 100%)",
  },
  {
    gradient: ["#0891b2", "#06b6d4"] as [string, string],
    Icon: IconChartBar,
    bg: "linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)",
  },
  {
    gradient: ["#db2777", "#ec4899"] as [string, string],
    Icon: IconBuildingSkyscraper,
    bg: "linear-gradient(135deg, #db2777 0%, #ec4899 100%)",
  },
  {
    gradient: ["#d97706", "#fbbf24"] as [string, string],
    Icon: IconCash,
    bg: "linear-gradient(135deg, #d97706 0%, #fbbf24 100%)",
  },
  {
    gradient: ["#16a34a", "#4ade80"] as [string, string],
    Icon: IconWorld,
    bg: "linear-gradient(135deg, #16a34a 0%, #4ade80 100%)",
  },
  {
    gradient: ["#1d4ed8", "#6366f1"] as [string, string],
    Icon: IconScale,
    bg: "linear-gradient(135deg, #1d4ed8 0%, #6366f1 100%)",
  },
  {
    gradient: ["#b45309", "#f59e0b"] as [string, string],
    Icon: IconCoins,
    bg: "linear-gradient(135deg, #b45309 0%, #f59e0b 100%)",
  },
];

const getTheme = (index: number) => FUND_THEMES[index % FUND_THEMES.length];

const FundsDisplay = () => {
  const [error, setError] = useState("");
  const [funds, setFunds] = useState<Fund[]>([]);
  // allocations stores percentages 0–100 per fund
  const [allocations, setAllocations] = useState<Record<string, number>>({});
  const [loadingFunds, setLoadingFunds] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [refetchKey, setRefetchKey] = useState(0);
  const token = useSelector((state: initialStateType) => state.token);
  const user = useSelector((state: initialStateType) => state.user);
  const availableBalance = Number(user?.balance ?? 0);
  const dispatch = useDispatch()
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/user/funds`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const data = await response.json();
        if (cancelled) return;
        if (!response.ok) {
          setError(data.message);
          return;
        }
        setFunds(data.funds);
        const initial: Record<string, number> = {};
        data.funds.forEach((f: Fund) => {
          initial[f._id] = 0;
        });
        setAllocations(initial);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to fetch funds",
          );
        }
      } finally {
        if (!cancelled) setLoadingFunds(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [token, refetchKey]);

  // totalPct is the sum of all percentages across funds
  const totalPct = Object.values(allocations).reduce((s, v) => s + v, 0);
  const remainingPct = 100 - totalPct;
  const overAllocated = totalPct > 100;

  const ringSections: { value: number; color: string; tooltip: string }[] = [];
  funds.forEach((f, i) => {
    const pct = allocations[f._id] ?? 0;
    if (pct > 0) {
      ringSections.push({
        value: pct,
        color: getTheme(i).gradient[0],
        tooltip: f.name,
      });
    }
  });
  if (ringSections.length === 0) {
    ringSections.push({ value: 100, color: "#e9ecef", tooltip: "Unallocated" });
  } else if (remainingPct > 0) {
    ringSections.push({
      value: remainingPct,
      color: "#e9ecef",
      tooltip: "Unallocated",
    });
  }

  const handleSave = async () => {
    if (availableBalance <= 0) {
      setError("No balance available to allocate.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const payload = funds
        .filter((f) => (allocations[f._id] ?? 0) > 0)
        .map((f) => ({
          fund: f._id,
          percentage: allocations[f._id],
          amount: ((allocations[f._id] / 100) * availableBalance).toFixed(2),
        }));
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/user/allocate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            allocations: payload,
            amount: availableBalance,
          }),
        },
      );
      
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Failed to save allocation");
        return;
      }
      dispatch(setUser(data.user))
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Stack align="center" gap="md" py="xl">
        <ThemeIcon color="teal" size={72} radius="xl" variant="light">
          <IconCircleCheckFilled size={44} />
        </ThemeIcon>
        <Text fw={700} fz="xl" ta="center">
          Allocation Saved!
        </Text>
        <Text c="dimmed" fz="sm" ta="center">
          Your contribution has been allocated across your chosen funds.
        </Text>
        <Button
          variant="light"
          onClick={() => {
            setSubmitted(false);
            setLoadingFunds(true);
            setRefetchKey((k) => k + 1);
          }}
        >
          Reallocate
        </Button>
      </Stack>
    );
  }

  return (
    <Box style={{ position: "relative", paddingBottom: 80 }}>
      <Stack gap="xl">
        <Box>
          <Text fz="xl" fw={800} style={{ letterSpacing: -0.5 }}>
            Allocate Contributions
          </Text>
          <Text fz="sm" c="dimmed">
            Distribute your SaveWise balance across investment funds by
            percentage
          </Text>
        </Box>

        <Group align="flex-start" gap="md" wrap="wrap">
          <Card
            radius="md"
            withBorder
            shadow="sm"
            p={0}
            style={{ flex: "1 1 220px", minWidth: 220 }}
          >
            <Box
              p="md"
              style={{
                background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
              }}
            >
              <Text
                fz="xs"
                c="rgba(255,255,255,0.55)"
                tt="uppercase"
                fw={600}
                style={{ letterSpacing: 1 }}
                mb={4}
              >
                Available to Allocate
              </Text>
              <Text fz="2xl" fw={800} c="white">
                $
                {availableBalance.toLocaleString("en-CA", {
                  minimumFractionDigits: 2,
                })}
              </Text>
            </Box>
            <Stack gap="xs" p="md">
              <Group justify="space-between">
                <Text fz="sm" c="dimmed">
                  Allocated
                </Text>
                <Text
                  fz="sm"
                  fw={700}
                  c={overAllocated ? "red" : totalPct > 0 ? "teal" : "dimmed"}
                >
                  {totalPct}%
                </Text>
              </Group>
              <Progress
                value={Math.min(totalPct, 100)}
                color={overAllocated ? "red" : "teal"}
                radius="xl"
                size="md"
              />
              <Group justify="space-between">
                <Text fz="sm" c="dimmed">
                  Remaining
                </Text>
                <Text fz="sm" fw={700} c={overAllocated ? "red" : "blue"}>
                  {Math.max(remainingPct, 0)}%
                </Text>
              </Group>
            </Stack>
          </Card>

          <Card radius="md" withBorder shadow="sm" p="md">
            <Stack align="center" gap="xs">
              <Text
                fz="xs"
                c="dimmed"
                tt="uppercase"
                fw={600}
                style={{ letterSpacing: 1 }}
              >
                Distribution
              </Text>
              <RingProgress
                size={148}
                thickness={18}
                roundCaps
                sections={ringSections}
                label={
                  <Center>
                    <Stack gap={0} align="center">
                      <Text fz="xs" c="dimmed" fw={500}>
                        Allocated
                      </Text>
                      <Text
                        fz="lg"
                        fw={800}
                        c={overAllocated ? "red" : "#228be6"}
                      >
                        {Math.min(totalPct, 100)}%
                      </Text>
                    </Stack>
                  </Center>
                }
              />
              <Stack gap={4} w="100%">
                {funds.map((f, i) => {
                  const pct = allocations[f._id] ?? 0;
                  if (pct <= 0) return null;
                  const dollarAmt = (pct / 100) * availableBalance;
                  return (
                    <Group key={f._id} justify="space-between" gap="xs">
                      <Group gap={6} wrap="nowrap">
                        <Box
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: getTheme(i).gradient[0],
                            flexShrink: 0,
                          }}
                        />
                        <Text fz="xs" lineClamp={1}>
                          {f.name}
                        </Text>
                      </Group>
                      <Group gap={4}>
                        <Text fz="xs" fw={600}>
                          {pct}%
                        </Text>
                        <Text fz="xs" c="dimmed">
                          ($
                          {dollarAmt.toLocaleString("en-CA", {
                            minimumFractionDigits: 2,
                          })}
                          )
                        </Text>
                      </Group>
                    </Group>
                  );
                })}
              </Stack>
            </Stack>
          </Card>
        </Group>

        <Divider label="Investment Funds" labelPosition="left" />

        {loadingFunds ? (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
            {[1, 2, 3].map((n) => (
              <Skeleton key={n} height={260} radius="md" />
            ))}
          </SimpleGrid>
        ) : funds.length === 0 ? (
          <Alert icon={<IconAlertCircle size={16} />} color="blue" radius="md">
            No investment funds are available right now.
          </Alert>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
            {funds.map((fund, index) => {
              const theme = getTheme(index);
              const { Icon, bg, gradient } = theme;
              const pct = allocations[fund._id] ?? 0;
              const dollarAmt = (pct / 100) * availableBalance;

              return (
                <Card key={fund._id} radius="md" withBorder shadow="sm" p={0}>
                  <Box p="md" style={{ background: bg }}>
                    <Group justify="space-between" align="flex-start" mb="sm">
                      <ThemeIcon
                        size={44}
                        radius="xl"
                        style={{
                          background: "rgba(255,255,255,0.2)",
                          color: "white",
                          backdropFilter: "blur(4px)",
                        }}
                      >
                        <Icon size={22} />
                      </ThemeIcon>
                      {pct > 0 && (
                        <Badge
                          size="sm"
                          style={{
                            background: "rgba(255,255,255,0.25)",
                            color: "white",
                            backdropFilter: "blur(4px)",
                          }}
                        >
                          {pct}%
                        </Badge>
                      )}
                    </Group>
                    <Text fw={700} fz="md" c="white" lh={1.2}>
                      {fund.name}
                    </Text>
                  </Box>

                  <Stack gap="md" p="md">
                    <Text
                      fz="sm"
                      c="dimmed"
                      lineClamp={2}
                      style={{ minHeight: 40 }}
                    >
                      {fund.description || "No description available."}
                    </Text>

                    <Group justify="space-between" align="baseline">
                      <Text
                        fz="xs"
                        c="dimmed"
                        tt="uppercase"
                        fw={600}
                        style={{ letterSpacing: 0.5 }}
                      >
                        Allocation
                      </Text>
                      <Stack gap={0} align="flex-end">
                        <Text
                          fz="lg"
                          fw={800}
                          c={pct > 0 ? gradient[0] : "dimmed"}
                          style={{ transition: "color 0.2s" }}
                        >
                          {pct}%
                        </Text>
                        <Text fz="xs" c="dimmed">
                          $
                          {dollarAmt.toLocaleString("en-CA", {
                            minimumFractionDigits: 2,
                          })}
                        </Text>
                      </Stack>
                    </Group>

                    <Slider
                      value={pct}
                      onChange={(val) => {
                        setAllocations((prev) => ({
                          ...prev,
                          [fund._id]: val,
                        }));
                        setError("");
                      }}
                      disabled={pct === 0 && remainingPct <= 0}
                      min={0}
                      max={100}
                      step={5}
                      label={(val) => `${val}%`}
                      marks={[
                        { value: 0, label: "0%" },
                        { value: 50, label: "50%" },
                        { value: 100, label: "100%" },
                      ]}
                      styles={{
                        bar: {
                          background: `linear-gradient(90deg, ${gradient[0]}, ${gradient[1]})`,
                        },
                        thumb: { borderColor: gradient[0] },
                        markLabel: { fontSize: 10 },
                      }}
                      mb="lg"
                    />
                  </Stack>
                </Card>
              );
            })}
          </SimpleGrid>
        )}
      </Stack>

      {funds.length > 0 && (
        <Box
          style={{
            position: "fixed",
            bottom: 28,
            right: 28,
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          {overAllocated && (
            <Group
              gap={6}
              style={{
                background: "#fff1f0",
                border: "1px solid #ffa39e",
                borderRadius: 8,
                padding: "6px 12px",
              }}
            >
              <IconAlertCircle size={15} color="#cf1322" />
              <Text fz="sm" c="red" fw={500}>
                Total exceeds 100% by {Math.abs(remainingPct)}%
              </Text>
            </Group>
          )}
          {error && (
            <Text fz="sm" c="red" fw={500}>
              {error}
            </Text>
          )}
          <Button
            leftSection={<IconCheck size={16} />}
            disabled={totalPct <= 0 || overAllocated}
            loading={submitting}
            onClick={handleSave}
            size="md"
            style={{
              background:
                totalPct > 0 && !overAllocated
                  ? "linear-gradient(135deg, #228be6 0%, #15aabf 100%)"
                  : undefined,
              boxShadow: "0 4px 16px rgba(34,139,230,0.35)",
            }}
          >
            Save Allocation
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default FundsDisplay;
