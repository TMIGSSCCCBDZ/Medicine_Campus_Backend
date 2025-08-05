import React from 'react'
import InstructorsPage from './_components/instructor-page'
import { prisma } from '@/lib/prisma'

export default async function Page() {
  const instructors: any = await prisma.instructor.findMany({
    include: {
      _count: {
        select: { courses: true },
      },
    },
    orderBy: { name: "asc" },
  })

  return (
    <div>
      <InstructorsPage instructors={instructors} />
    </div>
  )
}