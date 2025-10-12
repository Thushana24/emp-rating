"use client";
import Link from "next/link";
import React, { useMemo, useRef, useState } from "react";
import {
  IoAddSharp,
  IoChevronDown,
  IoChevronForward,
  IoChevronUp,
  IoClose,
  IoPeople,
  IoPersonAddSharp,
  IoSearch,
} from "react-icons/io5";
import Topbar from "../../Topbar";
import { useAuth } from "@/stores/authStore";
import useSearchQuery from "@/hooks/useSearchQuery";
import { Sheet } from "@/components/drawer";
import Button from "@/components/Button";
import InviteUserForm from "../employees/InviteUserForm";
import Form from "@/components/Forms/Form";
import InputGroup from "@/components/Forms/InputGroup";
import Field from "@/components/Forms/Field";
import Input from "@/components/Forms/Input";
import Select from "@/components/Forms/Select";
import z from "zod";
import AssignEmployeesForm from "./AssignEmployeesForm";
import { OrganizationEmployeesParams } from "@/app/api-client/organization/employees/types";
import safeParseInt from "@/utilities/safeParseInt";
import pageConfigs from "../employees/pageConfigs";
import useThrottledSearch from "@/hooks/useThrottledSearch";
import { RestrictedUserRole } from "@/app/api-client/user/types";
import { useGetEmployees } from "@/app/api-client/organization/Assign/useGetEmployees";
import { AnimatePresence, motion } from "motion/react";
import Spinner from "@/components/Spinner";
import Card from "@/components/Card";
import { ResponsivePagination } from "@/components/Pagination";

