import { Router, Request, Response, NextFunction } from 'express';
import {
    getAllCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
} from '../controllers/course.controller';
import { validateCourse } from '../middleware/validation.middleware';

const router = Router();

/**
 * @route   GET /api/courses
 * @desc    Get all courses with optional filters
 * @access  Public
 */
router.get('/', getAllCourses);

/**
 * @route   GET /api/courses/:id
 * @desc    Get course by ID
 * @access  Public
 */
router.get('/:id', getCourseById);

/**
 * @route   POST /api/courses
 * @desc    Create new course
 * @access  Private (TODO: add auth middleware)
 */
router.post('/', validateCourse, createCourse);

/**
 * @route   PUT /api/courses/:id
 * @desc    Update course
 * @access  Private (TODO: add auth middleware)
 */
router.put('/:id', validateCourse, updateCourse);

/**
 * @route   DELETE /api/courses/:id
 * @desc    Delete course
 * @access  Private (TODO: add auth middleware)
 */
router.delete('/:id', deleteCourse);

export default router;
