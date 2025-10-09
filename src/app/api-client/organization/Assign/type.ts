import { UserRole } from '@prisma/client';
import { AssignEmployeesSchema } from "@/schemas/user.schema";
import z from "zod";

export type assignEmployeesInput = z.infer<typeof AssignEmployeesSchema>;

export type AssignEmployeesData = {
  assignedEmployees: number;
  supervisorId: string;
  organizationId: string;
};

export type AssignEmployeesResponse = {
  success: true;
  data: AssignEmployeesData;
};

type AssignedEmployeesResponse = {
  supervisors: {
    supervisorId: string;
    supervisorName: string;
    role: UserRole;
    status: string;
    employees: {
      employeeId: string;
      employeeName: string;
      role: UserRole;
      status: string;
    }[];
  }[];
  unassignedEmployees: {
    employeeId: string;
    employeeName: string;
    role: UserRole;
    status: string;
  }[];
};

export type AssignedEmployeesApiResponse = {
  success: boolean;
  data: AssignedEmployeesResponse;
};
