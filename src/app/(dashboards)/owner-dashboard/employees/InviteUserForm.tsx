"use client";


import { CustomError } from "@/app/api/helpers/handleError";
import Button from "@/components/Button";
import ErrorMessage from "@/components/Forms/ErrorMessage";
import Field from "@/components/Forms/Field";
import Form from "@/components/Forms/Form";
import Input from "@/components/Forms/Input";
import InputGroup from "@/components/Forms/InputGroup";
import Select from "@/components/Forms/Select";
import { InviteUserSchema } from "@/schemas/user.schema";
import { useAuth } from "@/stores/authStore";
import { AxiosError } from "axios";
import { IoMail } from "react-icons/io5";
import { useInviteUser } from "@/app/api-client/invite/useInviteUser";
import pageConfigs from "./pageConfigs";
import capitalizeFirstLetter from "@/utilities/capitalizeFirstLetter";

const InviteUserForm = () => {
  const { selectedOrganization } = useAuth();
  const organizationId = selectedOrganization?.organizationId ?? "";

  const { mutateAsync: invite } = useInviteUser({
    organizationId,
  });

  return (
    <Form
      validationSchema={InviteUserSchema}
      onSubmit={async (values, methods) => {
        try {
          await invite({
            body: values,
          });
          methods.reset();
        } catch (error) {
          const err = error as AxiosError;
          const errObject = err.response?.data as CustomError;

          methods.setError("email", {
            message: errObject?.error?.message || "Failed to send invitation.",
          });
        }
      }}
    >
      {({ register, formState: { errors, isSubmitting } }) => (
        <>
          {/* Email Field */}
          <Field>
            <InputGroup>
              <IoMail data-slot="icon" />
              <Input
                type="email"
                placeholder="Email address"
                data-invalid={errors.email?.message}
                {...register("email")}
              />
            </InputGroup>
            <ErrorMessage>{errors.email?.message}</ErrorMessage>
          </Field>

          {/* Role Select Field */}
          <Field className="w-full mb-10">
            <Select
              selectClass="bg-primary/10 text-primary font-medium w-full py-2 border-1 data-[placeholder]:text-primary focus:ring-0 focus:border-primary"
              chevronClass="text-primary"
              name="role"
              placeholder="Select a role"
            >
              <Select.Option value="all">All roles</Select.Option>
              {pageConfigs.FILTERS.roles.map((role) => (
                <Select.Option key={role} value={role}>
                  {capitalizeFirstLetter(
                    role.toLowerCase().replaceAll("_", " "),
                  )}
                </Select.Option>
              ))}
            </Select>
          </Field>

          {/* Buttons */}
          <Button type="submit" isLoading={isSubmitting} className="w-full">
            Invite
          </Button>
        </>
      )}
    </Form>
  );
};

export default InviteUserForm;


