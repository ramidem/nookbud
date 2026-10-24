import { container } from './config';

export function Footer() {
  return (
    <footer
      className={`${container} flex flex-col gap-4 py-10 text-sm text-subtitle sm:flex-row sm:items-center sm:justify-between`}
    >
      <p>
        <span className="font-serif text-lg font-semibold text-foreground">Nookbud</span>
        <span className="ml-3">The safe corner where your child grows.</span>
      </p>
      <p>
        <a
          className="underline underline-offset-4 hover:text-foreground"
          href="mailto:hello@nookbud.com"
        >
          hello@nookbud.com
        </a>
        <span className="ml-4">&copy; {new Date().getFullYear()} Nookbud</span>
      </p>
    </footer>
  );
}
