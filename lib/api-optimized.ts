import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  query,
  orderBy,
  limit,
  startAfter,
  type DocumentSnapshot,
  where,
} from "firebase/firestore"
import { db } from "./firebase"
import type { Course, Instructor, Tag } from "@/types"

// Cache for frequently accessed data
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>()

// Cache utility functions
const getCacheKey = (collection: string, params?: any) => {
  return `${collection}_${params ? JSON.stringify(params) : "all"}`
}

const setCache = (key: string, data: any, ttl = 5 * 60 * 1000) => {
  // 5 minutes default TTL
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

// Optimized Course API with caching and pagination
export const courseAPI = {
  async getCourses(useCache = true): Promise<Course[]> {
    const cacheKey = getCacheKey("courses")

    if (useCache) {
      const cached = getCache(cacheKey)
      if (cached) return cached
    }

    try {
      // Optimize query with ordering and limit for initial load
      const q = query(collection(db, "courses"), orderBy("createdAt", "desc"))

      const querySnapshot = await getDocs(q)
      const courses = querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as Course,
      )

      setCache(cacheKey, courses)
      return courses
    } catch (error) {
      console.error("Error fetching courses:", error)
      throw new Error("Failed to fetch courses")
    }
  },

  async getCoursesPaginated(
    pageSize = 10,
    lastDoc?: DocumentSnapshot,
  ): Promise<{
    courses: Course[]
    lastDoc: DocumentSnapshot | null
    hasMore: boolean
  }> {
    try {
      let q = query(collection(db, "courses"), orderBy("createdAt", "desc"), limit(pageSize))

      if (lastDoc) {
        q = query(q, startAfter(lastDoc))
      }

      const querySnapshot = await getDocs(q)
      const courses = querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as Course,
      )

      return {
        courses,
        lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1] || null,
        hasMore: querySnapshot.docs.length === pageSize,
      }
    } catch (error) {
      console.error("Error fetching paginated courses:", error)
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
      const docRef = doc(db, "courses", id)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const course = { id: docSnap.id, ...docSnap.data() } as Course
        setCache(cacheKey, course)
        return course
      }
      return null
    } catch (error) {
      console.error("Error fetching course:", error)
      throw new Error("Failed to fetch course")
    }
  },

  async addCourse(courseData: Omit<Course, "id">): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, "courses"), {
        ...courseData,
        createdAt: Timestamp.now(),
      })

      // Clear cache to ensure fresh data
      clearCache("courses")

      return docRef.id
    } catch (error) {
      console.error("Error adding course:", error)
      throw new Error("Failed to create course")
    }
  },

  async updateCourse(id: string, updatedData: Partial<Course>): Promise<void> {
    try {
      const docRef = doc(db, "courses", id)
      await updateDoc(docRef, updatedData)

      // Clear specific cache entries
      clearCache("courses")
      clearCache("course")
    } catch (error) {
      console.error("Error updating course:", error)
      throw new Error("Failed to update course")
    }
  },

  async deleteCourse(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, "courses", id))

      // Clear cache
      clearCache("courses")
      clearCache("course")
    } catch (error) {
      console.error("Error deleting course:", error)
      throw new Error("Failed to delete course")
    }
  },

  async getCoursesByInstructor(instructorName: string): Promise<Course[]> {
    const cacheKey = getCacheKey("courses_by_instructor", { instructorName })
    const cached = getCache(cacheKey)
    if (cached) return cached

    try {
      const q = query(
        collection(db, "courses"),
        where("instructor", "==", instructorName),
        orderBy("createdAt", "desc"),
      )

      const querySnapshot = await getDocs(q)
      const courses = querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as Course,
      )

      setCache(cacheKey, courses, 2 * 60 * 1000) // 2 minutes TTL
      return courses
    } catch (error) {
      console.error("Error fetching courses by instructor:", error)
      throw new Error("Failed to fetch courses by instructor")
    }
  },
}

