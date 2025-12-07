import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

const courseSchema = Joi.object({
    title: Joi.string().max(200).required(),
    description: Joi.string().max(2000).required(),
    instructor: Joi.string().required(),
    duration: Joi.number().min(0).required(),
    price: Joi.number().min(0).required(),
    category: Joi.string()
        .valid('programming', 'design', 'business', 'marketing', 'data-science', 'other')
        .required(),
    level: Joi.string().valid('beginner', 'intermediate', 'advanced').required(),
    enrollments: Joi.number().min(0).default(0),
    rating: Joi.number().min(0).max(5).default(0),
    isPublished: Joi.boolean().default(false),
});

export const validateCourse = (req: Request, res: Response, next: NextFunction) => {
    const { error } = courseSchema.validate(req.body);

    if (error) {
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: error.details.map((detail) => detail.message),
        });
    }

    next();
};
