import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
export const POST = async (request: Request) => {
  const body = await request.json()
  const { data } = body
    const { title, description } = data
    if (!title || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

  try {
    // Assuming you have a function to create a course
    const newCourse = await prisma.course.create({
        
      data: {
        
        title: data.title,
          description: data.description,
          price: data.price,
          instructorId: data.instructorId,
          modules: {
            create: data.modules.map((module:any) => ({
              title: module.title,
              order: module.order,
              lessons: {
                create: module.lessons.map((lesson:any) => ({
                  title: lesson.title,
                  content: lesson.content,
                  videoUrl: lesson.videoUrl,
                  order: lesson.order,
                })),
              },
            })),
          },
          courseTags: {
            create: data.tagIds.map((tagId:any) => ({
              tagId,
            })),
          },
        },
     
          

        })

console.log("Created course:", )
return NextResponse.json({ course: newCourse }, {
      status: 200
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create course" }, {
      status: 500
    })
  }
}
   