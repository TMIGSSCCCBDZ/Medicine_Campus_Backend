"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, PlayCircle } from "lucide-react"
import type { Course } from "@/types"

interface CourseTableProps {
  courses: Course[]
  onEdit: (course: Course) => void
  onDelete: (course: Course) => void
}

export function CourseTable({ courses, onEdit, onDelete }: CourseTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Course Title</TableHead>
            <TableHead>Instructor</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Modules</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses.map((course) => (
            <TableRow key={course.id}>
              <TableCell className="font-medium">
                <div>
                  <div className="font-semibold">{course.title}</div>
                  {course.description && (
                    <div className="text-sm text-muted-foreground truncate max-w-xs">{course.description}</div>
                  )}
                </div>
              </TableCell>
              <TableCell>{course.instructor || "Not specified"}</TableCell>
              <TableCell>
                {course.price === 0 ? <Badge variant="secondary">Free</Badge> : `$${course.price.toFixed(2)}`}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <PlayCircle className="w-4 h-4" />
                  <span>{course.modules.length}</span>
                  <span className="text-muted-foreground text-sm">
                    ({course.modules.reduce((total, module) => total + module.lessons.length, 0)} lessons)
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {course.tags.slice(0, 2).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {course.tags.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{course.tags.length - 2}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => onEdit(course)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onDelete(course)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
