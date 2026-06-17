"use client";
import React, { useEffect, useState } from "react";
import {
  Badge,
  Box,
  Center,
  Divider,
  Drawer,
  Group,
  Loader,
  NativeSelect,
  Pagination,
  Stack,
  Text,
  ThemeIcon,
  Card,
} from "@mantine/core";
import { IconArrowDownLeft, IconArrowUpRight } from "@tabler/icons-react";
import { useSelector } from "react-redux";
import { initialStateType } from "../types";
import { apiFetch, notifyError } from "@/lib/apiClient";

const PAGE_SIZE = 5;
const currentYear = new Date().getFullYear();

interface ContributionType {
  _id: string;
  amount: number;
  type: "TRADITIONAL" | "ROTH";
  status: "RECORDED" | "WITHDRAWN";
  taxYear: number;
  createdAt: string;
}

interface Props {
  opened: boolean;
  onClose: () => void;
}

const taxYearOptions = [
  { value: "All", label: "All Years" },
  ...Array.from({ length: 10 }, (_, i) => ({
    value: String(currentYear - i),
    label: String(currentYear - i),
  })),
];

const ContributionsDrawer = ({ opened, onClose }: Props) => {
  const token = useSelector((state: initialStateType) => state.token);
  const [contributions, setContributions] = useState<ContributionType[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [taxYearFilter, setTaxYearFilter] = useState("All");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!opened) return;
    const fetchContributions = async () => {
      setLoading(true);
      try {
        const res = await apiFetch("/user/allContributions", token);
        const data = await res.json();
        if (!res.ok) {
          notifyError(data.message || "Failed to load contributions");
          return;
        }
        setContributions(data.contributions || []);
      } catch (err) {
        if (err instanceof Error && err.message !== "UNAUTHORIZED")
          notifyError("Something went wrong loading contributions");
      } finally {
        setLoading(false);
      }
    };
    fetchContributions();
  }, [opened, token]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, taxYearFilter]);

  const filtered = contributions.filter((c) => {
    const matchStatus = statusFilter === "All" || c.status === statusFilter;
    const matchYear =
      taxYearFilter === "All" || c.taxYear === Number(taxYearFilter);
    return matchStatus && matchYear;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={700} fz="lg">
          Contribution History
        </Text>
      }
      position="right"
      size="md"
      padding="lg"
    >
      <Stack gap="md">
        <Group gap="sm" grow>
          <NativeSelect
            label="Status"
            data={[
              { value: "All", label: "All" },
              { value: "RECORDED", label: "Recorded" },
              { value: "WITHDRAWN", label: "Withdrawn" },
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
          <NativeSelect
            label="Tax Year"
            data={taxYearOptions}
            value={taxYearFilter}
            onChange={(e) => setTaxYearFilter(e.target.value)}
          />
        </Group>

        <Divider />

        {loading ? (
          <Center py="xl">
            <Loader size="sm" />
          </Center>
        ) : paginated.length === 0 ? (
          <Text c="dimmed" ta="center" py="xl">
            No contributions found.
          </Text>
        ) : (
          <Stack gap="sm">
            {paginated.map((c) => (
              <Card key={c._id} withBorder radius="sm" p="sm">
                <Group justify="space-between" align="flex-start" wrap="nowrap">
                  <Group gap="sm" align="center">
                    <ThemeIcon
                      size={36}
                      radius="xl"
                      color={c.status === "RECORDED" ? "blue" : "orange"}
                      variant="light"
                    >
                      {c.status === "RECORDED" ? (
                        <IconArrowUpRight size={18} />
                      ) : (
                        <IconArrowDownLeft size={18} />
                      )}
                    </ThemeIcon>
                    <Box>
                      <Text fw={700} fz="sm" c={c.status === "RECORDED" ? "blue" : "orange"}>
                        {c.status === "RECORDED" ? "+" : "-"}$
                        {c.amount.toLocaleString("en-CA", {
                          minimumFractionDigits: 2,
                        })}
                      </Text>
                      <Text fz="xs" c="dimmed">
                        {new Date(c.createdAt).toLocaleDateString("en-CA", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </Text>
                    </Box>
                  </Group>
                  <Stack gap={4} align="flex-end">
                    <Badge
                      color={c.status === "RECORDED" ? "green" : "orange"}
                      variant="light"
                      size="sm"
                    >
                      {c.status}
                    </Badge>
                    <Badge color="gray" variant="outline" size="sm">
                      {c.type}
                    </Badge>
                    <Text fz="xs" c="dimmed">
                      TY {c.taxYear}
                    </Text>
                  </Stack>
                </Group>
              </Card>
            ))}
          </Stack>
        )}

        {!loading && filtered.length > 0 && (
          <>
            <Divider />
            <Center>
              <Pagination
                value={page}
                onChange={setPage}
                total={totalPages}
                size="sm"
              />
            </Center>
            <Text fz="xs" c="dimmed" ta="center">
              {filtered.length} contribution{filtered.length !== 1 ? "s" : ""}{" "}
              total
            </Text>
          </>
        )}
      </Stack>
    </Drawer>
  );
};

export default ContributionsDrawer;
