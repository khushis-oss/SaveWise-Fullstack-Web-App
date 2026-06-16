"use client"
import { useState } from 'react';
import {
  IconCalendarStats,
  IconDeviceDesktopAnalytics,
  IconFingerprint,
  IconGauge,
  IconHome2,
  IconLogout,
  IconSettings,
  IconSwitchHorizontal,
  IconUser,
} from '@tabler/icons-react';
import { Center, Stack,Box, Tooltip, UnstyledButton } from '@mantine/core';
import classes from './SideNav.module.css';
import Image from 'next/image';
import profit from "../../public/financial-profit.png"
import { signOut } from "next-auth/react";
import { useDispatch, useSelector } from "react-redux";
import { setToken, setUser } from "@/state";
import { useRouter } from "next/navigation";

interface NavbarLinkProps {
  icon: typeof IconHome2;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

function NavbarLink({ icon: Icon, label, active, onClick }: NavbarLinkProps) {
  return (
    <Tooltip label={label} position="right" transitionProps={{ duration: 0 }}>
      <UnstyledButton
        onClick={onClick}
        className={classes.link}
        data-active={active || undefined}
        aria-label={label}
      >
        <Icon size={20} stroke={1.5} />
      </UnstyledButton>
    </Tooltip>
  );
}

const mockdata = [
  { icon: IconHome2, label: 'Home' },
  { icon: IconGauge, label: 'Dashboard' },
  { icon: IconDeviceDesktopAnalytics, label: 'Analytics' },
  { icon: IconCalendarStats, label: 'Releases' },
  { icon: IconUser, label: 'Account' },
  { icon: IconFingerprint, label: 'Security' },
  { icon: IconSettings, label: 'Settings' },
];

export default function SideNav() {
  const [active, setActive] = useState(2);
  const dispatch = useDispatch();
  const router = useRouter();

  const links = mockdata.map((link, index) => (
    <NavbarLink
      {...link}
      key={link.label}
      active={index === active}
      onClick={() => setActive(index)}
    />
  ));

 const logoutHandler = (e: React.MouseEvent) => {
    e.preventDefault();
    signOut({ redirect: false });
    dispatch(setUser(null));
    dispatch(setToken(null));
    router.push("/auth/login");
  };
  
  return (
    <nav className={classes.navbar} style={{
    boxShadow: "2px 0 15px rgba(0, 0, 0, 0.15)",
    position: "relative",
    zIndex: 9,
  }}>
      <Center>
       <Image src={profit} alt='site_logo' height={30} width={30} ></Image>
      </Center>

      <div className={classes.navbarMain}>
        <Stack justify="center" gap={0}>
          {links}
        </Stack>
      </div>

      <Box className='justify-center gap-0' onClick={(e)=>logoutHandler(e)}>
        <NavbarLink icon={IconLogout} label="Logout" />
      </Box>
    </nav>
  );
}