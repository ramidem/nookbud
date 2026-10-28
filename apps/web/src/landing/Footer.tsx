import { container } from './config';

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div
        className={`${container} flex flex-col gap-4 py-10 text-sm text-neutral-600 sm:flex-row sm:items-center sm:justify-between`}
      >
        <p>
          <span className="text-base font-semibold text-foreground">Nookbud</span>
          <span className="ml-3">The safe corner where your child grows.</span>
        </p>
        <p className="flex flex-wrap gap-x-5 gap-y-1">
          <a className="hover:text-foreground" href="/documentation">
            Documentation
          </a>
          <a className="hover:text-foreground" href="mailto:hello@nookbud.com">
            hello@nookbud.com
          </a>
          <span>&copy; {new Date().getFullYear()} Nookbud</span>
        </p>
      </div>
    </footer>
  );
}
