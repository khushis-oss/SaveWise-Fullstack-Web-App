"use client";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { initialStateType } from "../../../types";
import { setBankDetails } from "@/state";
import {
  Card,
  Text,
  Group,
  Stack,
  Box,
  Badge,
  ThemeIcon,
  Divider,
  Avatar,
  Button,
  SimpleGrid,
  Center,
  Loader,
  Table,
} from "@mantine/core";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";
import {
  IconMail,
  IconBuildingBank,
  IconPigMoney,
  IconChartPie,
  IconTrendingUp,
  IconListDetails,
  IconHistory,
  IconCoinFilled,
  IconWallet,
} from "@tabler/icons-react";
import { apiFetch, notifyError } from "@/lib/apiClient";
import ActivityFeed from "@/components/ActivityFeed";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const COLORS = [
  "#228be6",
  "#7950f2",
  "#15aabf",
  "#40c057",
  "#fd7e14",
  "#fa5252",
  "#cc5de8",
  "#f783ac",
];

interface AllocatedFund {
  fundId: string;
  name: string;
  totalAmountAllocated: number;
}

interface ContributionType {
  _id: string;
  amount: number;
  status: "RECORDED" | "WITHDRAWN";
  createdAt: string;
}

interface SubAllocation {
  fund: { _id: string; name: string } | string;
  percentage: number;
  amount: number;
  _id: string;
}

interface UserAllocation {
  _id: string;
  totalAmount: number;
  allocations: SubAllocation[];
  createdAt: string;
}

const StatCard = ({
  label,
  value,
  icon,
  gradient,
  sub,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  gradient: string;
  sub?: string;
}) => (
  <Card
    radius="md"
    p="lg"
    shadow="sm"
    style={{ background: gradient, border: "none", overflow: "hidden" }}
  >
    <Group justify="space-between" align="flex-start">
      <Box>
        <Text
          fz="xs"
          c="rgba(255,255,255,0.75)"
          fw={600}
          tt="uppercase"
          mb={6}
          style={{ letterSpacing: 0.8 }}
        >
          {label}
        </Text>
        <Text fw={800} fz="xl" c="white">
          {value}
        </Text>
        {sub && (
          <Text fz="xs" c="rgba(255,255,255,0.6)" mt={2}>
            {sub}
          </Text>
        )}
      </Box>
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.18)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
    </Group>
  </Card>
);

const EmptyState = ({
  icon,
  color,
  title,
  sub,
  height = 220,
}: {
  icon: React.ReactNode;
  color: string;
  title: string;
  sub: string;
  height?: number;
}) => (
  <Center style={{ height }}>
    <Stack align="center" gap="sm">
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: `${color}18`,
          border: `1.5px solid ${color}40`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </div>
      <Text fw={600} fz="sm" c="#374151">
        {title}
      </Text>
      <Text c="#9ca3af" fz="xs" ta="center" maw={220}>
        {sub}
      </Text>
    </Stack>
  </Center>
);

