import { Request, Response, NextFunction, Application } from 'express';
import promClient from 'prom-client';

const register = new promClient.Registry();

// Default metrics (CPU, memory, etc.)
promClient.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new promClient.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    registers: [register],
});

const httpRequestTotal = new promClient.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
    registers: [register],
});

const activeConnections = new promClient.Gauge({
    name: 'active_connections',
    help: 'Number of active connections',
    registers: [register],
});

export const initMetrics = (app: Application) => {
    // Metrics endpoint
    app.get('/metrics', async (req: Request, res: Response) => {
        res.set('Content-Type', register.contentType);
        res.end(await register.metrics());
    });
};

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (req.path === '/metrics') {
        return next();
    }

    activeConnections.inc();
    const start = Date.now();

    res.on('finish', () => {
        const duration = (Date.now() - start) / 1000;
        const route = req.route?.path || req.path;

        httpRequestDuration.observe(
            {
                method: req.method,
                route,
                status_code: res.statusCode,
            },
            duration
        );

        httpRequestTotal.inc({
            method: req.method,
            route,
            status_code: res.statusCode,
        });

        activeConnections.dec();
    });

    next();
};
