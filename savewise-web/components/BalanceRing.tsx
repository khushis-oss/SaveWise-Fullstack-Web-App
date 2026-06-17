"use client";
import React from "react";
import {
  Card,
  RingProgress,
  Text,
  Group,
  Stack,
  Box,
  ThemeIcon,
  Center,
} from "@mantine/core";
import { useSelector } from "react-redux";
import { initialStateType } from "../../types";
import { IconPigMoney, IconBuildingBank } from "@tabler/icons-react";

const GAP = 2.5;

const LegendRow = ({
  color,
  label,
  amount,
  pct,
  icon,
}: {
  color: string;
  label: string;
  amount: number;
  pct: number;
  icon: React.ReactNode;
}) => (
  <Group justify="space-between" wrap="nowrap">
    <Group gap="sm" wrap="nowrap">
      <Box
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: color,
          flexShrink: 0,
        }}
      />
      <ThemeIcon size="sm" radius="xl" style={{ background: color }}>
        {icon}
      </ThemeIcon>
      <Text fz="sm" fw={500}>
        {label}
      </Text>
    </Group>
    <Stack gap={0} align="flex-end">
      <Text fz="sm" fw={700}>
        ${amount.toLocaleString("en-CA", { minimumFractionDigits: 2 })}
      </Text>
      <Text fz="xs" c="dimmed">
        {pct.toFixed(1)}%
      </Text>
    </Stack>
  </Group>
);

const BalanceRing = () => {
  const bankDetails = useSelector(
    (state: initialStateType) => state.bankDetails,
  );
  const contributionBalance = useSelector(
    (state: initialStateType) => state?.user?.balance,
  );

  if (!bankDetails) return null;

  const bankBalance = Number(bankDetails.balance);
  const contributed = Number(contributionBalance);
  const total = bankBalance + contributed;

  const bankPct = total > 0 ? (bankBalance / total) * 100 : 0;
  const contributedPct = total > 0 ? (contributed / total) * 100 : 0;

  type Section = { value: number; color: string; tooltip?: string };
  let sections: Section[];

  if (contributed > 0 && bankBalance > 0) {
    sections = [
      {
        value: contributedPct - GAP,
        color: "#15aabf",
        tooltip: `Contributed: $${contributed.toLocaleString("en-CA", { minimumFractionDigits: 2 })}`,
      },
      { value: GAP, color: "white" },
      {
        value: bankPct - GAP,
        color: "#228be6",
        tooltip: `Bank Balance: $${bankBalance.toLocaleString("en-CA", { minimumFractionDigits: 2 })}`,
      },
      { value: GAP, color: "white" },
    ];
  } else if (contributed > 0) {
    sections = [{ value: 100, color: "#15aabf" }];
  } else if (bankBalance > 0) {
    sections = [{ value: 100, color: "#228be6" }];
  } else {
    sections = [{ value: 100, color: "#e9ecef" }];
  }

  return (
    <Card radius="md" w="100%" withBorder p={0} shadow="sm">
      <Box
        p="lg"
        style={{
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
        }}
      >
        <Text
          fz="xs"
          c="rgba(255,255,255,0.6)"
          tt="uppercase"
          fw={600}
          style={{ letterSpacing: 1 }}
          mb={4}
        >
          Savings Overview
        </Text>
        <Text fz="xl" fw={700} c="white">
          ${total.toLocaleString("en-CA", { minimumFractionDigits: 2 })}
        </Text>
        <Text fz="xs" c="rgba(255,255,255,0.5)">
          Total tracked across bank &amp; SaveWise
        </Text>
      </Box>

      <Stack gap="lg" p="lg" align="center">
        <Center>
          <RingProgress
            size={200}
            thickness={28}
            roundCaps
            sections={sections}
            label={
              <Center>
                <Stack gap={2} align="center">
                  <Text fz="xs" c="dimmed" tt="uppercase" fw={600} style={{ letterSpacing: 0.5 }}>
                    Saved
                  </Text>
                  <Text fz="md" fw={800} c="#15aabf">
                    {total > 0 ? contributedPct.toFixed(0) : 0}%
                  </Text>
                </Stack>
              </Center>
            }
          />
        </Center>

        <Stack gap="sm" w="100%">
          <LegendRow
            color="#228be6"
            label="Bank Balance"
            amount={bankBalance}
            pct={bankPct}
            icon={<IconBuildingBank size={10} />}
          />
          <LegendRow
            color="#15aabf"
            label="Contributed"
            amount={contributed}
            pct={contributedPct}
            icon={<IconPigMoney size={10} />}
          />
        </Stack>
      </Stack>
    </Card>
  );
};

export default BalanceRing;
