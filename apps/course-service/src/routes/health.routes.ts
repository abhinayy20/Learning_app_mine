import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { redisClient } from '../services/redis.service';

const router = Router();

/**
 * @route   GET /health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get('/', async (req: Request, res: Response) => {
    const health = {
        status: 'UP',
        timestamp: new Date().toISOString(),
        service: 'course-service',
        checks: {
            mongodb: 'DOWN',
            redis: 'DOWN',
        },
    };

    // Check MongoDB
    try {
        if (mongoose.connection.readyState === 1) {
            health.checks.mongodb = 'UP';
        }
    } catch (error) {
        health.checks.mongodb = 'DOWN';
    }

    // Check Redis
    try {
        await redisClient.ping();
        health.checks.redis = 'UP';
    } catch (error) {
        health.checks.redis = 'DOWN';
    }

    // Set overall status
    const allUp = Object.values(health.checks).every((check) => check === 'UP');
    health.status = allUp ? 'UP' : 'DEGRADED';

    const statusCode = allUp ? 200 : 503;
    res.status(statusCode).json(health);
});

/**
 * @route   GET /health/ready
 * @desc    Readiness probe for Kubernetes
 * @access  Public
 */
router.get('/ready', async (req: Request, res: Response) => {
    if (mongoose.connection.readyState === 1) {
        res.status(200).json({ status: 'ready' });
    } else {
        res.status(503).json({ status: 'not ready' });
    }
});

/**
 * @route   GET /health/live
 * @desc    Liveness probe for Kubernetes
 * @access  Public
 */
router.get('/live', (req: Request, res: Response) => {
    res.status(200).json({ status: 'alive' });
});

export default router;
