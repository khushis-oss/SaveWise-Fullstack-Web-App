"use client";
import { Paper, Text, Button, Stack, Affix } from "@mantine/core";
import { IconCashBanknoteFilled } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { Modal } from "@mantine/core";
import { Stepper, Group } from "@mantine/core";
import { useState, useEffect, useCallback } from "react";
import { IconHomeFilled } from "@tabler/icons-react";
import { IconHome2Filled } from "@tabler/icons-react";
import BankForm from "./Forms/BankForm";
import { useDispatch, useSelector } from "react-redux";
import { setBalance, setBankDetails, setUser } from "@/state";
import { initialStateType } from "../../types";
import { IconShieldCheckFilled } from "@tabler/icons-react";
import BankDetails from "./BankDetails";
import UserDetails from "./UserDetails";
import MakeContribution from "./MakeContribution";
import BalanceRing from "./BalanceRing";

const AddAccount = () => {
  const [loading, { toggle }] = useDisclosure();
  const [opened, { open, close }] = useDisclosure(false);
  const [error, setError] = useState("");
  const [fetchError, setFetchError] = useState("");
  const [active, setActive] = useState(0);
  const [bank, setBank] = useState("");
  const [highestStepVisited, setHighestStepVisited] = useState(active);
  const dispatch = useDispatch();
  const token = useSelector((state: initialStateType) => state.token);
  const user = useSelector((state: initialStateType) => state.user);
  const bankDetails = useSelector(
    (state: initialStateType) => state.bankDetails,
  );

  const fetchBankDetails = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/user/bankDetails`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await response.json();
      if (!response.ok) {
        setFetchError(data.message);
        return;
      }
      dispatch(setBankDetails(data.bankDetails));
    } catch (error) {
      if (error instanceof Error) setFetchError(error.message);
      else setFetchError("failed to fetch");
    }
  }, [token, dispatch]);

  const fetchContributionBalance = useCallback(async() => {
    try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/user/contributionBalance`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            },
          );
          const data = await response.json();
          if (!response.ok) {
            setError(data.message);
            return;
          }
          dispatch(setUser(data.user));
          dispatch(setBalance(data.contributionBalance));
        } catch (err) {
          setError(err instanceof Error ? err.message : "Something went wrong.");
      };
  },[token,dispatch])

  useEffect(() => {
    if (user?.isBankConnected) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchBankDetails();
    }
  }, [user, fetchBankDetails]);

  useEffect(() => {
    if (user?.isBankConnected) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchContributionBalance();
    }
  }, [user, fetchContributionBalance]);

  
  const handleStepChange = (nextStep: number) => {
    const isOutOfBounds = nextStep > 3 || nextStep < 0;

    if (isOutOfBounds) {
      return;
    }

    setError("");
    setActive(nextStep);
    setHighestStepVisited((hSC) => Math.max(hSC, nextStep));
  };

  // Allow the user to freely go back and forth between visited steps.
  //   const shouldAllowSelectStep = (step: number) =>
  //     highestStepVisited >= step && active !== step;

  const handleBankDetails = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    try {
      console.log(token);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/user/connectAccount`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: email,
            password: password,
          }),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        setError(data.message);
        return;
      }
      dispatch(setBankDetails(data.bankDetails));
      dispatch(setUser(data.user));
      handleStepChange(2);
    } catch (error) {
      if (error instanceof Error) setError(error.message);
      else setError("failed to authenticate");
    }
  };
  return (
    <>
      {fetchError && (
        <Text ta="center" mt="md" c="red">
          {fetchError}
        </Text>
      )}
      {bankDetails && Object.entries(bankDetails).length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          
          <MakeContribution />
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-around",
              gap:"20px",
              flexWrap:"wrap"
            }}
          >
            <BankDetails />
            <UserDetails />
            <BalanceRing />
          </div>
        </div>
      ) : (
        <>
          <Paper shadow="sm" p={50} w="90%" m="auto">
            <Stack align="center">
              <Text fw={500} c="#545454">
                Add Your Bank Account
              </Text>
              <Text c="#888a8a">
                To start making contributions, add the bank account you'd like
                to contribute from. You can add and manage them anytime in your
                account settings.
              </Text>
              <IconCashBanknoteFilled size={150} color="#d0ebff" />
              <Button variant="outline" loading={loading} onClick={open}>
                Add Bank Account
              </Button>
            </Stack>
          </Paper>
          <Modal
            opened={opened}
            onClose={() => {
              close();
              setActive(0);
            }}
            title="Authentication"
            centered
          >
            {error && (
              <Text ta="center" mt="md" c="red">
                {error}
              </Text>
            )}
            <Stepper
              active={active}
              onStepClick={setActive}
              h={300}
              w="70%"
              style={{ margin: "auto" }}
            >
              <Stepper.Step allowStepSelect={false}>
                <Group justify="center">
                  Step 1 : Choose Bank Account
                  <Button
                    leftSection={<IconHomeFilled size={14} />}
                    onClick={() => {
                      setBank("Bank 1");
                      if (bank) {
                        handleStepChange(active + 1);
                      }
                    }}
                    variant="default"
                  >
                    Bank 1
                  </Button>
                  <Button
                    leftSection={<IconHome2Filled size={14} />}
                    onClick={() => {
                      setBank("Bank 2");
                      if (bank) {
                        handleStepChange(active + 1);
                      }
                    }}
                    variant="default"
                  >
                    Bank 2
                  </Button>
                  <Button
                    leftSection={<IconHomeFilled size={14} />}
                    onClick={() => {
                      setBank("Bank 3");
                      if (bank) {
                        handleStepChange(active + 1);
                      }
                    }}
                    variant="default"
                  >
                    Bank 3
                  </Button>
                  <Button
                    leftSection={<IconHome2Filled size={14} />}
                    onClick={() => {
                      setBank("Bank 4");
                      if (bank) {
                        handleStepChange(active + 1);
                      }
                    }}
                    variant="default"
                  >
                    Bank 4
                  </Button>
                  <Button
                    leftSection={<IconHomeFilled size={14} />}
                    onClick={() => {
                      setBank("Bank 5");
                      if (bank) {
                        handleStepChange(active + 1);
                      }
                    }}
                    variant="default"
                  >
                    Bank 5
                  </Button>
                  <Button
                    leftSection={<IconHome2Filled size={14} />}
                    onClick={() => {
                      setBank("Bank 6");
                      if (bank) {
                        handleStepChange(active + 1);
                      }
                    }}
                    variant="default"
                  >
                    Bank 6
                  </Button>
                </Group>
              </Stepper.Step>
              <Stepper.Step allowStepSelect={false}>
                Step 2 connect bank
                <BankForm handleSubmit={handleBankDetails} />
              </Stepper.Step>
              <Stepper.Step allowStepSelect={false}>
                {bankDetails ? (
                  <div className="flex flex-col items-center">
                    <IconShieldCheckFilled color="green" size={100} />
                    <Text>Connected Successfully</Text>
                  </div>
                ) : (
                  <Text>Bank Not yet connected</Text>
                )}
              </Stepper.Step>
            </Stepper>
            {!bankDetails && (
              <Group justify="center" mt="xl">
                <Button
                  variant="default"
                  onClick={() => handleStepChange(active - 1)}
                >
                  Back
                </Button>
              </Group>
            )}
          </Modal>
          {active == 1 && (
            <Affix position={{ bottom: 0, right: 0 }} w="100%" bg={"#fff"}>
              <div
                style={{
                  width: "100%",
                  height: "20px",
                  boxShadow: "-1px 0 6px rgba(0,0,0,0.5)",
                  padding: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                Credentials » username: user_good | password: pass_good
              </div>
            </Affix>
          )}
        </>
      )}
    </>
  );
};

export default AddAccount;
