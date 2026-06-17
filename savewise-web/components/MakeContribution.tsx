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
import { setBankDetails, setUser } from "@/state";
import {
  IconArrowUpRight,
  IconCircleCheckFilled,
  IconCoinFilled,
  IconHistory,
} from "@tabler/icons-react";
import ContributionsDrawer from "./ContributionsDrawer";
import { apiFetch, notifyError } from "@/lib/apiClient";

const currentYear = new Date().getFullYear();

const taxYearOptions = Array.from({ length: 10 }, (_, i) => ({
  value: String(currentYear - i),
  label: String(currentYear - i),
}));

const MakeContribution = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);
  const [amount, setAmount] = useState<number | string>("");
  const [status,setStatus]=useState("RECORDED")
  const [type,setType]=useState("TRADITIONAL");
  const [taxY,setTaxY]=useState(String(currentYear))
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
    setStatus("RECORDED");
    setType("TRADITIONAL");
    setTaxY(String(currentYear));
    setError("");
    setSuccess(false);
  };
  

  const handleSubmit = async () => {
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setError("Please enter a valid amount.");
      return;
    }
    if (status === "RECORDED" && numAmount > balance) {
      setError("Amount exceeds your available bank balance.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await apiFetch("/user/contribute", token, {
        method: "POST",
        body: JSON.stringify({ amount: numAmount, status, type, taxY }),
      });
      const data = await response.json();
      if (!response.ok) {
        notifyError(data.message || "Contribution failed");
        return;
      }
      dispatch(setBankDetails(data.bankDetails));
      if (data.user) dispatch(setUser(data.user));
      setSuccess(true);
    } catch (err) {
      if (err instanceof Error && err.message !== "UNAUTHORIZED")
        notifyError(err.message || "Something went wrong");
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
              leftSection={<IconHistory size={16} />}
              onClick={openDrawer}
              variant="light"
            >
              History
            </Button>
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

      <ContributionsDrawer opened={drawerOpened} onClose={closeDrawer} />

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
              data={["RECORDED", "WITHDRAWN"]}
              value={status}
              onChange={(e)=>setStatus(e.target.value)}
            />
            <NativeSelect
              label="Type of IRA"
              description="Traditional or Roth"
              data={["TRADITIONAL", "ROTH"]}
              value={type}
              onChange={(e)=>setType(e.target.value)}
            />
            <NativeSelect
              label="Tax Year"
              description="Select tax year"
              data={taxYearOptions}
              value={taxY}
              onChange={(e)=>setTaxY(e.target.value)}
            />
            <NumberInput
              label="Contribution Amount"
              placeholder="Enter amount"
              prefix="$"
              min={0.01}

              decimalScale={2}
              thousandSeparator=","
              value={amount}
              onChange={(val) => {
                setAmount(val);
                setError("");
              }}
              error={error}
            />
            {status === "RECORDED" && (
              <Text fz="xs" c="dimmed">
                Maximum contribution: $
                {balance.toLocaleString("en-CA", {
                  minimumFractionDigits: 2,
                })}
              </Text>
            )}
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
