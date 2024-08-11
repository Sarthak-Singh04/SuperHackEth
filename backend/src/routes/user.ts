import { Hono } from 'hono'
import { PrismaClient, User, Role } from '@prisma/client'
import { z } from 'zod'
import { HTTPException } from 'hono/http-exception'
import { privyServer } from '../lib/privyServer'
import { authMiddleware } from '../middleware/auth'

const prisma = new PrismaClient()

// Define custom variables for Hono context
interface Variables {
  user: User
}

// Create a typed Hono app
const app = new Hono<{ Variables: Variables }>()

// Define the user schema
const userSchema = z.object({
  privyUserId: z.string(),
  email: z.string().email().optional(),
  username: z.string().min(3).max(50),
  role: z.nativeEnum(Role).optional().default(Role.USER),
  appleEmail: z.string().email().optional(),
  googleEmail: z.string().email().optional(),
  twitterUsername: z.string().optional(),
  walletAddress: z.string().optional(),
  avatarUrl: z.string().url().optional(),
}).refine(data => {
  return data.email || data.appleEmail || data.googleEmail || data.twitterUsername;
}, {
  message: "At least one form of contact (email, appleEmail, googleEmail, or twitterUsername) must be provided"
});

type UserSchema = z.infer<typeof userSchema>

// Helper function to assert user type
function assertUser(user: unknown): asserts user is User {
  if (!(user && typeof user === 'object' && 'id' in user)) {
    throw new HTTPException(401, { message: 'Unauthorized' })
  }
}

// Register a new user
app.post('/register', async (c) => {
  try {
    const body = await c.req.json()
    const validatedData = userSchema.parse(body)

    const authHeader = c.req.header('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new HTTPException(401, { message: 'Missing or invalid authorization header' })
    }
    const token = authHeader.split(' ')[1]
    
    try {
      const verifiedClaims = await privyServer.verifyAuthToken(token)
      validatedData.privyUserId = verifiedClaims.userId
    } catch (error) {
      throw new HTTPException(401, { message: 'Invalid or expired token' })
    }

    const existingUser = await prisma.user.findUnique({
      where: { privyUserId: validatedData.privyUserId }
    })

    if (existingUser) {
      throw new HTTPException(409, { message: 'User already exists' })
    }

    const newUser = await prisma.user.create({
      data: validatedData
    })

    return c.json({ message: 'User registered successfully', user: newUser }, 201)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new HTTPException(400, { message: JSON.stringify(error.errors) })
    }
    if (error instanceof HTTPException) throw error
    console.error('Registration error:', error)
    throw new HTTPException(500, { message: 'Failed to register user' })
  }
})

// Get user profile
app.get('/profile',authMiddleware, async (c) => {
  const user = c.get('user')
  assertUser(user)
  
  try {
    const userProfile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        appleEmail: true,
        googleEmail: true,
        twitterUsername: true,
        walletAddress: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    if (!userProfile) {
      throw new HTTPException(404, { message: 'User not found' })
    }

    return c.json(userProfile)
  } catch (error) {
    console.error('Error fetching user profile:', error)
    if (error instanceof HTTPException) throw error
    throw new HTTPException(500, { message: 'Failed to fetch user profile' })
  }
})

// Update user profile
app.put('/profile',authMiddleware, async (c) => {
  const user = c.get('user')
  assertUser(user)
  
  try {
    const body = await c.req.json()
    const validatedData = userSchema.parse(body)

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: validatedData,
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        appleEmail: true,
        googleEmail: true,
        twitterUsername: true,
        walletAddress: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    return c.json({ message: 'User profile updated successfully', user: updatedUser })
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new HTTPException(400, { message: JSON.stringify(error.errors) })
    }
    console.error('Error updating user profile:', error)
    if (error instanceof HTTPException) throw error
    throw new HTTPException(500, { message: 'Failed to update user profile' })
  }
})

// Delete user account
app.delete('/account', async (c) => {
  const user = c.get('user')
  assertUser(user)
  
  try {
    await prisma.user.delete({
      where: { id: user.id }
    })

    return c.json({ message: 'User account deleted successfully' })
  } catch (error) {
    console.error('Error deleting user account:', error)
    throw new HTTPException(500, { message: 'Failed to delete user account' })
  }
})

export default app