import { PrismaClient, Role } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()

const USERS_COUNT = 50
const PROJECTS_PER_USER = 3
const COMMENTS_PER_PROJECT = 5

const imageUrls = [
  'https://plus.unsplash.com/premium_photo-1661604042122-2851a1ee3212?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8cG9saXRpY3N8ZW58MHx8MHx8fDA%3D',
  'https://images.unsplash.com/photo-1572980735149-05bbceb1cc12?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHBvbGl0aWNzfGVufDB8fDB8fHww',
  'https://images.unsplash.com/photo-1683744391079-bcdf60a327b6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fHBvbGl0aWNzfGVufDB8fDB8fHww',
  'https://images.unsplash.com/photo-1554418651-70309daf95f5?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjN8fHBvbGl0aWNzfGVufDB8fDB8fHww',
]

function getRandomImageUrl(): string {
  return imageUrls[Math.floor(Math.random() * imageUrls.length)]
}

function getRandomEnum<T>(enumObject: T): T[keyof T] {
  const values = Object.values(enumObject)
  return values[Math.floor(Math.random() * values.length)]
}

async function clearDatabase() {
  const tablenames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`

  const tables = tablenames
    .map(({ tablename }) => tablename)
    .filter((name) => name !== '_prisma_migrations')
    .map((name) => `"public"."${name}"`)
    .join(', ')

  try {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`)
  } catch (error) {
    console.log({ error })
  }
}

async function createUser(index: number) {
  return prisma.user.create({
    data: {
      id: uuidv4(),
      privyUserId: uuidv4(), // This is a placeholder. In reality, this would come from Privy
      email: `user${index}_${Date.now()}@example.com`,
      username: `user${index}_${Date.now()}`,
      role: getRandomEnum(Role),
      avatarUrl: getRandomImageUrl(),
    },
  })
}

async function createProject(user: any, index: number) {
  return prisma.project.create({
    data: {
      id: uuidv4(),
      title: `Project ${index} by ${user.username}`,
      content: `This is the content of project ${index} created by ${user.username}.`,
      slug: `project-${index}-${user.username}-${Date.now()}`,
      published: Math.random() > 0.2, // 80% chance of being published
      imageUrl: getRandomImageUrl(),
      authorId: user.id,
    },
  })
}

async function createComments(project: any, users: any[]) {
  const comments = []
  for (let i = 0; i < COMMENTS_PER_PROJECT; i++) {
    const user = users[Math.floor(Math.random() * users.length)]
    const comment = await prisma.comment.create({
      data: {
        id: uuidv4(),
        content: `Comment ${i + 1} on ${project.title}`,
        authorId: user.id,
        projectId: project.id,
        parentId: i > 0 && Math.random() > 0.5 ? comments[0].id : null, // 50% chance of being a reply to the first comment
      },
    })
    comments.push(comment)
  }
}

async function main() {
  console.log('Clearing existing data...')
  await clearDatabase()
  
  console.log('Starting seeding...')

  const users = []
  for (let i = 0; i < USERS_COUNT; i++) {
    try {
      const user = await createUser(i + 1)
      users.push(user)
    } catch (error) {
      console.error(`Failed to create user ${i + 1}:`, error)
    }
  }

  for (const user of users) {
    const projects = []
    for (let i = 0; i < PROJECTS_PER_USER; i++) {
      try {
        const project = await createProject(user, i + 1)
        projects.push(project)
      } catch (error) {
        console.error(`Failed to create project ${i + 1} for user ${user.username}:`, error)
      }
    }

    for (const project of projects) {
      try {
        await createComments(project, users)
      } catch (error) {
        console.error(`Failed to create comments for project ${project.title}:`, error)
      }
    }
  }

  console.log('Seeding completed.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })