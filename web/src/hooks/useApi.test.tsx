import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useApi } from "./useApi";

function SuccessComponent({ fetcher }: { fetcher: () => Promise<{ value: number }> }) {
  const { data, loading, error } = useApi(fetcher);
  return (
    <div data-testid="result">
      {loading ? "loading" : error ? `error:${error.message}` : JSON.stringify(data)}
    </div>
  );
}

function FailureComponent({
  fetcher,
  retries = 1,
}: {
  fetcher: () => Promise<unknown>;
  retries?: number;
}) {
  const { error, loading } = useApi(fetcher, {
    retries,
    retryDelay: 5,
  });
  return (
    <div data-testid="result">{loading ? "loading" : error ? `error:${error.message}` : "ok"}</div>
  );
}

describe("useApi", () => {
  it("loads data successfully", async () => {
    const fetcher = vi.fn().mockResolvedValue({ value: 42 });
    render(<SuccessComponent fetcher={fetcher} />);
    expect(await screen.findByTestId("result")).toHaveTextContent('"value":42');
  });

  it("retries failed requests and reports the error", async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error("boom"));
    render(<FailureComponent fetcher={fetcher} retries={1} />);
    await waitFor(() => {
      expect(screen.getByTestId("result")).toHaveTextContent("error:boom");
    });
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("does not retry when retries is zero", async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error("nope"));
    render(<FailureComponent fetcher={fetcher} retries={0} />);
    await waitFor(() => {
      expect(screen.getByTestId("result")).toHaveTextContent("error:nope");
    });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});
