import React, { JSX } from "react";

import { Button, ButtonProps } from "@mantine/core";

const SocialButton = ({
  icon,
  children,
  handler,
  ...props
}: {
  icon: JSX.Element;
  children: React.ReactNode;
  handler: () => void;
} & ButtonProps) => {
  return (
    <Button leftSection={icon} variant="default" {...props} onClick={handler}>
      {children}
    </Button>
  );
};

export default SocialButton;
