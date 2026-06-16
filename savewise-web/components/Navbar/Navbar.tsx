"use client";
import {
  Box,
  Button,
  Group,
  Text,
} from "@mantine/core";
import classes from "./Navbar.module.css";
import { signOut } from "next-auth/react";
import { useDispatch, useSelector } from "react-redux";
import { setToken, setUser } from "@/state";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import dollar from "../../public/dollar.png";


export default function Navbar() {
  const dispatch = useDispatch();
  const router = useRouter();

  const logoutHandler = (e: React.MouseEvent) => {
    e.preventDefault();
    signOut({
      redirect:false
    });
    dispatch(setUser(null));
    dispatch(setToken(null));
    router.push("/auth/login");
  };

  return (
    <Box style={{
    boxShadow: "0 1px 15px rgba(0, 0, 0, 0.15)",
    position: "relative",
    zIndex: 10,
  }}>
      <header className={classes.header}>
        <Group justify="space-between" h="100%">
          <Group h="100%" gap={0}>
            <Link href="/" className="flex items-center gap-2">
              <Image
                src={dollar}
                alt="site_logo"
                height={50}
                width={50}
              ></Image>
              <Text fw={900} size="xl">
                SaveWise
              </Text>
            </Link>
          </Group>

          <Group visibleFrom="sm">
            <Button onClick={(e) => logoutHandler(e)}>Logout</Button>
          </Group>
        </Group>
      </header>
    </Box>
  );
}
