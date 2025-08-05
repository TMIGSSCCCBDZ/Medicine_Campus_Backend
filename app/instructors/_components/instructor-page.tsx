"use client"

import { useState, useCallback, Suspense, lazy } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useOptimizedData } from "@/hooks/use-optimized-data"
import { MemoizedInstructorRow } from "@/components/memoized-components"
import { PageLoadingSkeleton, ErrorState, InlineLoader } from "@/components/optimized-loading-states"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import type { Instructor, InstructorFormData } from "@/types"
import axios from "axios"

// Lazy load the instructor form
const InstructorForm = lazy(() =>
  import("@/components/instructor-form").then((module) => ({ default: module.InstructorForm })),
)
interface InstructorsPageProps {
  instructors?: Instructor[]    
}


export default function InstructorsPage({ instructors }: InstructorsPageProps) {
  const { stats, loading, errors, refreshData, setInstructors } = useOptimizedData()

  const [editingInstructor, setEditingInstructor] = useState<Instructor | undefined>()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [deletingInstructor, setDeletingInstructor] = useState<Instructor | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const { toast } = useToast()

  const handleCreateInstructor = useCallback(() => {
    setEditingInstructor(undefined)
    setIsFormOpen(true)
  }, [])

  const handleEditInstructor = useCallback((instructor: Instructor) => {
    setEditingInstructor(instructor)
    setIsFormOpen(true)
  }, [])


  const handleSaveInstructor = useCallback(
    async (instructorData: InstructorFormData) => {
      setFormLoading(true)
      try {
        if (editingInstructor) {
          await axios.patch(`/api/instructors/${editingInstructor.id}/edit`, instructorData)

          toast({
            title: "Success",
            description: "Instructor updated successfully",
          })
        } else {
          await axios.post("/api/instructors/create", instructorData)

          toast({
            title: "Success",
            description: "Instructor added successfully",
          })
        }

        // Refresh data in background
        setTimeout(() => refreshData("instructors"), 1000)
      } catch (error) {
        toast({
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : editingInstructor
                ? "Failed to update instructor"
                : "Failed to add instructor",
          variant: "destructive",
        })
        throw error
      } finally {
        setFormLoading(false)
      }
    },
    [editingInstructor, toast, refreshData],
  )

  const handleDeleteInstructor = useCallback(
    (instructor: Instructor) => {
      // Check if instructor has courses
      const courseCount = instructor._count?.courses || 0
      if (courseCount > 0) {
        toast({
          title: "Cannot Delete",
          description: `This instructor has ${courseCount} course(s). Please reassign or delete those courses first.`,
          variant: "destructive",
        })
        return
      }

      setDeletingInstructor(instructor)
      setIsDeleteDialogOpen(true)
    },
    [toast],
  )

  const confirmDeleteInstructor = useCallback(async () => {
    if (!deletingInstructor) return

    try {
      await axios.delete(`/api/instructors/${deletingInstructor.id}/delete`)

      // Optimistic update
      setInstructors((prev) => prev.filter((instructor) => instructor.id !== deletingInstructor.id))

      toast({
        title: "Success",
        description: "Instructor deleted successfully",
      })

      // Refresh data in background
      setTimeout(() => refreshData("instructors"), 1000)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete instructor",
        variant: "destructive",
      })
      throw error
    }
  }, [deletingInstructor, setInstructors, toast, refreshData])

  // Show loading skeleton on initial load
  if (loading.initial) {
    return <PageLoadingSkeleton />
  }



  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Instructors</h1>
          <p className="text-muted-foreground">Manage course instructors</p>
        </div>
        <Button onClick={handleCreateInstructor} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add New Instructor
        </Button>
      </div>

      {/* Stats Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Instructors</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{instructors?.length}</div>
        </CardContent>
      </Card>

      {/* Instructors Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Instructors</CardTitle>
          <CardDescription>Manage your course instructors</CardDescription>
        </CardHeader>
        <CardContent>
          {loading.instructors ? (
            <InlineLoader message="Loading instructors..." />
          ) : instructors?.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No instructors yet</h3>
              <p className="text-muted-foreground mb-4">Get started by adding your first instructor</p>
              <Button onClick={handleCreateInstructor}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Instructor
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Bio</TableHead>
                    <TableHead>Courses</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {instructors?.map((instructor) => (
                    <MemoizedInstructorRow
                      key={instructor.id}
                      instructor={instructor}
                      courseCount={instructor._count?.courses || 0}
                      onEdit={handleEditInstructor}
                      onDelete={handleDeleteInstructor}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructor Form Modal - Lazy loaded */}
      <Suspense fallback={null}>
        {isFormOpen && (
          <InstructorForm
            instructor={editingInstructor}
            onSave={handleSaveInstructor}
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
        onConfirm={confirmDeleteInstructor}
        title="Delete Instructor"
        description={`Are you sure you want to delete "${deletingInstructor?.name}"? This action cannot be undone.`}
      />
    </div>
  )
}
