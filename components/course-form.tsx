// "use client"

// import type React from "react"

// import { useState, useEffect } from "react"
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Textarea } from "@/components/ui/textarea"
// import { Label } from "@/components/ui/label"
// import { Card } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Checkbox } from "@/components/ui/checkbox"
// import { useToast } from "@/hooks/use-toast"
// import { Plus, Trash2, Loader2 } from "lucide-react"
// import type { Course, Instructor, Tag, Module, Lesson } from "@/types"
// import { FormLoadingOverlay } from "./optimized-loading-states"

// interface CourseFormProps {
//   course?: Course
//   instructors: Instructor[]
//   tags: Tag[]
//   onSave: (course: Omit<Course, "id">) => Promise<void>
//   onCancel: () => void
//   isOpen: boolean
//   onOpenChange: (open: boolean) => void
//   loading?: boolean // Add this prop
// }

// export function CourseForm({
//   course,
//   instructors,
//   tags,
//   onSave,
//   onCancel,
//   isOpen,
//   onOpenChange,
//   loading = false, // Add this with default value
// }: CourseFormProps) {
//   const [formData, setFormData] = useState<Omit<Course, "id">>({
//     title: "",
//     description: "",
//     instructor: "",
//     price: 0,
//     tags: [],
//     modules: [],
//   })
//   const [saving, setSaving] = useState(false)
//   const { toast } = useToast()

//   useEffect(() => {
//     if (course) {
//       setFormData({
//         title: course.title,
//         description: course.description,
//         instructor: course.instructor,
//         price: course.price,
//         tags: course.tags,
//         modules: course.modules,
//       })
//     } else {
//       setFormData({
//         title: "",
//         description: "",
//         instructor: "",
//         price: 0,
//         tags: [],
//         modules: [],
//       })
//     }
//   }, [course, isOpen])

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()

//     if (!formData.title.trim()) {
//       toast({
//         title: "Validation Error",
//         description: "Course title is required",
//         variant: "destructive",
//       })
//       return
//     }

//     if (!formData.instructor) {
//       toast({
//         title: "Validation Error",
//         description: "Please select an instructor",
//         variant: "destructive",
//       })
//       return
//     }

//     if (formData.price < 0) {
//       toast({
//         title: "Validation Error",
//         description: "Price must be a positive number",
//         variant: "destructive",
//       })
//       return
//     }

//     setSaving(true)
//     try {
//       await onSave(formData)
//       onOpenChange(false)
//     } catch (error) {
//       // Error handling is done in the parent component
//     } finally {
//       setSaving(false)
//     }
//   }

//   const handleTagChange = (tagName: string, checked: boolean) => {
//     setFormData((prev) => ({
//       ...prev,
//       tags: checked ? [...prev.tags, tagName] : prev.tags.filter((tag) => tag !== tagName),
//     }))
//   }

//   const addModule = () => {
//     const newModule: Module = {
//       moduleId: crypto.randomUUID(),
//       title: "",
//       lessons: [],
//     }
//     setFormData((prev) => ({
//       ...prev,
//       modules: [...prev.modules, newModule],
//     }))
//   }

//   const updateModule = (moduleId: string, updates: Partial<Module>) => {
//     setFormData((prev) => ({
//       ...prev,
//       modules: prev.modules.map((module) => (module.moduleId === moduleId ? { ...module, ...updates } : module)),
//     }))
//   }

//   const removeModule = (moduleId: string) => {
//     setFormData((prev) => ({
//       ...prev,
//       modules: prev.modules.filter((module) => module.moduleId !== moduleId),
//     }))
//   }

//   const addLesson = (moduleId: string) => {
//     const newLesson: Lesson = {
//       lessonId: crypto.randomUUID(),
//       title: "",
//       videoUrl: "",
//       content: "",
//     }
//     updateModule(moduleId, {
//       lessons: [...(formData.modules.find((m) => m.moduleId === moduleId)?.lessons || []), newLesson],
//     })
//   }

//   const updateLesson = (moduleId: string, lessonId: string, updates: Partial<Lesson>) => {
//     const module = formData.modules.find((m) => m.moduleId === moduleId)
//     if (module) {
//       updateModule(moduleId, {
//         lessons: module.lessons.map((lesson) => (lesson.lessonId === lessonId ? { ...lesson, ...updates } : lesson)),
//       })
//     }
//   }

//   const removeLesson = (moduleId: string, lessonId: string) => {
//     const module = formData.modules.find((m) => m.moduleId === moduleId)
//     if (module) {
//       updateModule(moduleId, {
//         lessons: module.lessons.filter((lesson) => lesson.lessonId !== lessonId),
//       })
//     }
//   }

//   return (
//     <Dialog open={isOpen} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
//         {loading && <FormLoadingOverlay message="Saving course..." />}
//         <DialogHeader>
//           <DialogTitle>{course ? "Edit Course" : "Create New Course"}</DialogTitle>
//         </DialogHeader>

