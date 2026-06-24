import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { SEMRESATTRS_SERVICE_NAME } from '@opentelemetry/semantic-conventions'; // Will fix these deprecated imports in the next release of OpenTelemetry
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { SimpleLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-grpc';
import { metrics } from '@opentelemetry/api';
import { WinstonInstrumentation } from '@opentelemetry/instrumentation-winston';
// import { HostMetricsInstrumentation } from '@opentelemetry/instrumentation-host-metrics';

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.WARN);

const logExporter = new OTLPLogExporter({
  url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://127.0.0.1:4317',
});

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [SEMRESATTRS_SERVICE_NAME]: process.env.SERVICE_NAME || 'api-gateway',
  }),
  traceExporter: new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://127.0.0.1:4317',
  }),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://127.0.0.1:4317',
    }),
  }),
  logRecordProcessors: [new SimpleLogRecordProcessor(logExporter)],
  instrumentations: [
    getNodeAutoInstrumentations(),
    // new HostMetricsInstrumentation(),
    new WinstonInstrumentation(),
  ],
});

sdk.start();
console.log('OpenTelemetry Runtime Hooks Successfully Injected');

const customMeter = metrics.getMeter('api-gateway-custom-metrics');

const cpuTimeMetric = customMeter.createObservableCounter('process.cpu.time', {
  description: 'Time spent by the Node.js process on the CPU',
  unit: 's',
});

cpuTimeMetric.addCallback((observableResult) => {
  // Node.js returns CPU time in microseconds
  const usage = process.cpuUsage();

  // Convert microseconds to seconds and push to the Collector with state labels
  observableResult.observe(usage.user / 1e6, { state: 'user' });
  observableResult.observe(usage.system / 1e6, { state: 'system' });
});

// Graceful shutdown of the SDK to ensure all telemetry is flushed before the application exits
process.on('SIGTERM', () => {
  sdk
    .shutdown()
    .then(() => console.log('Tracing terminated ApiGateway'))
    .catch((error) =>
      console.log('Error terminating tracing ApiGateway', error),
    )
    .finally(() => process.exit(0));
});
