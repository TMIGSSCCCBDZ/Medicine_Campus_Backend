"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { courseAPI, instructorAPI, tagAPI } from "@/lib/api-prisma"
import type { Course, Instructor, Tag } from "@/types"

export function useOptimizedData() {
  const [courses, setCourses] = useState<Course[]>([])
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState({
    courses: false,
    instructors: false,
    tags: false,
    initial: true,
  })
  const [errors, setErrors] = useState({
    courses: null as string | null,
    instructors: null as string | null,
    tags: null as string | null,
  })

  // Memoized statistics
  const stats = useMemo(() => {
    const totalCourses = courses.length
    const totalInstructors = instructors.length
    const totalTags = tags.length
    const averagePrice =
      courses.length > 0 ? courses.reduce((sum, course) => sum + course.price, 0) / courses.length : 0

    // Course count by instructor
    const coursesByInstructor = courses.reduce(
      (acc, course) => {
        acc[course.instructor.name] = (acc[course.instructor.name] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Tag usage count
    const tagUsage = courses.reduce(
      (acc, course): any => {
        (course as any).tags.forEach((tag: any) => {
          acc[tag.name] = (acc[tag.name] || 0) + 1
        })
        return acc
      },
      {} as Record<string, number>,
    )

    return {
      totalCourses,
      totalInstructors,
      totalTags,
      averagePrice,
      coursesByInstructor,
      tagUsage,
    }
  }, [courses, instructors, tags])

  // Load courses with error handling
  const loadCourses = useCallback(async (useCache = true) => {
    setLoading((prev) => ({ ...prev, courses: true }))
    setErrors((prev) => ({ ...prev, courses: null }))

    try {
      const coursesData = await courseAPI.getCourses(useCache)
      setCourses(coursesData)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load courses"
      setErrors((prev) => ({ ...prev, courses: errorMessage }))
      console.error("Error loading courses:", error)
    } finally {
      setLoading((prev) => ({ ...prev, courses: false }))
    }
  }, [])

  // Load instructors with error handling
  const loadInstructors = useCallback(async (useCache = true) => {
    setLoading((prev) => ({ ...prev, instructors: true }))
    setErrors((prev) => ({ ...prev, instructors: null }))

    try {
      const instructorsData = await instructorAPI.getInstructors(useCache)
      setInstructors(instructorsData)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load instructors"
      setErrors((prev) => ({ ...prev, instructors: errorMessage }))
      console.error("Error loading instructors:", error)
    } finally {
      setLoading((prev) => ({ ...prev, instructors: false }))
    }
  }, [])

  // Load tags with error handling
  const loadTags = useCallback(async (useCache = true) => {
    setLoading((prev) => ({ ...prev, tags: true }))
    setErrors((prev) => ({ ...prev, tags: null }))

    try {
      const tagsData = await tagAPI.getTags(useCache)
      setTags(tagsData)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load tags"
      setErrors((prev) => ({ ...prev, tags: errorMessage }))
      console.error("Error loading tags:", error)
    } finally {
      setLoading((prev) => ({ ...prev, tags: false }))
    }
  }, [])

  // Load all data efficiently
  const loadAllData = useCallback(
    async (useCache = true) => {
      setLoading((prev) => ({ ...prev, initial: true }))

      // Load data in parallel for better performance
      await Promise.allSettled([loadCourses(useCache), loadInstructors(useCache), loadTags(useCache)])

      setLoading((prev) => ({ ...prev, initial: false }))
    },
    [loadCourses, loadInstructors, loadTags],
  )

  // Refresh specific data type
  const refreshData = useCallback(
    async (type: "courses" | "instructors" | "tags" | "all") => {
      switch (type) {
        case "courses":
          await loadCourses(false)
          break
        case "instructors":
          await loadInstructors(false)
          break
        case "tags":
          await loadTags(false)
          break
        case "all":
          await loadAllData(false)
          break
      }
    },
    [loadCourses, loadInstructors, loadTags, loadAllData],
  )

  // Initial data load
  useEffect(() => {
    loadAllData(true)
  }, [loadAllData])

  return {
    // Data
    courses,
    instructors,
    tags,
    stats,

    // Loading states
    loading,
    isLoading: loading.initial || loading.courses || loading.instructors || loading.tags,

    // Errors
    errors,
    hasErrors: Object.values(errors).some((error) => error !== null),

    // Actions
    loadCourses,
    loadInstructors,
    loadTags,
    loadAllData,
    refreshData,

    // Setters for optimistic updates
    setCourses,
    setInstructors,
    setTags,
  }
}

// Hook for instructor-specific data
export function useInstructorData(instructorId?: string) {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadInstructorCourses = useCallback(async () => {
    if (!instructorId) return

    setLoading(true)
    setError(null)

    try {
      const coursesData = await courseAPI.getCoursesByInstructor(instructorId)
      setCourses(coursesData)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load instructor courses"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [instructorId])

  useEffect(() => {
    loadInstructorCourses()
  }, [loadInstructorCourses])

  return {
    courses,
    loading,
    error,
    refresh: loadInstructorCourses,
  }
}
