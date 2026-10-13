import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ScreenForm } from "./ScreenForm";

const VALID_ADDRESS = "0x1234567890123456789012345678901234567890";

describe("ScreenForm", () => {
  it("shows a validation error for an invalid address", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<ScreenForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/Ethereum Address/), "0xinvalid");
    await user.click(screen.getByRole("button", { name: "Screen Address" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("valid Ethereum address");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits a valid address with defaults", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<ScreenForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/Ethereum Address/), VALID_ADDRESS);
    await user.click(screen.getByRole("button", { name: "Screen Address" }));

    expect(onSubmit).toHaveBeenCalledWith({
      address: VALID_ADDRESS,
      txHash: null,
      chainId: 8453,
    });
  });

  it("shows an error for a malformed transaction hash", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<ScreenForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/Ethereum Address/), VALID_ADDRESS);
    await user.type(screen.getByLabelText(/Transaction Hash/), "0xshort");
    await user.click(screen.getByRole("button", { name: "Screen Address" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Transaction hash");
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
