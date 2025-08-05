import {prisma} from "@/lib/prisma";
import { NextResponse } from "next/server";
export const GET = async (req: Request) => {


  try {
    const courses = await prisma.course.findMany({
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

    if (!courses || courses.length === 0) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    return NextResponse.json(courses, { status: 200 })
  } catch (error) {
    return new NextResponse("Failed to fetch course", { status: 500 })
  }
}