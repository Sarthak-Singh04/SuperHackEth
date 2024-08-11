import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'
import { HTTPException } from 'hono/http-exception'
import { authMiddleware } from './middleware/auth'

import projectRoutes from './routes/project'
import userRoutes from './routes/user'

const app = new Hono().basePath("api/v1")

// Global middleware
app.use('*', logger())
app.use('*', cors())

// Public routes (no auth required)
app.route('/auth', userRoutes)

// Authenticated routes
const authenticatedRoutes = new Hono()
authenticatedRoutes.use('*', authMiddleware)

authenticatedRoutes.route('/projects', projectRoutes)


app.route('/', authenticatedRoutes)

// Error handling
app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json({ error: err.message }, err.status)
  }
  console.error('Unhandled error:', err)
  return c.json({ error: 'Internal Server Error' }, 500)
})

export default app