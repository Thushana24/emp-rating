import { Prisma } from "@prisma/client";
import { InviteUserSchema } from "@/schemas/user.schema";
import z from "zod";

export type InviteInput = z.infer<typeof InviteUserSchema>;


export type InviteUserData = {
  userId: string;
  email: string;
  role: Prisma.OrganizationMemberGetPayload<{
    select: { role: true };
  }>["role"];
  status: Prisma.OrganizationMemberGetPayload<{
    select: { status: true };
  }>["status"];
  organization: Prisma.OrganizationGetPayload<{
    select: { id: true; name: true };
  }>;
  inviteSent: boolean;
};

export type InviteUserResponse = {
  success: true;
  data: InviteUserData;
};
