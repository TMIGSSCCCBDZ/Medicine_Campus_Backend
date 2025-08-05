import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // Create sample instructors
  const instructor1 = await prisma.instructor.create({
    data: {
      name: "John Doe",
      email: "john.doe@example.com",
      bio: "Experienced web developer with 10+ years in the industry.",
    },
  })

  const instructor2 = await prisma.instructor.create({
    data: {
      
      name: "Jane Smith",
      email: "jane.smith@example.com",
      bio: "Full-stack developer and UI/UX designer.",
    },
  })

  // Create sample tags
  const tag1 = await prisma.tag.create({
    data: {
      name: "JavaScript",
      description: "Modern JavaScript programming",
    },
  })

  const tag2 = await prisma.tag.create({
    data: {
      name: "React",
      description: "React.js framework",
    },
  })

  const tag3 = await prisma.tag.create({
    data: {
      name: "TypeScript",
      description: "TypeScript programming language",
    },
  })

  // Create sample courses
  const course1 = await prisma.course.create({
    data: {
      title: "Complete React Development Course",
      description: "Learn React from basics to advanced concepts",
      price: 99.99,
      instructorId: instructor1.id,
      modules: {
        create: [
          {
            title: "Introduction to React",
            order: 0,
            lessons: {
              create: [
                {
                  title: "What is React?",
                  content: "Introduction to React library",
                  videoUrl: "https://example.com/video1",
                  order: 0,
                },
                {
                  title: "Setting up React",
                  content: "How to set up a React development environment",
                  videoUrl: "https://example.com/video2",
                  order: 1,
                },
              ],
            },
          },
          {
            title: "React Components",
            order: 1,
            lessons: {
              create: [
                {
                  title: "Functional Components",
                  content: "Creating functional components in React",
                  videoUrl: "https://example.com/video3",
                  order: 0,
                },
              ],
            },
          },
        ],
      },
      courseTags: {
        create: [{ tagId: tag1.id }, { tagId: tag2.id }],
      },
    },
  })

  const course2 = await prisma.course.create({
    data: {
      title: "TypeScript Fundamentals",
      description: "Master TypeScript for better JavaScript development",
      price: 79.99,
      instructorId: instructor2.id,
      modules: {
        create: [
          {
            title: "TypeScript Basics",
            order: 0,
            lessons: {
              create: [
                {
                  title: "Introduction to TypeScript",
                  content: "What is TypeScript and why use it?",
                  videoUrl: "https://example.com/video4",
                  order: 0,
                },
              ],
            },
          },
        ],
      },
      courseTags: {
        create: [{ tagId: tag1.id }, { tagId: tag3.id }],
      },
    },
  })

  console.log("Database seeded successfully!")
  console.log({ instructor1, instructor2, tag1, tag2, tag3, course1, course2 })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
