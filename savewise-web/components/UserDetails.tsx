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
  Avatar,
} from "@mantine/core";
import { initialStateType } from "../../types";
import { useSelector } from "react-redux";
import {
  IconUser,
  IconMail,
  IconShieldCheckFilled,
  IconShieldExclamation,
  IconBuildingBank,
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
    <ThemeIcon variant="light" color="violet" size="sm" radius="xl">
      {icon}
    </ThemeIcon>
    <Box>
      <Text
        fz="xs"
        c="dimmed"
        tt="uppercase"
        fw={600}
        style={{ letterSpacing: 0.5 }}
      >
        {label}
      </Text>
      <Text fz="sm" fw={500}>
        {value}
      </Text>
    </Box>
  </Group>
);

const UserDetails = () => {
  const user = useSelector((state: initialStateType) => state.user);

  if (!user) return null;

  const initials = user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card radius="md" w="100%" withBorder p={0} shadow="sm">
      <Box
        p="lg"
        style={{
          background: "linear-gradient(135deg, #7950f2 0%, #cc5de8 100%)",
        }}
      >
        <Group gap="md" align="center">
          <Avatar
            src={
              user.profilePictureUrl
                ? user.profilePictureUrl.startsWith("http")
                  ? user.profilePictureUrl
                  : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${user.profilePictureUrl}`
                : null
            }
            size={56}
            radius="xl"
            style={{ border: "2px solid rgba(255,255,255,0.4)" }}
          >
            <Text fw={700} c="white" fz="lg">
              {initials}
            </Text>
          </Avatar>
          <Stack gap={4}>
            <Text
              fz="xs"
              c="rgba(255,255,255,0.7)"
              tt="uppercase"
              fw={600}
              style={{ letterSpacing: 1 }}
            >
              Profile
            </Text>
            <Text fz="xl" fw={700} c="white">
              {user.name}
            </Text>
            <Badge
              variant="outline"
              size="sm"
              radius="sm"
              tt="capitalize"
              style={{
                borderColor: "rgba(255,255,255,0.5)",
                color: "white",
                width: "fit-content",
              }}
            >
              {user.role}
            </Badge>
          </Stack>
        </Group>
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
          label="Full Name"
          value={user.name}
          icon={<IconUser size={12} />}
        />
        <DetailRow
          label="Email"
          value={user.email}
          icon={<IconMail size={12} />}
        />

        <Divider />

        <Group gap="sm">
          <Badge
            color={user.isVerified ? "green" : "orange"}
            variant="light"
            size="sm"
            radius="sm"
            leftSection={
              user.isVerified ? (
                <IconShieldCheckFilled size={10} />
              ) : (
                <IconShieldExclamation size={10} />
              )
            }
          >
            {user.isVerified ? "Email Verified" : "Not Verified"}
          </Badge>
          <Badge
            color={user.isBankConnected ? "blue" : "gray"}
            variant="light"
            size="sm"
            radius="sm"
            leftSection={<IconBuildingBank size={10} />}
          >
            {user.isBankConnected ? "Bank Connected" : "No Bank Linked"}
          </Badge>
        </Group>
      </Stack>
    </Card>
  );
};

export default UserDetails;
