#!/usr/bin/env node
/**
 * Symlink this package's skills/ into agent skill directories.
 *
 * Runs on `npm install` (postinstall) and via `npx storyteller-skills`.
 * Uses INIT_CWD when installed as a dependency so links land in the
 * consumer project, not inside node_modules.
 */

const fs = require("fs");
const path = require("path");
const os = require("os");

const pkgRoot = path.resolve(__dirname, "..");
const skillsRoot = path.join(pkgRoot, "skills");

function isInsideNodeModules(p) {
  return p.split(path.sep).includes("node_modules");
}

function projectRoot() {
  if (process.env.INIT_CWD && isInsideNodeModules(pkgRoot)) {
    return process.env.INIT_CWD;
  }
  if (isInsideNodeModules(pkgRoot)) {
    // node_modules/storyteller-skills or node_modules/@scope/pkg
    let dir = path.dirname(pkgRoot);
    if (path.basename(dir).startsWith("@")) dir = path.dirname(dir);
    if (path.basename(dir) === "node_modules") return path.dirname(dir);
  }
  return pkgRoot;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function listSkills() {
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

function linkSkill(targetDir, skillName) {
  ensureDir(targetDir);
  const dest = path.join(targetDir, skillName);
  const src = path.join(skillsRoot, skillName);

  try {
    const stat = fs.lstatSync(dest);
    if (stat.isSymbolicLink() || stat.isDirectory() || stat.isFile()) {
      fs.rmSync(dest, { recursive: true, force: true });
    }
  } catch {
    // missing — fine
  }

  try {
    fs.symlinkSync(src, dest, "dir");
    return "linked";
  } catch (err) {
    // Windows / restricted envs: copy instead
    try {
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
  const rel = [
    [".cursor", "skills"],
    [".claude", "skills"],
    [".codex", "skills"],
    [".agents", "skills"],
  ];
  return rel.map((parts) => path.join(root, ...parts));
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
  const skills = listSkills();
  if (skills.length === 0) {
    process.exitCode = 0;
    return;
  }

  const root = projectRoot();
  const wantGlobal =
    process.env.STORYTELLER_SKILLS_GLOBAL === "1" ||
    process.argv.includes("--global") ||
    process.argv.includes("-g");

  const targets = [...agentTargets(root)];
  if (wantGlobal) targets.push(...globalTargets());

  // Always also refresh globals when installing this repo itself (dev)
  if (!isInsideNodeModules(pkgRoot) || wantGlobal) {
    for (const t of globalTargets()) {
      if (!targets.includes(t)) targets.push(t);
    }
  }

  let ok = 0;
  let fail = 0;
  console.log(`[storyteller-skills] Installing ${skills.length} skills into agents under ${root}`);

  for (const target of targets) {
    for (const name of skills) {
      const result = linkSkill(target, name);
      if (result === "failed") fail += 1;
      else ok += 1;
    }
  }

  console.log(`[storyteller-skills] Done — ${ok} install(s)${fail ? `, ${fail} failed` : ""}`);
  console.log(
    `[storyteller-skills] Front door: storyteller-start · Recipes: stories-that-* · Reference: storyteller-tactics`
  );
}

main();
