

import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
export const DELETE = async (request: Request, { params }: { params: { courseId: string } }) => {

    if (!params.courseId) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 })
    }

  try {
    
    // Assuming you have a function to create a course
   await prisma.course.delete({
      where: { id: params.courseId },

        })
    // Delete associated modules and lessons

    return NextResponse.json({ message: "Course deleted successfully" }, {
      status: 200
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete course" }, {
      status: 500
    })
  }
}
   