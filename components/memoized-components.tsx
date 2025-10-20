"use client"

import type React from "react"
import { memo, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BookOpen, Users, DollarSign, Tag, Edit, Trash2, PlayCircle } from "lucide-react"
import type { Course, Instructor, Tag as TagType } from "@/types"

// Memoized stats card component
export const MemoizedStatsCard = memo(function StatsCard({
  title,
  value,
  icon: Icon,
}: {
  title: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
})

// Memoized stats cards container
export const MemoizedStatsCards = memo(function StatsCards({
  totalCourses,
  totalInstructors,
  totalTags,
  averagePrice,
}: {
  totalCourses: number
  totalInstructors: number
  totalTags: number
  averagePrice: number
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <MemoizedStatsCard title="Total Courses" value={totalCourses} icon={BookOpen} />
      <MemoizedStatsCard title="Instructors" value={totalInstructors} icon={Users} />
      <MemoizedStatsCard title="Tags" value={totalTags} icon={Tag} />
      <MemoizedStatsCard title="Average Price" value={`$${averagePrice.toFixed(2)}`} icon={DollarSign} />
    </div>
  )
})

// Memoized course row component
export const MemoizedCourseRow = memo(function CourseRow({
  course,
  onEdit,
  onDelete,
}: {
  course: Course
  onEdit: (course: Course) => void
  onDelete: (course: Course) => void
}) {
  const moduleCount = course.modules.length
  const lessonCount = useMemo(
    () => course.modules.reduce((total, module) => total + module.lessons.length, 0),
    [course.modules],
  )

  const displayTags = useMemo(() => course?.courseTags?.slice(0, 2), [course.courseTags])
  const remainingTagsCount = course?.courseTags?.length - 2
  return (

      <TableRow>

        <TableCell className="font-medium">
          <div>
            <div className="font-semibold">{course.title}</div>
            {course.description && (
              <div className="text-sm text-muted-foreground truncate max-w-xs">{course.description}</div>
            )}
          </div>
        </TableCell>
        <TableCell>{course?.instructor.name || "Not specified"}</TableCell>
        <TableCell>
          {course?.price === 0 ? <Badge variant="secondary">Free</Badge> : `$${course?.price.toFixed(2)}`}
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-1">
            <PlayCircle className="w-4 h-4" />
            <span>{moduleCount}</span>
            <span className="text-muted-foreground text-sm">({lessonCount} lessons)</span>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex flex-wrap gap-1">
            {displayTags?.map((tag:any, index:any):any => (

              <Badge key={index} variant="outline" className="text-xs">
                {tag.tag.name}
              </Badge>
            ))}
            {remainingTagsCount > 0 && (
              <Badge variant="outline" className="text-xs">
                +{remainingTagsCount}
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
  )
})

// Memoized course table component
export const MemoizedCourseTable = memo(function CourseTable({
  courses,
  onEdit,
  onDelete,
}: {
  courses: Course[]
  onEdit: (course: Course) => void
  onDelete: (course: Course) => void
}) {
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
            <MemoizedCourseRow key={course.id} course={course} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
})

// Memoized instructor row component
export const MemoizedInstructorRow = memo(function InstructorRow({
  instructor,
  courseCount,
  onEdit,
  onDelete,
}: {
  instructor: Instructor
  courseCount: number
  onEdit: (instructor: Instructor) => void
  onDelete: (instructor: Instructor) => void
}) {
  return (
    <TableRow>
      <TableCell className="font-medium">{instructor.name}</TableCell>
      <TableCell>{instructor.email}</TableCell>
      <TableCell>
        <div className="max-w-xs truncate">{instructor.bio || "No bio provided"}</div>
      </TableCell>
      <TableCell>
        <Badge variant={courseCount > 0 ? "default" : "secondary"}>{courseCount} courses</Badge>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(instructor)}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => onDelete(instructor)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
})

// Memoized tag row component
export const MemoizedTagRow = memo(function TagRow({
  tag,
  usageCount,
  onEdit,
  onDelete,
}: {
  tag: TagType
  usageCount: number
  onEdit: (tag: TagType) => void
  onDelete: (tag: TagType) => void
}) {
  return (
    <TableRow>
      <TableCell className="font-medium">
        <Badge variant="outline">{tag.name}</Badge>
      </TableCell>
      <TableCell>
        <div className="max-w-xs truncate">{tag.description || "No description provided"}</div>
      </TableCell>
      <TableCell>
        <Badge variant={usageCount > 0 ? "default" : "secondary"}>{usageCount} courses</Badge>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(tag)}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => onDelete(tag)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
})
