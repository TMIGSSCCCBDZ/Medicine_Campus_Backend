import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
export const PATCH = async (request: Request, { params }: { params: { courseId: string } }) => {
  const body = await request.json()
  const { data } = body
    const { title, description } = data
    if (!title || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    if (!params.courseId) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 })
    }

  try {
    // Assuming you have a function to create a course
    const newCourse = await prisma.course.update({
      where: { id: params.courseId },
      data: {
        title: data.title,
        description: data.description,
        price: data.price,
        instructorId: data.instructorId,
     
      },
    })

    // Update course modules
    await prisma.module.deleteMany({
      where: { courseId: params.courseId },
    })
   
    await prisma.module.createMany({
      data: data.modules.map((module: any) => ({
        title: module.title,
        order: module.order,
        courseId: params.courseId,
      })),
    })

    // Fetch created modules to get their IDs
    const createdModules = await prisma.module.findMany({
      where: { courseId: params.courseId },
      orderBy: { order: "asc" },
    })

    // Create lessons for each module
    for (let i = 0; i < data.modules.length; i++) {
      const module = data.modules[i]
      const createdModule = createdModules[i]
      await prisma.lesson.createMany({
        data: module.lessons.map((lesson: any) => ({
          title: lesson.title,
          content: lesson.content,
          videoUrl: lesson.videoUrl,
          order: lesson.order,
          moduleId: createdModule.id,
        })),
      })
    }
    //   const createdModules = await prisma.module.findMany({
    //       where: { courseId: params.courseId },
    //       orderBy: { order: "asc" },
    //     })
    // for (let i=0; i< data.modules.length ; i++) {
    //   const module = data.modules[i]
    //     const createdModule = createdModules[i]
    //  await prisma.lesson.createMany({
    //     data: module.lessons.map((lesson: any) => ({
    //       title: lesson.title,
    //       content: lesson.content,
    //       videoUrl: lesson.videoUrl,
    //       order: lesson.order,
    //       moduleId: createdModule.id,
    //     })),
    //  })
    // }

    // Update course tags
    await prisma.courseTag.deleteMany({
      where: { courseId: params.courseId },
    })
    await prisma.courseTag.createMany({
  data: data.tagIds.map((tagId: string) => ({
    courseId: params.courseId,
    tagId,
  })),
})

    console.log("Updated course:", newCourse)

return NextResponse.json({ course: newCourse }, {
      status: 200
    })
  } catch (error) {
    return NextResponse.json({ error: error || String(error) }, { status: 500 })
  }
}
