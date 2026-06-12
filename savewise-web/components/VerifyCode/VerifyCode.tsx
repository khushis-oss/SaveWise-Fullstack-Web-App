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
            const result = await signIn("credentials", {
              backendToken: data.token,
              userId: data.user._id,
              email: data.user.email,
              name: data.user.name,
              image: data.user.profilePictureUrl,
              redirect: false,
              callbackUrl: "/",
            });
            if (data?.error) {
              setError("Invalid OTP");
            } else {
              setError("");
              router.push(result?.url ?? "/");
            }
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
    <div className="flex justify-center items-center my-10">
      <div className="flex flex-col h-full justify-center items-center max-w-md mx-auto">
        <Text size="30px" fw="700" c="#228be6" mb="lg">
          {" "}
          Please Complete 2 Factor Authentication
        </Text>
        <Card shadow="sm" withBorder padding={0} maw={500}>
          <div>
            <Image
              src={auth}
              alt="Norway"
              className="object-cover"
              height={250}
            />
          </div>

          <Stack mt="md" mb="xs" p="lg" align="center">
            <Text fw={500} size="md">
              Check console for OTP
            </Text>

            <PinInput
              length={6}
              oneTimeCode
              className="w-1/2 mx-auto"
              value={code}
              onChange={(val) => {
                setCode(val);
                if (error) setError("");
              }}
              inputMode="numeric"
            />

            {error && (
              <Text c="red" size="sm">
                {error}
              </Text>
            )}

            <Button
              color="blue"
              fullWidth
              mt="md"
              onClick={() => {
                if (code.length !== 6) {
                  setError("Please enter all 6 digits");
                  return;
                }

                setError("");
                verifyCodeFn();
              }}
            >
              Verify
            </Button>
          </Stack>
        </Card>
      </div>
    </div>
  );
}

export default VerifyCode;