const DashboardPage = () => {
  const token = useSelector((state: initialStateType) => state.token);
  const user = useSelector((state: initialStateType) => state.user);
  const bankDetails = useSelector(
    (state: initialStateType) => state.bankDetails,
  );
  const dispatch = useDispatch();
  const router = useRouter();

  const [allocatedFunds, setAllocatedFunds] = useState<AllocatedFund[]>([]);
  const [totalAllocated, setTotalAllocated] = useState(0);
  const [contributions, setContributions] = useState<ContributionType[]>([]);
  const [userAllocations, setUserAllocations] = useState<UserAllocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      setLoading(true);
      try {
        const requests: Promise<Response>[] = [
          apiFetch("/dashboard/allocatedFunds", token),
          apiFetch("/user/allContributions", token),
          apiFetch("/dashboard/getUserAllocations", token),
        ];

        if (user?.isBankConnected && !bankDetails) {
          requests.push(apiFetch("/user/bankDetails", token));
        }

        const responses = await Promise.all(requests);
        const [fundsData, contribData, allocData, bankData] = await Promise.all(
          responses.map((r) => r.json()),
        );

        if (responses[0].ok) {
          setAllocatedFunds(fundsData.allocatedFunds || []);
          setTotalAllocated(fundsData.totalAmountAllocated || 0);
        } else {
          notifyError(fundsData.message || "Failed to load fund data");
        }
        if (responses[1].ok) {
          setContributions(contribData.contributions || []);
        } else {
          notifyError(contribData.message || "Failed to load contributions");
        }
        if (responses[2].ok) {
          setUserAllocations(allocData.allocations || []);
        } else {
          notifyError(allocData.message || "Failed to load allocations");
        }
        if (responses[3]?.ok && bankData?.bankDetails) {
          dispatch(setBankDetails(bankData.bankDetails));
        }
      } catch (err) {
        if (err instanceof Error && err.message !== "UNAUTHORIZED")
          notifyError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token, user?.isBankConnected, bankDetails, dispatch]);

  const lineData = [...contributions]
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    )
    .reduce<{ date: string; balance: number }[]>((acc, c) => {
      const prev = acc.length > 0 ? acc[acc.length - 1].balance : 0;
      const delta = c.status === "RECORDED" ? c.amount : -c.amount;
      return [
        ...acc,
        {
          date: new Date(c.createdAt).toLocaleDateString("en-CA", {
            month: "short",
            day: "numeric",
          }),
          balance: +(prev + delta).toFixed(2),
        },
      ];
    }, []);

  const savewiseBalance = Number(
    user?.balance ?? lineData[lineData.length - 1]?.balance ?? 0,
  );
  const bankBalance = user?.isBankConnected
    ? Number(bankDetails?.balance ?? 0)
    : 0;

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (loading) {
    return (
      <Center h={400}>
        <Loader size="md" color="blue" />
      </Center>
    );
  }

  return (
    <Stack gap="xl" p="md">
      {/* Stat summary row */}
      <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md">
        <StatCard
          label="Bank Balance"
          value={`$${bankBalance.toLocaleString("en-CA", { minimumFractionDigits: 2 })}`}
          icon={<IconBuildingBank size={22} color="white" stroke={1.5} />}
          gradient="linear-gradient(135deg, #228be6 0%, #1971c2 100%)"
          sub={bankDetails?.institutionName}
        />
        <StatCard
          label="SaveWise Balance"
          value={`$${savewiseBalance.toLocaleString("en-CA", { minimumFractionDigits: 2 })}`}
          icon={<IconPigMoney size={22} color="white" stroke={1.5} />}
          gradient="linear-gradient(135deg, #0ca678 0%, #12b886 100%)"
          sub={`${contributions.filter((c) => c.status === "RECORDED").length} deposits`}
        />
        <StatCard
          label="Total Allocated"
          value={`$${totalAllocated.toLocaleString("en-CA", { minimumFractionDigits: 2 })}`}
          icon={<IconWallet size={22} color="white" stroke={1.5} />}
          gradient="linear-gradient(135deg, #7950f2 0%, #9775fa 100%)"
          sub={`${allocatedFunds.length} fund${allocatedFunds.length !== 1 ? "s" : ""}`}
        />
        <StatCard
          label="Contributions"
          value={String(contributions.length)}
          icon={<IconCoinFilled size={22} color="white" />}
          gradient="linear-gradient(135deg, #f76707 0%, #fd7e14 100%)"
          sub={contributions.length > 0 ? "total transactions" : "none yet"}
        />
      </SimpleGrid>

      {/* Row 2: User + Bank */}
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        {/* User card */}
        <Card
          radius="md"
          withBorder
          p={0}
          shadow="xs"
          style={{ overflow: "hidden" }}
        >
          <Box
            px="lg"
            py="md"
            style={{
              background: "linear-gradient(135deg, #7950f2 0%, #cc5de8 100%)",
            }}
          >
            <Group gap="md" align="center" wrap="nowrap">
              <Avatar
                src={
                  user?.profilePictureUrl
                    ? user.profilePictureUrl.startsWith("http")
                      ? user.profilePictureUrl
                      : `${API}${user.profilePictureUrl}`
                    : null
                }
                size={52}
                radius="xl"
                style={{
                  border: "2px solid rgba(255,255,255,0.4)",
                  flexShrink: 0,
                }}
              >
                <Text fw={700} c="white" fz="sm">
                  {initials}
                </Text>
              </Avatar>
              <Box style={{ minWidth: 0 }}>
                <Text
                  fz="xs"
                  c="rgba(255,255,255,0.7)"
                  tt="uppercase"
                  fw={600}
                  style={{ letterSpacing: 0.8 }}
                >
                  Account
                </Text>
                <Text
                  fw={700}
                  fz="lg"
                  c="white"
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {user?.name}
                </Text>
                <Badge
                  variant="outline"
                  size="sm"
                  tt="capitalize"
                  style={{
                    borderColor: "rgba(255,255,255,0.5)",
                    color: "white",
                  }}
                >
                  {user?.role}
                </Badge>
              </Box>
            </Group>
          </Box>
          <Stack gap="sm" p="lg">
            <Group gap={6} wrap="nowrap">
              <IconMail size={13} color="var(--mantine-color-dimmed)" />
              <Text
                fz="sm"
                c="dimmed"
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user?.email}
              </Text>
            </Group>
            <Divider />
            <Group gap="xs">
              <Badge
                color={user?.isVerified ? "green" : "orange"}
                variant="dot"
                size="sm"
              >
                {user?.isVerified ? "Verified" : "Unverified"}
              </Badge>
              <Badge
                color={user?.isBankConnected ? "blue" : "gray"}
                variant="dot"
                size="sm"
              >
                {user?.isBankConnected ? "Bank Connected" : "No Bank"}
              </Badge>
            </Group>
          </Stack>
        </Card>

        {/* Bank card */}
        {!user?.isBankConnected || !bankDetails ? (
          <Card
            radius="md"
            withBorder
            p="lg"
            shadow="xs"
            style={{
              background: "linear-gradient(145deg, #eff6ff 0%, #f0fdf4 100%)",
              borderColor: "#bfdbfe",
            }}
          >
            <Stack align="center" justify="center" h="100%" gap="sm" py="sm">
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, #228be6 0%, #74c0fc 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 14px rgba(34,139,230,0.3)",
                }}
              >
                <IconBuildingBank size={26} color="white" stroke={1.5} />
              </div>
              <Text fw={600} c="#1a1a2e">
                No Bank Connected
              </Text>
              <Text fz="sm" c="#6b7280" ta="center" maw={220}>
                Link your bank account to start making IRA contributions
              </Text>
              <Button
                size="sm"
                mt="xs"
                onClick={() => router.push("/contributions")}
                style={{
                  background:
                    "linear-gradient(135deg, #228be6 0%, #1971c2 100%)",
                }}
              >
                Connect Bank
              </Button>
            </Stack>
          </Card>
        ) : (
          <Card
            radius="md"
            withBorder
            p={0}
            shadow="xs"
            style={{ overflow: "hidden" }}
          >
            <Box
              px="lg"
              py="md"
              style={{
                background: "linear-gradient(135deg, #0ca678 0%, #1c7ed6 100%)",
              }}
            >
              <Group justify="space-between" align="center">
                <Group gap="sm" wrap="nowrap">
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <IconBuildingBank size={18} color="white" stroke={1.5} />
                  </div>
                  <Box>
                    <Text
                      fz="xs"
                      c="rgba(255,255,255,0.7)"
                      tt="uppercase"
                      fw={600}
                      style={{ letterSpacing: 0.8 }}
                    >
                      Connected Bank
                    </Text>
                    <Text fw={700} c="white" fz="md">
                      {bankDetails.institutionName}
                    </Text>
                  </Box>
                </Group>
                <Box ta="right">
                  <Text
                    fz="xs"
                    c="rgba(255,255,255,0.7)"
                    tt="uppercase"
                    fw={600}
                    style={{ letterSpacing: 0.5 }}
                  >
                    Balance
                  </Text>
                  <Text fw={800} fz="xl" c="white">
                    $
                    {Number(bankDetails.balance).toLocaleString("en-CA", {
                      minimumFractionDigits: 2,
                    })}
                  </Text>
                </Box>
              </Group>
            </Box>
            <Group gap="xl" px="lg" py="md">
              <Box>
                <Text
                  fz="xs"
                  c="dimmed"
                  tt="uppercase"
                  fw={600}
                  style={{ letterSpacing: 0.5 }}
                >
                  Account
                </Text>
                <Text fz="sm" fw={500}>
                  •••• {String(bankDetails.accountNumber).slice(-4)}
                </Text>
              </Box>
              <Box>
                <Text
                  fz="xs"
                  c="dimmed"
                  tt="uppercase"
                  fw={600}
                  style={{ letterSpacing: 0.5 }}
                >
                  Transit
                </Text>
                <Text fz="sm" fw={500}>
                  {bankDetails.transitNumber}
                </Text>
              </Box>
              <Box>
                <Text
                  fz="xs"
                  c="dimmed"
                  tt="uppercase"
                  fw={600}
                  style={{ letterSpacing: 0.5 }}
                >
                  Institution
                </Text>
                <Text fz="sm" fw={500}>
                  {bankDetails.institutionNumber}
                </Text>
              </Box>
              <Badge color="green" variant="light" size="sm" radius="sm">
                Active
              </Badge>
            </Group>
          </Card>
        )}
      </SimpleGrid>

      {/* Row 3: Charts */}
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        {/* Pie chart */}
        <Card radius="md" withBorder p="lg" shadow="xs">
          <Group gap="xs" mb={4}>
            <ThemeIcon size="sm" radius="xl" variant="light" color="violet">
              <IconChartPie size={12} />
            </ThemeIcon>
            <Text fw={700} fz="md">
              Fund Allocation Breakdown
            </Text>
          </Group>
          <Text fz="xs" c="dimmed" mb="md">
            Total allocated: $
            {totalAllocated.toLocaleString("en-CA", {
              minimumFractionDigits: 2,
            })}
          </Text>
          {allocatedFunds.length === 0 ? (
            <EmptyState
              icon={<IconChartPie size={26} color="#7950f2" stroke={1.5} />}
              color="#7950f2"
              title="No allocations yet"
              sub="Allocate your contributions to funds to see the breakdown here"
            />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={allocatedFunds}
                  dataKey="totalAmountAllocated"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={40}
                >
                  {allocatedFunds.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip
                  formatter={(value: number) => [
                    `$${value.toLocaleString("en-CA", { minimumFractionDigits: 2 })}`,
                    "Allocated",
                  ]}
                />
                <Legend
                  formatter={(value) => (
                    <span style={{ fontSize: 12 }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Area chart */}
        <Card radius="md" withBorder p="lg" shadow="xs">
          <Group gap="xs" mb={4}>
            <ThemeIcon size="sm" radius="xl" variant="light" color="blue">
              <IconTrendingUp size={12} />
            </ThemeIcon>
            <Text fw={700} fz="md">
              Contributions Over Time
            </Text>
          </Group>
          <Text fz="xs" c="dimmed" mb="md">
            Cumulative SaveWise balance
          </Text>
          {lineData.length === 0 ? (
            <EmptyState
              icon={<IconTrendingUp size={26} color="#228be6" stroke={1.5} />}
              color="#228be6"
              title="No contributions yet"
              sub="Make your first contribution to see your balance grow over time"
            />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart
                data={lineData}
                margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
              >
                <defs>
                  <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#228be6" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#228be6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f5" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) =>
                    `$${Number(v).toLocaleString("en-CA", {
                      maximumFractionDigits: 0,
                    })}`
                  }
                  width={70}
                />
                <RechartsTooltip
                  formatter={(value: number) => [
                    `$${value.toLocaleString("en-CA", { minimumFractionDigits: 2 })}`,
                    "Balance",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke="#228be6"
                  strokeWidth={2.5}
                  fill="url(#balanceGrad)"
                  dot={{ r: 4, fill: "#228be6", strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>
      </SimpleGrid>

      {/* Row 4: Allocations table */}
      <Card radius="md" withBorder p="lg" shadow="xs">
        <Group gap="xs" mb="md">
          <ThemeIcon size="sm" radius="xl" variant="light" color="teal">
            <IconListDetails size={12} />
          </ThemeIcon>
          <Text fw={700} fz="md">
            My Allocations
          </Text>
        </Group>

        {userAllocations.length === 0 ? (
          <EmptyState
            icon={<IconListDetails size={26} color="#0ca678" stroke={1.5} />}
            color="#0ca678"
            title="No allocations made yet"
            sub="Visit the Allocations page to distribute your contributions across funds"
            height={150}
          />
        ) : (
          <Table striped highlightOnHover withTableBorder withColumnBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Date</Table.Th>
                <Table.Th>Total Amount</Table.Th>
                <Table.Th>Funds</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {userAllocations.map((alloc) => (
                <Table.Tr key={alloc._id}>
                  <Table.Td>
                    <Text fz="sm">
                      {new Date(alloc.createdAt).toLocaleDateString("en-CA", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text fw={600} c="teal" fz="sm">
                      $
                      {alloc.totalAmount.toLocaleString("en-CA", {
                        minimumFractionDigits: 2,
                      })}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs" wrap="wrap">
                      {alloc.allocations.map((a, i) => {
                        const fundName =
                          typeof a.fund === "object" && a.fund !== null
                            ? a.fund.name
                            : "Fund";
                        return (
                          <Badge
                            key={a._id || i}
                            variant="light"
                            color={
                              ["blue", "violet", "teal", "green", "orange"][
                                i % 5
                              ]
                            }
                            size="sm"
                          >
                            {fundName} · {a.percentage}% · $
                            {a.amount.toLocaleString("en-CA", {
                              minimumFractionDigits: 2,
                            })}
                          </Badge>
                        );
                      })}
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Card>

      {/* Row 5: Recent Activity */}
      <Card radius="md" withBorder p="lg" shadow="xs">
        <Group gap="xs" mb="md" justify="space-between">
          <Group gap="xs">
            <ThemeIcon size="sm" radius="xl" variant="light" color="gray">
              <IconHistory size={12} />
            </ThemeIcon>
            <Text fw={700} fz="md">
              Recent Activity
            </Text>
          </Group>
          <Link
            href="/activity"
            style={{ fontSize: 12, color: "#228be6", textDecoration: "none" }}
          >
            View all →
          </Link>
        </Group>
        <ActivityFeed limit={5} />
      </Card>
    </Stack>
  );
};

export default DashboardPage;
