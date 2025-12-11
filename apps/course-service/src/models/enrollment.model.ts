import mongoose, { Document, Schema } from 'mongoose';

export interface IEnrollment extends Document {
    userId: string; // User ID from user-service
    courseId: mongoose.Types.ObjectId;
    enrolledAt: Date;
    progress: number; // 0-100
    completedLessons: number;
    totalLessons: number;
    lastAccessedAt: Date;
    isCompleted: boolean;
    completedAt?: Date;
}

const EnrollmentSchema: Schema = new Schema(
    {
        userId: {
            type: String,
            required: true,
            index: true,
        },
        courseId: {
            type: Schema.Types.ObjectId,
            ref: 'Course',
            required: true,
            index: true,
        },
        enrolledAt: {
            type: Date,
            default: Date.now,
        },
        progress: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        completedLessons: {
            type: Number,
            default: 0,
            min: 0,
        },
        totalLessons: {
            type: Number,
            default: 10, // Default total lessons
            min: 1,
        },
        lastAccessedAt: {
            type: Date,
            default: Date.now,
        },
        isCompleted: {
            type: Boolean,
            default: false,
        },
        completedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index to prevent duplicate enrollments
EnrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });

// Indexes for queries
EnrollmentSchema.index({ enrolledAt: -1 });
EnrollmentSchema.index({ isCompleted: 1 });

// Calculate progress before saving
EnrollmentSchema.pre<IEnrollment>('save', function (next) {
    const enrollment = this as IEnrollment;

    if (enrollment.totalLessons > 0) {
        enrollment.progress = Math.round((enrollment.completedLessons / enrollment.totalLessons) * 100);
    }

    if (enrollment.progress >= 100 && !enrollment.isCompleted) {
        enrollment.isCompleted = true;
        enrollment.completedAt = new Date();
    }

    next();
});

export default mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema);
