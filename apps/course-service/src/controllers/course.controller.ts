import { Request, Response, NextFunction } from 'express';
import Course from '../models/course.model';
import { getCachedData, setCachedData, deleteCachedData } from '../services/redis.service';

/**
 * Get all courses with optional filtering and pagination
 */
export const getAllCourses = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { category, level, page = 1, limit = 10, sort = '-createdAt' } = req.query;

        // Build filter
        const filter: any = { isPublished: true };
        if (category) filter.category = category;
        if (level) filter.level = level;

        // Cache key
        const cacheKey = `courses:${JSON.stringify(filter)}:${page}:${limit}:${sort}`;

        // Check cache
        const cached = await getCachedData(cacheKey);
        if (cached) {
            return res.json({
                success: true,
                cached: true,
                data: cached,
            });
        }

        // Query database
        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const skip = (pageNum - 1) * limitNum;

        const [courses, total] = await Promise.all([
            Course.find(filter).sort(sort as string).skip(skip).limit(limitNum),
            Course.countDocuments(filter),
        ]);

        const result = {
            courses,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum),
            },
        };

        // Cache result
        await setCachedData(cacheKey, result, 300); // 5 minutes

        res.json({
            success: true,
            cached: false,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get a single course by ID
 */
export const getCourseById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        // Check cache
        const cacheKey = `course:${id}`;
        const cached = await getCachedData(cacheKey);
        if (cached) {
            return res.json({
                success: true,
                cached: true,
                data: cached,
            });
        }

        const course = await Course.findById(id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found',
            });
        }

        // Cache result
        await setCachedData(cacheKey, course, 600); // 10 minutes

        res.json({
            success: true,
            cached: false,
            data: course,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create a new course
 */
export const createCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const course = new Course(req.body);
        await course.save();

        // Invalidate cache
        await deleteCachedData('courses:*');

        res.status(201).json({
            success: true,
            message: 'Course created successfully',
            data: course,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update a course
 */
export const updateCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const course = await Course.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found',
            });
        }

        // Invalidate cache
        await deleteCachedData(`course:${id}`);
        await deleteCachedData('courses:*');

        res.json({
            success: true,
            message: 'Course updated successfully',
            data: course,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete a course
 */
export const deleteCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const course = await Course.findByIdAndDelete(id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found',
            });
        }

        // Invalidate cache
        await deleteCachedData(`course:${id}`);
        await deleteCachedData('courses:*');

        res.json({
            success: true,
            message: 'Course deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};
