import redisClient from '../db/redis.js'
import { CustomError } from '../errors/custom.error.js'
import { validateStudentData } from '../helpers/student-validation.helper.js'
import studentsRepo from '../repositories/students.repo.js'
import { constants } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { randomUUID } from 'crypto'
import fs from 'fs/promises'

function getFolderPath(year) {
	const __dirname = path.dirname(fileURLToPath(import.meta.url))
	return path.join(__dirname, `../../uploads/students/${year}`)
}

async function savePhoto(file, year) {
	if (!file) return null
	const uploadsFolder = getFolderPath(year)
	let folderExists = true
	try {
		await fs.access(uploadsFolder, constants.F_OK)
	} catch (error) {
		folderExists = false
	}

	if (!folderExists) {
		await fs.mkdir(uploadsFolder, { recursive: true })
	}

	const ext = path.extname(file.originalname).toLowerCase()
	const filename = `${randomUUID()}${ext}`
	await fs.writeFile(path.join(uploadsFolder, filename), file.buffer)

	return `/students/${year}/${filename}`
}

async function deleteFile(photoPath, year) {
	if (!photoPath) return

	const uploadsFolder = getFolderPath(year)
	const fileFullPath = path.join(uploadsFolder, path.basename(photoPath))

	try {
		await fs.unlink(fileFullPath)
	} catch (error) {
		return false
	}
}

async function deleteFolder(year) {
	const uploadsFolder = getFolderPath(year)
	try {
		await fs.rm(uploadsFolder, { recursive: true, force: true })
	} catch (error) {
		return false
	}
}

const getStudents = async (page, limit, queryParams) => {
	const params = Object.keys(queryParams).length > 0 ? queryParams : null
	return await studentsRepo.getStudents(page, limit, params)
}

const getStudentById = async (id, year) => {
	const student = await studentsRepo.getStudentById(id, year)
	if (!student) {
		throw CustomError.notFoundError(
			`Student with ID ${id} not found for the year ${year}`,
		)
	}
	return student
}

const createStudent = async (body, file) => {
	const currentYear = new Date().getFullYear()
	let photoUrl = null
	try {
		photoUrl = await savePhoto(file, currentYear)
		const validatedData = validateStudentData(body)

		const requestData = {
			...validatedData,
			photo: photoUrl,
		}
		return await studentsRepo.createStudent(requestData, currentYear)
	} catch (error) {
		if (photoUrl) await deleteFile(photoUrl, currentYear)
		throw error
	}
}

const updateStudent = async (id, year, req) => {
	let photoUrl = null
	try {
		const student = await studentsRepo.getStudentById(id, year)

		if (!student) {
			throw CustomError.notFoundError(
				`Student with ID ${id} not found for the year ${year}`,
			)
		}

		let data = req.body || {}
		if (req.file) {
			if (student && student.photo) {
				await deleteFile(student.photo, student.year)
			}
			photoUrl = await savePhoto(req.file, year)
			data.photo = photoUrl
		}

		return await studentsRepo.updateStudentById(id, data, year)
	} catch (error) {
		if (photoUrl) await deleteFile(photoUrl, year)
		throw error
	}
}

const deleteStudent = async (id, year) => {
	const student = await studentsRepo.getStudentById(id, year)
	if (!student)
		throw CustomError.notFoundError(`Student with ID ${id} not found`)

	if (student.photo) await deleteFile(student.photo, year)

	await studentsRepo.deleteStudentById(id, year)
}

const getMonthlyStats = async () => {
	return await studentsRepo.getMonthlyStats()
}

const dropStPartitionTable = async () => {
	const currentYear = new Date().getFullYear()
	const targetYear = currentYear - 5
	const tableName = `students_${targetYear}`
	const result = await studentsRepo.dropOldPartition(tableName)

	if (result) {
		await redisClient.del(tableName)
		await deleteFolder(targetYear)
	}

	return result
}

export default {
	dropStPartitionTable,
	getStudents,
	getStudentById,
	createStudent,
	updateStudent,
	deleteStudent,
	getMonthlyStats,
}
