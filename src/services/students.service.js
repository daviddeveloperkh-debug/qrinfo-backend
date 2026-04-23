import { CustomError } from '../errors/custom.error.js'
import studentsRepo from '../repositories/students.repo.js'
// import welderCertificatesRepo from "../repositories/welder-certificates.repo.js";

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

const createStudent = async requestData => {
	const currentYear = new Date().getFullYear()
	return await studentsRepo.createStudent(requestData, currentYear)
}

const updateStudent = async (id, year, data) => {
	const student = await studentsRepo.getStudentById(id, year)
	if (!student) {
		throw new Error(`Student with ID ${id} and Year ${year} not found`)
	}
	const { year: _, ...updateData } = data
	return await studentsRepo.updateStudentById(id, updateData, year)
}

const deleteStudent = async (id, year) => {
	const student = await studentsRepo.getStudentById(id, year)
	if (!student)
		throw CustomError.notFoundError(`Student with ID ${id} not found`)
	await studentsRepo.deleteStudentById(id, year)
}

const getMonthlyStats = async () => {
	return await studentsRepo.getMonthlyStats()
}

const dropStPartitionTable = async () => {
	const currentYear = new Date().getFullYear()
	const targetYear = currentYear - 5
	const tableName = `students_${targetYear}`
	await studentsRepo.dropOldPartition(tableName)
	return { success: true, tableName };
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
