"use client";
import { Paper, Text, Button, Stack, Affix, Badge, Group, SimpleGrid, Center, Loader } from "@mantine/core";
import {
  IconBuildingBank,
  IconShieldCheckFilled,
  IconLock,
  IconRefresh,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { Modal, Stepper } from "@mantine/core";
import { useState, useEffect, useCallback } from "react";
import BankForm from "./Forms/BankForm";
import { useDispatch, useSelector } from "react-redux";
import { setTotalContributedBalance, setBankDetails, setUser } from "@/state";
import { initialStateType } from "../../types";
import BankDetails from "./BankDetails";
import UserDetails from "./UserDetails";
import MakeContribution from "./MakeContribution";
import BalanceRing from "./BalanceRing";
import { apiFetch, notifyError } from "@/lib/apiClient";

const BANKS = [
  "Bank 1",
  "Bank 2",
  "Bank 3",
  "Bank 4",
  "Bank 5",
  "Bank 6",
];

const AddAccount = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const [modalError, setModalError] = useState("");
  const [fetchLoading, setFetchLoading] = useState(false);
  const [active, setActive] = useState(0);
  const [bank, setBank] = useState("");
  const dispatch = useDispatch();
  const token = useSelector((state: initialStateType) => state.token);
  const user = useSelector((state: initialStateType) => state.user);
  const bankDetails = useSelector(
    (state: initialStateType) => state.bankDetails,
  );

  const fetchBankDetails = useCallback(async () => {
    try {
      const response = await apiFetch("/user/bankDetails", token);
      const data = await response.json();
      if (!response.ok) {
        notifyError(data.message || "Failed to load bank details");
        return;
      }
      dispatch(setBankDetails(data.bankDetails));
    } catch (err) {
      if (err instanceof Error && err.message !== "UNAUTHORIZED" && err.message !== "FORBIDDEN")
        notifyError(err.message);
    }
  }, [token, dispatch]);

  const fetchContributionBalance = useCallback(async () => {
    try {
      const response = await apiFetch("/user/contributionBalance", token);
      const data = await response.json();
      if (!response.ok) {
        notifyError(data.message || "Failed to load balance");
        return;
      }
      dispatch(setUser(data.user));
      dispatch(setTotalContributedBalance(data.totalContributedBalance));
    } catch (err) {
      if (err instanceof Error && err.message !== "UNAUTHORIZED" && err.message !== "FORBIDDEN")
        notifyError(err.message);
    }
  }, [token, dispatch]);

  useEffect(() => {
    if (user?.isBankConnected) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFetchLoading(true);
      Promise.all([fetchBankDetails(), fetchContributionBalance()]).finally(
        () => setFetchLoading(false),
      );
    }
  }, [user?.isBankConnected, fetchBankDetails, fetchContributionBalance]);

  const handleStepChange = (nextStep: number) => {
    if (nextStep > 3 || nextStep < 0) return;
    setModalError("");
    setActive(nextStep);
  };

  const handleBankDetails = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    try {
      const response = await apiFetch("/user/connectAccount", token, {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setModalError(data.message || "Failed to connect account");
        return;
      }
      dispatch(setBankDetails(data.bankDetails));
      dispatch(setUser(data.user));
      handleStepChange(2);
    } catch (err) {
      if (err instanceof Error && err.message !== "UNAUTHORIZED" && err.message !== "FORBIDDEN")
        setModalError(err.message || "Failed to authenticate");
    }
  };

  if (user?.isBankConnected && fetchLoading) {
    return (
      <Center h={300}>
        <Loader size="md" />
      </Center>
    );
  }

  return (
    <>
      {bankDetails && Object.entries(bankDetails).length > 0 ? (
        <Stack gap="md">
          <MakeContribution />
          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
            <BankDetails />
            <UserDetails />
            <BalanceRing />
          </SimpleGrid>
        </Stack>
      ) : (
        <>
          {/* Empty state — no bank connected */}
          <Paper
            shadow="sm"
            p={60}
            w="100%"
            style={{
              background:
                "linear-gradient(145deg, #f0f7ff 0%, #ffffff 60%, #f8f9ff 100%)",
              border: "1px solid #e7f0fd",
              borderRadius: 16,
            }}
          >
            <Stack align="center" gap="xl">
              <div
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, #228be6 0%, #74c0fc 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 8px 24px rgba(34, 139, 230, 0.25)",
                }}
              >
                <IconBuildingBank size={46} color="white" stroke={1.5} />
              </div>

              <Stack align="center" gap={6}>
                <Text fw={700} size="xl" c="#1a1a2e">
                  Connect Your Bank Account
                </Text>
                <Text c="#6b7280" size="sm" ta="center" maw={380} lh={1.7}>
                  Securely link your bank to start making IRA contributions.
                  Your data is encrypted and never stored on our servers.
                </Text>
              </Stack>

              <Group gap={8} justify="center">
                <Badge
                  leftSection={<IconShieldCheckFilled size={12} />}
                  variant="light"
                  color="blue"
                  radius="xl"
                  size="sm"
                >
                  Bank-level Security
                </Badge>
                <Badge
                  leftSection={<IconLock size={12} />}
                  variant="light"
                  color="teal"
                  radius="xl"
                  size="sm"
                >
                  256-bit Encryption
                </Badge>
                <Badge
                  leftSection={<IconRefresh size={12} />}
                  variant="light"
                  color="violet"
                  radius="xl"
                  size="sm"
                >
                  Manage Anytime
                </Badge>
              </Group>

              <Button
                size="md"
                leftSection={<IconBuildingBank size={18} />}
                loading={fetchLoading}
                onClick={open}
                style={{
                  background:
                    "linear-gradient(135deg, #228be6 0%, #1971c2 100%)",
                  borderRadius: 10,
                  padding: "0 36px",
                  height: 46,
                }}
              >
                Connect Bank Account
              </Button>
            </Stack>
          </Paper>

          {/* Connect bank modal */}
          <Modal
            opened={opened}
            onClose={() => {
              close();
              setActive(0);
            }}
            title={
              <Text fw={600} size="lg">
                Connect Your Bank
              </Text>
            }
            centered
            size="md"
          >
            {modalError && (
              <Text ta="center" mb="sm" c="red" size="sm">
                {modalError}
              </Text>
            )}
            <Stepper active={active} onStepClick={setActive}>
              {/* Step 1 — choose bank */}
              <Stepper.Step allowStepSelect={false}>
                <Stack gap="sm" mt="md">
                  <Text fw={500} size="sm" c="#374151" ta="center">
                    Select your bank
                  </Text>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: 10,
                    }}
                  >
                    {BANKS.map((name) => (
                      <button
                        key={name}
                        onClick={() => {
                          setBank(name);
                          handleStepChange(active + 1);
                        }}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 8,
                          padding: "16px 12px",
                          border: `2px solid ${bank === name ? "#228be6" : "#e5e7eb"}`,
                          borderRadius: 10,
                          background: bank === name ? "#eff6ff" : "white",
                          cursor: "pointer",
                          transition: "all 0.15s",
                        }}
                      >
                        <IconBuildingBank
                          size={28}
                          color={bank === name ? "#228be6" : "#6b7280"}
                          stroke={1.5}
                        />
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 500,
                            color: bank === name ? "#1971c2" : "#374151",
                          }}
                        >
                          {name}
                        </span>
                      </button>
                    ))}
                  </div>
                </Stack>
              </Stepper.Step>

              {/* Step 2 — credentials */}
              <Stepper.Step allowStepSelect={false}>
                <Stack gap="xs" mt="md">
                  <Text fw={500} size="sm" c="#374151" ta="center">
                    Enter your {bank} credentials
                  </Text>
                  <BankForm handleSubmit={handleBankDetails} />
                </Stack>
              </Stepper.Step>

              {/* Step 3 — success */}
              <Stepper.Step allowStepSelect={false}>
                <Stack align="center" gap="sm" mt="lg" mb="md">
                  <div
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: "50%",
                      background: "#f0fdf4",
                      border: "2px solid #bbf7d0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <IconShieldCheckFilled color="#16a34a" size={40} />
                  </div>
                  <Text fw={600} size="lg" c="#15803d">
                    Connected Successfully
                  </Text>
                  <Text size="sm" c="#6b7280" ta="center">
                    Your {bank} account has been linked. You can now make
                    contributions.
                  </Text>
                  <Button
                    mt="xs"
                    onClick={() => {
                      close();
                      setActive(0);
                    }}
                    style={{
                      background:
                        "linear-gradient(135deg, #228be6 0%, #1971c2 100%)",
                    }}
                  >
                    Go to Dashboard
                  </Button>
                </Stack>
              </Stepper.Step>
            </Stepper>

            {active === 1 && (
              <Group justify="center" mt="md">
                <Button
                  variant="subtle"
                  color="gray"
                  size="sm"
                  onClick={() => handleStepChange(active - 1)}
                >
                  ← Back
                </Button>
              </Group>
            )}
          </Modal>

          {active === 1 && (
            <Affix position={{ bottom: 0, right: 0 }} w="100%" bg="#fff">
              <div
                style={{
                  width: "100%",
                  boxShadow: "0 -2px 10px rgba(0,0,0,0.08)",
                  padding: "10px 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <Text size="xs" c="#6b7280">
                  Demo credentials —
                </Text>
                <Text size="xs" fw={500} c="#374151">
                  Username: user_good
                </Text>
                <Text size="xs" c="#9ca3af">
                  |
                </Text>
                <Text size="xs" fw={500} c="#374151">
                  Password: pass_good
                </Text>
              </div>
            </Affix>
          )}
        </>
      )}
    </>
  );
};

export default AddAccount;
