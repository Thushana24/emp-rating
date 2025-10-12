import { UserRole } from '@prisma/client';
import { AssignEmployeesSchema } from "@/schemas/user.schema";
import z from "zod";

export type assignEmployeesInput = z.infer<typeof AssignEmployeesSchema>;

export interface AssignEmployeesResponse {
  success: true;
  data: {
    assignedEmployees: number; // Number of employees successfully assigned
    supervisorId: string; // Supervisor's userId
    organizationMemberId: string; // Supervisor's OrganizationMember.id
    organizationId: string; // Organization id
  };
}


export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}



// ✅ Single supervisor with employees
export type SupervisorAssignedEmployees = {
  supervisorId: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: string;
  employees: {
    employeeId: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    status: string;
  }[];
};


// API response structure
export type AssignedEmployeesResponse = {
  assigned: Paginated<SupervisorAssignedEmployees>;
  unassigned: Paginated<{
    employeeId: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    status: string;
  }>;
};

// Full API response
export type AssignedEmployeesApiResponse = {
  success: boolean;
  data: AssignedEmployeesResponse;
};


