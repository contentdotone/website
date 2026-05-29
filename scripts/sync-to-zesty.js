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
// Hybrid verification: git diff picks candidates, then (when a token is present)
// the instance's current content is fetched and compared so no-op saves are
// skipped. NO_API_CHECK disables it.
const CAN_CHECK = !!(INSTANCE_ZUID && TOKEN) && process.env.NO_API_CHECK !== 'true';
const norm = (s) =>
  s == null ? '' : String(s).replace(/\r\n/g, '\n').replace(/[ \t]+$/gm, '').replace(/\n+$/, '');

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

// Read-only GET of a resource's current code in the instance (null if missing).
async function fetchCurrentCode(endpoint, zuid) {
  try {
    const url = `https://${INSTANCE_ZUID}.api.zesty.io/v1/web/${endpoint}/${zuid}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
    if (!res.ok) return null;
    const json = await res.json().catch(() => null);
    const d = (json && json.data) || {};
    return typeof d.code === 'string' ? d.code : null;
  } catch {
    return null;
  }
}

// Every file currently on disk under webengine/<section>/ (skips dotfiles).
function walkFiles(dir) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  const out = [];
  for (const e of entries) {
    if (e.name.startsWith('.')) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walkFiles(full));
    else if (e.isFile()) out.push(full);
  }
  return out;
}

// Files present on disk but not yet mapped in zesty.config.json — these need
// to be CREATED as instance resources (the branch preview renders them from
// GitHub, but they don't exist in the instance until created).
function findNewFiles(mappedPaths) {
  const news = [];
  for (const [section, meta] of Object.entries(SECTIONS)) {
    const base = path.join(WEBENGINE_DIR, meta.dir);
    for (const full of walkFiles(base)) {
      if (mappedPaths.has(full)) continue;
      news.push({ section, endpoint: meta.endpoint, localPath: full, rel: path.relative(base, full) });
    }
  }
  return news;
}

// Derive the Zesty fileName, resource type, and config key for a new file.
// Views with an extension are "endpoint" views (ajax-json, path-style fileName);
// extensionless views are snippets. Styles/scripts type comes from the extension.
function inferResource(section, rel) {
  const posix = rel.split(path.sep).join('/');
  const ext = path.extname(rel).toLowerCase();
  if (section === 'styles') {
    const type = ext === '.scss' ? 'text/scss' : ext === '.css' ? 'text/css' : 'text/less';
    return { fileName: posix, type, configKey: posix };
  }
  if (section === 'scripts') {
    return { fileName: posix, type: 'text/javascript', configKey: posix };
  }
  if (ext) {
    return { fileName: `/${posix}`, type: 'ajax-json', configKey: `/${posix}` };
  }
  return { fileName: posix, type: undefined, configKey: posix };
}

// Zesty wraps responses as { data: {...} } in most cases; be lenient.
function extractZuid(json) {
  const d = (json && json.data) || json || {};
  return d.ZUID || d.zuid || json.ZUID || json.zuid || null;
}

// POST /web/<endpoint> to create a brand-new resource, returning its new ZUID.
async function createNew(nf, publish) {
  const code = fs.readFileSync(nf.localPath, 'utf8');
  const { fileName, type, configKey } = inferResource(nf.section, nf.rel);
  const rel = path.relative(process.cwd(), nf.localPath);
  console.log(`✨ ${DRY_RUN ? '[dry-run] ' : ''}Create ${rel} → ${nf.endpoint} (fileName=${fileName}${type ? `, type=${type}` : ''})`);
  if (DRY_RUN) return { section: nf.section, configKey, zuid: 'DRYRUN-ZUID', type };
  const payload = type ? { code, fileName, type } : { code, fileName };
  const res = await apiRequest('POST', `/web/${nf.endpoint}`, payload);
  const json = await res.json().catch(() => ({}));
  const zuid = extractZuid(json);
  if (!zuid) {
    throw new Error(`Created ${rel} but no ZUID in response: ${JSON.stringify(json).slice(0, 200)}`);
  }
  console.log(`   → new ZUID ${zuid}`);
  if (publish) {
    await apiRequest('PUT', `/web/${nf.endpoint}/${zuid}?action=publish&purge_cache=true`, { code });
    console.log(`   → published ${zuid}`);
  }
  return { section: nf.section, configKey, zuid, type };
}

// Match the existing config's indentation so the writeback diff stays small.
function detectIndent(raw) {
  const m = raw.match(/\n([ \t]+)"/);
  return m ? m[1] : '  ';
}

function addToConfig(config, created) {
  const now = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  config.instance = config.instance || {};
  for (const c of created) {
    config.instance[c.section] = config.instance[c.section] || {};
    config.instance[c.section][c.configKey] = {
      zuid: c.zuid,
      type: c.type || 'snippet',
      updatedAt: now,
      createdAt: now,
    };
  }
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
  const dry = DRY_RUN ? '[dry-run] ' : '';

  // Hybrid check: compare repo content to the instance's current content.
  // On stage (no publish) an identical resource is skipped entirely. On
  // production we still publish identical content (the saved version may not be
  // live yet — stage/production share one instance, so it's already saved).
  if (CAN_CHECK) {
    const current = await fetchCurrentCode(item.endpoint, item.zuid);
    const same = current !== null && norm(current) === norm(code);
    if (same && !publish) {
      console.log(`✓ ${dry}Unchanged, skip ${rel} → ${item.endpoint}/${item.zuid}`);
      return false;
    }
    const why = same ? 'already saved' : 'differs';
    console.log(`${publish ? '🚀' : '💾'} ${dry}${publish ? 'Save+publish' : 'Save'} (${why}) ${rel} → ${item.endpoint}/${item.zuid}`);
  } else {
    console.log(`${publish ? '🚀' : '💾'} ${dry}${publish ? 'Save+publish' : 'Save'} ${rel} → ${item.endpoint}/${item.zuid}`);
  }

  if (!DRY_RUN) {
    const query = publish ? '?action=publish&purge_cache=true' : '';
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
  const indent = detectIndent(fs.readFileSync(CONFIG_PATH, 'utf8'));
  const manifest = buildManifest(config);
  const mappedPaths = new Set(manifest.map((m) => m.localPath));
  const shouldPublish = BRANCH === 'production' || MANUAL_PUBLISH;

  // Updates = files already mapped by ZUID; creates = on disk but not yet mapped.
  let items = manifest;
  let newFiles = findNewFiles(mappedPaths);
  let scope = `full (${manifest.length} mapped + ${newFiles.length} new)`;
  if (!FULL_SYNC) {
    const changed = changedFilePaths();
    if (changed === null) {
      console.warn('⚠️  Could not determine changed files — falling back to a full sync.');
    } else {
      const inScope = (p) => changed.has(path.relative(process.cwd(), p));
      items = manifest.filter((it) => inScope(it.localPath));
      newFiles = newFiles.filter((nf) => inScope(nf.localPath));
      scope = `changed (${items.length} update + ${newFiles.length} new, of ${manifest.length} mapped)`;
    }
  }

  console.log(
    `🚀 Zesty sync | branch=${BRANCH} | publish=${shouldPublish} | dry-run=${DRY_RUN} | scope=${scope}`
  );

  // Create new resources first so they exist + get ZUIDs, then map them back.
  const created = [];
  for (const nf of newFiles) {
    created.push(await createNew(nf, shouldPublish));
  }
  if (created.length && !DRY_RUN) {
    addToConfig(config, created);
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, indent) + '\n');
    console.log(`📝 Mapped ${created.length} new resource(s) into zesty.config.json.`);
  }

  // Update existing mapped resources.
  let synced = 0;
  for (const item of items) {
    if (await saveItem(item, shouldPublish)) synced++;
  }

  console.log(
    `\n🎉 Zesty sync complete — created ${created.length}, ${shouldPublish ? 'saved+published' : 'saved'} ${synced}/${items.length} mapped file(s).`
  );
}

main().catch((err) => {
  console.error('💥 Error:', err.message);
  process.exit(1);
});
