"use client";
import React from "react";
import {
  Card,
  Text,
  Badge,
  Group,
  Stack,
  Divider,
  ThemeIcon,
  Box,
} from "@mantine/core";
import { initialStateType } from "../../types";
import { useSelector } from "react-redux";
import {
  IconPigMoney,
  IconBuildingBank,
  IconCreditCard,
  IconHash,
} from "@tabler/icons-react";

const DetailRow = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) => (
  <Group gap="sm" wrap="nowrap">
    <ThemeIcon variant="light" color="blue" size="sm" radius="xl">
      {icon}
    </ThemeIcon>
    <Box>
      <Text fz="xs" c="dimmed" tt="uppercase" fw={600} style={{ letterSpacing: 0.5 }}>
        {label}
      </Text>
      <Text fz="sm" fw={500}>
        {value}
      </Text>
    </Box>
  </Group>
);

const BankDetails = () => {
  const bankDetails = useSelector(
    (state: initialStateType) => state.bankDetails,
  );

  if (!bankDetails) return null;

  const maskedAccount = `•••• ${String(bankDetails.accountNumber).slice(-4)}`;
  const formattedBalance = Number(bankDetails.balance).toLocaleString("en-CA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <Card radius="md" withBorder w={380} p={0} shadow="sm" miw={250}>
      <Box
        p="lg"
        style={{
          background: "linear-gradient(135deg, #228be6 0%, #15aabf 100%)",
        }}
      >
        <Group justify="space-between" align="flex-start">
          <Stack gap={4}>
            <Text
              fz="xs"
              c="rgba(255,255,255,0.7)"
              tt="uppercase"
              fw={600}
              style={{ letterSpacing: 1 }}
            >
              Connected Account
            </Text>
            <Text fz="xl" fw={700} c="white">
              {bankDetails.institutionName}
            </Text>
          </Stack>
          <ThemeIcon variant="white" color="blue" size={44} radius="xl">
            <IconPigMoney size={24} />
          </ThemeIcon>
        </Group>

        <Box
          mt="lg"
          p="sm"
          style={{ background: "rgba(255,255,255,0.15)", borderRadius: 8 }}
        >
          <Text
            fz="xs"
            c="rgba(255,255,255,0.7)"
            tt="uppercase"
            fw={600}
            mb={2}
            style={{ letterSpacing: 0.5 }}
          >
            Available Balance
          </Text>
          <Text fz="xl" fw={700} c="white">
            ${formattedBalance}
          </Text>
        </Box>
      </Box>

      <Stack gap="md" p="lg">
        <Text
          fz="xs"
          c="dimmed"
          tt="uppercase"
          fw={600}
          style={{ letterSpacing: 1 }}
        >
          Account Details
        </Text>

        <DetailRow
          label="Account Number"
          value={maskedAccount}
          icon={<IconCreditCard size={12} />}
        />
        <DetailRow
          label="Transit Number"
          value={String(bankDetails.transitNumber)}
          icon={<IconHash size={12} />}
        />
        <DetailRow
          label="Institution Number"
          value={String(bankDetails.institutionNumber)}
          icon={<IconBuildingBank size={12} />}
        />

        <Divider />

        <Group justify="space-between" align="center">
          <Text fz="xs" c="dimmed" style={{ maxWidth: 220 }}>
            Your funding source for SaveWise contributions
          </Text>
          <Badge color="green" variant="light" size="sm" radius="sm">
            Active
          </Badge>
        </Group>
      </Stack>
    </Card>
  );
};

export default BankDetails;
