import { useApi } from "@/providers/ApiProvider";
import { useCreateMutation } from "../../apiFactory";
import { assignEmployeesInput, AssignEmployeesResponse } from "./type";

interface UseAssignEmployeesOptions {
  organizationId: string;
  invalidateQueryKey?: unknown[];
}

export const useAssignEmployees = ({
  organizationId,
  invalidateQueryKey,
}: UseAssignEmployeesOptions) => {
  const { jsonApiClient } = useApi();
  return useCreateMutation<
    Record<string, any>,
    assignEmployeesInput,
    { data: AssignEmployeesResponse },
    { data: AssignEmployeesResponse }
  >({
    apiClient: jsonApiClient,
    method: "post",
    url: `/organization/${organizationId}/assign-employee-to-supervisor`,
    errorMessage: "Failed to assign employees.",
    invalidateQueryKey,
    mutationOptions: {},
  });
};
