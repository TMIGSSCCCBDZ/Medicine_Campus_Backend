import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
export const DELETE = async (req: Request, { params }: { params: { instructorId: string } }) => {
  if (!params.instructorId) {
    return new NextResponse("Instructor ID is required", { status: 400 })
  }

  try {
    const instructor = await prisma.instructor.delete({
      where: { id: params.instructorId },
    })
    return NextResponse.json(instructor, { status: 200 })
  } catch (error) {
    console.error("Error deleting instructor:", error)
    return new NextResponse("Failed to delete instructor", { status: 500 })
  }
}