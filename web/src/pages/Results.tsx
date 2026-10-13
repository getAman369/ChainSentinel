import { Link, useLocation } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

import type { ScreenResponse } from "@/types";

import { ResultsDisplay } from "@components/display/ResultsDisplay";

interface ResultsLocationState {
  result?: ScreenResponse;
}

export default function Results() {
  const location = useLocation();
  const result = (location.state as ResultsLocationState | null)?.result;

  if (!result) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">No Screening Results</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Screen an address to see its risk assessment here.
        </p>
        <Link
          to="/"
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:underline dark:text-primary-400"
        >
          <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
          Back to screening
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Screening Results</h1>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:underline dark:text-primary-400"
        >
          <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
          New screening
        </Link>
      </div>
      <ResultsDisplay result={result} />
    </section>
  );
}
