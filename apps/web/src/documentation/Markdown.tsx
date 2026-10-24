import rehypeShiki from '@shikijs/rehype';
import Link from 'next/link';
import type { ComponentProps } from 'react';
import { MarkdownAsync } from 'react-markdown';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import { type Doc, resolveLink } from './content';
import styles from './documentation.module.css';

const LANGUAGES = ['bash', 'css', 'diff', 'json', 'markdown', 'sql', 'toml', 'tsx', 'ts', 'yaml'];

type Props = { doc: Doc; docs: Doc[] };

export function Markdown({ doc, docs }: Props) {
  function DocLink({
    href = '',
    children,
    node: _node,
    ...rest
  }: ComponentProps<'a'> & { node?: unknown }) {
    const link = resolveLink(href, doc.file, docs);

    if (link.kind === 'hash') {
      return (
        <a {...rest} href={link.href}>
          {children}
        </a>
      );
    }
    if (link.kind === 'doc' || link.kind === 'site') {
      return (
        <Link {...rest} href={link.href}>
          {children}
        </Link>
      );
    }
    if (link.kind === 'external') {
      return (
        <a {...rest} href={link.href} rel="noopener noreferrer" target="_blank">
          {children}
        </a>
      );
    }
    // Files outside the documentation (reference docs, source files) are not part of the site.
    return (
      <span className={styles.outside} title="Not part of the documentation site">
        {children}
      </span>
    );
  }

  return (
    <MarkdownAsync
      components={{
        a: DocLink,
        table: ({ children }) => (
          <div className={styles.tableWrap}>
            <table>{children}</table>
          </div>
        ),
      }}
      rehypePlugins={[
        rehypeSlug,
        [
          rehypeAutolinkHeadings,
          {
            behavior: 'append',
            content: { type: 'text', value: '#' },
            properties: { ariaLabel: 'Link to this section', className: ['anchor'] },
          },
        ],
        [
          rehypeShiki,
          {
            defaultColor: false,
            fallbackLanguage: 'text',
            langs: LANGUAGES,
            themes: { dark: 'github-dark', light: 'github-light' },
          },
        ],
      ]}
      remarkPlugins={[remarkGfm]}
    >
      {doc.body}
    </MarkdownAsync>
  );
}
