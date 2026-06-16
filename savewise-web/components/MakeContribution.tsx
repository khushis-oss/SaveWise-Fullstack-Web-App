"use client";
import React, { useState } from "react";
import {
  Card,
  Text,
  Button,
  Group,
  Stack,
  Modal,
  NumberInput,
  ThemeIcon,
  Box,
  Divider,
  Badge,
  NativeSelect,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useDispatch, useSelector } from "react-redux";
import { initialStateType } from "../../types";
import { setBankDetails } from "@/state";
import {
  IconArrowUpRight,
  IconCircleCheckFilled,
  IconCoinFilled,
} from "@tabler/icons-react";

const MakeContribution = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const [amount, setAmount] = useState<number | string>("");
  const [type,setType]=useState("deposit")
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const dispatch = useDispatch();
  const token = useSelector((state: initialStateType) => state.token);
  const bankDetails = useSelector(
    (state: initialStateType) => state.bankDetails,
  );

  const balance = Number(bankDetails?.balance ?? 0);

  const handleClose = () => {
    close();
    setAmount("");
    setError("");
    setSuccess(false);
  };

  const handleSubmit = async () => {
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setError("Please enter a valid amount.");
      return;
    }
    if (type === "deposit" && numAmount > balance) {
      setError("Amount exceeds your available bank balance.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/user/contribute`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ amount: numAmount,type:type }),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        setError(data.message);
        return;
      }
      dispatch(setBankDetails(data.bankDetails));
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (!bankDetails) return null;

  return (
    <>
      <Card radius="md" withBorder w="100%" p="lg" shadow="sm">
        <Group justify="space-between" align="center" wrap="wrap" gap="md">
          <Group gap="md" align="center">
            <ThemeIcon
              size={48}
              radius="xl"
              style={{
                background: "linear-gradient(135deg, #228be6 0%, #15aabf 100%)",
              }}
            >
              <IconCoinFilled size={24} />
            </ThemeIcon>
            <Box>
              <Text fw={600} fz="md">
                Make a Contribution
              </Text>
              <Text fz="sm" c="dimmed">
                Transfer funds from your connected bank into SaveWise
              </Text>
            </Box>
          </Group>

          <Group gap="sm" align="center">
            <Box ta="right">
              <Text
                fz="xs"
                c="dimmed"
                tt="uppercase"
                fw={600}
                style={{ letterSpacing: 0.5 }}
              >
                Available
              </Text>
              <Text fw={700} fz="lg" c="blue">
                ${balance.toLocaleString("en-CA", { minimumFractionDigits: 2 })}
              </Text>
            </Box>
            <Button
              leftSection={<IconArrowUpRight size={16} />}
              onClick={open}
              style={{
                background: "linear-gradient(135deg, #228be6 0%, #15aabf 100%)",
              }}
            >
              Make Contribution
            </Button>
          </Group>
        </Group>
      </Card>

      <Modal
        opened={opened}
        onClose={handleClose}
        title="Make a Contribution"
        centered
        radius="md"
      >
        {success ? (
          <Stack align="center" gap="md" py="md">
            <ThemeIcon color="green" size={64} radius="xl" variant="light">
              <IconCircleCheckFilled size={36} />
            </ThemeIcon>
            <Text fw={600} fz="lg" ta="center">
              Contribution Successful
            </Text>
            <Text c="dimmed" fz="sm" ta="center">
              Your funds have been transferred to SaveWise.
            </Text>
            <Badge color="green" variant="light" size="lg" radius="sm">
              New Balance: $
              {Number(bankDetails.balance).toLocaleString("en-CA", {
                minimumFractionDigits: 2,
              })}
            </Badge>
            <Button variant="light" onClick={handleClose} fullWidth mt="xs">
              Done
            </Button>
          </Stack>
        ) : (
          <Stack gap="md">
            <Box
              p="sm"
              style={{
                background: "#f0f9ff",
                borderRadius: 8,
                border: "1px solid #bfdbfe",
              }}
            >
              <Text
                fz="xs"
                c="dimmed"
                tt="uppercase"
                fw={600}
                style={{ letterSpacing: 0.5 }}
              >
                Available Balance
              </Text>
              <Text fw={700} fz="xl" c="blue">
                ${balance.toLocaleString("en-CA", { minimumFractionDigits: 2 })}
              </Text>
            </Box>
            <NativeSelect
              label="Type of contribution"
              description="Deposit or withdrawal"
              data={["deposit", "withdrawal"]}
              value={type}
              onChange={(e)=>setType(e.target.value)}
            />
            <NumberInput
              label="Contribution Amount"
              placeholder="Enter amount"
              prefix="$"
              min={0.01}
              max={balance}
              decimalScale={2}
              thousandSeparator=","
              value={amount}
              onChange={(val) => {
                setAmount(val);
                setError("");
              }}
              error={error}
            />
            <Text fz="xs" c="dimmed">
              Maximum contribution: $
              {balance.toLocaleString("en-CA", {
                minimumFractionDigits: 2,
              })}
            </Text>
            <Divider />
            <Group justify="flex-end" gap="sm">
              <Button variant="default" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                loading={loading}
                onClick={handleSubmit}
                disabled={!amount || Number(amount) <= 0}
                style={{
                  background:
                    "linear-gradient(135deg, #228be6 0%, #15aabf 100%)",
                }}
              >
                Confirm
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </>
  );
};

export default MakeContribution;
