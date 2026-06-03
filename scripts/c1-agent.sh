#!/usr/bin/env bash
# scripts/c1-agent.sh — read-only lookups against agent.content.one
#
# Usage:
#   scripts/c1-agent.sh <command> [args]
#
# Credential resolution (in order):
#   ZUID:  $ZESTY_INSTANCE_ZUID env  →  .instance_zuid in zesty.config.json
#   Token: $C1_AGENT_TOKEN env       →  .["zesty.editor.token"] in .vscode/settings.json
#
# Output is raw JSON from the API. Pipe through `jq` for human-readable output.
#
# Write actions (create / edit / publish / approve) are intentionally NOT exposed
# here — production-bound mutations stay manual + operator-gated.

set -euo pipefail

BASE="${C1_AGENT_BASE:-https://agent.content.one}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

usage() {
  cat <<EOF
Usage: $(basename "$0") <command> [args]

Read-only commands:
  models           GET /client/models — list non-block content models
  views            GET /client/views — list template views
  instance-data    GET /client/instance-data — settings, preview password (zpw)
  domain           GET /client/webengine-domain — preview hostname
  context          GET /client/context — AI context files (brand/writing/images/coding)
  tokens           GET /client/stored-tokens/:zuid — Claude + DALL-E usage by request
  history          GET /client/history/:zuid — recent conversation messages
  stored-logs      GET /client/stored-logs/:zuid — persisted log groups
  health           GET /health — no-auth probe
  whoami           Echo the resolved instance ZUID (no remote call)

Environment:
  ZESTY_INSTANCE_ZUID, C1_AGENT_TOKEN, C1_AGENT_BASE
  Fallbacks: zesty.config.json :: instance_zuid
             .vscode/settings.json :: "zesty.editor.token"

Output is raw JSON. Pipe through jq for readable output:
  $(basename "$0") models | jq '.[] | {ZUID, name}'
EOF
}

cmd="${1:-help}"
shift || true

# Subcommands that don't need any credentials
case "$cmd" in
  help|-h|--help) usage; exit 0 ;;
  health)         curl -sfS "$BASE/health"; exit 0 ;;
esac

# ── Load credentials (lazy — only for commands that hit /client/*) ──────
ZUID="${ZESTY_INSTANCE_ZUID:-}"
if [[ -z "$ZUID" && -r "$REPO_ROOT/zesty.config.json" ]]; then
  ZUID="$(jq -r '.instance_zuid // empty' "$REPO_ROOT/zesty.config.json" 2>/dev/null || true)"
fi

if [[ -z "$ZUID" ]]; then
  echo "ERROR: instance ZUID not found. Set ZESTY_INSTANCE_ZUID or add instance_zuid to zesty.config.json." >&2
  exit 1
fi

# whoami only needs the ZUID
if [[ "$cmd" == "whoami" ]]; then
  echo "$ZUID"
  exit 0
fi

TOKEN="${C1_AGENT_TOKEN:-}"
if [[ -z "$TOKEN" && -r "$REPO_ROOT/.vscode/settings.json" ]]; then
  TOKEN="$(jq -r '.["zesty.editor.token"] // empty' "$REPO_ROOT/.vscode/settings.json" 2>/dev/null || true)"
fi

if [[ -z "$TOKEN" ]]; then
  echo "ERROR: editor token not found. Set C1_AGENT_TOKEN or add zesty.editor.token to .vscode/settings.json." >&2
  exit 1
fi

auth_get() {
  curl -sfS -H "Authorization: Bearer $TOKEN" "$BASE$1"
}

case "$cmd" in
  models)                    auth_get "/client/models?instance_zuid=$ZUID" ;;
  views)                     auth_get "/client/views?instance_zuid=$ZUID" ;;
  instance-data)             auth_get "/client/instance-data?instance_zuid=$ZUID" ;;
  domain|webengine-domain)   auth_get "/client/webengine-domain?instance_zuid=$ZUID" ;;
  context)                   auth_get "/client/context?instance_zuid=$ZUID" ;;
  tokens|stored-tokens)      auth_get "/client/stored-tokens/$ZUID" ;;
  history)                   auth_get "/client/history/$ZUID" ;;
  stored-logs)               auth_get "/client/stored-logs/$ZUID" ;;
  *)
    echo "Unknown command: $cmd" >&2
    usage >&2
    exit 2
    ;;
esac
