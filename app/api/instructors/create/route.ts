import {prisma} from "@/lib/prisma"
import { NextResponse } from "next/server"
export const POST = async (req: Request) => {
  const body = await req.json()
  const { name, email, bio } = body

  if (!name || !email) {
    return new NextResponse("Missing required fields", { status: 400 })
  }

  try {
    const instructor = await prisma.instructor.create({
      data: {
        name,
        email,
        bio,
      },
    })
    return NextResponse.json(instructor,{status: 200})
  } catch (error) {
    console.error("Error creating instructor:", error)
    return new NextResponse("Failed to create instructor", { status: 500 })
  }
}
