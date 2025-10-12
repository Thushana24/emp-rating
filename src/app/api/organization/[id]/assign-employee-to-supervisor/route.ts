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
        const searchParams = request.nextUrl.searchParams;
        const search = (searchParams.get("search") || "").trim();

        // Assigned supervisors pagination
        const assignedPage = Math.max(
          parseInt(searchParams.get("assignedPage") || "1", 10),
          1,
        );
        const assignedSize = Math.min(
          parseInt(searchParams.get("assignedSize") || "10", 10),
          100,
        );
        const assignedSkip = (assignedPage - 1) * assignedSize;

        // Unassigned employees pagination
        const unassignedPage = Math.max(
          parseInt(searchParams.get("unassignedPage") || "1", 10),
          1,
        );
        const unassignedSize = Math.min(
          parseInt(searchParams.get("unassignedSize") || "10", 10),
          100,
        );
        const unassignedSkip = (unassignedPage - 1) * unassignedSize;

        // ✅ Validate organization
        const org = await prisma.organization.findUnique({
          where: { id: organizationId, status: OrganizationStatus.ACTIVE },
          select: { id: true },
        });
        if (!org) throw new Error("ORG_NOT_FOUND");

        // ✅ Fetch assigned supervisors with employees
        const totalSupervisors = await prisma.organizationMember.count({
          where: {
            organizationId,
            role: UserRole.SUPERVISOR,
            status: UserStatus.ACTIVE,
          },
        });

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
            User: { select: { firstName: true, lastName: true, email: true } },
            Employees: {
              where: { role: UserRole.EMPLOYEE, status: UserStatus.ACTIVE },
              select: {
                userId: true,
                role: true,
                status: true,
                User: {
                  select: { firstName: true, lastName: true, email: true },
                },
              },
            },
          },
          skip: assignedSkip,
          take: assignedSize,
          orderBy: { createdAt: "desc" },
        });

        // ✅ Collect assigned employee IDs and supervisor IDs to exclude
        const assignedEmployeeIds = supervisors.flatMap((sup) =>
          sup.Employees.map((emp) => emp.userId),
        );
        const supervisorIds = supervisors.map((sup) => sup.userId);

        // ✅ Fetch unassigned employees
        const whereUnassigned: any = {
          organizationId,
          role: UserRole.EMPLOYEE,
          status: UserStatus.ACTIVE,
          userId: { notIn: [...assignedEmployeeIds, ...supervisorIds] }, // exclude supervisors too
        };

        if (search) {
          whereUnassigned.OR = [
            { User: { firstName: { contains: search, mode: "insensitive" } } },
            { User: { lastName: { contains: search, mode: "insensitive" } } },
            { User: { email: { contains: search, mode: "insensitive" } } },
          ];
        }

        const totalUnassigned = await prisma.organizationMember.count({
          where: whereUnassigned,
        });
        const unassignedEmployees = await prisma.organizationMember.findMany({
          where: whereUnassigned,
          select: {
            userId: true,
            role: true,
            status: true,
            User: { select: { firstName: true, lastName: true, email: true } },
          },
          skip: unassignedSkip,
          take: unassignedSize,
          orderBy: { createdAt: "desc" },
        });

        // ✅ Transform and return response
        // ✅ Transform and return response
return NextResponse.json(
  {
    success: true,
    data: {
      assigned: {
        items: supervisors.map((sup) => ({
          supervisorId: sup.userId,
          firstName: sup.User.firstName,
          lastName: sup.User.lastName,
          role: sup.role,
          status: sup.status,
          employees: sup.Employees.map((emp) => ({
            employeeId: emp.userId,
           firstName: emp.User.firstName,
            lastName: emp.User.lastName,
            role: emp.role,
            status: emp.status,
          })),
        })),
        total: totalSupervisors,
        page: assignedPage,
        size: assignedSize,
        pages: Math.max(1, Math.ceil(totalSupervisors / assignedSize)),
      },
      unassigned: {
        items: unassignedEmployees.map((emp) => ({
          employeeId: emp.userId,
          employeeFirstName: emp.User.firstName,
          employeeLastName: emp.User.lastName,
          role: emp.role,
          status: emp.status,
        })),
        total: totalUnassigned,
        page: unassignedPage,
        size: unassignedSize,
        pages: Math.max(1, Math.ceil(totalUnassigned / unassignedSize)),
      },
    },
  },
  { status: 200 },
);

      } catch (error: any) {
        return handleError(
          error,
          "Failed to fetch assigned/unassigned employees",
        );
      }
    },
  );
}






