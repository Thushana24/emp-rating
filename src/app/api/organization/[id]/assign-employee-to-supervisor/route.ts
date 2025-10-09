import privateRoute from "@/app/api/helpers/privateRoute";
import { AssignEmployeesSchema } from "@/schemas/user.schema";
import { OrganizationStatus, UserRole, UserStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import handleError from "@/app/api/helpers/handleError";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: organizationId } = await params;
  const body = await request.json();
  return privateRoute(
    request,
    {
      organizationId,
      permissions: ["USER:*:*", "USER:ASSIGN:ASSIGNED"],
    },
    async () => {
      try {
        const { supervisorId, employeeIds } = AssignEmployeesSchema.parse(body);
        //Check if organization is active
        const organization = await prisma.organization.findUnique({
          where: { id: organizationId, status: OrganizationStatus.ACTIVE },
          select: { id: true },
        });

        if (!organization) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: "ORG_NOT_FOUND",
                message: "Organization not found or inactive.",
              },
            },
            { status: 404 },
          );
        }
        //Check if supervisor exists and is in the organization
        const supervisor = await prisma.organizationMember.findFirst({
          where: {
            userId: supervisorId,
            organizationId,
            role: UserRole.SUPERVISOR,
            status: UserStatus.ACTIVE,
          },
        });
        if (!supervisor) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: "SUPERVISOR_NOT_FOUND",
                message: "Supervisor not found in the organization.",
              },
            },
            { status: 404 },
          );
        }

        //Find valid employee members
        const existingEmployees = await prisma.organizationMember.findMany({
          where: {
            userId: { in: employeeIds },
            organizationId,
            status: UserStatus.ACTIVE,
            role: UserRole.EMPLOYEE,
          },
          select: { userId: true },
        });
        const existingEmployeeIds = existingEmployees.map((emp) => emp.userId);
        const missingEmployeeIds = employeeIds.filter(
          (id) => !existingEmployeeIds.includes(id),
        );
        if (missingEmployeeIds.length > 0) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: "EMPLOYEES_NOT_FOUND",
                message: `The following employees are not in the organization: ${missingEmployeeIds.join(", ")}`,
              },
            },
            { status: 400 },
          );
        }

        // Assign employees to supervisor
        // ✅ Find the supervisor’s OrganizationMember record
const supervisorMember = await prisma.organizationMember.findFirst({
  where: {
    userId: supervisorId, // userId from body
    organizationId,
    role: UserRole.SUPERVISOR,
    status: UserStatus.ACTIVE,
  },
});

if (!supervisorMember) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "SUPERVISOR_MEMBER_NOT_FOUND",
        message: "Supervisor not found in the organization.",
      },
    },
    { status: 404 },
  );
}

// ✅ Assign employees to this supervisor’s OrganizationMember.id
await prisma.organizationMember.updateMany({
  where: {
    userId: { in: employeeIds },
    organizationId,
  },
  data: {
    supervisorId: supervisorMember.id, // FIX: use OrgMember.id, not User.id
  },
});

return NextResponse.json(
  {
    success: true,
    data: {
      assignedEmployees: employeeIds.length,
      supervisorId: supervisorMember.userId, // keep userId for clarity
      organizationMemberId: supervisorMember.id, // optional
      organizationId,
    },
  },
  { status: 200 },
);

      } catch (error) {
        return handleError(error, "Failed to assign employees to supervisor");
      }
    },
  );
}



export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: organizationId } = await params;

  return privateRoute(
    request,
    {
      organizationId,
      permissions: ["USER:*:*", "USER:VIEW:ASSIGNED"],
    },
    async () => {
      try {
        // ✅ Check if organization exists
        const organization = await prisma.organization.findUnique({
          where: { id: organizationId, status: OrganizationStatus.ACTIVE },
          select: { id: true },
        });

        if (!organization) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: "ORG_NOT_FOUND",
                message: "Organization not found or inactive.",
              },
            },
            { status: 404 },
          );
        }

        // ✅ Fetch supervisors with their employees
        const supervisors = await prisma.organizationMember.findMany({
          where: {
            organizationId,
            role: UserRole.SUPERVISOR,
            status: UserStatus.ACTIVE,
          },
          select: {
            userId: true,
            role: true,
            status: true,
            User: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            Employees: {
              where: { role: UserRole.EMPLOYEE },
              select: {
                userId: true,
                role: true,
                status: true,
                User: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
          },
        });

        // ✅ Fetch all employees
        const allEmployees = await prisma.organizationMember.findMany({
          where: {
            organizationId,
            role: UserRole.EMPLOYEE,
            status: UserStatus.ACTIVE,
          },
          select: {
            userId: true,
            role: true,
            status: true,
            User: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        });

        // ✅ Get IDs of assigned employees
        const assignedEmployeeIds = supervisors.flatMap((sup) =>
          sup.Employees.map((emp) => emp.userId),
        );

        // ✅ Filter unassigned employees
        const unassignedEmployees = allEmployees.filter(
          (emp) => !assignedEmployeeIds.includes(emp.userId),
        );

        // ✅ Transform data to consistent response format
        return NextResponse.json(
          {
            success: true,
            data: {
              supervisors: supervisors.map((sup) => ({
                supervisorId: sup.userId,
                supervisorName:
                  sup.User.firstName || sup.User.email || "Unnamed Supervisor",
                role: sup.role,
                status: sup.status,
                employees: sup.Employees.map((emp) => ({
                  employeeId: emp.userId,
                  employeeName:
                    emp.User.firstName || emp.User.email || "Unnamed Employee",
                  role: emp.role,
                  status: emp.status,
                })),
              })),
              unassignedEmployees: unassignedEmployees.map((emp) => ({
                employeeId: emp.userId,
                employeeName:
                  emp.User.firstName || emp.User.email || "Unnamed Employee",
                role: emp.role,
                status: emp.status,
              })),
            },
          },
          { status: 200 },
        );
      } catch (error) {
        return handleError(error, "Failed to fetch supervisors with employees");
      }
    },
  );
}

