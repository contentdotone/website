const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const INSTANCE_ZUID = process.env.ZESTY_INSTANCE_ZUID;
const TOKEN = process.env.ZESTY_DEVELOPER_TOKEN;
const BRANCH = process.env.BRANCH || 'stage';
const MANUAL_PUBLISH = process.env.MANUAL_PUBLISH === 'true';
const DRY_RUN = process.env.DRY_RUN === 'true' || process.argv.includes('--dry-run');
// Branch model: merges into `stage` save files; merges into `production`
// save+publish them. By default only files changed by the push are touched
// (DIFF_BASE = the pre-push SHA); FULL_SYNC=true processes every mapped file.
const FULL_SYNC = process.env.FULL_SYNC === 'true' || process.argv.includes('--full');

const CONFIG_PATH = path.join(process.cwd(), 'zesty.config.json');
const WEBENGINE_DIR = path.join(process.cwd(), 'webengine');

// Maps each config section to its on-disk folder and the Zesty API resource path.
const SECTIONS = {
  views: { dir: 'views', endpoint: 'views' },
  styles: { dir: 'styles', endpoint: 'stylesheets' },
  scripts: { dir: 'scripts', endpoint: 'scripts' },
};

function loadConfig() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  } catch (err) {
    console.error(`❌ Could not read ${CONFIG_PATH}: ${err.message}`);
    process.exit(1);
  }
}

// A config key may be a bare name ("home_page") or a path ("/components/header.html").
// Both resolve under webengine/<sectionDir>/. Guard against escaping that folder.
function resolveLocalPath(sectionDir, key) {
  const rel = key.replace(/^\/+/, '');
  const base = path.join(WEBENGINE_DIR, sectionDir);
  const full = path.join(base, rel);
  if (full !== base && !full.startsWith(base + path.sep)) {
    throw new Error(`Refusing path outside ${sectionDir}/: ${key}`);
  }
  return full;
}

function buildManifest(config) {
  const instance = config.instance || {};
  const items = [];
  for (const [section, meta] of Object.entries(SECTIONS)) {
    const entries = instance[section] || {};
    for (const [key, info] of Object.entries(entries)) {
      if (!info || !info.zuid) {
        console.warn(`⚠️  Skipping ${section}/${key}: missing zuid`);
        continue;
      }
      items.push({
        section,
        key,
        zuid: info.zuid,
        endpoint: meta.endpoint,
        localPath: resolveLocalPath(meta.dir, key),
      });
    }
  }
  return items;
}

// Repo-relative paths changed between DIFF_BASE and DIFF_HEAD. Returns null when
// there is no usable base to diff against (first push to a branch → DIFF_BASE is
// all-zeros; shallow clone; manual dispatch) so the caller falls back to a full
// sync. execFileSync (no shell) avoids any injection.
function changedFilePaths() {
  const base = process.env.DIFF_BASE;
  const head = process.env.DIFF_HEAD || 'HEAD';
  const isZero = (s) => !s || /^0+$/.test(s);
  if (isZero(base)) return null;
  try {
    const out = execFileSync('git', ['diff', '--name-only', base, head], {
      cwd: process.cwd(),
      encoding: 'utf8',
    });
    return new Set(out.split('\n').map((s) => s.trim()).filter(Boolean));
  } catch {
    return null;
  }
}

async function apiRequest(method, endpointPath, body) {
  const url = `https://${INSTANCE_ZUID}.api.zesty.io/v1${endpointPath}`;
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${method} ${endpointPath} → ${res.status} ${text}`);
  }
  return res;
}

// Zesty saves a web resource with PUT /web/<type>/<zuid> and publishes it in
// the same call via ?action=publish&purge_cache=true (a {code} body retains
// the resource's existing filename/type).
async function saveItem(item, publish) {
  const rel = path.relative(process.cwd(), item.localPath);
  if (!fs.existsSync(item.localPath)) {
    console.warn(`⚠️  Missing local file, skipping: ${rel}`);
    return false;
  }
  const code = fs.readFileSync(item.localPath, 'utf8');
  const query = publish ? '?action=publish&purge_cache=true' : '';
  const verb = publish ? 'Save+publish' : 'Save';
  console.log(`${publish ? '🚀' : '💾'} ${DRY_RUN ? '[dry-run] ' : ''}${verb} ${rel} → ${item.endpoint}/${item.zuid}`);
  if (!DRY_RUN) {
    await apiRequest('PUT', `/web/${item.endpoint}/${item.zuid}${query}`, { code });
  }
  return true;
}

async function main() {
  if (!DRY_RUN && (!INSTANCE_ZUID || !TOKEN)) {
    console.error('❌ Missing ZESTY_INSTANCE_ZUID or ZESTY_DEVELOPER_TOKEN in environment');
    process.exit(1);
  }

  const config = loadConfig();
  const manifest = buildManifest(config);
  const shouldPublish = BRANCH === 'production' || MANUAL_PUBLISH;

  let items = manifest;
  let scope = `full (${manifest.length} mapped)`;
  if (!FULL_SYNC) {
    const changed = changedFilePaths();
    if (changed === null) {
      console.warn('⚠️  Could not determine changed files — falling back to a full sync.');
    } else {
      items = manifest.filter((it) => changed.has(path.relative(process.cwd(), it.localPath)));
      scope = `changed (${items.length} of ${manifest.length} mapped)`;
    }
  }

  console.log(
    `🚀 Zesty sync | branch=${BRANCH} | publish=${shouldPublish} | dry-run=${DRY_RUN} | scope=${scope}`
  );

  let synced = 0;
  for (const item of items) {
    if (await saveItem(item, shouldPublish)) synced++;
  }

  console.log(
    `\n🎉 Zesty sync complete — ${shouldPublish ? 'saved+published' : 'saved'} ${synced}/${items.length} selected file(s).`
  );
}

main().catch((err) => {
  console.error('💥 Error:', err.message);
  process.exit(1);
});
