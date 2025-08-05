export const dynamic = "force-dynamic";

import React from 'react'
import {TagsPage} from './_components/tag-form'
import { prisma } from '@/lib/prisma'

export default async function Page() {
  const tags : any = await prisma.tag.findMany({
        include: {
          
          _count: {
            select: { courseTags: true },
          },
        },
        orderBy: { name: "asc" },
      })
  
  return (
    <div>
      <TagsPage tags={tags} />
    </div>
  )
}
