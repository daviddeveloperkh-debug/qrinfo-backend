import studentsService from '../services/students.service.js'
import {
	responseSuccess,
	responsePaginated,
} from '../helpers/reponse.helper.js'
import { students } from '../db/partition.js'

const getStudents = async (req, res, next) => {
	try {
		const page = parseInt(req.query.page) || 1
		const limit = parseInt(req.query.limit) || 10
		const query = req.query || {}
		const result = await studentsService.getStudents(page, limit, query)
		res
			.status(200)
			.json(
				responsePaginated(
					'Students retrieved successfully',
					result.data,
					result.pagination,
				),
			)
	} catch (error) {
		next(error)
	}
}

const getStudentById = async (req, res, next) => {
	try {
		const { id } = req.params
		const { year } = req.query
		if (!year) {
			return res.status(400).json({
				success: false,
				message: "Ma'lumotni olish uchun 'year' parametri ko'rsatilishi shart!",
			})
		}

		const student = await studentsService.getStudentById(id, parseInt(year))

		if (!student) {
			return res.status(404).json({
				success: false,
				message: 'Talaba topilmadi',
			})
		}

		res
			.status(200)
			.json(responseSuccess('Student retrieved successfully', student))
	} catch (error) {
		next(error)
	}
}

const createStudent = async (req, res, next) => {
	try {
		const requestData = await studentsService.createStudent(req.body, req.file)
		res
			.status(201)
			.json(responseSuccess('Student created successfully', requestData))
	} catch (error) {
		next(error)
	}
}
const updateStudent = async (req, res, next) => {
	try {
		const { id } = req.params
		const year = req.query ? parseInt(req.query.year) : null

		if (!year) {
			return res.status(400).json({
				success: false,
				message: 'Year query parametri (raqam) majburiy!',
			})
		}

		const student = await studentsService.updateStudent(id, year, req)

		res.status(200).json({ success: true, data: student })
	} catch (error) {
		next(error)
	}
}

const deleteStudent = async (req, res, next) => {
	try {
		const { id } = req.params
		const year = req.query ? parseInt(req.query.year) : null

		if (!year) {
			return res.status(400).json({
				success: false,
				message:
					"Ma'lumotni o'chirish uchun 'year' parametri (raqam) ko'rsatilishi shart!",
			})
		}

		await studentsService.deleteStudent(req.params.id, parseInt(year))
		res.status(204).send()
	} catch (error) {
		next(error)
	}
}

const getMonthlyStats = async (req, res, next) => {
	try {
		const stats = await studentsService.getMonthlyStats()
		res
			.status(200)
			.json(responseSuccess('Monthly stats retrieved successfully', stats))
	} catch (error) {
		next(error)
	}
}

export default {
	getStudents,
	getStudentById,
	createStudent,
	updateStudent,
	deleteStudent,
	getMonthlyStats,
}
