
"use client"

import { useState, useCallback, Suspense, lazy } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Tag } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { tagAPI } from "@/lib/api-prisma"
import { useOptimizedData } from "@/hooks/use-optimized-data"
import { MemoizedTagRow } from "@/components/memoized-components"
import { PageLoadingSkeleton, ErrorState, InlineLoader } from "@/components/optimized-loading-states"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import type { Tag as TagType, TagFormData } from "@/types"
import axios from "axios"

// Lazy load the tag form
const TagForm = lazy(() => import("@/components/tag-form").then((module) => ({ default: module.TagForm })))


interface TagsPageProps {
  tags?: {
    id: string
    name: string
    description: string
    _count?: {
      courseTags?: number
    }
  }[]
}

export const TagsPage = ({ tags }: TagsPageProps) => {
  const { stats, loading, errors, refreshData, setTags } = useOptimizedData()

  const [editingTag, setEditingTag] = useState<TagType | undefined>()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [deletingTag, setDeletingTag] = useState<TagType | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const { toast } = useToast()

  const handleCreateTag = useCallback(() => {
    setEditingTag(undefined)
    setIsFormOpen(true)
  }, [])

  const handleEditTag = useCallback((tag: TagType) => {
    setEditingTag(tag)
    setIsFormOpen(true)
  }, [])

  const handleSaveTag = useCallback(
    async (tagData: TagFormData) => {
      setFormLoading(true)
      try {
        if (editingTag) {
            await axios.patch(`/api/tags/${editingTag.id}/edit`, tagData)
          toast({
            title: "Success",
            description: "Tag updated successfully",
          })
        } else {
          await axios.post("/api/tags/create", tagData)
          toast({
            title: "Success",
            description: "Tag added successfully",
          })
        }

        // Refresh data in background
        setTimeout(() => refreshData("tags"), 1000)
      } catch (error) {
        toast({
          title: "Error",
          description:
            error instanceof Error ? error.message : editingTag ? "Failed to update tag" : "Failed to add tag",
          variant: "destructive",
        })
        throw error
      } finally {
        setFormLoading(false)
      }
    },
    [editingTag, toast, refreshData],
  )

  const handleDeleteTag = useCallback(
    (tag: TagType) => {
      // Check if tag is used in courses
      const usageCount = tag._count?.courseTags || 0
      if (usageCount > 0) {
        toast({
          title: "Cannot Delete",
          description: `This tag is used in ${usageCount} course(s). Please remove it from those courses first.`,
          variant: "destructive",
        })
        return
      }

      setDeletingTag(tag)
      setIsDeleteDialogOpen(true)
    },
    [toast],
  )

  const confirmDeleteTag = useCallback(async () => {
    if (!deletingTag) return

    try {
      await axios.delete(`/api/tags/${deletingTag.id}/delete`)

      // Optimistic update
      setTags((prev) => prev.filter((tag) => tag.id !== deletingTag.id))

      toast({
        title: "Success",
        description: "Tag deleted successfully",
      })

      // Refresh data in background
      setTimeout(() => refreshData("tags"), 1000)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete tag",
        variant: "destructive",
      })
      throw error
    }
  }, [deletingTag, setTags, toast, refreshData])

  // Show loading skeleton on initial load
  if (loading.initial) {
    return <PageLoadingSkeleton />
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Tags</h1>
          <p className="text-muted-foreground">Manage course tags and categories</p>
        </div>
        <Button onClick={handleCreateTag} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add New Tag
        </Button>
      </div>

      {/* Stats Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Tags</CardTitle>
          <Tag className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{tags?.length}</div>
        </CardContent>
      </Card>

      {/* Tags Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Tags</CardTitle>
          <CardDescription>Manage your course tags and categories</CardDescription>
        </CardHeader>
        <CardContent>
          {loading.tags ? (
            <InlineLoader message="Loading tags..." />
          ) : tags?.length === 0 ? (
            <div className="text-center py-8">
              <Tag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tags yet</h3>
              <p className="text-muted-foreground mb-4">Get started by adding your first tag</p>
              <Button onClick={handleCreateTag}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Tag
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tags?.map((tag) => (
                    <MemoizedTagRow
                      key={tag.id}
                      tag={tag}
                      usageCount={tag._count?.courseTags || 0}
                      onEdit={handleEditTag}
                      onDelete={handleDeleteTag}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
</Card>

      {/* Tag Form Modal - Lazy loaded */}
      <Suspense fallback={null}>
        {isFormOpen && (
          <TagForm
            tag={editingTag}
            onSave={handleSaveTag}
            isOpen={isFormOpen}
            onOpenChange={setIsFormOpen}
          />
        )}
      </Suspense>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDeleteTag}
        title="Delete Tag"
        description={`Are you sure you want to delete "${deletingTag?.name}"? This action cannot be undone.`}
      />
    </div>
  )
}
