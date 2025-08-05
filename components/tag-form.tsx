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
import type { Tag } from "@/types"

interface TagFormProps {
  tag?: Tag
  onSave: (tag: Omit<Tag, "id">) => Promise<void>
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function TagForm({ tag, onSave, isOpen, onOpenChange }: TagFormProps) {
  const [formData, setFormData] = useState<Omit<Tag, "id">>({
    name: "",
    description: "",
  })
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (tag) {
      setFormData({
        name: tag.name,
        description: tag.description,
      })
    } else {
      setFormData({
        name: "",
        description: "",
      })
    }
  }, [tag, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Tag name is required",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      await onSave(formData)
      onOpenChange(false)
    } catch (error) {
      // Error handling is done in the parent component
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{tag ? "Edit Tag" : "Add New Tag"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tag Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Enter tag name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Enter tag description"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {tag ? "Update Tag" : "Add Tag"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
