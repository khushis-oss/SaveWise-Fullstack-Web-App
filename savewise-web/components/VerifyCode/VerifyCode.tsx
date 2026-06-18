"use client";
import { Card, PinInput, Text, Stack, Button } from "@mantine/core";
import auth from "../../public/auth.png";
import Image from "next/image";
import { useEffect, useState } from "react";
import { UserType } from "../../../types";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setUser, setToken, setOtp } from "@/state";
import { signIn } from "next-auth/react";
import { IconShieldCheckFilled } from '@tabler/icons-react';
function VerifyCode({ userObj }: { userObj: UserType }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    console.log("Yout OTP code for verificaion is" + " " + userObj.otp.code);
  }, []);

  const verifyCodeFn = async () => {
    if (Date.now() > new Date(userObj.otp.expiresAt).getTime()) {
      alert("otp expired");
      router.push("/auth/login");
    } else {
      if (!error) {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/auth/verify`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: userObj.email,
                otp: code,
              }),
            },
          );

          if (response.ok) {
            const data = await response.json();
            dispatch(setUser(data.user));
            dispatch(setToken(data.token));
            dispatch(setOtp(null));
            await signIn("credentials", {
              backendToken: data.token,
              userId: data.user._id,
              email: data.user.email,
              name: data.user.name,
              image: data.user.profilePictureUrl,
              redirect: false,
              callbackUrl: "/",
            });
            setError("");
            router.push("/dashboard");
          }else{
            const result = await response.json()
            setError(result.message)
          }
        } catch (error) {
          console.error("error authenticating user");
          if (error instanceof Error) {
            setError(error.message);
          } else {
            setError("something went wrong");
          }
        }
      }
    }
  };
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #eff6ff 0%, #f8faff 100%)",
        padding: "24px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Header */}
        <Stack align="center" gap={4} mb="xl">
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #228be6 0%, #74c0fc 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 6px 20px rgba(34,139,230,0.3)",
              marginBottom: 8,
            }}
          >
            <IconShieldCheckFilled size={20} color="#1a1a2e"/>
          </div>
          <Text fw={700} size="xl" c="#1a1a2e" ta="center">
            Two-Factor Authentication
          </Text>
          <Text size="sm" c="#6b7280" ta="center" lh={1.6}>
            We&apos;ve sent a 6-digit verification code to{" "}
            <Text component="span" fw={600} c="#228be6">
              {userObj.email}
            </Text>
          </Text>
        </Stack>

        {/* Card */}
        <Card
          shadow="md"
          withBorder
          padding="xl"
          radius="lg"
          style={{ borderColor: "#e7f0fd" }}
        >
          <Stack gap="lg" align="center">
            <Stack gap={4} align="center" w="100%">
              <Text fw={500} size="sm" c="#374151">
                Enter verification code
              </Text>
              <Text size="xs" c="#9ca3af">
                Check the browser console for your OTP
              </Text>
            </Stack>

            <PinInput
              length={6}
              oneTimeCode
              value={code}
              onChange={(val) => {
                setCode(val);
                if (error) setError("");
              }}
              inputMode="numeric"
              size="lg"
              gap="xs"
            />

            {error && (
              <Text c="red" size="sm" ta="center">
                {error}
              </Text>
            )}

            <Button
              fullWidth
              size="md"
              mt="xs"
              onClick={() => {
                if (code.length !== 6) {
                  setError("Please enter all 6 digits");
                  return;
                }
                setError("");
                verifyCodeFn();
              }}
              style={{
                background:
                  "linear-gradient(135deg, #228be6 0%, #1971c2 100%)",
                borderRadius: 8,
                height: 44,
              }}
            >
              Verify & Continue
            </Button>

            <Text
              size="xs"
              c="#9ca3af"
              ta="center"
              style={{ cursor: "pointer" }}
              onClick={() => router.push("/auth/login")}
            >
              Back to login
            </Text>
          </Stack>
        </Card>
      </div>
    </div>
  );
}

export default VerifyCode;
