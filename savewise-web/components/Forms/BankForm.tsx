import { PasswordInput, TextInput, Button } from "@mantine/core";
import { useForm } from "@mantine/form";

const BankForm = ({
  handleSubmit,
}: {
  handleSubmit: ({ email, password }: { email: string; password: string }) => void;
}) => {
  const form = useForm({
    initialValues: {
      email: "",
      password: "",
    },
    validateInputOnBlur: true,
    validate: {
      email: (value) => {
        if (value.trim().length === 0) return "Email is required";
        return null;
      },
      password: (value) =>
        value.trim().length === 0 ? "Password is required" : null,
    },
  });
  return (
    <div>
      <form
        className=" flex flex-col align-center"
        onSubmit={form.onSubmit((values) =>
          handleSubmit({
            email: values.email,
            password: values.password,
          }))
        }
        
      >
        <TextInput
          label="Email"
          placeholder="John@gmail.com"
          size="sm"
          radius="md"
          value={form.values.email}
          onChange={(event) =>
            form.setFieldValue("email", event.currentTarget.value)
          }
          error={form.errors.email}
        />
        <PasswordInput
          label="Password"
          placeholder="password"
          size="sm"
          radius="md"
          value={form.values.password}
          onChange={(event) =>
            form.setFieldValue("password", event.currentTarget.value)
          }
          error={form.errors.password}
        />
        <Button type="submit" mt={20}>
          Confirm
        </Button>
      </form>
    </div>
  );
};

export default BankForm;
