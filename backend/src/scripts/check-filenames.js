"use strict";

/**
 * Filename convention checker
 * Ensures consistent, professional naming across the backend codebase.
 *
 * Rules:
 * - models/: kebab-case + .model.js (lowercase letters, digits, hyphens)
 * - controllers/: kebab-case path + .controller.js (mirrors models style)
 *   - legacy names ending in `Controller.js` are WARNED (to be removed)
 * - routes/: kebab-case .js (e.g., vendor-customers.js). No *.routes.js
 * - services/: ends with Service.js (no .service.js)
 * - middleware/: kebab-case .js (no .middleware.js)
 */

const fs = require("fs");
const path = require("path");

const SRC = path.join(__dirname, "..");

const errors = [];
const warnings = [];

function rel(p) {
  return path.relative(SRC, p).replace(/\\/g, "/");
}

function listFiles(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...listFiles(p));
    else out.push(p);
  }
  return out;
}

function checkModels() {
  const dir = path.join(SRC, "models");
  const files = listFiles(dir).filter((f) => f.endsWith(".js"));
  const kebabModel = /^[a-z0-9]+(?:-[a-z0-9]+)*\.model\.js$/;
  for (const f of files) {
    const name = path.basename(f);
    if (!kebabModel.test(name)) {
      errors.push(
        `models: ${rel(f)} should be kebab-case and end with .model.js`
      );
    }
  }
}

function checkControllers() {
  const dir = path.join(SRC, "controllers");
  const files = listFiles(dir).filter((f) => f.endsWith(".js"));
  const kebab = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  for (const f of files) {
    const relPath = rel(f);
    const name = path.basename(f);
    // Legacy CamelCase controller file
    if (/Controller\.js$/.test(name)) {
      warnings.push(
        `controllers: legacy file detected ${relPath} (should be migrated to kebab-case .controller.js and removed)`
      );
      continue;
    }

    // Must end with .controller.js
    if (!name.endsWith(".controller.js")) {
      errors.push(`controllers: ${relPath} should end with .controller.js`);
      continue;
    }

    // Validate kebab-case path segments and filename base
    const parts = relPath.replace(/^controllers\//, "").split("/");
    const fileName = parts[parts.length - 1];
    const base = fileName.replace(/\.controller\.js$/, "");
    const segsOk = parts.slice(0, -1).every((seg) => kebab.test(seg));
    if (!segsOk || !kebab.test(base)) {
      errors.push(
        `controllers: ${relPath} should be kebab-case path and filename, ending with .controller.js`
      );
    }
  }
}

function checkRoutes() {
  const dir = path.join(SRC, "routes");
  const files = listFiles(dir).filter((f) => f.endsWith(".js"));
  const kebab = /^([a-z0-9]+(?:-[a-z0-9]+)*)\.js$/;
  for (const f of files) {
    const name = path.basename(f);
    if (name.endsWith(".routes.js")) {
      errors.push(
        `routes: ${rel(f)} should not end with .routes.js (use kebab-case .js)`
      );
    }
    if (!kebab.test(name)) {
      errors.push(
        `routes: ${rel(f)} should be kebab-case (lowercase + hyphens) .js`
      );
    }
  }
}

function checkServices() {
  const dir = path.join(SRC, "services");
  const files = listFiles(dir).filter((f) => f.endsWith(".js"));
  for (const f of files) {
    const name = path.basename(f);
    if (name.endsWith(".service.js")) {
      errors.push(
        `services: ${rel(f)} should not end with .service.js (use *Service.js)`
      );
    }
    if (!/Service\.js$/.test(name)) {
      errors.push(`services: ${rel(f)} should end with *Service.js`);
    }
  }
}

function checkMiddleware() {
  const dir = path.join(SRC, "middleware");
  const files = listFiles(dir).filter((f) => f.endsWith(".js"));
  const lower = /^[a-z0-9]+(?:-[a-z0-9]+)*\.js$/;
  for (const f of files) {
    const name = path.basename(f);
    if (name.endsWith(".middleware.js")) {
      errors.push(`middleware: ${rel(f)} should not end with .middleware.js`);
    }
    if (!lower.test(name)) {
      errors.push(
        `middleware: ${rel(f)} should be lowercase (kebab allowed) .js`
      );
    }
  }
}

checkModels();
checkControllers();
checkRoutes();
checkServices();
checkMiddleware();

if (errors.length) {
  console.error("\nFilename convention errors:");
  for (const e of errors) console.error(" -", e);
  if (warnings.length) {
    console.warn("\nWarnings:");
    for (const w of warnings) console.warn(" -", w);
  }
  process.exit(1);
} else {
  if (warnings.length) {
    console.warn("All filenames conform, with warnings:");
    for (const w of warnings) console.warn(" -", w);
  } else {
    console.log("All filenames conform to the conventions.");
  }
}
