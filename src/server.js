import express from 'express'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import cors from 'cors'
import errorHandler from './middlewares/error-handler.middleware.js'
import { CustomError } from './errors/custom.error.js'
import { initJobs } from "./jobs/index.js";

dotenv.config()

const app = express()
app.use(cors())

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
// ✅ BigInt JSON serialization fix
app.set('json replacer', (key, value) =>
	typeof value === 'bigint' ? value.toString() : value,
)

// Static files
const __dirname = path.dirname(fileURLToPath(import.meta.url))
app.use(express.static(path.join(__dirname, '../uploads')))

// ROUTES
import usersRoute from './routes/users.route.js'
import authRoute from './routes/auth.route.js'
import studentsRoute from './routes/students.route.js'
import welderCertificatesRoute from './routes/welder-certificates.route.js'
import testRoute from './routes/test.route.js'

app.use('/api/test', testRoute)
app.use('/api/users', usersRoute)
app.use('/api/auth', authRoute)
app.use('/api/students', studentsRoute)
app.use('/api/welder-certificates', welderCertificatesRoute)

// Health check: Monitor server status and prevent root (/) 404 errors
app.get('/', (req, res) => {
	res.status(200).json({
		status: 'success',
		message: 'Server is running',
		timestamp: new Date().toISOString(),
	})
})

// 404 middleware
app.use((req, res, next) => {
	const requestedUrl = req.originalUrl
	const method = req.method
	next(
		CustomError.notFoundError(`API Route Not Found: ${method} ${requestedUrl}`),
	)
})

// Global error handling middleware
app.use(errorHandler)

// Start the server
const PORT = process.env.PORT || 8000
app.listen(PORT, () => {
	console.log(`Server is running on port: ${PORT}`)
  initJobs();
})
