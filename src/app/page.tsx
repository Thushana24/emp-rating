"use client";

import Spinner from "@/components/Spinner";
import { useAuth } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const Home = () => {
  const router = useRouter();
  const { user, selectedOrganization } = useAuth();

  useEffect(() => {
    if (user && selectedOrganization && user.OrganizationMembers.length > 0) {
      const role = selectedOrganization.role;

      if (role === "OWNER") {
        router.push("/owner-dashboard");
      }

      if (role === "SUPERVISOR") {
        router.push("/supervisor-dashboard");
      }

      if (role === "EMPLOYEE") {
        router.push("/employee-dashboard");
      }
    }
  }, [user, router, selectedOrganization]);

  return (
    <section className="flex h-dvh w-full flex-col items-center justify-center dark:bg-gray-950">
      <Spinner size={"xs"} />
    </section>
  );
};

export default Home;
