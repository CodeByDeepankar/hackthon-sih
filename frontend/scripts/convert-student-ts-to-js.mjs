import { promises as fs } from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.cwd(), 'src', 'student');

async function* walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(full);
    } else {
      yield full;
    }
  }
}

function transformContent(code, filePath) {
  let out = code;

  // Normalize EOLs
  out = out.replace(/\r\n/g, '\n');

  // Fix import specifiers with pinned versions (from copy-paste)
  out = out.replace(/@radix-ui\\/react-slot@[^\"']+/g, '@radix-ui/react-slot');
  out = out.replace(/class-variance-authority@[^\"']+/g, 'class-variance-authority');
  // Generic normalize for any @radix-ui/react-* pinned versions
  out = out.replace(/@radix-ui\\/(react-[^\"'@\s]+)@[^\"'\s]+/g, '@radix-ui/$1');

  // Remove `import type ...` lines entirely
  out = out.replace(/^\s*import\s+type\s+[^;]+;?\s*$/gm, '');

  // Remove `type` named imports, e.g. { cva, type VariantProps }
  out = out.replace(/\{([^}]+)\}/g, (m, inner) => {
    const cleaned = inner
      .split(',')
      .map(s => s.trim())
      .filter(s => s && !/^type\s+/.test(s))
      .join(', ');
    return `{ ${cleaned} }`;
  });

  // Convert clsx named import to default import
  out = out.replace(/import\s*\{\s*clsx\s*\}\s*from\s*["']clsx["'];?/g, "import clsx from 'clsx';");

  // Remove TS type aliases and interfaces
  out = out.replace(/^\s*type\s+\w+\s*=\s*[^;]+;?\s*$/gm, '');
  out = out.replace(/^\s*export\s+type\s+\w+\s*=\s*[^;]+;?\s*$/gm, '');
  out = out.replace(/^\s*interface\s+\w+[\s\S]*?\n\}/gm, '');
  out = out.replace(/^\s*export\s+interface\s+\w+[\s\S]*?\n\}/gm, '');

  // Remove generic annotations like useState<Type>(...)
  out = out.replace(/use(State|Ref|Memo|Callback)<[^>]+>\(/g, (m, g1) => `use${g1}(`);

  // Remove type assertions:  expr as SomeType (only when followed by ), ; , or newline)
  out = out.replace(/(\)|\w)\s+as\s+[A-Za-z0-9_<>{}\[\]\s.,|&?]+(?=[);,\n])/g, '$1');

  // Remove non-null assertions like `)!.' or `!)`
  out = out.replace(/\)!\./g, ').');
  out = out.replace(/\)!/g, ')');

  // Remove parameter type annotation after destructuring: `} : Something)` -> `})`
  out = out.replace(/\}\s*:\s*[^)]+\)/g, '})');

  // Remove return type annotations for arrow and function declarations
  out = out.replace(/\)\s*:\s*[^=\{\n]+(\s*=>)/g, '$1');
  out = out.replace(/function(\s+\w+)?\s*\([^)]*\)\s*:\s*[^\{\n]+\s*\{/g, (m) => m.replace(/:\s*[^\{\n]+/, ''));

  // Rewrite relative imports to new extensions
  out = out.replace(/(from\s+["'])(\.\.?\/[^"']+?)\.tsx(["'])/g, '$1$2.jsx$3');
  out = out.replace(/(from\s+["'])(\.\.?\/[^"']+?)\.ts(["'])/g, '$1$2.js$3');
  out = out.replace(/(require\(\s*["'])(\.\.?\/[^"']+?)\.tsx(["']\s*\))/g, '$1$2.jsx$3');
  out = out.replace(/(require\(\s*["'])(\.\.?\/[^"']+?)\.ts(["']\s*\))/g, '$1$2.js$3');

  // Trim leftover multiple blank lines
  out = out.replace(/\n{3,}/g, '\n\n');

  return out;
}

function chooseNewExt(file) {
  if (file.endsWith('.tsx')) return '.jsx';
  if (file.endsWith('.ts')) return '.js';
  return path.extname(file);
}

async function convertFile(file) {
  const rel = path.relative(root, file);
  const ext = path.extname(file);
  if (ext !== '.ts' && ext !== '.tsx') return null;
  const code = await fs.readFile(file, 'utf8');
  const transformed = transformContent(code, file);
  const newExt = chooseNewExt(file);
  const newPath = file.slice(0, -ext.length) + newExt;
  await fs.writeFile(newPath, transformed, 'utf8');
  await fs.unlink(file);
  return { from: rel, to: path.relative(root, newPath) };
}

async function main() {
  const changes = [];
  for await (const file of walk(root)) {
    const res = await convertFile(file);
    if (res) changes.push(res);
  }
  console.log('Converted files:', changes.length);
  for (const c of changes) {
    console.log(` - ${c.from} -> ${c.to}`);
  }
}

main().catch((err) => {
  console.error('Conversion failed:', err);
  process.exit(1);
});
