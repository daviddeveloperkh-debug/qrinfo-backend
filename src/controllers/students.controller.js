import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { randomUUID } from 'crypto'
import studentsService from '../services/students.service.js'
import {
	responseSuccess,
	responsePaginated,
} from '../helpers/reponse.helper.js'
import { students } from '../db/partition.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const UPLOADS_DIR = path.join(__dirname, '../../uploads/students')

const savePhoto = file => {
	if (!file) return null
	if (!fs.existsSync(UPLOADS_DIR))
		fs.mkdirSync(UPLOADS_DIR, { recursive: true })
	const ext = path.extname(file.originalname).toLowerCase()
	const filename = `${randomUUID()}${ext}`
	fs.writeFileSync(path.join(UPLOADS_DIR, filename), file.buffer)
	return `/students/${filename}`
}

const deletePhoto = photoPath => {
	if (!photoPath) return
	const fullPath = path.join(UPLOADS_DIR, path.basename(photoPath))
	if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath)
}

const createStudent = async (req, res, next) => {
	let photoUrl = null
	try {
		photoUrl = savePhoto(req.file)
		const requestData = await studentsService.createStudent({
			...req.body,
			photo: photoUrl,
		})
		res
			.status(201)
			.json(responseSuccess('Student created successfully', requestData))
	} catch (error) {
		// Agar baza xato bersa, yuklangan rasmni o'chirib tashlaymiz
		if (photoUrl) deletePhoto(photoUrl)
		next(error) // Global handlerga yuborish
	}
}
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
    const { id } = req.params;
    const { year } = req.query;
    if (!year) {
      return res.status(400).json({
        success: false,
        message: "Ma'lumotni olish uchun 'year' parametri ko'rsatilishi shart!"
      });
    }

    const student = await studentsService.getStudentById(id, parseInt(year));

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Talaba topilmadi"
      });
    }

    res.status(200).json(responseSuccess('Student retrieved successfully', student));
  } catch (error) {
    next(error);
  }
}

const updateStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { year } = req.query; // URL oxiridagi ?year=2026

    // Qat'iy tekshiruv
    if (!year || isNaN(parseInt(year))) {
      return res.status(400).json({ 
        success: false, 
        message: "Year query parametri (raqam) majburiy!" 
      });
    }

    const numericYear = parseInt(year);

    // Tartib: (id, year, data)
    const student = await studentsService.updateStudent(
      id, 
      numericYear, 
      req.body
    );

    res.status(200).json({ success: true, data: student });
  } catch (error) {
    next(error);
  }
}

const deleteStudent = async (req, res, next) => {
	try {
		 const { id } = req.params;
    const { year } = req.query;
		if (!year || isNaN(parseInt(year))) {
			return res.status(400).json({
				success: false,
				message: "Ma'lumotni o'chirish uchun 'year' parametri (raqam) ko'rsatilishi shart!"
			});
		}
		const existing = await studentsService.getStudentById(req.params.id, parseInt(year));
		if (!existing) {
			return res.status(404).json({
				success: false,
				message: "Talaba topilmadi"
			});
		}
		deletePhoto(existing.photo)
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
