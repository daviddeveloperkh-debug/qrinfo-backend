import { and, eq, gte, lte, ilike, between, asc, desc } from 'drizzle-orm'

function dateFilterBuilder(date, dateType, table) {
	const dateQueryList = []
	switch (dateType) {
		case 'between':
			const [from, to] = date.split('_')
			if (from && to) {
				dateQueryList.push(
					gte(table.createdAt, new Date(`${from} 00:00:00`)),
					lte(table.createdAt, new Date(`${to} 23:59:59`)),
				)
			}
			break

		case 'gte':
			dateQueryList.push(gte(table.createdAt, new Date(`${date} 00:00:00`)))
			break

		case 'lte':
			dateQueryList.push(lte(table.createdAt, new Date(`${date} 23:59:59`)))
			break

		default:
			break
	}
	return dateQueryList
}

const usersWhereBuilder = (params, users) => {
	if (!params) return undefined
	const conditions = []

	if (params.name) conditions.push(ilike(users.name, `%${params.name}%`))
	if (params.role) conditions.push(eq(users.role, params.role))
	if (params.login) conditions.push(ilike(users.login, `%${params.login}%`))

	if (params?.date && params?.dateType) {
		const dateConditions = dateFilterBuilder(
			params.date,
			params.dateType,
			users,
		)
		if (dateConditions.length) conditions.push(...dateConditions)
	}

	return and(...conditions)
}

const studentsWhereBuilder = (params, students) => {
	if (!params) return undefined
	const conditions = []

	if (params.id) conditions.push(eq(students.id, params.id))
	if (params.firstName)
		conditions.push(ilike(students.firstName, `%${params.firstName}%`))
	if (params.lastName)
		conditions.push(ilike(students.lastName, `%${params.lastName}%`))
	if (params.specialty)
		conditions.push(ilike(students.specialty, `%${params.specialty}%`))
	if (params.passportNumber)
		conditions.push(
			ilike(students.passportNumber, `%${params.passportNumber}%`),
		)
	if (params.certificateNumber)
		conditions.push(
			ilike(students.certificateNumber, `%${params.certificateNumber}%`),
		)
	if (params.protocolNumber)
		conditions.push(
			ilike(students.protocolNumber, `%${params.protocolNumber}%`),
		)
	if (params.year) conditions.push(eq(students.year, Number(params.year)))
	if (params.commissionChairman)
		conditions.push(
			ilike(students.commissionChairman, `%${params.commissionChairman}%`),
		)

	if (params?.date && params?.dateType) {
		const dateConditions = dateFilterBuilder(
			params.date,
			params.dateType,
			students,
		)
		if (dateConditions.length) conditions.push(...dateConditions)
	}

	return conditions.length > 0 ? and(...conditions) : undefined
}

const SORTABLE_FIELDS = ['year', 'createdAt']

const studentsSortBuilder = (params, students) => {
	let orderByClause = desc(students.createdAt)
	if (params && params.sortBy && params.order) {
		if (includes(SORTABLE_FIELDS, params.sortBy.toLowerCase())) {
			orderByClause =
				params.order.toLowerCase() === 'asc'
					? asc(params.sortBy)
					: desc(params.sortBy)
		}
	}
	return orderByClause
}

export default {
	usersWhereBuilder,
	studentsWhereBuilder,
	studentsSortBuilder,
}
