import { Card, PinInput, Text, Stack, Button } from "@mantine/core";
import auth from "../../public/auth.png";
import Image from "next/image";

function VerifyCode() {
  return (
    <div className="flex justify-center items-center my-10">
      <div className="flex flex-col h-full justify-center items-center max-w-md mx-auto">
        <Text size="30px" fw="700" c="#228be6" mb="lg">
          {" "}
          Please Complete 2 Factor Authentication
        </Text>
        <Card shadow="sm" withBorder padding={0} maw={500} >
          <div>
            <Image src={auth} alt="Norway" className="object-cover" height={250} />
          </div>
           
          <Stack  mt="md" mb="xs" p="lg" align="center"  >
            <Text fw={500} size="md">Enter valid code</Text>
            <PinInput
              length={6}
              oneTimeCode
              className="w-1/2 mx-auto"
            />

            <Button color="blue" fullWidth mt="md">
              Verify
            </Button>
          </Stack>
        </Card>
      </div>
    </div>
  );
}

export default VerifyCode;
