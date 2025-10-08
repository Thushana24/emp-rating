import { UserWithOrgMembers } from "@/app/api/auth/types";
import { useApi } from "@/providers/ApiProvider";
import { useCreateMutation } from "../apiFactory";
import { InviteInput, InviteUserResponse } from "./type";

interface UseInviteUserOptions {
  organizationId: string;
  invalidateQueryKey?: unknown[];
}

export const useInviteUser = ({
  organizationId,
  invalidateQueryKey,
}: UseInviteUserOptions) => {
  const { jsonApiClient } = useApi();

  return useCreateMutation<
    Record<string, any>,
    InviteInput,
    { data: {user :InviteUserResponse} },
    { data: { user:InviteUserResponse }}
  >({
    apiClient: jsonApiClient,
    method: "post",
    url: `/organization/${organizationId}/invite`,
    errorMessage: "Failed to send invitation.",
    invalidateQueryKey,
    mutationOptions: {},
  });
};