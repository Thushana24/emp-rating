import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import privateRoute from "../../auth/helpers/privateRoute";
import handleError from "../../auth/helpers/handleError";

export async function GET(request: NextRequest) {
  return privateRoute(request, { permissions: [] }, async (currentUser) => {
    try {
      const organizationMemberships = await prisma.organizationMember.findMany({
        where: {
          userId: currentUser.id,
        },
        include: {
          Organization: {
            select: {
              id: true,
              name: true,
              status: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          Supervisor: {
            include: {
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
          Employees: {
            include: {
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
        orderBy: {
          createdAt: "desc",
        },
      });

      return NextResponse.json(
        {
          success: true,
          data: organizationMemberships,
        },
        { status: 200 },
      );
    } catch (error) {
      return handleError(error, "Failed to fetch organization memberships");
    }
  });
}
