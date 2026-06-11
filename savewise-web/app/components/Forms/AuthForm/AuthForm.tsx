"use client";
import {
  Anchor,
  Button,
  Checkbox,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
  Group,
} from "@mantine/core";
import classes from "./AuthenticationImage.module.css";
import SocialButton from "../../Buttons/SocialButton";
import GoogleIcon from "../../Icons/GoogleIcon";
import GitHubIcon from "../../Icons/GitHubIcon";
import { signIn, signOut } from "next-auth/react";
import { useState } from "react";
import { useForm } from "@mantine/form";
import { FileInput, Image, Stack } from "@mantine/core";
import { useMemo } from "react";
import { IconCamera } from "@tabler/icons-react";
import { IconSquareLetterXFilled } from "@tabler/icons-react";

const AuthForm = ({ formType }: { formType: "login" | "signup" }) => {
  const [pageType, setPageType] = useState(formType);
  const [file, setFile] = useState<File | null>(null);
  const preview = useMemo(() => {
    return file ? URL.createObjectURL(file) : null;
  }, [file]);

  const form = useForm({
    initialValues: {
      email: "",
      name: "",
      image: null as File | null,
      password: "",
      status: false,
    },

    validate: {
      name: (val) =>
        pageType === "signup" && val.length < 2
          ? "Name must have at least 2 letters"
          : null,
      image: (val) =>
        pageType === "signup" && !val ? "Image is required" : null,
      email: (val) => (/^\S+@\S+$/.test(val) ? null : "Invalid email"),
      password: (val) =>
        val.length <= 6
          ? "Password should include at least 6 characters"
          : null,
    },
  });
  return (
    <div className={classes.wrapper}>
      <Paper className={classes.form}>
        <form onSubmit={form.onSubmit((values) => console.log(values))}>
          <Title order={2} className={classes.title}>
            {pageType === "login"
              ? "Welcome back to SaveWise!"
              : "Welcome to SaveWise! Create an account to get started."}
          </Title>
          <Group grow mb="md" mt="md">
            <SocialButton
              icon={<GoogleIcon />}
              radius="xl"
              handler={() => signIn("google")}
            >
              Google
            </SocialButton>
            <SocialButton
              icon={<GitHubIcon />}
              radius="xl"
              handler={() => signIn("github")}
            >
              GitHub
            </SocialButton>
          </Group>

          {pageType === "signup" && (
            <>
              <TextInput
                label="Name"
                placeholder="John Doe"
                size="sm"
                radius="md"
                value={form.values.name}
                onChange={(event) =>
                  form.setFieldValue("name", event.currentTarget.value)
                }
                error={form.errors.name && "Invalid name"}
              />
              <Stack>
                <FileInput
                  rightSection={<IconCamera size={14} />}
                  placeholder="Your Image"
                  label="Upload image"
                  accept="image/*"
                  value={form.values.image}
                  onChange={(file) => {
                    setFile(file);
                    form.setFieldValue("image", file);
                  }}
                  size="sm"
                  radius="md"
                  mt="md"
                  error={form.errors.image && "Invalid image"}
                />
                {preview && (
                  <div
                    style={{
                      position: "relative",
                      display: "inline-block",
                      width: "max-content",
                    }}
                  >
                    <Image
                      src={preview}
                      alt="Preview"
                      w={70}
                      h={70}
                      radius="md"
                      style={{
                        objectFit: "cover",
                        borderRadius: "50%",
                        cursor: "pointer",
                      }}
                    />
                    <IconSquareLetterXFilled
                      size={25}
                      style={{
                        position: "absolute",
                        top: -5,
                        right: -5,
                        cursor: "pointer",
                        color: "#F72585",
                      }}
                      onClick={() => {
                        URL.revokeObjectURL(preview);
                        setFile(null);
                      }}
                    />
                  </div>
                )}
              </Stack>
            </>
          )}
          <TextInput
            label="Email address"
            placeholder="hello@gmail.com"
            size="md"
            radius="md"
            mt="md"
            value={form.values.email}
            onChange={(event) =>
              form.setFieldValue("email", event.currentTarget.value)
            }
            error={form.errors.email && "Invalid email"}
          />
          <PasswordInput
            label="Password"
            placeholder="Your password"
            mt="md"
            size="md"
            radius="md"
            value={form.values.password}
            onChange={(event) =>
              form.setFieldValue("password", event.currentTarget.value)
            }
            error={form.errors.password && "Invalid password"}
          />
          {pageType === "login" && (
            <Checkbox
              label="Keep me logged in"
              mt="xl"
              size="md"
              checked={form.values.status}
              onChange={(event) =>
                form.setFieldValue("status", event.currentTarget.checked)
              }
            />
          )}
          <Button fullWidth mt="xl" size="md" radius="md" type="submit">
            {pageType === "login" ? "Login" : "Sign Up"}
          </Button>

          <Text ta="center" mt="md">
            {pageType === "login"
              ? "Don't have an account?"
              : "Already have an account?"}{" "}
            <Anchor
              href="/auth/login"
              fw={500}
              onClick={(e) => {
                e.preventDefault();
                setPageType(pageType === "login" ? "signup" : "login");
                form.reset();
                URL.revokeObjectURL(preview!);
                setFile(null);
              }}
            >
              {pageType === "login" ? "Sign Up" : "Login"}
            </Anchor>
          </Text>
        </form>
      </Paper>
    </div>
  );
};

export default AuthForm;
