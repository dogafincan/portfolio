// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vite-plus/test";

import { Input } from "@/components/ui/input";

afterEach(() => {
  cleanup();
});

describe("universal control size", () => {
  it("keeps editable inputs on a real 40px box", () => {
    render(<Input aria-label="Project name" />);

    const input = screen.getByRole("textbox", { name: "Project name" });
    expect(input.className).toContain("control-target");
    expect(input.className).toContain("h-10");
  });
});
