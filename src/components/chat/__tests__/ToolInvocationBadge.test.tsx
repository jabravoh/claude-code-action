import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocationBadge } from "../ToolInvocationBadge";
import type { ToolInvocation } from "ai";

afterEach(() => {
  cleanup();
});

function makeTool(
  toolName: string,
  args: Record<string, unknown>,
  state: "call" | "result" = "call"
): ToolInvocation {
  return state === "result"
    ? { toolCallId: "1", toolName, args, state, result: "ok" }
    : { toolCallId: "1", toolName, args, state };
}

// str_replace_editor labels
test("shows 'Creating' for str_replace_editor create command", () => {
  render(<ToolInvocationBadge tool={makeTool("str_replace_editor", { command: "create", path: "src/App.tsx" })} />);
  expect(screen.getByText("Creating App.tsx")).toBeDefined();
});

test("shows 'Editing' for str_replace_editor str_replace command", () => {
  render(<ToolInvocationBadge tool={makeTool("str_replace_editor", { command: "str_replace", path: "src/Button.tsx" })} />);
  expect(screen.getByText("Editing Button.tsx")).toBeDefined();
});

test("shows 'Editing' for str_replace_editor insert command", () => {
  render(<ToolInvocationBadge tool={makeTool("str_replace_editor", { command: "insert", path: "src/index.ts" })} />);
  expect(screen.getByText("Editing index.ts")).toBeDefined();
});

test("shows 'Viewing' for str_replace_editor view command", () => {
  render(<ToolInvocationBadge tool={makeTool("str_replace_editor", { command: "view", path: "src/utils.ts" })} />);
  expect(screen.getByText("Viewing utils.ts")).toBeDefined();
});

// file_manager labels
test("shows 'Renaming' for file_manager rename command", () => {
  render(<ToolInvocationBadge tool={makeTool("file_manager", { command: "rename", path: "src/Old.tsx", new_path: "src/New.tsx" })} />);
  expect(screen.getByText("Renaming Old.tsx")).toBeDefined();
});

test("shows 'Deleting' for file_manager delete command", () => {
  render(<ToolInvocationBadge tool={makeTool("file_manager", { command: "delete", path: "src/Unused.tsx" })} />);
  expect(screen.getByText("Deleting Unused.tsx")).toBeDefined();
});

// State indicators
test("shows spinner when tool is in progress", () => {
  const { container } = render(
    <ToolInvocationBadge tool={makeTool("str_replace_editor", { command: "create", path: "src/App.tsx" }, "call")} />
  );
  expect(container.querySelector(".animate-spin")).toBeTruthy();
});

test("shows green dot when tool has a result", () => {
  const { container } = render(
    <ToolInvocationBadge tool={makeTool("str_replace_editor", { command: "create", path: "src/App.tsx" }, "result")} />
  );
  expect(container.querySelector(".bg-emerald-500")).toBeTruthy();
  expect(container.querySelector(".animate-spin")).toBeFalsy();
});

// Fallback for unknown tools
test("falls back to toolName for unknown tools", () => {
  render(<ToolInvocationBadge tool={makeTool("unknown_tool", { command: "something", path: "file.ts" })} />);
  expect(screen.getByText("unknown_tool")).toBeDefined();
});
