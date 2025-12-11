import { Router } from 'express';
import {
    enrollInCourse,
    getMyEnrollments,
    updateProgress,
    unenroll
} from '../controllers/enrollment.controller';

const router = Router();

// POST /api/enrollments - Enroll in a course
router.post('/', enrollInCourse);

// GET /api/enrollments/me - Get my enrollments
router.get('/me', getMyEnrollments);

// PUT /api/enrollments/:id/progress - Update progress
router.put('/:id/progress', updateProgress);

// DELETE /api/enrollments/:id - Unenroll from course
router.delete('/:id', unenroll);

export default router;
