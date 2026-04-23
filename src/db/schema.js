import {
	pgTable,
	serial,
	text,
	integer,
	timestamp,
	uniqueIndex,
	index,
	varchar,
	date,
} from 'drizzle-orm/pg-core'

export const users = pgTable(
	'users',
	{
		id: serial('id').primaryKey(),
		name: text('name').notNull(),
		role: integer('role').default(1),
		login: text('login').notNull().unique(),
		password: text('password').notNull(),
		createdAt: timestamp('created_at').defaultNow(),
		updatedAt: timestamp('updated_at').defaultNow(),
	},
	table => [uniqueIndex('login_idx').on(table.login)],
)

export const welderCertificates = pgTable('welder_certificates', {
	id: serial('id').primaryKey(),
  certificatesName: text('certificates_name'),
	introStatement: text('intro_statement'),
	theoryGrade: varchar('theory_grade', { length: 50 }),
	practiceGrade: varchar('practice_grade', { length: 50 }),
	qualificationDetails: text('qualification_details'),
	issuanceBasis: text('issuance_basis'),
	issuingBody: varchar('issuing_body', { length: 255 }),
	city: varchar('city', { length: 100 }),
	certificateNo: varchar('certificate_no', { length: 50 }),
	issueDate: date('issue_date'),
	expiryDate: date('expiry_date'),
	createdAt: timestamp('created_at').defaultNow(),
})

export const refreshTokens = pgTable('refresh_tokens', {
	id: serial('id').primaryKey(),
	userId: integer('user_id').references(() => users.id),
	token: text('token').notNull().unique(),
	createdAt: timestamp('created_at').defaultNow(),
})
