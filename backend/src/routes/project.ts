import { Hono } from 'hono'
import { PrismaClient, User } from '@prisma/client'
import { z } from 'zod'
import { HTTPException } from 'hono/http-exception'
import { nanoid } from 'nanoid'

const prisma = new PrismaClient()

interface Variables {
  user: User
}

const app = new Hono<{ Variables: Variables }>()

const projectSchema = z.object({
  title: z.string().min(1).max(256),
  content: z.string(),
  slug: z.string().optional(),
  published: z.boolean().optional().default(false),
  imageUrl: z.string().url().optional().nullable(),
})

type ProjectSchema = z.infer<typeof projectSchema>

// Function to generate a unique slug
function generateSlug(title: string): string {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  const uniqueSuffix = nanoid(6) // Generate a short, unique string
  return `${baseSlug}-${uniqueSuffix}`
}

app.get('/public', async (c) => {
  try {
    const projects = await prisma.project.findMany({
      where: { published: true },
      include: { author: true },
    })
    return c.json(projects, 200)
  } catch (error) {
    console.error('Error fetching public projects:', error)
    throw new HTTPException(500, { message: 'Failed to fetch public projects' })
  }
})

app.get('/my', async (c) => {
  const user = c.get('user')
  try {
    const projects = await prisma.project.findMany({
      where: { authorId: user.id },
      include: { author: true },
    })
    return c.json(projects, 200)
  } catch (error) {
    console.error('Error fetching user projects:', error)
    throw new HTTPException(500, { message: 'Failed to fetch user projects' })
  }
})

app.post('/', async (c) => {
  const user = c.get('user')
  try {
    const body = await c.req.json()
    const validatedData = projectSchema.parse(body)

    const slug = generateSlug(validatedData.title)

    const project = await prisma.project.create({
      data: {
        ...validatedData,
        authorId: user.id,
        slug,
      },
      include: { author: true },
    })

    return c.json(project, 201)
  } catch (error) {
    console.error('Error creating project:', error)
    if (error instanceof z.ZodError) {
      throw new HTTPException(400, { message: JSON.stringify(error.errors) })
    }
    throw new HTTPException(500, { message: 'Failed to create project' })
  }
})

app.get('/:idOrSlug', async (c) => {
  try {
    const idOrSlug = c.req.param('idOrSlug')
    const project = await prisma.project.findFirst({
      where: {
        OR: [
          { id: idOrSlug },
          { slug: idOrSlug }
        ]
      },
      include: { author: true },
    })

    if (!project) {
      throw new HTTPException(404, { message: 'Project not found' })
    }

    return c.json(project, 200)
  } catch (error) {
    console.error('Error fetching project:', error)
    if (error instanceof HTTPException) throw error
    throw new HTTPException(500, { message: 'Failed to fetch project' })
  }
})

app.put('/:idOrSlug', async (c) => {
  const user = c.get('user')
  try {
    const idOrSlug = c.req.param('idOrSlug')
    const body = await c.req.json()
    const validatedData = projectSchema.partial().parse(body)

    const project = await prisma.project.findFirst({
      where: {
        OR: [
          { id: idOrSlug },
          { slug: idOrSlug }
        ]
      }
    })

    if (!project) {
      throw new HTTPException(404, { message: 'Project not found' })
    }
    if (project.authorId !== user.id) {
      throw new HTTPException(403, { message: 'Not authorized to update this project' })
    }

    if (validatedData.title) {
      validatedData.slug = generateSlug(validatedData.title)
    }

    const updatedProject = await prisma.project.update({
      where: { id: project.id },
      data: validatedData,
      include: { author: true },
    })

    return c.json(updatedProject, 200)
  } catch (error) {
    console.error('Error updating project:', error)
    if (error instanceof z.ZodError) {
      throw new HTTPException(400, { message: JSON.stringify(error.errors) })
    }
    if (error instanceof HTTPException) throw error
    throw new HTTPException(500, { message: 'Failed to update project' })
  }
})

app.delete('/:idOrSlug', async (c) => {
  const user = c.get('user')
  try {
    const idOrSlug = c.req.param('idOrSlug')

    const project = await prisma.project.findFirst({
      where: {
        OR: [
          { id: idOrSlug },
          { slug: idOrSlug }
        ]
      }
    })

    if (!project) {
      throw new HTTPException(404, { message: 'Project not found' })
    }
    if (project.authorId !== user.id) {
      throw new HTTPException(403, { message: 'Not authorized to delete this project' })
    }

    await prisma.project.delete({ where: { id: project.id } })

    return c.json({ message: 'Project deleted successfully' }, 200)
  } catch (error) {
    console.error('Error deleting project:', error)
    if (error instanceof HTTPException) throw error
    throw new HTTPException(500, { message: 'Failed to delete project' })
  }
})

export default app