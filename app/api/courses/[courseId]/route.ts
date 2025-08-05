
import {prisma} from "@/lib/prisma";
import { NextResponse } from "next/server";
export const GET = async (req: Request, { params }: { params: { courseId: string } }) => {

  const { courseId } = params
    if (!courseId) {
        return NextResponse.json({ error: "Course ID is required" }, { status: 400 })
    }
  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        instructor: true,
        modules: {
          include: {
            lessons: {
              orderBy: { order: "asc" },
            },
          },
        },
        courseTags: {
          include: {
            tag: true,
          },
        },
      },
    })

    if (!course ) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    return NextResponse.json(course, { status: 200 })
  } catch (error) {
    return new NextResponse("Failed to fetch course", { status: 500 })
  }
}