const Page = () => {
  const { selectedOrganization } = useAuth();
  const [isAssignSupervisorDrawerOpen, setIsAssignSupervisorDrawerOpen] =
    useState(false);

  // ADD THESE TWO LINES - Missing state
  const [expandedSupervisor, setExpandedSupervisor] = useState<string | null>(
    null,
  );

  const {
    searchParams,
    appendToSearchQuery,
    deleteFromSearchQuery,
    batchUpdateSearchQuery,
  } = useSearchQuery();

  const role = useMemo(() => {
    const roleParam = searchParams.get("role") ?? "";
    return pageConfigs.FILTERS.roles.includes(
      roleParam as (typeof RestrictedUserRole)[number],
    )
      ? roleParam
      : "all";
  }, [searchParams]);

  const size = useMemo(() => {
    const perPageParam = searchParams.get("size");
    return safeParseInt({
      input: perPageParam,
      defaultValue: pageConfigs.DEFAULT_PER_PAGE,
      validValues: pageConfigs.PER_PAGES,
    });
  }, [searchParams]);

  const page = useMemo(() => {
    const pageParam = searchParams.get("page");
    const safeParsedPage = safeParseInt({
      input: pageParam,
      defaultValue: pageConfigs.DEFAULT_PAGE,
    });
    return Math.max(
      pageConfigs.DEFAULT_PAGE,
      Math.min(safeParsedPage, pageConfigs.MAX_ALLOWED_PAGE),
    );
  }, [searchParams]);

  const { queryToSearch, setQueryToSearch } = useThrottledSearch({
    searchQuery: searchParams.get("search") ?? "",
    batchUpdateSearchQuery,
    delay: 300,
  });

  const AssignedEmployeesOptions = useMemo<OrganizationEmployeesParams>(
    () => ({
      page: page,
      size: size,
      search: searchParams.get("search") ?? undefined,
      role: role,
    }),
    [page, size, searchParams, role],
  );

  const {
    data: assignedEmployeesResponse,
    isPending: isAssignedEmployeesLoading,
    isError: isOrganizationError,
  } = useGetEmployees({
    orgId: selectedOrganization?.organizationId || "",
    params: AssignedEmployeesOptions,
  });

  // Extract only assigned employees
  const assignedEmployees =
    assignedEmployeesResponse?.data?.assigned?.items ?? [];

  const previousNumberOfPages = useRef<number | null>(null);

  const numberOfPages = useMemo(() => {
    const totalAssigned = assignedEmployeesResponse?.data?.assigned?.total ?? 0;
    const pages = Math.ceil(totalAssigned / size);
    previousNumberOfPages.current = pages;
    return pages;
  }, [assignedEmployeesResponse, size]);

  // ADD THIS FUNCTION - Missing toggle function
  const toggleSupervisor = (supervisorId: string) => {
    setExpandedSupervisor(
      expandedSupervisor === supervisorId ? null : supervisorId,
    );
  };

  return (
    <section className="@container flex h-full flex-1 flex-col overflow-hidden">
      <Topbar
        Heading={() => (
          <div className="flex items-center justify-start gap-2">
            <Link
              href={"/owner-dashboard"}
              aria-disabled
              className="text-primary text-xl font-medium hover:underline md:text-2xl"
            >
              Owner Dashboard
            </Link>

            <IoChevronForward className="text-primary/60 size-6" />

            <Link
              href={"/owner-dashboard/manage"}
              aria-disabled
              className="text-xl font-semibold text-gray-800 md:text-2xl"
            >
              Manage
            </Link>
          </div>
        )}
      />
      <div className="scrollbar h-full w-full flex-1 overflow-hidden overflow-y-auto bg-gray-100 p-5">
        <div className="flex min-h-full flex-1 flex-col rounded-2xl bg-white p-5">
          <div className="flex flex-col gap-5">
            {/* Search and Actions Row */}
            <div className="flex items-center justify-between gap-3">
              <Form
                validationSchema={z.object({ role: z.string() })}
                className="flex-1"
              >
                {() => (
                  <Field>
                    <InputGroup>
                      <IoSearch data-slot="icon" className="pb-1" />
                      <Input
                        placeholder="Search..."
                        className="w-full"
                        inputClass="border-0 text-primary bg-primary/10 py-2"
                        value={queryToSearch}
                        onChange={(e) => setQueryToSearch(e.target.value)}
                      />
                    </InputGroup>
                  </Field>
                )}
              </Form>

              {/* CTA */}
              <Sheet
                open={isAssignSupervisorDrawerOpen}
                onOpenChange={setIsAssignSupervisorDrawerOpen}
                shouldScaleBackground
                setBackgroundColorOnScale
              >
                <Sheet.Button asChild className="w-max">
                  <Button
                    className={
                      "flex w-max flex-shrink-0 items-center justify-center gap-2 py-2 whitespace-nowrap md:py-2 @lg:w-max @lg:justify-start"
                    }
                  >
                    <IoPersonAddSharp className="size-5" />
                    Assign Employees
                  </Button>
                </Sheet.Button>

                <Sheet.Content>
                  <div className="flex flex-1 flex-col rounded-xl bg-white p-4 md:mt-0 md:rounded-md md:rounded-r-none">
                    <Sheet.Header className="flex items-start justify-between gap-10">
                      <div className="w-full">
                        <Sheet.Title>
                          Assign Employees To Supervisor
                        </Sheet.Title>
                        <Sheet.Description className="mt-1">
                          Add selected employees to a supervisor&apos;s team.
                          <br />
                          Simple, quick, and efficient!
                        </Sheet.Description>
                      </div>

                      <Sheet.Close asChild>
                        <Button
                          variant={"secondary"}
                          className={"rounded-md p-1 md:p-1"}
                        >
                          <IoClose className="size-4" />
                        </Button>
                      </Sheet.Close>
                    </Sheet.Header>

                    {/* body */}
                    <div className="mt-10 flex flex-1 flex-col space-y-5">
                      <AssignEmployeesForm />

                      <Sheet.Close asChild>
                        <Button
                          type="button"
                          variant="secondary"
                          className="mt-3 w-full"
                        >
                          Cancel
                        </Button>
                      </Sheet.Close>
                    </div>
                    {/* body */}
                  </div>
                </Sheet.Content>
              </Sheet>
            </div>

            {/* Loading State */}
            <AnimatePresence mode="popLayout">
              {isAssignedEmployeesLoading && (
                <motion.div
                  key="users-loading"
                  initial={{ filter: "blur(10px)", opacity: 0 }}
                  animate={{ filter: "blur(0px)", opacity: 1 }}
                  exit={{ filter: "blur(10px)", opacity: 0 }}
                  className="flex w-full flex-1 flex-col items-center justify-center py-20"
                >
                  <Spinner className="size-8" />
                  <p className="mt-3 text-sm text-gray-500">
                    Loading supervisors...
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Supervisor Cards */}
            {!isAssignedEmployeesLoading &&
              assignedEmployees &&
              assignedEmployees?.length > 0 && (
                <motion.div
                  key="supervisors-list"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {assignedEmployees.map((supervisor) => (
                    <div key={supervisor.supervisorId}>
                      {/* Supervisor Card */}
                      <Card.Item
                        variant="supervisor"
                        className="cursor-pointer"
                        onClick={() =>
                          toggleSupervisor(supervisor.supervisorId)
                        }
                      >
                        <Card.Header>
                          <div className="flex flex-1 items-center gap-4">
                            <Card.Avatar
                              fallback={`${supervisor.firstName?.[0] || ""}${supervisor.lastName?.[0] || ""}`}
                            />
                            <div className="flex-1">
                              <Card.Title>
                                {supervisor.firstName} {supervisor.lastName}
                              </Card.Title>
                              <Card.Subtitle>{supervisor.role}</Card.Subtitle>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <Card.Badge
                              variant="info"
                              className="flex items-center gap-1"
                            >
                              <IoPeople className="h-3 w-3" />
                              {supervisor.employees?.length || 0}
                            </Card.Badge>
                            {expandedSupervisor === supervisor.supervisorId ? (
                              <IoChevronUp className="h-5 w-5 text-gray-600" />
                            ) : (
                              <IoChevronDown className="h-5 w-5 text-gray-600" />
                            )}
                          </div>
                        </Card.Header>
                      </Card.Item>

                      {/* Employee Cards */}
                      <AnimatePresence>
                        {expandedSupervisor === supervisor.supervisorId &&
                          supervisor.employees &&
                          supervisor.employees.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <Card
                                wrapperClass="ml-6 mt-3 border-l-2 border-indigo-200 pl-4"
                                className="w-full"
                              >
                                {supervisor.employees.map((employee) => (
                                  <Card.Item
                                    key={employee.employeeId}
                                    variant="employee"
                                  >
                                    <Card.Header>
                                      <div className="flex items-center gap-3">
                                        <Card.Avatar
                                          fallback={`${employee.firstName?.[0] || ""}${employee.lastName?.[0] || ""}`}
                                          className="h-10 w-10"
                                        />
                                        <div>
                                          <Card.Title className="text-base">
                                            {employee.firstName}{" "}
                                            {employee.lastName}
                                          </Card.Title>
                                          <Card.Subtitle className="text-xs">
                                            {employee.role}
                                          </Card.Subtitle>
                                        </div>
                                      </div>
                                    </Card.Header>

                                    <Card.Body>
                                      <Card.Row>
                                        <Card.Label>Status</Card.Label>
                                        <Card.Badge
                                          variant={
                                            employee.status === "ACTIVE"
                                              ? "success"
                                              : "default"
                                          }
                                        >
                                          {employee.status}
                                        </Card.Badge>
                                      </Card.Row>
                                    </Card.Body>

                                    <Card.Footer>
                                      <Card.Actions className="justify-end">
                                        <button className="text-xs font-medium text-indigo-600 hover:text-indigo-800">
                                          Details
                                        </button>
                                        <button className="text-xs font-medium text-gray-600 hover:text-gray-800">
                                          Reassign
                                        </button>
                                      </Card.Actions>
                                    </Card.Footer>
                                  </Card.Item>
                                ))}
                              </Card>
                            </motion.div>
                          )}
                      </AnimatePresence>

                      {/* Empty State for No Employees */}
                      {expandedSupervisor === supervisor.supervisorId &&
                        (!supervisor.employees ||
                          supervisor.employees.length === 0) && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="ml-6 border-l-2 border-indigo-200 py-4 pl-6"
                          >
                            <p className="text-sm text-gray-500 italic">
                              No employees assigned to this supervisor yet.
                            </p>
                          </motion.div>
                        )}
                    </div>
                  ))}
                </motion.div>
              )}

            {/* Empty State - No Supervisors */}
            {!isAssignedEmployeesLoading &&
              (!assignedEmployees || assignedEmployees.length === 0) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-20"
                >
                  <IoPeople className="mb-4 size-16 text-gray-300" />
                  <h3 className="mb-2 text-lg font-semibold text-gray-800">
                    No Supervisors Found
                  </h3>
                  <p className="max-w-md text-center text-sm text-gray-500">
                    There are no supervisors with assigned employees yet. Start
                    by assigning employees to supervisors.
                  </p>
                </motion.div>
              )}

            {/* pagination */}
            <AnimatePresence mode="popLayout">
              <motion.div
                key="pagination"
                initial={{ filter: "blur(10px)", opacity: 0 }}
                animate={{ filter: "blur(0px)", opacity: 1 }}
                exit={{ filter: "blur(10px)", opacity: 0 }}
                className="mt-5 flex w-full items-center justify-between gap-2"
              >
                <div className="flex flex-col items-start justify-start">
                  <Form validationSchema={z.object({ perPage: z.string() })}>
                    {() => (
                      <Field>
                        <Select
                          name="perPage"
                          placeholder="Pages per page"
                          value={size.toString()}
                          onValueChange={(value) => {
                            batchUpdateSearchQuery({ size: value }, ["page"]);
                          }}
                          chevronClass="text-primary"
                          selectClass="py-1 rounded-md border-none p-0"
                          className="w-max min-w-32 p-0 md:p-0"
                        >
                          {pageConfigs.PER_PAGES.map((perPage) => (
                            <Select.Option
                              key={perPage}
                              value={perPage.toString()}
                            >
                              {perPage} per page
                            </Select.Option>
                          ))}
                        </Select>
                      </Field>
                    )}
                  </Form>

                  <p className="mt-1 text-xs whitespace-nowrap text-gray-600">
                    Showing:{" "}
                    {Math.min(
                      size,
                      assignedEmployeesResponse?.data?.assigned?.total ?? 0,
                    )}{" "}
                    of {assignedEmployeesResponse?.data?.assigned?.total ?? 0}
                  </p>
                </div>

                <ResponsivePagination
                  numberOfPages={numberOfPages}
                  currentPage={page}
                  setCurrentPage={(page) => {
                    if (page > 1) {
                      appendToSearchQuery({ page: page.toString() });
                    } else {
                      deleteFromSearchQuery("page");
                    }
                  }}
                  truncationThreshold={5}
                  maxVisiblePages={10}
                />
              </motion.div>
            </AnimatePresence>
            {/* pagination */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Page;
