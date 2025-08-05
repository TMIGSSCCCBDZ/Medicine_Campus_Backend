"use client"

import { useState, useCallback, Suspense, lazy } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, BookOpen } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useOptimizedData } from "@/hooks/use-optimized-data"
import { MemoizedStatsCards, MemoizedCourseTable } from "@/components/memoized-components"
import { PageLoadingSkeleton, ErrorState, InlineLoader } from "@/components/optimized-loading-states"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import type { Course, CourseFormData } from "@/types"
import axios from "axios"

// Lazy load the course form for better initial page load
const CourseFormPrisma = lazy(() =>
  import("@/components/course-form-prisma").then((module) => ({ default: module.CourseFormPrisma })),
)

interface CoursesPageProps {
  courses: any[] 
    instructors: any[]
    tags: any[]
}
export default function CoursesPage({ courses, instructors, tags }: CoursesPageProps) {
  // Use custom hook to manage data fetching
  const { stats, loading, errors, refreshData, setCourses } = useOptimizedData()

  const [editingCourse, setEditingCourse] = useState<Course | undefined>()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const { toast } = useToast()

  const handleCreateCourse = useCallback(() => {
    setEditingCourse(undefined)
    setIsFormOpen(true)
  }, [])

  const handleEditCourse = useCallback((course: Course) => {
    setEditingCourse(course)
    setIsFormOpen(true)
  }, [])

  const handleSaveCourse = useCallback(
    async (courseData: CourseFormData) => {
      setFormLoading(true)
      try {
        if (editingCourse) {
          await axios.patch(`/api/courses/${editingCourse.id}/edit`, courseData)

          toast({
            title: "Success",
            description: "Course updated successfully",
          })
        } else {
          await axios.post("/api/courses/create", courseData)

          toast({
            title: "Success",
            description: "Course created successfully",
          })
        }

        // Refresh data
        setTimeout(() => refreshData("courses"), 1000)
      } catch (error) {
        toast({
          title: "Error",
          description: editingCourse ? "Failed to update course" : "Failed to create course",
          variant: "destructive",
        })
        throw error
      } finally {
        setFormLoading(false)
      }
    },
    [editingCourse, toast, refreshData],
  )

  const handleDeleteCourse = useCallback((course: Course) => {
    setDeletingCourse(course)
    setIsDeleteDialogOpen(true)
  }, [])

  const confirmDeleteCourse = useCallback(async () => {
    if (!deletingCourse) return

    
    try {
      await axios.delete(`/api/courses/${deletingCourse.id}/delete`)

      // Optimistic update
      setCourses((prev) => prev.filter((course) => course.id !== deletingCourse.id))

      toast({
        title: "Success",
        description: "Course deleted successfully",
      })

      // Refresh data in background
      setTimeout(() => refreshData("courses"), 1000)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete course",
        variant: "destructive",
      })
      throw error
    }
  }, [deletingCourse, setCourses, toast, refreshData])

  // Show loading skeleton on initial load
  if (loading.initial) {
    return <PageLoadingSkeleton />
  }



  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Courses</h1>
          <p className="text-muted-foreground">Manage your online courses</p>
        </div>
        <Button onClick={handleCreateCourse} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add New Course
        </Button>
      </div>

      {/* Stats Cards */}
      <MemoizedStatsCards
        totalCourses={stats.totalCourses}
        totalInstructors={stats.totalInstructors}
        totalTags={stats.totalTags}
        averagePrice={stats.averagePrice}
      />

      {/* Courses Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Courses</CardTitle>
          <CardDescription>Manage your course catalog</CardDescription>
        </CardHeader>
        <CardContent>
          {loading.courses ? (
            <InlineLoader message="Loading courses..." />
          ) : courses.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
              <p className="text-muted-foreground mb-4">Get started by creating your first course</p>
              <Button onClick={handleCreateCourse}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Course
              </Button>
            </div>
          ) : (
            <MemoizedCourseTable courses={courses} onEdit={handleEditCourse} onDelete={handleDeleteCourse} />
          )}
        </CardContent>
      </Card>

      {/* Course Form Modal - Lazy loaded */}
      <Suspense fallback={null}>
        {isFormOpen && (
          <CourseFormPrisma
            course={editingCourse}
            instructors={instructors}
            tags={tags}
            onSave={handleSaveCourse}
            onCancel={() => setIsFormOpen(false)}
            isOpen={isFormOpen}
            onOpenChange={setIsFormOpen}
            loading={formLoading}
          />
        )}
      </Suspense>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDeleteCourse}
        title="Delete Course"
        description={`Are you sure you want to delete "${deletingCourse?.title}"? This action cannot be undone.`}
      />
    </div>
  )
}
