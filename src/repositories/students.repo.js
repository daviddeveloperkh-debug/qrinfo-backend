import { eq, sql, and } from 'drizzle-orm'
import { db } from '../db/index.js'
import { students } from '../db/partition.js'
import queryBuilder from '../helpers/query-builder.helper.js'
import redisClient from '../db/redis.js'
// import { welderCertificates } from "../db/schema.js";

async function ensureYearlyPartition(year) {
	const partitionName = `students_${year}` // `students_2026`

	const isCached = await redisClient.get(partitionName) //students_2026

	if (isCached) {
		return
	}

	await db.execute(
		sql`
    CREATE TABLE IF NOT EXISTS ${sql.identifier(partitionName)} 
    PARTITION OF ${students} 
    FOR VALUES FROM (${sql.raw(year.toString())}) TO (${sql.raw((year + 1).toString())});
  `,
	)
	await redisClient.set(partitionName, 'true', {
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
			year: students.year,
			createdAt: students.createdAt,
			updatedAt: students.updatedAt,
		})
		.from(students)
		.where(
			and(
				eq(students.id, id),
				eq(students.year, Number(year)), 
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
			given: requestData.given,
			lastName: requestData.lastName,
			firstName: requestData.firstName,
			patronymic: requestData.patronymic,
			specialty: requestData.specialty,
			qualification: requestData.qualification,
			birthDate: requestData.birthDate,
			passportNumber: requestData.passportNumber,
			certificateNumber: requestData.certificateNumber,
			protocolNumber: requestData.protocolNumber,
			protocolRegistrationDate: requestData.protocolRegistrationDate,
			commissionChairman: requestData.commissionChairman,
			photo: requestData.photo || null,
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

const dropOldPartition = async partitionTable => {
	// 1. partition borligini tekshiramiz
	const check = await db.execute(
		sql.raw(`
    SELECT to_regclass('${partitionTable}') as exists;
  `),
	)

	if (!check.rows[0].exists) {
		return false
	}

	// 2. parent dan detach qilamiz
	await db.execute(
		sql`ALTER TABLE ${students} DETACH PARTITION ${sql.identifier(partitionTable)};`,
	)

	// 3. partitionni o‘chiramiz
	await db.execute(
		sql.raw(`
    DROP TABLE ${partitionTable};
  `),
	)

	return true
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
