# Content.One Website — Claude Code Guide

This is the Content.One marketing site, deployed via [Zesty.io WebEngine](https://www.zesty.io/). Source files live under `webengine/` (`views/`, `styles/`, `scripts/`). Routing and page composition use Zesty's Parsley templating (`{{include /...}}`, `{{if ...}}`, `{{globals.X}}`, `{{this.X}}`).

Branch model: feature → `stage` → `production`. Production merges require explicit operator permission.

## Local helper: `scripts/c1-agent.sh`

A read-only CLI wrapper around the [agent.content.one](https://agent.content.one/documentation/) API. Use it for **lookups during interactive Claude Code sessions** — preview hostnames, content-model and view ZUIDs, AI context files, token spend, recent agent history, etc. Output is raw JSON; pipe through `jq`.

### Setup

The script reads credentials from these locations (env wins over file):

| Credential | Env var | File fallback |
|---|---|---|
| Instance ZUID | `ZESTY_INSTANCE_ZUID` | `instance_zuid` in `zesty.config.json` (already present) |
| Editor token | `C1_AGENT_TOKEN` | `zesty.editor.token` in `.vscode/settings.json` (gitignored — you create it locally) |

Your `.vscode/settings.json` should contain at minimum:

```json
{
  "zesty.editor.token": "PTK-..."
}
```

Get the PTK from the Zesty dashboard for the instance you're working on. `.vscode/` is gitignored, so the token stays on your machine.

### Subcommands

```
scripts/c1-agent.sh help            # full reference
scripts/c1-agent.sh whoami          # echo instance ZUID (no remote call)
scripts/c1-agent.sh health          # API health probe (no auth)
scripts/c1-agent.sh models          # non-block content models
scripts/c1-agent.sh views           # template views
scripts/c1-agent.sh instance-data   # settings + preview password (zpw)
scripts/c1-agent.sh domain          # canonical preview hostname
scripts/c1-agent.sh context         # AI brand/writing/images/coding context files
scripts/c1-agent.sh tokens          # Claude + DALL-E usage by request
scripts/c1-agent.sh history         # recent agent conversation messages
scripts/c1-agent.sh stored-logs     # persisted log groups
```

### Common patterns

**Build a branch preview URL** (instead of hardcoding `hj5v68xn-<branch>...`):

```bash
HOST="$(scripts/c1-agent.sh domain | jq -r .domain | sed "s/-dev\$/-$(git branch --show-current)/")"
ZPW="$(scripts/c1-agent.sh instance-data | jq -r .zpw)"
echo "https://$HOST/your/path/?zpw=$ZPW"
```

**Find a view's ZUID by filename** (to wire into `zesty.config.json`):

```bash
scripts/c1-agent.sh views | jq '.[] | select(.fileName | contains("cms-for-franchise-chains"))'
```

**Read the agent's writing/brand voice before drafting marketing copy:**

```bash
scripts/c1-agent.sh context | jq -r '.context.writing.code'
scripts/c1-agent.sh context | jq -r '.context.brand.code'
```

**Token-spend snapshot:**

```bash
scripts/c1-agent.sh tokens | jq '[.[] | .claudeTokens // 0] | add'
```

### Important: read-only by design

The script intentionally exposes **no** write actions. There are no subcommands for `/client/message`, `/client/approve`, `/client/approve-view`, `/client/schema/confirm`, etc. Production-affecting mutations stay manual + operator-gated.

If a workflow needs writes, raise it explicitly — don't extend this script.

## Other conventions

- **Industry pages** live at `webengine/views/page_html/industries/<slug>.html` and are loader-wrapped by `webengine/views/industries` (which provides nav + footer). Page files contain body content only.
- **Standalone top-level `*.html`** endpoints in `webengine/views/` bypass the loader — they must ship their own `<!DOCTYPE>`, `<head>`, Tailwind CDN config, nav, and footer (see `mcp-press-release.html` for the pattern).
- **Customer logos / brand colors:** real customers only (Sony, Salvation Army, Singlife, Phoenix Suns, Wattpad). Don't fabricate stats, quotes, or logos. Brand tokens: `royal #4255BD`, `royalDark #2F3F94`, `royalLite #8C9BE6`, `ink #0B0F1C`.
- **Sync to Zesty:** `scripts/sync-to-zesty.js` runs in CI on push to `stage`/`production`. Don't run it locally unless you know what you're doing.
