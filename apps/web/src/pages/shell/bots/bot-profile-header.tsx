import type { Bot } from "@rakazo/contracts";
import { BotAvatar } from "@rakazo/ui-web";
import { BotEmailAddressField } from "../../../components/BotEmailAddressField";

/** The bot's avatar, name and email address, above its tabs. */
export function BotProfileHeader({
  bot,
  name,
  color,
  avatarSet,
  email,
  claimingEmail,
}: {
  bot: Pick<Bot, "id" | "status">;
  name: string;
  color: string;
  avatarSet?: Bot["avatarSet"];
  email?: { address: string | null; domain: string } | null;
  claimingEmail: boolean;
}) {
  return (
    <div data-testid="bot-profile-header" className="flex flex-col items-center pb-5 text-center">
      <div className="flex justify-center pb-4">
        <BotAvatar
          color={color}
          identity={bot.id}
          status={bot.status}
          size={76}
          avatarSet={avatarSet}
        />
      </div>
      <div className="break-words px-2 text-heading2 font-semibold">{name}</div>
      {email && (email.address || claimingEmail) ? (
        <div data-testid="bot-email" className="mt-2 w-full max-w-sm text-left">
          <BotEmailAddressField
            bot={{ id: bot.id, name }}
            domain={email.domain}
            address={email.address}
          />
        </div>
      ) : null}
    </div>
  );
}
