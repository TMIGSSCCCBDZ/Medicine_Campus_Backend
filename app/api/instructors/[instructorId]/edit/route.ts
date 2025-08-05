import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
export const PATCH = async (req: Request, { params }: { params: { instructorId: string } }) => {
  const body = await req.json()
  const { name, email, bio } = body
console.log("Updating instructor with ID:", params.instructorId, "Data:", body)
  if (!name || !email) {
    return new NextResponse("Missing required fields", { status: 400 })
  }
  if (!params.instructorId ) {
    return new NextResponse("Instructor ID mismatch", { status: 400 })
  }
  try {
    const instructor = await prisma.instructor.update({
      where: { id: params.instructorId },
      data: {
        name,
        email,
        bio,
      },
    })
    return NextResponse.json(instructor, { status: 200 })
  } catch (error) {
    console.error("Error updating instructor:", error)
    return new NextResponse("Failed to update instructor", { status: 500 })
  }
}