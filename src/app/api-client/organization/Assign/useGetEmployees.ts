import { useApi } from "@/providers/ApiProvider";
import { useCreateQuery } from "../../apiFactory";
import { OrganizationEmployeesParams } from "../employees/types";
import { AssignedEmployeesKey, EAssignedEmployees } from "./config";
import { AssignedEmployeesApiResponse } from "./type";

export const useGetEmployees = ({
  orgId,
  params,
}: {
  orgId: string;
  params: OrganizationEmployeesParams;
}) => {
  const { jsonApiClient } = useApi();

  return useCreateQuery<AssignedEmployeesApiResponse>({
    queryKey: AssignedEmployeesKey[EAssignedEmployees.FETCH_ALL],
    apiClient: jsonApiClient,
    url: `/organization/${orgId}/assign-employee-to-supervisor`,
    errorMessage: "Failed to fetch assigned/unassigned employees.",
    queryOptions: {
      enabled: !!orgId,
    },
    queryParams: params,
  });
};
