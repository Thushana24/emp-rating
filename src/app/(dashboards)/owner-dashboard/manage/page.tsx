"use client";
import Link from "next/link";
import React, { useState } from "react";
import { IoAddSharp, IoChevronForward, IoClose, IoPeople, IoPersonAddSharp, IoSearch } from "react-icons/io5";
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

const Page = () => {
  const { selectedOrganization } = useAuth();
  const [isAssignSupervisorDrawerOpen, setIsAssignSupervisorDrawerOpen] =
    useState(false);
  const {
    searchParams,
    appendToSearchQuery,
    deleteFromSearchQuery,
    batchUpdateSearchQuery,
  } = useSearchQuery();
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
              Owner Dashboad
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
          <div className="flex items-center justify-between gap-3">
            <Form
              validationSchema={z.object({ role: z.string() })}
              className="w-full"
            >
              {() => (
                <div className="flex w-full items-center justify-between gap-3">
                  <Field>
                    <InputGroup>
                      <IoSearch data-slot="icon" className="pb-1" />
                      <Input
                        placeholder="Search..."
                        className="w-full"
                        inputClass="border-0 text-primary bg-primary/10 py-2"
                      />
                    </InputGroup>
                  </Field>
                </div>
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
                      <Sheet.Title>Assign Employees To Supervisor</Sheet.Title>
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

            {/* CTA */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Page;
