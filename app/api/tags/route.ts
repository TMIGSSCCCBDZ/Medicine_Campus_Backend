
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
export const GET = async (req: Request) => {
  
  try {
    const tags = await prisma.tag.findMany({
      include: {
       
      courseTags:{
            include: {
                course: {
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
                },
                },
            },
      },
      },
        orderBy: { name: "asc" },
    })

    if (!tags) {
      return NextResponse.json({ error: "Instructors not found" }, { status: 404 })
    }

    return NextResponse.json(tags, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch tags" }, { status: 500 })
  }
}