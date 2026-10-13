import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RiskBadge } from "./RiskBadge";

describe("RiskBadge", () => {
  it("displays the risk level label", () => {
    render(<RiskBadge score={4} />);
    expect(screen.getByText("(High)")).toBeInTheDocument();
  });

  it("maps score 1 to Minimal", () => {
    render(<RiskBadge score={1} />);
    expect(screen.getByText("(Minimal)")).toBeInTheDocument();
  });

  it("maps score 5 to Critical", () => {
    render(<RiskBadge score={5} />);
    expect(screen.getByText("(Critical)")).toBeInTheDocument();
  });

  it("hides the label when disabled", () => {
    render(<RiskBadge score={3} showLabel={false} />);
    expect(screen.queryByText("(Medium)")).not.toBeInTheDocument();
  });

  it("falls back to Unknown for out of range scores", () => {
    render(<RiskBadge score={99} />);
    expect(screen.getByText("(Unknown)")).toBeInTheDocument();
  });
});
