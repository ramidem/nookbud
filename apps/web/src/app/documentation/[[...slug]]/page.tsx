import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { findDoc, getHeadings, getNeighbours, loadDocs } from '../../../documentation/content';
import { Markdown } from '../../../documentation/Markdown';
import styles from '../../../documentation/documentation.module.css';

type Props = { params: Promise<{ slug?: string[] }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return loadDocs().map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const doc = findDoc(loadDocs(), slug);
  if (!doc) return {};
  return {
    description: doc.description,
    title: doc.slug.length ? doc.title : { absolute: 'Documentation · Nookbud' },
  };
}

export default async function DocumentationPage({ params }: Props) {
  const { slug } = await params;
  const docs = loadDocs();
  const doc = findDoc(docs, slug);
  if (!doc) notFound();

  const toc = getHeadings(doc.body).filter((heading) => heading.depth === 2 || heading.depth === 3);
  const { prev, next } = getNeighbours(docs, doc);

  return (
    <div className={styles.page}>
      <article className={styles.prose}>
        <Markdown doc={doc} docs={docs} />

        {(prev || next) && (
          <nav aria-label="Previous and next page" className={styles.pager}>
            {prev ? (
              <Link className={styles.pagerLink} href={prev.href} rel="prev">
                <span className={styles.pagerHint}>Previous</span>
                {prev.title}
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link
                className={`${styles.pagerLink} ${styles.pagerNext}`}
                href={next.href}
                rel="next"
              >
                <span className={styles.pagerHint}>Next</span>
                {next.title}
              </Link>
            )}
          </nav>
        )}
      </article>

      {toc.length > 1 && (
        <aside aria-label="On this page" className={styles.toc}>
          <p className={styles.tocTitle}>On this page</p>
          <ul>
            {toc.map((heading) => (
              <li className={heading.depth === 3 ? styles.tocSub : undefined} key={heading.id}>
                <a href={`#${heading.id}`}>{heading.text}</a>
              </li>
            ))}
          </ul>
        </aside>
      )}
    </div>
  );
}
