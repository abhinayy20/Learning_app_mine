import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
    userId: string; // User ID from user-service
    courseId: mongoose.Types.ObjectId;
    rating: number; // 1-5
    comment: string;
    isVerifiedPurchase: boolean;
    helpfulCount: number;
    createdAt: Date;
    updatedAt: Date;
}

const ReviewSchema: Schema = new Schema(
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
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            required: true,
            maxlength: 1000,
        },
        isVerifiedPurchase: {
            type: Boolean,
            default: false,
        },
        helpfulCount: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    {
        timestamps: true,
    }
);

// One review per user per course
ReviewSchema.index({ userId: 1, courseId: 1 }, { unique: true });
ReviewSchema.index({ rating: -1 });
ReviewSchema.index({ createdAt: -1 });

export default mongoose.model<IReview>('Review', ReviewSchema);
