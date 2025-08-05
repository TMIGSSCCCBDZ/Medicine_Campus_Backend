
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
export const DELETE = async (req: Request, { params }: { params: { tagId: string } }) => {
  if (!params.tagId) {
    return new NextResponse("Tag ID mismatch", { status: 400 })
  }

  try {
    await prisma.tag.delete({
      where: { id: params.tagId },
    })
    return NextResponse.json({ message: "Tag deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting tag:", error)
    return new NextResponse("Failed to delete tag", { status: 500 })
  }
}
