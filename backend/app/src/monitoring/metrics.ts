import { Request, Response, NextFunction } from "express";
import { Registry, collectDefaultMetrics, Histogram } from "prom-client";

export const register = new Registry();

collectDefaultMetrics({
  register,
});

export const httpRequestDuration = new Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request duration in seconds",
  labelNames: ["method", "route", "status_code"] as const,
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [register],
});

export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const end = httpRequestDuration.startTimer();

  res.on("finish", () => {
    const routePath = req.route?.path
      ? `${req.baseUrl || ""}${req.route.path}`
      : "unmatched";

    end({
      method: req.method,
      route: routePath,
      status_code: String(res.statusCode),
    });
  });

  next();
}
