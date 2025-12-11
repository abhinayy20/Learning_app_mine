import { Request, Response } from 'express';
import Enrollment from '../models/enrollment.model';
import Course from '../models/course.model';

export const enrollInCourse = async (req: Request, res: Response) => {
    try {
        const { courseId } = req.body;
        const userId = req.body.userId || req.headers['x-user-id']; // Get from auth middleware

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User authentication required'
            });
        }

        // Check if course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Check if already enrolled
        const existingEnrollment = await Enrollment.findOne({ userId, courseId });
        if (existingEnrollment) {
            return res.status(409).json({
                success: false,
                message: 'Already enrolled in this course'
            });
        }

        // Create enrollment
        const enrollment = new Enrollment({
            userId,
            courseId,
            totalLessons: 10 // Default, can be from course data
        });

        await enrollment.save();

        // Update course enrollment count
        course.enrollments += 1;
        await course.save();

        return res.status(201).json({
            success: true,
            message: 'Successfully enrolled in course',
            data: enrollment
        });
    } catch (error: any) {
        console.error('Enrollment error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to enroll in course',
            error: error.message
        });
    }
};

export const getMyEnrollments = async (req: Request, res: Response) => {
    try {
        const userId = req.body.userId || req.headers['x-user-id'];

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User authentication required'
            });
        }

        const enrollments = await Enrollment.find({ userId })
            .populate('courseId')
            .sort({ enrolledAt: -1 });

        return res.json({
            success: true,
            data: {
                enrollments,
                count: enrollments.length
            }
        });
    } catch (error: any) {
        console.error('Get enrollments error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to get enrollments',
            error: error.message
        });
    }
};

export const updateProgress = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { completedLessons } = req.body;
        const userId = req.body.userId || req.headers['x-user-id'];

        const enrollment = await Enrollment.findOne({ _id: id, userId });

        if (!enrollment) {
            return res.status(404).json({
                success: false,
                message: 'Enrollment not found'
            });
        }

        if (completedLessons !== undefined) {
            enrollment.completedLessons = Math.min(completedLessons, enrollment.totalLessons);
        }

        enrollment.lastAccessedAt = new Date();
        await enrollment.save();

        return res.json({
            success: true,
            message: 'Progress updated successfully',
            data: enrollment
        });
    } catch (error: any) {
        console.error('Update progress error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update progress',
            error: error.message
        });
    }
};

export const unenroll = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.body.userId || req.headers['x-user-id'];

        const enrollment = await Enrollment.findOneAndDelete({ _id: id, userId });

        if (!enrollment) {
            return res.status(404).json({
                success: false,
                message: 'Enrollment not found'
            });
        }

        // Update course enrollment count
        const course = await Course.findById(enrollment.courseId);
        if (course && course.enrollments > 0) {
            course.enrollments -= 1;
            await course.save();
        }

        return res.json({
            success: true,
            message: 'Successfully unenrolled from course'
        });
    } catch (error: any) {
        console.error('Unenroll error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to unenroll from course',
            error: error.message
        });
    }
};