// Optimized Instructor API
export const instructorAPI = {
  async getInstructors(useCache = true): Promise<Instructor[]> {
    const cacheKey = getCacheKey("instructors")

    if (useCache) {
      const cached = getCache(cacheKey)
      if (cached) return cached
    }

    try {
      const q = query(collection(db, "instructors"), orderBy("name", "asc"))

      const querySnapshot = await getDocs(q)
      const instructors = querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as Instructor,
      )

      setCache(cacheKey, instructors)
      return instructors
    } catch (error) {
      console.error("Error fetching instructors:", error)
      throw new Error("Failed to fetch instructors")
    }
  },

  async addInstructor(instructorData: Omit<Instructor, "id">): Promise<string> {
    try {
      // Check for duplicate email
      const existingQuery = query(collection(db, "instructors"), where("email", "==", instructorData.email))
      const existingDocs = await getDocs(existingQuery)

      if (!existingDocs.empty) {
        throw new Error("An instructor with this email already exists")
      }

      const docRef = await addDoc(collection(db, "instructors"), {
        ...instructorData,
        createdAt: Timestamp.now(),
      })

      clearCache("instructors")
      return docRef.id
    } catch (error) {
      console.error("Error adding instructor:", error)
      throw error
    }
  },

  async updateInstructor(id: string, updatedData: Partial<Instructor>): Promise<void> {
    try {
      // If email is being updated, check for duplicates
      if (updatedData.email) {
        const existingQuery = query(collection(db, "instructors"), where("email", "==", updatedData.email))
        const existingDocs = await getDocs(existingQuery)

        // Check if email exists for a different instructor
        const duplicateExists = existingDocs.docs.some((doc) => doc.id !== id)
        if (duplicateExists) {
          throw new Error("An instructor with this email already exists")
        }
      }

      const docRef = doc(db, "instructors", id)
      await updateDoc(docRef, updatedData)

      clearCache("instructors")
      clearCache("courses") // Clear courses cache as instructor name might have changed
    } catch (error) {
      console.error("Error updating instructor:", error)
      throw error
    }
  },

  async deleteInstructor(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, "instructors", id))
      clearCache("instructors")
    } catch (error) {
      console.error("Error deleting instructor:", error)
      throw new Error("Failed to delete instructor")
    }
  },
}

// Optimized Tag API
export const tagAPI = {
  async getTags(useCache = true): Promise<Tag[]> {
    const cacheKey = getCacheKey("tags")

    if (useCache) {
      const cached = getCache(cacheKey)
      if (cached) return cached
    }

    try {
      const q = query(collection(db, "tags"), orderBy("name", "asc"))

      const querySnapshot = await getDocs(q)
      const tags = querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as Tag,
      )

      setCache(cacheKey, tags)
      return tags
    } catch (error) {
      console.error("Error fetching tags:", error)
      throw new Error("Failed to fetch tags")
    }
  },

  async addTag(tagData: Omit<Tag, "id">): Promise<string> {
    try {
      // Check for duplicate tag name
      const existingQuery = query(collection(db, "tags"), where("name", "==", tagData.name))
      const existingDocs = await getDocs(existingQuery)

      if (!existingDocs.empty) {
        throw new Error("A tag with this name already exists")
      }

      const docRef = await addDoc(collection(db, "tags"), {
        ...tagData,
        createdAt: Timestamp.now(),
      })

      clearCache("tags")
      return docRef.id
    } catch (error) {
      console.error("Error adding tag:", error)
      throw error
    }
  },

  async updateTag(id: string, updatedData: Partial<Tag>): Promise<void> {
    try {
      // If name is being updated, check for duplicates
      if (updatedData.name) {
        const existingQuery = query(collection(db, "tags"), where("name", "==", updatedData.name))
        const existingDocs = await getDocs(existingQuery)

        const duplicateExists = existingDocs.docs.some((doc) => doc.id !== id)
        if (duplicateExists) {
          throw new Error("A tag with this name already exists")
        }
      }

      const docRef = doc(db, "tags", id)
      await updateDoc(docRef, updatedData)

      clearCache("tags")
      clearCache("courses") // Clear courses cache as tag name might have changed
    } catch (error) {
      console.error("Error updating tag:", error)
      throw error
    }
  },

  async deleteTag(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, "tags", id))
      clearCache("tags")
    } catch (error) {
      console.error("Error deleting tag:", error)
      throw new Error("Failed to delete tag")
    }
  },
}

// Export cache utilities for manual cache management
export const cacheUtils = {
  clearCache,
  getCacheSize: () => cache.size,
  getCacheKeys: () => Array.from(cache.keys()),
}
