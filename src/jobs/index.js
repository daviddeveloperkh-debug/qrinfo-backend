import cron from 'node-cron'
import studentsService from '../services/students.service.js'

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
}
