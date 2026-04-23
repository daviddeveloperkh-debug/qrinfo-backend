import cron from 'node-cron'
import studentsService from '../services/students.service.js'

export const initJobs = () => {
	// Har minutda ishlaydigan cron (Test uchun)
	cron.schedule(
		'0 0 * * *',
		async () => {
			try {
				console.log('--- AUTO-CLEANUP START ---')

				const result = await studentsService.dropStPartitionTable()

				console.log(
					`--- SUCCESS: ${result.tableName} o'chirildi yoki mavjud emas ---`,
				)
			} catch (error) {
				console.error('--- AUTO-CLEANUP ERROR ---:', error.message)
			}
		},
		{
			scheduled: true,
			timezone: 'Asia/Tashkent',
		},
	)

	console.log('✅ All background jobs initialized (Running every day at midnight)')
}
