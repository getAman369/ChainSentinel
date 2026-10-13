import { useEffect, useState } from "react";

import { getApiInfo } from "@/services/api";
import type { ApiVersionInfo } from "@/types";

import { Badge, type BadgeColor } from "@components/ui/Badge";
import { Card, CardBody } from "@components/ui/Card";

interface OpenApiSpec {
  info: {
    title: string;
    description: string;
    version: string;
  };
  paths: Record<string, Record<string, { summary?: string; description?: string }>>;
}

interface EndpointExample {
  method: "GET" | "POST";
  description: string;
  example: string;
}

const EXAMPLES: Record<string, EndpointExample> = {
  "/api/v1/screen": {
    method: "POST",
    description: "Screens an address for AML/fraud risk and records an on-chain attestation.",
    example: `POST /api/v1/screen
Content-Type: application/json

{
  "address": "0x1234...",
  "txHash": "0x...",
  "chainId": 8453
}`,
  },
  "/api/v1/attestations/{address}": {
    method: "GET",
    description: "Retrieves the latest attestation and total count for a given address.",
    example: `GET /api/v1/attestations/0x1234...`,
  },
  "/health": {
    method: "GET",
    description: "Returns health status of the API and its dependencies.",
    example: `GET /health`,
  },
};

const METHOD_COLORS: Record<string, BadgeColor> = {
  GET: "minimal",
  POST: "purple",
};

export default function ApiDocs() {
  const [spec, setSpec] = useState<OpenApiSpec | null>(null);
  const [info, setInfo] = useState<ApiVersionInfo | null>(null);

  useEffect(() => {
    fetch("/api/v1/docs")
      .then((response) => response.json() as Promise<OpenApiSpec>)
      .then(setSpec)
      .catch(() => setSpec(null));
    getApiInfo()
      .then(setInfo)
      .catch(() => setInfo(null));
  }, []);

  const endpoints = spec
    ? Object.entries(spec.paths).map(([path, methods]) => ({
        path,
        method: Object.keys(methods)[0]?.toUpperCase() ?? "GET",
        summary: Object.values(methods)[0]?.summary ?? "",
      }))
    : Object.entries(EXAMPLES).map(([path, example]) => ({
        path,
        method: example.method,
        summary: example.description,
      }));

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">API Documentation</h1>
      <p className="mt-2 max-w-2xl text-gray-600 dark:text-gray-400">
        {(spec?.info?.description ?? info?.endpoints)
          ? "AML/Fraud Detection API with on-chain attestation on Base L2."
          : "API documentation unavailable. Start the Express server to load the OpenAPI spec."}
      </p>

      {info && (
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Service: <span className="font-semibold">{info.service}</span> ({info.version})
        </p>
      )}

      <div className="mt-8 space-y-6">
        {endpoints.map((endpoint) => {
          const example = EXAMPLES[endpoint.path];
          return (
            <Card key={endpoint.path} variant="bordered">
              <CardBody className="space-y-4">
                <div className="flex items-center gap-3">
                  <Badge color={METHOD_COLORS[endpoint.method] ?? "gray"}>{endpoint.method}</Badge>
                  <code className="font-mono text-sm font-semibold text-gray-900 dark:text-white">
                    {endpoint.path}
                  </code>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{endpoint.summary}</p>
                {example && (
                  <pre className="overflow-x-auto rounded-lg bg-gray-100 p-4 font-mono text-sm text-gray-700 dark:bg-gray-900 dark:text-gray-300">
                    <code>{example.example}</code>
                  </pre>
                )}
              </CardBody>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
