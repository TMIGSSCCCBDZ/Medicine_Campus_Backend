import React from 'react'
import CoursesPage from './_components/course-form'
import {prisma} from '@/lib/prisma'
const page = async() => {
  const courses = await prisma.course.findMany({
        include: {
          instructor: true,
          modules: {
            include: {
              lessons: {
                orderBy: { order: "asc" },
              },
            },
            orderBy: { order: "asc" },
          },
          courseTags: {
            include: {
              tag: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      })
            const instructors = await prisma.instructor.findMany({
        include: {
          _count: {
            select: { courses: true },
          },
        },
        orderBy: { name: "asc" },
      })

          const tags = await prisma.tag.findMany({
        include: {
          _count: {
            select: { courseTags: true },
          },
        },
        orderBy: { name: "asc" },
      })
  return (
    <div>
      <CoursesPage courses={courses} instructors={instructors} tags={tags} />
    </div>
  )
}

export default page