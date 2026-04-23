import userService from '../services/users.service.js'
import { responseSuccess } from '../helpers/reponse.helper.js'
import { responsePaginated } from '../helpers/reponse.helper.js'

const getUsers = async (req, res, next) => {
	try {
		const page = parseInt(req.query.page) || 1
		const limit = parseInt(req.query.limit) || 10
		const query = req.query || {}

		const result = await userService.getUsers(page, limit, query)
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

const getUserById = async (req, res, next) => {
	try {
		const user = await userService.getUserById(parseInt(req.params.id))

		res.status(200).json({
			success: true,
			error: false,
			data: user,
		})
	} catch (error) {
		next(error)
	}
}

const createUser = async (req, res, next) => {
	try {
		await userService.createUser(req.body)
		res.status(200).json(responseSuccess())
	} catch (error) {
		next(error)
	}
}

const updateUser = async (req, res, next) => {
	try {
		await userService.updateUser(parseInt(req.params.id), req.body)
		res.status(200).json({
			success: true,
			error: false,
		})
	} catch (error) {
		next(error)
	}
}

const getMe = async (req, res, next) => {
	try {
		const user = await userService.getUserById(parseInt(req.user.id))
		res.status(200).json({
			success: true,
			error: false,
			data: user,
		})
	} catch (error) {
		next(error)
	}
}

const deleteUser = async (req, res, next) => {
	try {
		await userService.deleteUser(parseInt(req.params.id))
		res.status(200).json({
			success: true,
			error: false,
		})
	} catch (error) {
		next(error)
	}
}

export default {
	getUsers,
	getUserById,
	createUser,
	updateUser,
	deleteUser,
	getMe,
}
