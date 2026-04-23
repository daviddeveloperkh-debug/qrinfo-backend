import { eq, sql } from 'drizzle-orm'
import { db } from '../db/index.js'
import { users } from '../db/schema.js'
import queryBuilderHelper from '../helpers/query-builder.helper.js'

const getUsers = async (page, limit, queryParams) => {
	const sqlQuery = queryBuilderHelper.usersWhereBuilder(queryParams, users)

	const [data, countResult] = await Promise.all([
		db
			.select({
				id: users.id,
				name: users.name,
				role: users.role,
				login: users.login,
			})
			.from(users)
			.where(sqlQuery)
			.limit(limit)
			.offset((page - 1) * limit),

		db
			.select({ total: sql`count(*)`.mapWith(Number) })
			.from(users)
			.where(sqlQuery),
	])

	const total = countResult[0]?.total ?? 0

	return {
		data,
		pagination: {
			page: Number(page),
			limit: Number(limit),
			total: countResult[0]?.total ?? 0,
		},
	}
}

const getUser = async userId => {
	return await db.query.users.findFirst({
		where: eq(users.id, userId),
		columns: { id: true, name: true, role: true, login: true },
	})
}

const getByLogin = async login => {
	return await db.query.users.findFirst({
		where: eq(users.login, login),
		columns: { id: true, name: true, role: true, login: true, password: true },
	})
}

const createUser = async data => {
	const [newUser] = await db.insert(users).values(data).returning()
	return newUser
}

const updateUserById = async (id, data) => {
	const [updatedUser] = await db
		.update(users)
		.set(data)
		.where(eq(users.id, id))
		.returning()
	return updatedUser
}

const deleteUserById = async id => {
	await db.delete(users).where(eq(users.id, id))
}

export default {
	getUsers,
	getUser,
	getByLogin,
	createUser,
	updateUserById,
	deleteUserById,
}
