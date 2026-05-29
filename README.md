# Zesty.io + VS Code Plugin + Bootstrap SCSS Workflow

Content.one website repo that uses Zesty.io as the CMS, Bootstrap via SCSS with https://block.codescandy.com/, npm to compile custom SCSS, preview on the Zesty preview domain.

* **Project board:** https://coda.io/d/Bobaks-Coda-Playground_d8OzrmMloaj/Content-One-Website_suQ9vSaa#_lue45cnD
* **Figma file:** https://www.figma.com/design/S2eLYQT6Q3Jfq4ZwFqQT8K/Content.One-Site---Template?node-id=10-2973&p=f&t=VgQjdLLe6W6hdylf-0
* **Component Library:** https://block.codescandy.com/blocks/about.html
* **Preview URL:** https://hj5v68xn-dev.webengine.zesty.io/
* **Prod URL:** https://www.content.one

⸻

1) Prerequisites
	•	Node.js (LTS) and npm installed
	•	VS Code
	•	Zesty.io VS Code extension installed: Extensions → search “Zesty.io” → Install
	•	A Zesty instance with access to the Manager and Code Editor

⸻

1) Project structure 

website/
├─ scss/
│  ├─ _variables.scss   # your Bootstrap variable overrides
│  └─ main.scss         # your main bundle entry
├─ webengine/       # all files in here are synced to zesty instance
│  └─ views/
│     └─ assets/theme.css      # compiled output (generated)
│  └─ scripts/
│  └─ styles/
├─ package.json
└─ README.md
⸻


3) Install dependencies

In your project root:

npm init -y
npm i -D sass
npm i bootstrap

	•	sass compiles SCSS → CSS
	•	bootstrap gives you the SCSS source you can customize

⸻

4) Configure npm script

Add a compilescss script to your package.json:

{
  "scripts": {
    "compilescss": "sass scss/main.scss webengine/views/assets/theme.css --style=compressed --no-source-map"
  }
}

This compiles scss/main.scss into webengine/views/assets/theme.css.

⸻

5) SCSS setup

Edit scss/_variables.scss to change design variables


1) Compile SCSS → CSS

Run:

npm run compilescss

This generates/updates: webengine/views/assets/theme.css.

⸻

7) Local sanity check

Open the compiled file locally to verify it exists and looks correct:

webengine/views/assets/theme.css

You can also use a local HTML tester that references webengine/views/assets/theme.css to quickly confirm styles.

⸻

8) Preview in Zesty
	1.	Visit the Zesty preview URL: https://hj5v68xn-dev.webengine.zesty.io/
	2.	Enter password: bobby
	3.	Verify your changes once you’ve pasted the CSS (next step) and published.

⸻

9) Publish Compiled CSS via Zesty Manager Code Editor
	1.	Open the Zesty Manager Code Editor to the target file:
https://8-98969f9fe2-5w3x3g.manager.zesty.io/code/file/views/11-9ad6dec9d3-9znmtm
	2.	Open webengine/assets/theme.css locally and copy all contents.
	3.	Paste the CSS into the file in Zesty Manager.
	4.	Save in the Manager.
	5.	Publish when you’ve tested on the preview domain and you’re happy.

Tip: Keep a changelog or commit history so you can revert quickly if needed.

⸻

10) (Optional) Using the Zesty.io VS Code Extension

While the steps above use a manual copy/paste for the CSS, the VS Code extension can streamline working with content and files:
	•	Sign in to your Zesty account in the extension.
	•	Connect to your instance.
	•	Browse/Edit views, partials, and assets directly from VS Code.
	•	Sync & Save: Depending on your workflow, you can push updates to Zesty without leaving the editor.

If your team prefers manual pasting for theme.css, keep using the steps in section 9 to avoid accidental overwrites.

⸻

## Deployment Automation

Instead of pasting code by hand, this repo can sync `webengine/` files to the Zesty instance automatically via a GitHub Action (`.github/workflows/zesty-deploy.yml` + `scripts/sync-to-zesty.js`). The script reads `zesty.config.json`, which maps each local file to its Zesty resource ZUID, and `PUT`s the file contents to the Instance API.

### Branch model

Work flows `local → stage → production`:

* **`local`** — where you do your work. No automation runs here.
* **`stage`** — merge `local` (or any branch) into `stage` to **save/update** the changed files on the instance (no publish). Preview them on the dev domain.
* **`production`** — merge `stage` into `production` to **save *and* publish** the changed files live.

### Changed files only

On each push the Action diffs against the pre-push commit (`github.event.before`) and only touches files that actually changed in that merge — so promoting `stage → production` publishes just the changed files. Edge cases are handled safely:

* First push to a branch (no previous commit to diff against) falls back to a **full sync**.
* Run the workflow manually (Actions → *Deploy to Zesty.io* → *Run workflow*) with **full_sync = true** to re-sync every mapped file, or **publish = true** to force a publish.

### Required GitHub Actions secrets

Set these in repo → Settings → Secrets and variables → Actions:

* `ZESTY_INSTANCE_ZUID` — the instance ID (`8-98969f9fe2-5w3x3g`)
* `ZESTY_DEVELOPER_TOKEN` — a Zesty developer/instance-API token with write access to that instance

### Local testing

```
npm run deploy:dry    # dry run — resolves files, makes no API calls
```

