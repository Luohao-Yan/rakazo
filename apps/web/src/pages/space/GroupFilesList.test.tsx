// @vitest-environment jsdom

import { flush } from "@rakazo/core/test-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ComponentProps, ReactNode } from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({ listSpace: vi.fn() }));
const rpcClient = vi.hoisted(() => ({ artifacts: api, bootstrap: vi.fn() }));
vi.mock("../../lib/query/rpc", () => ({
  rpc: rpcClient,
  rpcForSpace: () => rpcClient,
  createSpaceRpc: () => rpcClient,
  selectedSpaceId: () => "space-1",
}));
vi.mock("../../lib/locale/relative-time", () => ({ formatRelativeTime: () => "just now" }));
vi.mock("@lingui/react/macro", () => {
  const t = (parts: TemplateStringsArray, ...values: unknown[]) =>
    parts.reduce((text, part, index) => text + part + (values[index] ?? ""), "");
  return { useLingui: () => ({ t }), Trans: ({ children }: { children: ReactNode }) => children };
});
vi.mock("@rakazo/ui-web", () => ({
  BotAvatar: () => <span />,
  Button: (props: ComponentProps<"button">) => <button {...props} />,
  Spinner: (props: ComponentProps<"svg">) => <svg role="status" {...props} />,
  ListSearchInput: ({
    query,
    setQuery,
    label,
  }: {
    query: string;
    setQuery: (query: string) => void;
    label: string;
  }) => (
    <input aria-label={label} value={query} onChange={(event) => setQuery(event.target.value)} />
  ),
}));

import { GroupFilesList } from "./GroupFilesList";

const bot = {
  id: "bot-1",
  name: "Writer",
  color: "blue",
  avatarSet: null,
  status: "idle",
} as never;

function artifact(name: string, id: string, runId: string | null) {
  return {
    id,
    botId: "bot-1",
    groupId: "group-1",
    runId,
    name,
    description: null,
    mimeType: "text/markdown",
    size: 128,
    version: 1,
    createdAt: "2026-09-20T12:00:00.000Z",
    versionCount: 1,
  };
}

let queryClient: QueryClient;
beforeEach(() => {
  api.listSpace.mockReset();
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
});

async function render() {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  await act(async () => {
    root.render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <GroupFilesList groupId="group-1" bots={[bot]} />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  });
  await act(flush);
  return {
    container,
    async cleanup() {
      await act(async () => root.unmount());
      container.remove();
    },
  };
}

it("lists the files shared in the chat and who shared them", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  api.listSpace.mockResolvedValue({
    items: [
      artifact("report.md", "artifact-1", "run-1"),
      artifact("notes.txt", "artifact-2", null),
    ],
    nextCursor: null,
  });
  const page = await render();
  try {
    expect(page.container.textContent).toContain("report.md");
    expect(page.container.textContent).toContain("Writer");
    expect(page.container.textContent).toContain("notes.txt");
    expect(page.container.textContent).toContain("You");
    expect(page.container.querySelector("a[href='/app/artifacts/artifact-1']")).not.toBeNull();
    expect(page.container.querySelector("input[aria-label='Search files']")).not.toBeNull();
  } finally {
    await page.cleanup();
    vi.unstubAllGlobals();
  }
});

it("searches the whole group history by name", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  api.listSpace
    .mockResolvedValueOnce({
      items: [artifact("report.md", "artifact-1", "run-1")],
      nextCursor: null,
    })
    .mockResolvedValue({ items: [], nextCursor: null });
  const page = await render();
  try {
    const input = page.container.querySelector<HTMLInputElement>(
      "input[aria-label='Search files']",
    );
    expect(input).not.toBeNull();
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
      setter.call(input, "report");
      input!.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await act(flush);
    await act(flush);
    expect(api.listSpace.mock.lastCall?.[0]).toEqual({
      groupId: "group-1",
      limit: 30,
      query: "report",
    });
    expect(page.container.textContent).toContain("No files match “report”.");
  } finally {
    await page.cleanup();
    vi.unstubAllGlobals();
  }
});

it("says where files will appear while the chat has none", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  api.listSpace.mockResolvedValue({ items: [], nextCursor: null });
  const page = await render();
  try {
    expect(page.container.textContent).toContain("Files shared in this chat appear here.");
  } finally {
    await page.cleanup();
    vi.unstubAllGlobals();
  }
});
