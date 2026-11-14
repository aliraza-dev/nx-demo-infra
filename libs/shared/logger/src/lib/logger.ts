import * as winston from 'winston';
import { OpenTelemetryTransportV3 } from '@opentelemetry/winston-transport';

/**
 * Returns true if observability (OpenTelemetry tracing, metrics, logs) is enabled.
 * Can be controlled via ENABLE_OBSERVABILITY or OBSERVABILITY_ENABLED env vars ('true'/'false' or '1'/'0').
 * Also respects standard OpenTelemetry OTEL_SDK_DISABLED ('true'/'false').
 */
export function isObservabilityEnabled(): boolean {
  if (
    process.env['OTEL_SDK_DISABLED'] === 'true' ||
    process.env['OTEL_SDK_DISABLED'] === '1'
  ) {
    return false;
  }

  const flag =
    process.env['ENABLE_OBSERVABILITY'] ??
    process.env['OBSERVABILITY_ENABLED'];
  if (flag === undefined) {
    return true; // Default to enabled
  }

  return flag.toLowerCase() === 'true' || flag === '1';
}

const transports: winston.transport[] = [
  new winston.transports.Console(),
];

if (isObservabilityEnabled()) {
  transports.push(new OpenTelemetryTransportV3());
}

export const gatewayLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports,
});