//         <form onSubmit={handleSubmit} className="space-y-6">
//           {/* Basic Course Information */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <Label htmlFor="title">Course Title *</Label>
//               <Input
//                 id="title"
//                 value={formData.title}
//                 onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
//                 placeholder="Enter course title"
//                 required
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="instructor">Instructor *</Label>
//               <Select
//                 value={formData.instructor}
//                 onValueChange={(value) => setFormData((prev) => ({ ...prev, instructor: value }))}
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select an instructor" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {instructors.map((instructor) => (
//                     <SelectItem key={instructor.id} value={instructor.name}>
//                       {instructor.name}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="description">Description</Label>
//             <Textarea
//               id="description"
//               value={formData.description}
//               onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
//               placeholder="Enter course description"
//               rows={3}
//             />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="price">Price ($)</Label>
//             <Input
//               id="price"
//               type="number"
//               min="0"
//               step="0.01"
//               value={formData.price}
//               onChange={(e) => setFormData((prev) => ({ ...prev, price: Number.parseFloat(e.target.value) || 0 }))}
//               placeholder="0.00"
//             />
//           </div>

//           {/* Tags Section */}
//           <div className="space-y-2">
//             <Label>Tags</Label>
//             <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
//               {tags.map((tag) => (
//                 <div key={tag.id} className="flex items-center space-x-2">
//                   <Checkbox
//                     id={tag.id}
//                     checked={formData.tags.includes(tag.name)}
//                     onCheckedChange={(checked) => handleTagChange(tag.name, checked as boolean)}
//                   />
//                   <Label htmlFor={tag.id} className="text-sm">
//                     {tag.name}
//                   </Label>
//                 </div>
//               ))}
//             </div>
//             <div className="flex flex-wrap gap-2 mt-2">
//               {formData.tags.map((tag, index) => (
//                 <Badge key={index} variant="secondary">
//                   {tag}
//                 </Badge>
//               ))}
//             </div>
//           </div>

//           {/* Modules Section */}
//           <div className="space-y-4">
//             <div className="flex items-center justify-between">
//               <Label className="text-lg font-semibold">Course Modules</Label>
//               <Button type="button" onClick={addModule} variant="outline" size="sm">
//                 <Plus className="w-4 h-4 mr-2" />
//                 Add Module
//               </Button>
//             </div>

//             {formData.modules.map((module, moduleIndex) => (
//               <Card key={module.moduleId} className="p-4">
//                 <div className="space-y-4">
//                   <div className="flex items-center gap-2">
//                     <Input
//                       value={module.title}
//                       onChange={(e) => updateModule(module.moduleId, { title: e.target.value })}
//                       placeholder={`Module ${moduleIndex + 1} title`}
//                       className="flex-1"
//                     />
//                     <Button type="button" onClick={() => removeModule(module.moduleId)} variant="outline" size="sm">
//                       <Trash2 className="w-4 h-4" />
//                     </Button>
//                   </div>

//                   {/* Lessons */}
//                   <div className="ml-4 space-y-2">
//                     <div className="flex items-center justify-between">
//                       <Label className="font-medium">Lessons</Label>
//                       <Button type="button" onClick={() => addLesson(module.moduleId)} variant="outline" size="sm">
//                         <Plus className="w-4 h-4 mr-1" />
//                         Add Lesson
//                       </Button>
//                     </div>

//                     {module.lessons.map((lesson, lessonIndex) => (
//                       <Card key={lesson.lessonId} className="p-3 bg-gray-50">
//                         <div className="space-y-2">
//                           <div className="flex items-center gap-2">
//                             <Input
//                               value={lesson.title}
//                               onChange={(e) =>
//                                 updateLesson(module.moduleId, lesson.lessonId, { title: e.target.value })
//                               }
//                               placeholder={`Lesson ${lessonIndex + 1} title`}
//                               className="flex-1"
//                             />
//                             <Button
//                               type="button"
//                               onClick={() => removeLesson(module.moduleId, lesson.lessonId)}
//                               variant="outline"
//                               size="sm"
//                             >
//                               <Trash2 className="w-4 h-4" />
//                             </Button>
//                           </div>
//                           <Input
//                             value={lesson.videoUrl}
//                             onChange={(e) =>
//                               updateLesson(module.moduleId, lesson.lessonId, { videoUrl: e.target.value })
//                             }
//                             placeholder="Video URL (YouTube, Vimeo, etc.)"
//                           />
//                           <Textarea
//                             value={lesson.content}
//                             onChange={(e) =>
//                               updateLesson(module.moduleId, lesson.lessonId, { content: e.target.value })
//                             }
//                             placeholder="Lesson content (supports Markdown)"
//                             rows={2}
//                           />
//                         </div>
//                       </Card>
//                     ))}
//                   </div>
//                 </div>
//               </Card>
//             ))}
//           </div>

//           {/* Form Actions */}
//           <div className="flex justify-end gap-2 pt-4 border-t">
//             <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
//               Cancel
//             </Button>
//             <Button type="submit" disabled={saving}>
//               {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
//               {course ? "Update Course" : "Create Course"}
//             </Button>
//           </div>
//         </form>
//       </DialogContent>
//     </Dialog>
//   )
// }
