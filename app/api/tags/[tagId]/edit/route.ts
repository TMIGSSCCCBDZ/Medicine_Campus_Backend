import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
export const PATCH = async (req: Request, { params }: { params: { tagId: string } }) => {
  const body = await req.json()
    const { name, description } = body

  if (!name || !description) {
    return new NextResponse("Missing required fields", { status: 400 })
  }
    if (!params.tagId) {
        return new NextResponse("Tag ID mismatch", { status: 400 })
    }

  try {
    const tag = await prisma.tag.update({
      where: { id: params.tagId },
      data: {
        name: name,
        description: description,
      },
    })
    return NextResponse.json(tag, { status: 200 })
  } catch (error) {
    console.error("Error updating tag:", error)
    return new NextResponse("Failed to update tag", { status: 500 })
  }
}

