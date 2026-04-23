import {
	pgTable,
	uuid,
	text,
	integer,
	timestamp,
	primaryKey,
} from 'drizzle-orm/pg-core'

// Bu jadvalni Drizzle-kit ko'rmaydi, lekin biz koddai import qilib ishlatamiz
export const partitionTest = pgTable(
	'test_partition',
	{
		id: uuid('id').defaultRandom().notNull(),
		name: text('name'),
		year: integer('year').notNull(),
		createdAt: timestamp('created_at').defaultNow(),
	},
	table => [
		// Partitioning uchun Composite Primary Key shart
		primaryKey({ columns: [table.id, table.year] }),
	],
)

export const students = pgTable(
	'students',
	{
		id: uuid('id').defaultRandom().notNull(),
		given: text('given').notNull(),
		lastName: text('last_name').notNull(),
		firstName: text('first_name').notNull(),
		patronymic: text('patronymic').notNull(),
		specialty: text('specialty').notNull(),
		qualification: text('qualification').notNull(),
		birthDate: text('birth_date').notNull(),
		passportNumber: text('passport_number').unique().notNull(),
		certificateNumber: integer('certificate_number').notNull(),
		protocolNumber: text('protocol_number').notNull(),
		protocolRegistrationDate: text('protocol_registration_date').notNull(),
		commissionChairman: text('commission_chairman').notNull(),
		photo: text('photo'),
		year: integer('year').notNull(),
		createdAt: timestamp('created_at').defaultNow(),
		updatedAt: timestamp('updated_at').defaultNow(),
	},
	table => [
		// Partitioning uchun Composite Primary Key shart
		primaryKey({ columns: [table.id, table.year] }),
	],
)


