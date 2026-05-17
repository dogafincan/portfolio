// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vite-plus/test";

import { HelloWorld } from "@/components/hello-world";

describe("HelloWorld", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the temporary hello world page", () => {
    render(<HelloWorld />);

    expect(screen.getByRole("heading", { level: 1, name: "hello world" })).toBeTruthy();
  });
});
