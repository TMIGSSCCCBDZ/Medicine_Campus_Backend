import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
export const GET = async (req: Request) => {
  
  try {
    const instructors = await prisma.instructor.findMany({
      include: {
       
        courses: {
            include: {
              
                modules: {
                include: {
                    lessons: {
                    orderBy: { order: "asc" },
                    },
                },
                orderBy: { order: "asc" },
                },
            },
            },
      },
        orderBy: { name: "asc" },
    })

    if (!instructors) {
      return NextResponse.json({ error: "Instructors not found" }, { status: 404 })
    }

    return NextResponse.json(instructors, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch instructors" }, { status: 500 })
  }
}