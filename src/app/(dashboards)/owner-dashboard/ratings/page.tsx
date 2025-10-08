"use client"
import Link from 'next/link'
import React from 'react'
import { IoChevronForward } from 'react-icons/io5'
import Topbar from '../../Topbar'

const page = () => {
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
                  Ratings
                </Link>
              </div>
            )}
          />
    </section>
  )
}

export default page