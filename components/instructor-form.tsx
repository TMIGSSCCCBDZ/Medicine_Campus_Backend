"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import type { Instructor } from "@/types"
import { FormLoadingOverlay } from "./optimized-loading-states"
import { instructorAPI } from "@/lib/api-prisma"
import { prisma } from "@/lib/prisma"
import axios from "axios"
import { useRouter } from "next/navigation"

interface InstructorFormProps {
  instructor?: Instructor
  onSave: (instructor: Omit<Instructor, "id">) => Promise<void>
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  loading?: boolean // Add this prop
}
interface InstructorFormData {
  name: string
  email: string
  bio?: string
}

export function InstructorForm({
  instructor,
  onSave,
  isOpen,
  onOpenChange,
  loading = false, // Add this with default value
}: InstructorFormProps) {
  const [formData, setFormData] = useState<InstructorFormData>({
    name: "",
    email: "",
    bio: "",
  })
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (instructor) {
      setFormData({
        name: instructor.name,
        email: instructor.email,
        bio: instructor.bio,
      })

    } else {
      setFormData({
        name: "",
        email: "",
        bio: "",
      })
    }
  }, [instructor, isOpen])
const router = useRouter()
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Instructor name is required",
        variant: "destructive",
      })
      return
    }

    if (!formData.email.trim()) {
      toast({
        title: "Validation Error",
        description: "Email is required",
        variant: "destructive",
      })
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      if (instructor) {
 await axios.patch(`/api/instructors/${instructor.id}/edit`, formData)
         onOpenChange(false)
         toast({
           title: "Success",
           description: "Instructor updated successfully",
         })
       } else {
         await 
         onOpenChange(false)
         toast({
           title: "Success",
           description: "Instructor added successfully",
         })
       }
    } catch (error) {
      // Error handling is done in the parent component
      console.log("Error saving instructor:", error)
    } finally {
      setSaving(false)
      router.refresh()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        {loading && <FormLoadingOverlay message="Saving instructor..." />}
        <DialogHeader>
          <DialogTitle>{instructor ? "Edit Instructor" : "Add New Instructor"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Enter instructor name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="Enter email address"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
              placeholder="Enter instructor bio"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {instructor ? "Update Instructor" : "Add Instructor"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
