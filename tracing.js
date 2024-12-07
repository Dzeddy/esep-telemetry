const { Resource } = require("@opentelemetry/resources");
const { SemanticResourceAttributes } = require("@opentelemetry/semantic-conventions");
const { SimpleSpanProcessor } = require("@opentelemetry/sdk-trace-base");
const { NodeTracerProvider } = require("@opentelemetry/sdk-trace-node");
const { trace } = require("@opentelemetry/api");
const { ExpressInstrumentation } = require("opentelemetry-instrumentation-express");
const { MongoDBInstrumentation } = require("@opentelemetry/instrumentation-mongodb");
const { HttpInstrumentation } = require("@opentelemetry/instrumentation-http");
const { registerInstrumentations } = require("@opentelemetry/instrumentation");
const { JaegerExporter } = require("@opentelemetry/exporter-jaeger");

module.exports = (serviceName) => {
  // Create and configure the Jaeger Exporter
  const exporter = new JaegerExporter({
    // Configure the endpoint and other options if needed:
    // endpoint: 'http://localhost:14268/api/traces',
    serviceName: serviceName,
  });

  // Create a provider for activating and tracking spans
  const provider = new NodeTracerProvider({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
    }),
  });

  // Add the exporter to the provider’s span processor
  provider.addSpanProcessor(new SimpleSpanProcessor(exporter));

  // Register the tracer provider
  provider.register();

  // Register automatic instrumentations
  registerInstrumentations({
    instrumentations: [
      new HttpInstrumentation(),
      new ExpressInstrumentation(),
      new MongoDBInstrumentation(),
    ],
    tracerProvider: provider,
  });

  // Return a tracer instance
  return trace.getTracer(serviceName);
};
