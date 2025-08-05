import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
export const POST = async (req: Request) => {
  const body = await req.json()
    const { name, description } = body

  if (!name || !description) {
    return new NextResponse("Missing required fields", { status: 400 })
  }

  try {
    const tag = await prisma.tag.create({
      data: {
          name: name,
          description: description,
        },
    })
    return NextResponse.json(tag, { status: 200 })
  } catch (error) {
    console.error("Error creating tag:", error)
    return new NextResponse("Failed to create tag", { status: 500 })
  }
}