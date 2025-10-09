"use client";

import { useAssignEmployees } from "@/app/api-client/organization/Assign/useAssignEmployees";
import { useGetAssignedEmployees } from "@/app/api-client/organization/Assign/useGetUnAssignedEmployees";
import { useGetAllOrganizationEmployees } from "@/app/api-client/organization/employees/useGetAllOrganizationEmployees";
import { CustomError } from "@/app/api/helpers/handleError";
import Button from "@/components/Button";
import ErrorMessage from "@/components/Forms/ErrorMessage";
import Field from "@/components/Forms/Field";
import Form from "@/components/Forms/Form";
import MultiSelect from "@/components/Forms/MultiSelect";
import { Select } from "@/components/Forms/Select";
import { AssignEmployeesSchema } from "@/schemas/user.schema";
import { useAuth } from "@/stores/authStore";
import { AxiosError } from "axios";
import React, { useMemo } from "react";

const AssignEmployeesForm = () => {
  const { selectedOrganization } = useAuth();
  const organizationId = selectedOrganization?.organizationId ?? "";

  const { mutateAsync: assign } = useAssignEmployees({ organizationId });

  // Fetch supervisors
  const { data: supervisors, isLoading: loadingSupervisors } =
    useGetAllOrganizationEmployees({
      orgId: organizationId,
      params: { role: "SUPERVISOR" },
    });

  // Fetch assigned/unassigned employees
  const { data: employeesData, isLoading: loadingEmployees } =
    useGetAssignedEmployees({
      orgId: organizationId,
      params: { role: "EMPLOYEE" },
    });

  // Transform unassigned employees data to options format
  const employeeOptions = useMemo(() => {
    return (
      employeesData?.data?.unassignedEmployees.map((employee) => ({
        value: employee.employeeId,
        label: employee.employeeName,
      })) ?? []
    );
  }, [employeesData]);
  
  
  return (
    <Form
      validationSchema={AssignEmployeesSchema}
      onSubmit={async (values, methods) => {
        try {
          await assign({
            body: values,
          });
          methods.reset();
        } catch (error) {
          const err = error as AxiosError;
          const errObject = err.response?.data as CustomError;

          methods.setError("employeeIds", {
            message:
              errObject?.error?.message ||
              "Failed to assign employees to supervisor.",
          });
        }
      }}
    >
      {({ setValue, formState: { errors, isSubmitting } }) => (
        <div className="space-y-4">
          {/* Supervisor Select */}
          <Field>
            <Select
              name="supervisorId"
              placeholder={
                loadingSupervisors
                  ? "Loading supervisors..."
                  : "Select a Supervisor"
              }
              disabled={loadingSupervisors}
              onValueChange={(value) => setValue("supervisorId", value)}
            >
              {supervisors?.data?.items?.map((supervisor) => (
                <Select.Option key={supervisor.id} value={supervisor.id}>
                  {supervisor.firstName || supervisor.email}
                </Select.Option>
              ))}
            </Select>
            <ErrorMessage>{errors.supervisorId?.message}</ErrorMessage>
          </Field>

          {/* Employees MultiSelect */}
          <Field>
            <MultiSelect
              name="employeeIds"
              placeholder={
                loadingEmployees ? "Loading employees..." : "Select Employees"
              }
              options={employeeOptions}
              onChange={(values) =>
                setValue("employeeIds", values as [string, ...string[]])
              }
            />
            <ErrorMessage>{errors.employeeIds?.message}</ErrorMessage>
          </Field>

          {/* Submit Button */}
          <Button
            type="submit"
            isLoading={isSubmitting}
            className="mt-4 w-full"
          >
            Assign Employees
          </Button>
        </div>
      )}
    </Form>
  );
};

export default AssignEmployeesForm;
