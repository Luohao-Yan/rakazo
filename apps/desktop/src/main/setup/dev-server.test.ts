import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, expect, it } from "vitest";
import { readDevServerUrl } from "./dev-server.js";

let root: string | undefined;

afterEach(() => {
  if (root !== undefined) rmSync(root, { recursive: true, force: true });
  root = undefined;
});

function appPathWith(content?: string) {
  root = mkdtempSync(path.join(tmpdir(), "rakazo-dev-server-"));
  const appPath = path.join(root, "apps", "desktop");
  mkdirSync(appPath, { recursive: true });
  if (content !== undefined) writeFileSync(path.join(root, ".rakazo-dev-web-url"), content);
  return appPath;
}

it("reads the origin pnpm dev wrote for this checkout", () => {
  expect(readDevServerUrl(appPathWith("http://127.0.0.1:5173\n"))).toBe("http://127.0.0.1:5173");
});

it("ignores a missing or unusable file", () => {
  expect(readDevServerUrl(appPathWith())).toBeNull();
  expect(readDevServerUrl(appPathWith("not a server address"))).toBeNull();
});
