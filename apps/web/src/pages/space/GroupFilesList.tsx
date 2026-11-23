import { Trans, useLingui } from "@lingui/react/macro";
import type { Artifact, Bot } from "@rakazo/contracts";
import { formatFileSize } from "@rakazo/core";
import { BotAvatar, Button, ListSearchInput, Spinner } from "@rakazo/ui-web";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useDeferredValue, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { formatRelativeTime } from "../../lib/locale/relative-time";
import { useSpaceQueries } from "../../lib/query/query";
import { errorText } from "../../lib/query/user-error";
import { ArtifactMimeIcon } from "./artifact-mime-icon";

type ArtifactSummary = Artifact & { versionCount: number };

const PAGE_SIZE = 30;

/**
 * The files shared in a group's chat, newest first: what its bots made and what people attached.
 * A search reads the whole history, so a file stays findable after the chat scrolls away.
 */
export function GroupFilesList({ groupId, bots }: { groupId: string; bots: Bot[] }) {
  const { t } = useLingui();
  const queries = useSpaceQueries();
  const [search, setSearch] = useState("");
  const query = useDeferredValue(search.trim());
  const listing = useInfiniteQuery(
    queries.artifacts.listSpace.infiniteOptions({
      input: (cursor: string | null) => ({
        groupId,
        limit: PAGE_SIZE,
        ...(cursor ? { cursor } : {}),
        ...(query ? { query } : {}),
      }),
      initialPageParam: null as string | null,
      getNextPageParam: (page) => page.nextCursor,
      // A search keeps showing the last results until its own arrive.
      placeholderData: (previous) => previous,
    }),
  );
  const items = useMemo(
    () => listing.data?.pages.flatMap((page) => page.items) ?? null,
    [listing.data],
  );
  const botsById = useMemo(() => new Map(bots.map((bot) => [bot.id, bot])), [bots]);
  const loadError = listing.error ? errorText(listing.error, t`Could not load files.`) : null;
  const searchable = query !== "" || (items?.length ?? 0) > 0 || listing.hasNextPage;

  function row(item: ArtifactSummary) {
    const bot = item.runId ? botsById.get(item.botId ?? "") : undefined;
    return (
      <li key={item.id}>
        <Link
          to={`/app/artifacts/${item.id}`}
          className="flex items-center gap-3 rounded-md px-2 py-2 outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="shrink-0 text-muted-foreground">
            <ArtifactMimeIcon mimeType={item.mimeType} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-body text-foreground" dir="auto">
              {item.name}
            </span>
            <span className="mt-0.5 flex items-center gap-2 text-label text-muted-foreground">
              {item.runId ? (
                <>
                  {bot ? (
                    <BotAvatar
                      avatarSet={bot.avatarSet}
                      color={bot.color}
                      identity={bot.id}
                      size={14}
                      status={bot.status}
                    />
                  ) : null}
                  <span className="truncate">{bot?.name ?? t`Bot`}</span>
                </>
              ) : (
                <span>
                  <Trans>You</Trans>
                </span>
              )}
              <span className="shrink-0">{formatRelativeTime(item.createdAt)}</span>
            </span>
          </span>
          <span className="shrink-0 text-label text-muted-foreground">
            {formatFileSize(item.size)}
          </span>
        </Link>
      </li>
    );
  }

  return (
    <div data-testid="group-files" className="flex flex-col gap-3">
      {searchable ? (
        <ListSearchInput
          query={search}
          setQuery={setSearch}
          label={t`Search files`}
          placeholder={t`Search files…`}
        />
      ) : null}
      {loadError ? (
        <div role="alert" className="flex flex-col items-start gap-2 px-1 py-2">
          <p className="text-body-sm text-destructive">{loadError}</p>
          <Button size="sm" variant="outline" onClick={() => void listing.refetch()}>
            <Trans>Try again</Trans>
          </Button>
        </div>
      ) : listing.isPending && !listing.data ? (
        <div className="grid place-items-center py-6 text-muted-foreground">
          <Spinner />
        </div>
      ) : items && items.length > 0 ? (
        <ul className="flex flex-col">{items.map(row)}</ul>
      ) : query ? (
        <p className="px-2 py-1 text-body-sm text-muted-foreground">
          <Trans>No files match “{query}”.</Trans>
        </p>
      ) : (
        <p className="px-2 py-1 text-body-sm text-muted-foreground">
          <Trans>Files shared in this chat appear here.</Trans>
        </p>
      )}
      {listing.hasNextPage ? (
        <Button
          variant="ghost"
          size="sm"
          className="self-start"
          disabled={listing.isFetchingNextPage}
          onClick={() => void listing.fetchNextPage()}
        >
          <Trans>Show more</Trans>
        </Button>
      ) : null}
    </div>
  );
}
