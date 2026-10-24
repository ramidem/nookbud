import fs from 'node:fs';
import path from 'node:path';
import GithubSlugger from 'github-slugger';
import matter from 'gray-matter';

/**
 * The documentation lives next to the app, so a build rooted at apps/web can always read it.
 * Pages are read at build time only (every page is statically generated), so the file reads below
 * opt out of Turbopack's output tracing instead of pulling the whole project into the deploy.
 */
export const DOCS_DIR = path.join(process.cwd(), 'documentation');

export const BASE_PATH = '/documentation';

export type Doc = {
  /** Path inside `documentation/`, always with forward slashes. */
  file: string;
  slug: string[];
  href: string;
  title: string;
  description?: string;
  section?: string;
  order: number;
  body: string;
};

export type Heading = { depth: number; text: string; id: string };

export type NavGroup = { label?: string; items: Doc[] };

function listMarkdown(dir: string, base = dir, exclude: string[] = []): string[] {
  return fs
    .readdirSync(/*turbopackIgnore: true*/ dir, { withFileTypes: true })
    .flatMap((entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const relative = path.relative(base, full).split(path.sep).join('/');
        return exclude.includes(relative) ? [] : listMarkdown(full, base, exclude);
      }
      return entry.name.endsWith('.md')
        ? [path.relative(base, full).split(path.sep).join('/')]
        : [];
    })
    .sort();
}

/** The visible text of a heading, as the rendered page will see it. */
function plainText(markdown: string): string {
  return markdown
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[`*_~]/g, '')
    .trim();
}

/** Headings of a Markdown body, with the same ids `rehype-slug` gives them. */
export function getHeadings(body: string): Heading[] {
  const slugger = new GithubSlugger();
  const headings: Heading[] = [];
  let fenced = false;
  for (const line of body.split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) {
      fenced = !fenced;
      continue;
    }
    if (fenced) continue;
    const match = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!match) continue;
    const text = plainText(match[2]);
    headings.push({ depth: match[1].length, text, id: slugger.slug(text) });
  }
  return headings;
}

function firstHeading(body: string): string | undefined {
  return getHeadings(body).find((heading) => heading.depth === 1)?.text;
}

export function loadDocs(root = DOCS_DIR, exclude: string[] = []): Doc[] {
  return listMarkdown(root, root, exclude).map((file) => {
    const { data, content } = matter(
      fs.readFileSync(path.join(/*turbopackIgnore: true*/ root, file), 'utf8'),
    );
    const parts = file.replace(/\.md$/, '').split('/');
    if (parts[parts.length - 1].toLowerCase() === 'index') parts.pop();
    const slug = parts.map((part) => part.toLowerCase());
    return {
      file,
      slug,
      href: slug.length ? `${BASE_PATH}/${slug.join('/')}` : BASE_PATH,
      title: String(
        data.title ?? firstHeading(content) ?? slug[slug.length - 1] ?? 'Documentation',
      ),
      description: data.description ? String(data.description) : undefined,
      section: data.section ? String(data.section) : undefined,
      order: typeof data.order === 'number' ? data.order : 100,
      body: content,
    };
  });
}

function byOrder(a: Doc, b: Doc) {
  return a.order - b.order || a.title.localeCompare(b.title);
}

/**
 * Pages without a section come first. Sections follow, ordered by the lowest `order` among their
 * pages, so a section's place is set by the pages in it and no list of names needs maintaining.
 */
export function getNav(docs: Doc[]): NavGroup[] {
  const sections = [...new Set(docs.map((doc) => doc.section).filter(Boolean))] as string[];
  const rank = (label: string) =>
    Math.min(...docs.filter((doc) => doc.section === label).map((doc) => doc.order));
  sections.sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
  const groups: NavGroup[] = [{ items: docs.filter((doc) => !doc.section).sort(byOrder) }];
  for (const label of sections) {
    groups.push({ label, items: docs.filter((doc) => doc.section === label).sort(byOrder) });
  }
  return groups.filter((group) => group.items.length);
}

export function findDoc(docs: Doc[], slug: string[] = []): Doc | undefined {
  const wanted = slug.map((part) => part.toLowerCase()).join('/');
  return docs.find((doc) => doc.slug.join('/') === wanted);
}

export function getNeighbours(docs: Doc[], current: Doc): { prev?: Doc; next?: Doc } {
  const flat = getNav(docs).flatMap((group) => group.items);
  const index = flat.findIndex((doc) => doc.file === current.file);
  return { prev: flat[index - 1], next: flat[index + 1] };
}

export type ResolvedLink =
  | { kind: 'hash'; href: string }
  | { kind: 'external'; href: string }
  | { kind: 'site'; href: string }
  | { kind: 'doc'; href: string; file: string; hash: string }
  | { kind: 'outside'; path: string }
  | { kind: 'missing'; path: string };

/** Decide where a link written in `fromFile` goes. Links between pages are relative `.md` links. */
export function resolveLink(href: string, fromFile: string, docs: Doc[]): ResolvedLink {
  if (href.startsWith('#')) return { kind: 'hash', href };
  if (/^[a-z][a-z0-9+.-]*:/i.test(href)) return { kind: 'external', href };
  if (href.startsWith('/') && !href.startsWith('//')) return { kind: 'site', href };

  const [target, hash = ''] = href.split('#');
  const joined = path.posix.normalize(path.posix.join(path.posix.dirname(fromFile), target));
  if (joined.startsWith('..')) return { kind: 'outside', path: joined };

  const doc = docs.find((candidate) => candidate.file === joined);
  if (!doc) return { kind: 'missing', path: joined };
  return { kind: 'doc', href: doc.href + (hash ? `#${hash}` : ''), file: doc.file, hash };
}
