import React from 'react'
import InstructorsPage from './_components/instructor-page'
import { instructorAPI } from '@/lib/api-prisma'

const page = async () => {
  const instructors = await instructorAPI.getInstructors()
console.log("Fetched instructors:", instructors)
  return (
    <div>
      <InstructorsPage instructors={instructors} />
    </div>
  )
}

export default page