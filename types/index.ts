export interface Lesson {
  id: string
  title: string
  videoUrl?: string
  content?: string
  order: number
}

export interface Module {
  id: string
  title: string
  order: number
  lessons: Lesson[]
}

export interface Course {
  id: string
  title: string
  description?: string
  price: number
  createdAt: Date
  updatedAt: Date
  instructor: Instructor
  instructorId: string
  modules: Module[]
  courseTags: Tag[]
}

export interface Instructor {
  id: string
  name: string
  email: string
  bio?: string
  createdAt: Date
  updatedAt: Date
  _count?: {
    courses: number
  }
}

export interface Tag {
  id: string
  name: string
  description?: string
  createdAt: Date
  updatedAt: Date
  _count?: {
    courseTags: number
  }
}

// Form types for creating/updating
export interface CourseFormData {
  title: string
  description?: string
  price: number
  instructorId: string
  tagIds: string[]
  modules: ModuleFormData[]
}

export interface ModuleFormData {
  id?: string
  title: string
  order: number
  lessons: LessonFormData[]
}

export interface LessonFormData {
  id?: string
  title: string
  content?: string
  videoUrl?: string
  order: number
}

export interface InstructorFormData {
  name: string
  email: string
  bio?: string
}

export interface TagFormData {
  name: string
  description?: string
}
