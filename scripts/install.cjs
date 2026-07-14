#!/usr/bin/env node
/**
 * Symlink this package's skills/ into agent skill directories.
 *
 * Run after install: `npx storyteller-skills` or `storyteller-skills` (global).
 *
 * Important: when npm installs from a git URL, the package may briefly live under
 * ~/.npm/_cacache/tmp/git-clone*. Never symlink from that path — resolve the
 * durable node_modules (or global) install location instead.
 */

const fs = require("fs");
const path = require("path");
const os = require("os");
const { createRequire } = require("module");
const { execSync } = require("child_process");

const PKG_NAME = "storyteller-skills";

function isTempNpmClone(p) {
  const norm = p.split(path.sep).join("/");
  return (
    norm.includes("/_cacache/tmp/") ||
    norm.includes("/git-clone") ||
    norm.includes("/.npm/_cacache/")
  );
}

function isInsideNodeModules(p) {
  return p.split(path.sep).includes("node_modules");
}

function hasSkills(dir) {
  return fs.existsSync(path.join(dir, "skills", "storyteller-start", "SKILL.md"));
}

/**
 * Resolve the durable installed package root (not npm's ephemeral git clone).
 */
function resolvePackageRoot() {
  const candidates = [];

  // 1) require.resolve from INIT_CWD / cwd (final node_modules)
  const searchBases = [
    process.env.INIT_CWD,
    process.cwd(),
    process.env.npm_config_prefix
      ? path.join(process.env.npm_config_prefix, "lib")
      : null,
  ].filter(Boolean);

  for (const base of searchBases) {
    try {
      const req = createRequire(path.join(base, "package.json"));
      const pkgJson = req.resolve(`${PKG_NAME}/package.json`);
      candidates.push(path.dirname(pkgJson));
    } catch {
      // not installed relative to this base
    }
  }

  // 2) Walk up from cwd looking for node_modules/storyteller-skills
  let dir = process.env.INIT_CWD || process.cwd();
  for (let i = 0; i < 12; i++) {
    const nm = path.join(dir, "node_modules", PKG_NAME);
    if (hasSkills(nm)) candidates.push(nm);
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  // 3) Global npm root
  try {
    const globalRoot = execSync("npm root -g", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    const globalPkg = path.join(globalRoot, PKG_NAME);
    if (hasSkills(globalPkg)) candidates.push(globalPkg);
  } catch {
    // ignore
  }

  // 4) __dirname fallback (dev checkout / already-durable install)
  const fromScript = path.resolve(__dirname, "..");
  if (hasSkills(fromScript)) candidates.push(fromScript);

  const durable = candidates.find((c) => hasSkills(c) && !isTempNpmClone(c));
  if (durable) return path.resolve(durable);

  // Last resort: script location even if temp (will warn)
  return path.resolve(fromScript);
}

function projectRoot(pkgRoot) {
  if (process.env.INIT_CWD) return process.env.INIT_CWD;
  if (isInsideNodeModules(pkgRoot) && !isTempNpmClone(pkgRoot)) {
    let dir = path.dirname(pkgRoot);
    if (path.basename(dir).startsWith("@")) dir = path.dirname(dir);
    if (path.basename(dir) === "node_modules") return path.dirname(dir);
  }
  return process.cwd();
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function listSkills(skillsRoot) {
  if (!fs.existsSync(skillsRoot)) {
    console.warn(`[storyteller-skills] No skills/ directory at ${skillsRoot}`);
    return [];
  }
  return fs
    .readdirSync(skillsRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((name) => fs.existsSync(path.join(skillsRoot, name, "SKILL.md")));
}

/**
 * Remove dest safely on macOS (broken symlinks + fs.rmSync "equivalent" crashes).
 */
function removeDest(dest) {
  try {
    const stat = fs.lstatSync(dest);
    if (stat.isSymbolicLink()) {
      fs.unlinkSync(dest);
      return;
    }
    if (stat.isDirectory()) {
      fs.rmSync(dest, { recursive: true, force: true });
      return;
    }
    fs.unlinkSync(dest);
  } catch (err) {
    if (err && err.code === "ENOENT") return;
    // Broken symlink: lstat may throw on some paths — try unlink anyway
    try {
      fs.unlinkSync(dest);
    } catch {
      try {
        fs.rmSync(dest, { recursive: true, force: true });
      } catch {
        // leave for symlinkSync to fail loudly
      }
    }
  }
}

function linkSkill(skillsRoot, targetDir, skillName) {
  ensureDir(targetDir);
  const dest = path.join(targetDir, skillName);
  const src = path.join(skillsRoot, skillName);

  if (!fs.existsSync(src)) {
    console.warn(`[storyteller-skills] Missing skill source: ${src}`);
    return "failed";
  }

  removeDest(dest);

  try {
    fs.symlinkSync(src, dest, "dir");
    // Verify target exists (catches temp-clone mistakes immediately)
    if (!fs.existsSync(dest)) {
      console.warn(
        `[storyteller-skills] Linked but target missing (broken): ${dest} → ${src}`
      );
      return "failed";
    }
    return "linked";
  } catch (err) {
    try {
      removeDest(dest);
      fs.cpSync(src, dest, { recursive: true });
      return "copied";
    } catch (copyErr) {
      console.warn(
        `[storyteller-skills] Failed to install ${skillName} → ${dest}: ${copyErr.message || err.message}`
      );
      return "failed";
    }
  }
}

function agentTargets(root) {
  return [
    path.join(root, ".cursor", "skills"),
    path.join(root, ".claude", "skills"),
    path.join(root, ".codex", "skills"),
    path.join(root, ".agents", "skills"),
  ];
}

function globalTargets() {
  const home = os.homedir();
  return [
    path.join(home, ".cursor", "skills"),
    path.join(home, ".claude", "skills"),
    path.join(home, ".codex", "skills"),
    path.join(home, ".agents", "skills"),
  ];
}

function main() {
  const pkgRoot = resolvePackageRoot();
  const skillsRoot = path.join(pkgRoot, "skills");

  if (isTempNpmClone(pkgRoot)) {
    console.error(
      `[storyteller-skills] Refusing to link from npm temp clone:\n  ${pkgRoot}\n` +
        `Wait until the package is in node_modules, then re-run: npx storyteller-skills`
    );
    process.exitCode = 1;
    return;
  }

  if (!hasSkills(pkgRoot)) {
    console.error(
      `[storyteller-skills] Could not find installed package with skills/.\n` +
        `Tried to use: ${pkgRoot}\n` +
        `Install first: npm install github:timobuilds/storytelling-skill\n` +
        `Then run:      npx storyteller-skills`
    );
    process.exitCode = 1;
    return;
  }

  const skills = listSkills(skillsRoot);
  if (skills.length === 0) {
    process.exitCode = 0;
    return;
  }

  const root = projectRoot(pkgRoot);
  const npmGlobal =
    process.env.npm_config_global === "true" ||
    process.env.npm_config_global === "1";
  const invokedAsBin =
    process.argv[1] &&
    (process.argv[1].includes(`${path.sep}storyteller-skills`) ||
      path.basename(process.argv[1]) === "storyteller-skills");
  const wantGlobal =
    npmGlobal ||
    process.env.STORYTELLER_SKILLS_GLOBAL === "1" ||
    process.argv.includes("--global") ||
    process.argv.includes("-g") ||
    (invokedAsBin && isInsideNodeModules(pkgRoot));

  const targets = [];
  if (wantGlobal || !isInsideNodeModules(pkgRoot)) {
    for (const t of globalTargets()) {
      if (!targets.includes(t)) targets.push(t);
    }
  }
  if (!npmGlobal || process.argv.includes("--project")) {
    for (const t of agentTargets(root)) {
      if (!targets.includes(t)) targets.push(t);
    }
  }

  let ok = 0;
  let fail = 0;
  console.log(`[storyteller-skills] Package: ${pkgRoot}`);
  console.log(
    `[storyteller-skills] Installing ${skills.length} skills → ${wantGlobal ? "global (+ project)" : root}`
  );

  for (const target of targets) {
    for (const name of skills) {
      const result = linkSkill(skillsRoot, target, name);
      if (result === "failed") fail += 1;
      else ok += 1;
    }
  }

  console.log(
    `[storyteller-skills] Done — ${ok} install(s)${fail ? `, ${fail} failed` : ""}`
  );
  console.log(
    `[storyteller-skills] Front door: storyteller-start · Recipes: stories-that-* · Reference: storyteller-tactics`
  );

  if (fail > 0) process.exitCode = 1;
}

main();
