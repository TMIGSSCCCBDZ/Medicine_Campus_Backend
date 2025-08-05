import { prisma } from "./prisma"
import type { Course, Instructor, Tag, CourseFormData, InstructorFormData, TagFormData } from "@/types"

// Cache implementation
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>()

const getCacheKey = (collection: string, params?: any) => {
  return `${collection}_${params ? JSON.stringify(params) : "all"}`
}

const setCache = (key: string, data: any, ttl = 5 * 60 * 1000) => {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl,
  })
}

const getCache = (key: string) => {
  const cached = cache.get(key)
  if (!cached) return null

  if (Date.now() - cached.timestamp > cached.ttl) {
    cache.delete(key)
    return null
  }

  return cached.data
}

const clearCache = (pattern?: string) => {
  if (pattern) {
    for (const key of cache.keys()) {
      if (key.includes(pattern)) {
        cache.delete(key)
      }
    }
  } else {
    cache.clear()
  }
}

// Course API
export const courseAPI = {
  async getCourses(useCache = true): Promise<Course[]> {
    const cacheKey = getCacheKey("courses")

    if (useCache) {
      const cached = getCache(cacheKey)
      if (cached) return cached
    }

    try {
      const courses = await prisma.course.findMany({
        include: {
          instructor: true,
          modules: {
            include: {
              lessons: {
                orderBy: { order: "asc" },
              },
            },
            orderBy: { order: "asc" },
          },
          courseTags: {
            include: {
              tag: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      })

      // Transform the data to match our interface
      const transformedCourses: any[] = courses.map((course) => ({
        ...course,
        tags: course.courseTags.map((ct) => ct.tag),
      }))

      setCache(cacheKey, transformedCourses)
      return transformedCourses
    } catch (error) {
      console.error("Error fetching courses:", error)
      throw new Error("Failed to fetch courses")
    }
  },

  async getCourseById(id: string, useCache = true): Promise<Course | null> {
    const cacheKey = getCacheKey("course", { id })

    if (useCache) {
      const cached = getCache(cacheKey)
      if (cached) return cached
    }

    try {
      const course = await prisma.course.findUnique({
        where: { id },
        include: {
          instructor: true,
          modules: {
            include: {
              lessons: {
                orderBy: { order: "asc" },
              },
            },
            orderBy: { order: "asc" },
          },
          courseTags: {
            include: {
              tag: true,
            },
          },
        },
      })

      if (!course) return null

      const transformedCourse: any = {
        ...course,
        tags: course.courseTags.map((ct) => ct.tag),
      }

      setCache(cacheKey, transformedCourse)
      return transformedCourse
    } catch (error) {
      console.error("Error fetching course:", error)
      throw new Error("Failed to fetch course")
    }
  },

  async createCourse(data: CourseFormData): Promise<string> {
    try {
      const course = await prisma.course.create({
        data: {

          title: data.title,
          description: data.description,
          price: data.price,
          instructorId: data.instructorId,
          modules: {
            create: data.modules.map((module) => ({
              title: module.title,
              order: module.order,
              lessons: {
                create: module.lessons.map((lesson) => ({
                  title: lesson.title,
                  content: lesson.content,
                  videoUrl: lesson.videoUrl,
                  order: lesson.order,
                })),
              },
            })),
          },
          courseTags: {
            create: data.tagIds.map((tagId) => ({
              tagId,
            })),
          },
        },
      })

      clearCache("courses")
      return course.id
    } catch (error) {
      console.error("Error creating course:", error)
      throw new Error("Failed to create course")
    }
  },

  async updateCourse(id: string, data: CourseFormData): Promise<void> {
    try {
      await prisma.$transaction(async (tx) => {
        // Update course basic info
        await tx.course.update({
          where: { id },
          data: {
            title: data.title,
            description: data.description,
            price: data.price,
            instructorId: data.instructorId,
          },
        })

        // Delete existing modules and lessons (cascade will handle lessons)
        await tx.module.deleteMany({
          where: { courseId: id },
        })

        // Delete existing course tags
        await tx.courseTag.deleteMany({
          where: { courseId: id },
        })

        // Create new modules and lessons
        await tx.module.createMany({
          data: data.modules.map((module) => ({
            title: module.title,
            order: module.order,
            courseId: id,
          })),
        })

        // Get created modules to create lessons
        const createdModules = await tx.module.findMany({
          where: { courseId: id },
          orderBy: { order: "asc" },
        })

        // Create lessons for each module
        for (let i = 0; i < data.modules.length; i++) {
          const moduleData = data.modules[i]
          const createdModule = createdModules[i]

          if (moduleData.lessons.length > 0) {
            await tx.lesson.createMany({
              data: moduleData.lessons.map((lesson) => ({
                title: lesson.title,
                content: lesson.content,
                videoUrl: lesson.videoUrl,
                order: lesson.order,
                moduleId: createdModule.id,
              })),
            })
          }
        }

        // Create new course tags
        if (data.tagIds.length > 0) {
          await tx.courseTag.createMany({
            data: data.tagIds.map((tagId) => ({
              courseId: id,
              tagId,
            })),
          })
        }
      })

      clearCache("courses")
      clearCache("course")
    } catch (error) {
      console.error("Error updating course:", error)
      throw new Error("Failed to update course")
    }
  },

  async deleteCourse(id: string): Promise<void> {
    try {
      await prisma.course.delete({
        where: { id },
      })

      clearCache("courses")
      clearCache("course")
    } catch (error) {
      console.error("Error deleting course:", error)
      throw new Error("Failed to delete course")
    }
  },

  async getCoursesByInstructor(instructorId: string): Promise<Course[]> {
    const cacheKey = getCacheKey("courses_by_instructor", { instructorId })
    const cached = getCache(cacheKey)
    if (cached) return cached

    try {
      const courses = await prisma.course.findMany({
        where: { instructorId },
        include: {
          instructor: true,
          modules: {
            include: {
              
              lessons: {
                orderBy: { order: "asc" },
              },
            },
            orderBy: { order: "asc" },
          },
          courseTags: {
            include: {
              tag: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      })

      const transformedCourses: any[] = courses.map((course) => ({
        ...course,
        tags: course.courseTags.map((ct) => ct.tag),
      }))

      setCache(cacheKey, transformedCourses, 2 * 60 * 1000)
      return transformedCourses
    } catch (error) {
      console.error("Error fetching courses by instructor:", error)
      throw new Error("Failed to fetch courses by instructor")
    }
  },
}

// Instructor API
export const instructorAPI = {
  async getInstructors(useCache = true): Promise<Instructor[]> {
    const cacheKey = getCacheKey("instructors")

    if (useCache) {
      const cached = getCache(cacheKey)
      if (cached) return cached
    }

    try {
      const instructors = await prisma.instructor.findMany({
        include: {
          _count: {
            select: { courses: true },
          },
        },
        orderBy: { name: "asc" },
      })


      setCache(cacheKey, instructors)
      return instructors as any[]
    } catch (error) {
      console.error("Error fetching instructors:", error)
      throw new Error("Failed to fetch instructors")
    }
  },

  async createInstructor(data: InstructorFormData): Promise<string> {
    try {
      const instructor = await prisma.instructor.create({
        data: {
          name: data.name,
          email: data.email,
          bio: data.bio,
        },
      })

      clearCache("instructors")
      return instructor.id
    } catch (error) {
      console.error("Error creating instructor:", error)
      if (error instanceof Error && error.message.includes("Unique constraint")) {
        throw new Error("An instructor with this name or email already exists")
      }
      throw new Error("Failed to create instructor")
    }
  },

  async updateInstructor(id: string, data: InstructorFormData): Promise<void> {
    try {
      await prisma.instructor.update({
        where: { id },
        data: {
          name: data.name,
          email: data.email,
          bio: data.bio,
        },
      })

      clearCache("instructors")
      clearCache("courses")
    } catch (error) {
      console.error("Error updating instructor:", error)
      if (error instanceof Error && error.message.includes("Unique constraint")) {
        throw new Error("An instructor with this name or email already exists")
      }
      throw new Error("Failed to update instructor")
    }
  },

  async deleteInstructor(id: string): Promise<void> {
    try {
      await prisma.instructor.delete({
        where: { id },
      })

      clearCache("instructors")
    } catch (error) {
      console.error("Error deleting instructor:", error)
      throw new Error("Failed to delete instructor")
    }
  },
}

// Tag API
export const tagAPI = {
  async getTags(useCache = true): Promise<Tag[]> {
    const cacheKey = getCacheKey("tags")

    if (useCache) {
      const cached = getCache(cacheKey)
      if (cached) return cached
    }

    try {
      const tags = await prisma.tag.findMany({
        include: {
          _count: {
            select: { courseTags: true },
          },
        },
        orderBy: { name: "asc" },
      })


      setCache(cacheKey, tags)
      return tags as any[]
    } catch (error) {
      console.error("Error fetching tags:", error)
      throw new Error("Failed to fetch tags")
    }
  },

  async createTag(data: TagFormData): Promise<string> {
    try {
      const tag = await prisma.tag.create({
        data: {
          name: data.name,
          description: data.description,
        },
      })

      clearCache("tags")
      return tag.id
    } catch (error) {
      console.error("Error creating tag:", error)
      if (error instanceof Error && error.message.includes("Unique constraint")) {
        throw new Error("A tag with this name already exists")
      }
      throw new Error("Failed to create tag")
    }
  },

  async updateTag(id: string, data: TagFormData): Promise<void> {
    try {
      await prisma.tag.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
        },
      })

      clearCache("tags")
      clearCache("courses")
    } catch (error) {
      console.error("Error updating tag:", error)
      if (error instanceof Error && error.message.includes("Unique constraint")) {
        throw new Error("A tag with this name already exists")
      }
      throw new Error("Failed to update tag")
    }
  },

  async deleteTag(id: string): Promise<void> {
    try {
      await prisma.tag.delete({
        where: { id },
      })

      clearCache("tags")
    } catch (error) {
      console.error("Error deleting tag:", error)
      throw new Error("Failed to delete tag")
    }
  },
}

// Export cache utilities
export const cacheUtils = {
  clearCache,
  getCacheSize: () => cache.size,
  getCacheKeys: () => Array.from(cache.keys()),
}
