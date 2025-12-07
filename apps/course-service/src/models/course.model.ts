import mongoose, { Document, Schema } from 'mongoose';

export interface ICourse extends Document {
    title: string;
    description: string;
    instructor: string;
    duration: number; // in hours
    price: number;
    category: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    enrollments: number;
    rating: number;
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const CourseSchema: Schema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },
        description: {
            type: String,
            required: true,
            maxlength: 2000,
        },
        instructor: {
            type: String,
            required: true,
            trim: true,
        },
        duration: {
            type: Number,
            required: true,
            min: 0,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        category: {
            type: String,
            required: true,
            enum: ['programming', 'design', 'business', 'marketing', 'data-science', 'other'],
        },
        level: {
            type: String,
            required: true,
            enum: ['beginner', 'intermediate', 'advanced'],
        },
        enrollments: {
            type: Number,
            default: 0,
            min: 0,
        },
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        isPublished: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for better query performance
CourseSchema.index({ category: 1, level: 1 });
CourseSchema.index({ instructor: 1 });
CourseSchema.index({ createdAt: -1 });

export default mongoose.model<ICourse>('Course', CourseSchema);
