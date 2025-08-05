import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, Timestamp } from "firebase/firestore"
import { db } from "./firebase"
import type { Course, Instructor, Tag } from "@/types"

// Course API
export const courseAPI = {
  async getCourses(): Promise<Course[]> {
    try {
      const querySnapshot = await getDocs(collection(db, "courses"))
      return querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as Course,
      )
    } catch (error) {
      console.error("Error fetching courses:", error)
      throw new Error("Failed to fetch courses")
    }
  },

  async getCourseById(id: string): Promise<Course | null> {
    try {
      const docRef = doc(db, "courses", id)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Course
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
    } catch (error) {
      console.error("Error updating course:", error)
      throw new Error("Failed to update course")
    }
  },

  async deleteCourse(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, "courses", id))
    } catch (error) {
      console.error("Error deleting course:", error)
      throw new Error("Failed to delete course")
    }
  },
}

// Instructor API
export const instructorAPI = {
  async getInstructors(): Promise<Instructor[]> {
    try {
      const querySnapshot = await getDocs(collection(db, "instructors"))
      return querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as Instructor,
      )
    } catch (error) {
      console.error("Error fetching instructors:", error)
      throw new Error("Failed to fetch instructors")
    }
  },

  async addInstructor(instructorData: Omit<Instructor, "id">): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, "instructors"), {
        ...instructorData,
        createdAt: Timestamp.now(),
      })
      return docRef.id
    } catch (error) {
      console.error("Error adding instructor:", error)
      throw new Error("Failed to create instructor")
    }
  },

  async updateInstructor(id: string, updatedData: Partial<Instructor>): Promise<void> {
    try {
      const docRef = doc(db, "instructors", id)
      await updateDoc(docRef, updatedData)
    } catch (error) {
      console.error("Error updating instructor:", error)
      throw new Error("Failed to update instructor")
    }
  },

  async deleteInstructor(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, "instructors", id))
    } catch (error) {
      console.error("Error deleting instructor:", error)
      throw new Error("Failed to delete instructor")
    }
  },
}

// Tag API
export const tagAPI = {
  async getTags(): Promise<Tag[]> {
    try {
      const querySnapshot = await getDocs(collection(db, "tags"))
      return querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as Tag,
      )
    } catch (error) {
      console.error("Error fetching tags:", error)
      throw new Error("Failed to fetch tags")
    }
  },

  async addTag(tagData: Omit<Tag, "id">): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, "tags"), {
        ...tagData,
        createdAt: Timestamp.now(),
      })
      return docRef.id
    } catch (error) {
      console.error("Error adding tag:", error)
      throw new Error("Failed to create tag")
    }
  },

  async updateTag(id: string, updatedData: Partial<Tag>): Promise<void> {
    try {
      const docRef = doc(db, "tags", id)
      await updateDoc(docRef, updatedData)
    } catch (error) {
      console.error("Error updating tag:", error)
      throw new Error("Failed to update tag")
    }
  },

  async deleteTag(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, "tags", id))
    } catch (error) {
      console.error("Error deleting tag:", error)
      throw new Error("Failed to delete tag")
    }
  },
}
