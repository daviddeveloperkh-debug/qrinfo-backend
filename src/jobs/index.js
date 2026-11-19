import cron from 'node-cron'
import { sql } from 'drizzle-orm'
import studentsService from '../services/students.service.js'
import { db } from '../db/index.js'
import { notifyMonthlyReport } from '../helpers/telegram.helper.js'

const sendMonthlyStudentReport = async () => {
        const result = await db.execute(sql`
                SELECT COUNT(*)::int AS total
                FROM students
                WHERE created_at >= date_trunc('month', now() - interval '1 month')
                  AND created_at < date_trunc('month', now())
        `)
        const total = result.rows?.[0]?.total ?? 0

        const prev = new Date()
        prev.setDate(1)
        prev.setMonth(prev.getMonth() - 1)
        const periodLabel = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`

        notifyMonthlyReport(total, periodLabel)
}

export const initJobs = () => {
        cron.schedule(
                '0 0 0 * * *',
                async () => {
                        try {
                                const result = await studentsService.dropStPartitionTable()
                        } catch (error) {
                                console.error('--- AUTO-CLEANUP ERROR ---:', error.message)
                        }
                },
                {
                        scheduled: true,
                        timezone: 'Asia/Tashkent',
                },
        )

        cron.schedule(
                '0 9 1 * *',
                async () => {
                        try {
                                console.log('--- MONTHLY REPORT START ---')
                                await sendMonthlyStudentReport()
                                console.log('--- MONTHLY REPORT SENT ---')
                        } catch (error) {
                                console.error('--- MONTHLY REPORT ERROR ---:', error.message)
                        }
                },
                {
                        scheduled: true,
                        timezone: 'Asia/Tashkent',
                },
        )
}
