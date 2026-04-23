import { Router } from 'express'
import studentsController from '../controllers/students.controller.js'
import { authentication } from '../middlewares/auth.middleware.js'
import { upload } from '../middlewares/fileupload.middleware.js'

const router = Router()

router.get('/stats/monthly', authentication, studentsController.getMonthlyStats)
router.get('/', authentication, studentsController.getStudents)
router.get('/:id', studentsController.getStudentById)
router.post(
	'/create',
	authentication,
	upload.single('file'),
	studentsController.createStudent,
)
router.post(
	'/update/:id',
	authentication,
	upload.single('file'),
	studentsController.updateStudent,
)
router.delete('/delete/:id', authentication, studentsController.deleteStudent)

export default router
