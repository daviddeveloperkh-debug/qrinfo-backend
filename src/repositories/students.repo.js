import { eq, sql, and } from 'drizzle-orm'
import { db } from '../db/index.js'
import { students } from '../db/partition.js'
import queryBuilder from '../helpers/query-builder.helper.js'
import redisClient from '../db/redis.js'
// import { welderCertificates } from "../db/schema.js";

async function ensureYearlyPartition(year) {
	const tableName = `students_${year}`
	const cacheKey = `table_exists:${tableName}`

	const isCached = await redisClient.get(cacheKey)

	if (isCached) {
		return
	}

	await db.execute(
		sql.raw(`
    CREATE TABLE IF NOT EXISTS ${tableName} 
    PARTITION OF students 
    FOR VALUES FROM (${year}) TO (${year + 1});
  `),
	)
	await redisClient.set(cacheKey, 'true', {
		EX: 604800, // 7 days in seconds
	})
}

const getStudents = async (page, limit, params) => {
	const whereClause = queryBuilder.studentsWhereBuilder(params, students)
	const orderByClause = queryBuilder.studentsSortBuilder(params, students)
	const [data, countResult] = await Promise.all([
		db
			.select()
			.from(students)
			.where(whereClause)
			.orderBy(orderByClause)
			.limit(limit)
			.offset((page - 1) * limit),
		db
			.select({ total: sql`count(*)`.mapWith(Number) })
			.from(students)
			.where(whereClause),
	])

	return {
		data,
		pagination: {
			page: Number(page),
			limit: Number(limit),
			total: countResult[0]?.total ?? 0,
		},
	}
}

const getStudentById = async (id, year) => {
	const result = await db
		.select({
			id: students.id,
			given: students.given,
			lastName: students.lastName,
			firstName: students.firstName,
			patronymic: students.patronymic,
			specialty: students.specialty,
			qualification: students.qualification,
			birthDate: students.birthDate,
			passportNumber: students.passportNumber,
			certificateNumber: students.certificateNumber,
			protocolNumber: students.protocolNumber,
			protocolRegistrationDate: students.protocolRegistrationDate,
			commissionChairman: students.commissionChairman,
			photo: students.photo,
			createdAt: students.createdAt,
			updatedAt: students.updatedAt,
			// welderCertificate: {
			//   id: welderCertificates.id,
			//   certificatesName: welderCertificates.certificatesName,
			//   certificateNo: welderCertificates.certificateNo,
			//   introStatement: welderCertificates.introStatement,
			//   theoryGrade: welderCertificates.theoryGrade,
			//   practiceGrade: welderCertificates.practiceGrade,
			//   qualificationDetails: welderCertificates.qualificationDetails,
			//   issuanceBasis: welderCertificates.issuanceBasis,
			//   issuingBody: welderCertificates.issuingBody,
			//   city: welderCertificates.city,
			//   issueDate: welderCertificates.issueDate,
			//   expiryDate: welderCertificates.expiryDate,
			// },
		})
		.from(students)
		// .leftJoin(welderCertificates, eq(students.welderCertificateId, welderCertificates.id))
		.where(
			and(
				eq(students.id, id),
				eq(students.year, Number(year)), // Qiymatni raqamga o'girish shart
			),
		)
		.limit(1)

	return result[0] ?? null
}

const createStudent = async (requestData, currentYear) => {
	await ensureYearlyPartition(currentYear)
	const [student] = await db
		.insert(students)
		.values({
			...requestData,
			year: currentYear,
		})
		.returning()
	return student
}

const updateStudentById = async (id, data, year) => {
	if (isNaN(year)) {
		throw new Error('Repository Error: Year is NaN')
	}

	const [updated] = await db
		.update(students)
		.set({ ...data, updatedAt: new Date() })
		.where(and(eq(students.id, id), eq(students.year, year)))
		.returning()

	return updated
}

const deleteStudentById = async (id, year) => {
	const [deleted] = await db
		.delete(students)
		.where(and(eq(students.id, id), eq(students.year, year)))
		.returning()
	return deleted ?? null
}

const getMonthlyStats = async () => {
	const result = await db.execute(sql`
    SELECT
      TO_CHAR(created_at, 'YYYY-MM') AS month,
      COUNT(*)::int AS total
    FROM students
    GROUP BY month
    ORDER BY month ASC
  `)
	return result.rows
}

const dropOldPartition = async tableName => {
	await db.execute(sql.raw(`DROP TABLE IF EXISTS ${tableName};`))
}

export default {
	dropOldPartition,
	getStudents,
	getStudentById,
	createStudent,
	updateStudentById,
	deleteStudentById,
	getMonthlyStats,
}
