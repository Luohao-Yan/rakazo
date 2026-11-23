const siteUrl = import.meta.env.PUBLIC_SITE_URL?.trim();
const appUrl = import.meta.env.PUBLIC_APP_URL?.trim();

export const SITE_NAME = "AgentForge";
export const SITE_URL = siteUrl || "http://localhost:4321";
export const SITE_DESCRIPTION =
  "AgentForge is an open source Grok Bot alternative for persistent AI teammates that do real work. Your keys, your model, your machine.";

export const APP_URL = appUrl || "http://localhost:3000";
export const PLUGIN_SUBMISSIONS_URL = `${APP_URL}/api/v1/plugin-submissions`;
export const INTEGRATION_CLAIMS_URL = `${APP_URL}/api/v1/integration-claims`;
export const CATALOG_URL = import.meta.env.PUBLIC_CATALOG_URL?.trim() || "";
export const GITHUB_URL = "https://github.com/Luohao-Yan/rakazo";
export const IOS_APP_URL = "https://apps.apple.com/app/agentforge/id0000000000";
export const GITHUB_API_REPO = "https://api.github.com/repos/Luohao-Yan/rakazo";
export const DOCS_URL = "https://github.com/Luohao-Yan/rakazo/blob/main/docs/self-host.md";
export const SELF_HOST_SECRETS_URL =
  "https://github.com/Luohao-Yan/rakazo/blob/main/docs/self-host-secrets.md";
export const SELF_HOST_RESTRICTED_URL =
  "https://github.com/Luohao-Yan/rakazo/blob/main/docs/self-host-restricted-network.md";
export const SETUP_PROMPT_URL = "https://github.com/Luohao-Yan/rakazo/blob/main/SETUP_PROMPT.md";
export const SELF_HOST_GUIDE_PATH = "/self-hosted-ai-agent/";
export const PLUGIN_SUBMIT_PATH = "/plugins/submit/";
export const OPENCLAW_ALTERNATIVE_PATH = "/openclaw-alternative/";
export const AFFILIATE_PROGRAM_URL = "https://agentforge.example.com/affiliates";
export const CHANGELOG_URL = "https://github.com/Luohao-Yan/rakazo/releases";
export const LATEST_RELEASE_URL = `${CHANGELOG_URL}/latest`;
export const INBOX_ZERO_URL = "https://agentforge.example.com";
export const X_URL = "https://x.com/agentforge";
export const DISCORD_URL = "https://discord.gg/agentforge";
