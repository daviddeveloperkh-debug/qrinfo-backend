import express from 'express'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import cors from 'cors'
import errorHandler from './middlewares/error-handler.middleware.js'
import { CustomError } from './errors/custom.error.js'
import { initJobs } from "./jobs/index.js";
import { initTelegramBot } from "./telegram/bot.js";

dotenv.config()

const app = express()
app.use(cors())

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.set('json replacer', (key, value) =>
        typeof value === 'bigint' ? value.toString() : value,
)

const __dirname = path.dirname(fileURLToPath(import.meta.url))
app.use(express.static(path.join(__dirname, '../uploads')))

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

app.get('/', (req, res) => {
        res.status(200).json({
                status: 'success',
                message: 'Server is running',
                timestamp: new Date().toISOString(),
        })
})

app.use((req, res, next) => {
        const requestedUrl = req.originalUrl
        const method = req.method
        next(
                CustomError.notFoundError(`API Route Not Found: ${method} ${requestedUrl}`),
        )
})

app.use(errorHandler)

const PORT = process.env.PORT || 8000
app.listen(PORT, () => {
        console.log(`Server is running on port: ${PORT}`)
  initJobs();
  initTelegramBot();
})
