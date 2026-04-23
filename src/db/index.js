import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg'
import * as schema from './schema.js'
import * as partitionSchema from './partition.js'

import dotenv from 'dotenv' // server.js da chaqirilsa bu yirda kerak emas
dotenv.config()

// 1. Ma'lumotlar bazasi bilan ulanish (Pool) yaratamiz
const pool = new pg.Pool({
	connectionString: process.env.DATABASE_URL,
})

// 2. Drizzle ob'ektini yaratamiz
// schema: schema - bu orqali Drizzle bizning jadvallarni tanib oladi (Querying uchun qulay)
export const db = drizzle(pool, {
	schema: { ...schema, ...partitionSchema },
})

// Ulanishda xatolik bo'lsa konsolga chiqarish
pool.on('error', err => {
	console.error('Baza bilan ulanishda kutilmagan xato:', err)
	process.exit(-1)
})
