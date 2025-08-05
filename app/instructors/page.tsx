"use server"
import React from 'react'
import InstructorsPage from './_components/instructor-page'
import { prisma } from '@/lib/prisma'
const page = async () => {
 
   const instructors : any = await prisma.instructor.findMany({
        include: {
          _count: {
            select: { courses: true },
          },
        },
        orderBy: { name: "asc" },
      })
      
console.log("Fetched instructors:", instructors)
  return (
    <div>
      <InstructorsPage instructors={instructors} />
    </div>
  )
}

export default page