"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Plus, Trash2, Loader2 } from "lucide-react"
import type { Course, Instructor, Tag, CourseFormData, ModuleFormData, LessonFormData } from "@/types"
import { FormLoadingOverlay } from "./optimized-loading-states"
import axios from "axios"

interface CourseFormProps {
  course?: Course
  instructors: Instructor[]
  tags: Tag[]
  onSave: (course: CourseFormData) => Promise<void>
  onCancel: () => void
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  loading?: boolean
}

export function CourseFormPrisma({
  course,
  instructors,
  tags,
  onSave,
  onCancel,
  isOpen,
  onOpenChange,
  loading = false,
}: CourseFormProps) {
  const [formData, setFormData] = useState<CourseFormData>({
    title: "",
    description: "",
    price: 0,
    instructorId: "",
    tagIds: [],
    modules: [],
  })
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()


  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title,
        description: course.description || "",
        price: course.price,
        instructorId: course.instructorId,
        tagIds: course.courseTags.map((tag) => tag.id),
        modules: course.modules.map((module) => ({
          id: module.id,
          title: module.title,
          order: module.order,
          lessons: module.lessons.map((lesson) => ({
            id: lesson.id,
            title: lesson.title,
            content: lesson.content || "",
            videoUrl: lesson.videoUrl || "",
            order: lesson.order,
          })),
        })),
      })
    } else {
      setFormData({
        title: "",
        description: "",
        price: 0,
        instructorId: "",
        tagIds: [],
        modules: [],
      })
    }
  }, [course, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Course title is required",
        variant: "destructive",
      })
      return
    }

    if (!formData.instructorId) {
      toast({
        title: "Validation Error",
        description: "Please select an instructor",
        variant: "destructive",
      })
      return
    }

    if (formData.price < 0) {
      toast({
        title: "Validation Error",
        description: "Price must be a positive number",
        variant: "destructive",
      })
      return
    }


    setSaving(true)
    try {
      if (course){
        await axios.patch(`/api/courses/${course.id}/edit`, {
          data: formData,
        }).then((result) => {
          console.log("Updated course:", result.data)
           toast({
          title: "Success",
          description:  "Course updated successfully",
        })
        }).catch((err) => {
          console.error("Error updating course:", err)
          toast({
            title: "Error",
            description: "Failed to update course",
            variant: "destructive",
          })
          throw err
        });
      } else {
        await axios.post("/api/courses/create", {
          data: formData,
        })
        toast({
          title: "Success",
          description:  "Course created successfully",
        })
      }
      onOpenChange(false)
    } catch (error) {
      // Error handling is done in the parent component
    } finally {
      setSaving(false)
    }
  }

  const handleTagChange = (tagId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      tagIds: checked ? [...prev.tagIds, tagId] : prev.tagIds.filter((id) => id !== tagId),
    }))
  }

  const addModule = () => {
    const newModule: ModuleFormData = {
      title: "",
      order: formData.modules.length,
      lessons: [],
    }
    setFormData((prev) => ({
      ...prev,
      modules: [...prev.modules, newModule],
    }))
  }

  const updateModule = (moduleIndex: number, updates: Partial<ModuleFormData>) => {
    setFormData((prev) => ({
      ...prev,
      modules: prev.modules.map((module, index) => (index === moduleIndex ? { ...module, ...updates } : module)),
    }))
  }

  const removeModule = (moduleIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      modules: prev.modules.filter((_, index) => index !== moduleIndex),
    }))
  }

  const addLesson = (moduleIndex: number) => {
    const module = formData.modules[moduleIndex]
    const newLesson: LessonFormData = {
      title: "",
      content: "",
      videoUrl: "",
      order: module.lessons.length,
    }

    updateModule(moduleIndex, {
      lessons: [...module.lessons, newLesson],
    })
  }

  const updateLesson = (moduleIndex: number, lessonIndex: number, updates: Partial<LessonFormData>) => {
    const module = formData.modules[moduleIndex]
    updateModule(moduleIndex, {
      lessons: module.lessons.map((lesson, index) => (index === lessonIndex ? { ...lesson, ...updates } : lesson)),
    })
  }

  const removeLesson = (moduleIndex: number, lessonIndex: number) => {
    const module = formData.modules[moduleIndex]
    updateModule(moduleIndex, {
      lessons: module.lessons.filter((_, index) => index !== lessonIndex),
    })
  }

  const selectedTags = tags.filter((tag) => formData.tagIds.includes(tag.id))
console.log(formData)
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {loading && <FormLoadingOverlay message="Saving course..." />}
        <DialogHeader>
          <DialogTitle>{course ? "Edit Course" : "Create New Course"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Course Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Course Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Enter course title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructor">Instructor *</Label>
              <Select
                value={formData.instructorId}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, instructorId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an instructor" />
                </SelectTrigger>
                <SelectContent>
                  {instructors.map((instructor) => (
                    <SelectItem key={instructor.id} value={instructor.id}>
                      {instructor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Enter course description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price ($)</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData((prev) => ({ ...prev, price: Number.parseFloat(e.target.value) || 0 }))}
              placeholder="0.00"
            />
          </div>

          {/* Tags Section */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {tags.map((tag) => (
                <div key={tag.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={tag.id}
                    checked={formData.tagIds.includes(tag.id)}
                    onCheckedChange={(checked) => handleTagChange(tag.id, checked as boolean)}
                  />
                  <Label htmlFor={tag.id} className="text-sm">
                    {tag.name}
                  </Label>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedTags.map((tag) => (
                <Badge key={tag.id} variant="secondary">
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Modules Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">Course Modules</Label>
              <Button type="button" onClick={addModule} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Module
              </Button>
            </div>

            {formData.modules.map((module, moduleIndex) => (
              <Card key={moduleIndex} className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Input
                      value={module.title}
                      onChange={(e) => updateModule(moduleIndex, { title: e.target.value })}
                      placeholder={`Module ${moduleIndex + 1} title`}
                      className="flex-1"
                    />
                    <Button type="button" onClick={() => removeModule(moduleIndex)} variant="outline" size="sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Lessons */}
                  <div className="ml-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="font-medium">Lessons</Label>
                      <Button type="button" onClick={() => addLesson(moduleIndex)} variant="outline" size="sm">
                        <Plus className="w-4 h-4 mr-1" />
                        Add Lesson
                      </Button>
                    </div>

                    {module.lessons.map((lesson, lessonIndex) => (
                      <Card key={lessonIndex} className="p-3 bg-gray-50">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Input
                              value={lesson.title}
                              onChange={(e) => updateLesson(moduleIndex, lessonIndex, { title: e.target.value })}
                              placeholder={`Lesson ${lessonIndex + 1} title`}
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              onClick={() => removeLesson(moduleIndex, lessonIndex)}
                              variant="outline"
                              size="sm"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <Input
                            value={lesson.videoUrl}
                            onChange={(e) => updateLesson(moduleIndex, lessonIndex, { videoUrl: e.target.value })}
                            placeholder="Video URL (YouTube, Vimeo, etc.)"
                          />
                          <Textarea
                            value={lesson.content}
                            onChange={(e) => updateLesson(moduleIndex, lessonIndex, { content: e.target.value })}
                            placeholder="Lesson content (supports Markdown)"
                            rows={2}
                          />
                        </div>
                      </Card>

                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {course ? "Update Course" : "Create Course"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
