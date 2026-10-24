import fs from 'node:fs';
import path from 'node:path';
import {
  type Doc,
  findDoc,
  getHeadings,
  getNav,
  loadDocs,
  resolveLink,
} from '../src/documentation/content';

const publicRoot = path.join(__dirname, '..', 'documentation');
const internalRoot = path.join(__dirname, '..', '..', '..', 'docs');

const publicDocs = loadDocs(publicRoot);
// The internal docs sit next to stale reference folders that are being retired; only the working docs are checked.
const internalDocs = loadDocs(internalRoot, ['discovery', 'research', 'strategy']);

/** Every `](target)` in a body, outside code fences and inline code. */
function linksIn(body: string): string[] {
  let fenced = false;
  const found: string[] = [];
  for (const line of body.split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) {
      fenced = !fenced;
      continue;
    }
    if (fenced) continue;
    for (const match of line.replace(/`[^`]*`/g, '').matchAll(/\]\(([^)\s]+)\)/g))
      found.push(match[1]);
  }
  return found;
}

function hasHeading(doc: Doc | undefined, id: string) {
  return !!doc && getHeadings(doc.body).some((heading) => heading.id === id);
}

/**
 * Problems with the links in one page.
 * `strict` is for the public site: a public page may only link to public pages, anchors and the site itself.
 * Internal docs may also link to any file that exists.
 */
function brokenLinks(doc: Doc, docs: Doc[], root: string, strict: boolean): string[] {
  const broken: string[] = [];
  for (const href of linksIn(doc.body)) {
    const link = resolveLink(href, doc.file, docs);
    switch (link.kind) {
      case 'hash':
        if (!hasHeading(doc, link.href.slice(1))) broken.push(`${href} (no such heading)`);
        break;
      case 'doc':
        if (
          link.hash &&
          !hasHeading(
            docs.find((candidate) => candidate.file === link.file),
            link.hash,
          )
        ) {
          broken.push(`${href} (no such heading)`);
        }
        break;
      case 'site': {
        const [pathname] = link.href.split('#');
        const known =
          pathname === '/' ||
          !pathname.startsWith('/documentation') ||
          docs.some((d) => d.href === pathname);
        if (!known) broken.push(`${href} (no such page)`);
        break;
      }
      case 'outside':
      case 'missing': {
        if (strict) broken.push(`${href} (public pages may only link to public pages)`);
        else if (!fs.existsSync(path.join(root, link.path))) broken.push(`${href} (no such file)`);
        break;
      }
      default:
        break;
    }
  }
  return broken;
}

describe('public documentation', () => {
  it('has an index page', () => {
    expect(findDoc(publicDocs, [])?.title).toBeTruthy();
  });

  it('gives every page a unique address', () => {
    const hrefs = publicDocs.map((doc) => doc.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it('puts every page in the navigation exactly once', () => {
    const files = getNav(publicDocs).flatMap((group) => group.items.map((doc) => doc.file));
    expect(files.sort()).toEqual(publicDocs.map((doc) => doc.file).sort());
  });

  it('serves only the public pages', () => {
    // Specs, requirements, the roadmap and engineering notes belong in `docs/`, which is never served.
    const internal = publicDocs.filter((doc) =>
      /^(spec|requirements|roadmap|database|todo)/i.test(doc.file),
    );
    expect(internal.map((doc) => doc.file)).toEqual([]);
  });

  describe.each(publicDocs.map((doc) => [doc.file, doc] as const))('%s', (_file, doc) => {
    it('has a title and a description', () => {
      expect(doc.title.length).toBeGreaterThan(0);
      expect(doc.description?.length ?? 0).toBeGreaterThan(0);
    });

    it('only links to things that exist', () => {
      expect(brokenLinks(doc, publicDocs, publicRoot, true)).toEqual([]);
    });
  });
});

describe('internal docs', () => {
  it.each(internalDocs.map((doc) => [doc.file, doc] as const))(
    '%s only links to things that exist',
    (_file, doc) => {
      expect(brokenLinks(doc, internalDocs, internalRoot, false)).toEqual([]);
    },
  );
});
