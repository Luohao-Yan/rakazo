import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { DesktopSetup } from "@rakazo/contracts";
import type { StartupTarget } from "./setup-config.js";
import { normalizeServerUrl, resolveStartupTarget } from "./setup-config.js";

/**
 * `pnpm dev` writes the web origin it chose for this checkout. An unpackaged app
 * reads it so development connects to that stack instead of the managed one.
 */
export const DEV_SERVER_FILE = ".rakazo-dev-web-url";

export function readDevServerUrl(appPath: string): string | null {
  const file = path.resolve(appPath, "..", "..", DEV_SERVER_FILE);
  try {
    return existsSync(file) ? normalizeServerUrl(readFileSync(file, "utf8")) : null;
  } catch {
    return null;
  }
}

export function resolveDesktopStartupTarget(input: {
  packaged: boolean;
  appPath: string;
  envUrl: string | undefined;
  saved: DesktopSetup | null;
  forceSetup: boolean;
}): StartupTarget {
  return resolveStartupTarget({
    envUrl: input.envUrl,
    devUrl: input.packaged ? null : readDevServerUrl(input.appPath),
    saved: input.saved,
    forceSetup: input.forceSetup,
  });
}

/** An explicit launch target replaces a saved managed instance for this run. */
export function usesExplicitTarget(target: StartupTarget): boolean {
  return target.kind === "app" && (target.source === "env" || target.source === "dev");
}
