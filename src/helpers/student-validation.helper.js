import { CustomError } from '../errors/custom.error.js'

export const validateStudentData = data => {
	const requiredFields = [
		'given',
		'lastName',
		'firstName',
		'patronymic',
		'specialty',
		'qualification',
		'birthDate',
		'passportNumber',
		'certificateNumber',
		'protocolNumber',
		'protocolRegistrationDate',
		'commissionChairman',
	]

	for (const field of requiredFields) {
		if (
			data[field] === undefined ||
			data[field] === null ||
			data[field] === ''
		) {
			throw CustomError.validationError(
				`Field "${field}" is required and cannot be empty`,
			)
		}
	}

	for (const key in data) {
		switch (key) {
			case 'given':
			case 'lastName':
			case 'firstName':
			case 'patronymic':
			case 'specialty':
			case 'qualification':
			case 'passportNumber':
			case 'protocolNumber':
			case 'commissionChairman':
				if (typeof data[key] !== 'string') data[key] = String(data[key])
				break

			case 'certificateNumber':
				if (typeof data[key] !== 'number') data[key] = Number(data[key])
				break

			case 'birthDate':
			case 'protocolRegistrationDate':
				if (!(data[key] instanceof Date) && isNaN(Date.parse(data[key]))) {
					throw CustomError.validationError(`Invalid date format for ${key}`)
				}
				break
		}
	}

	return data
}
