'use client';

import { usePathname } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import { focusRing } from '../../ui/styles';
import { Sidebar } from './Sidebar';

type Drawer = {
  open: boolean;
  panelId: string;
  toggle: () => void;
  dismiss: () => void;
  buttonRef: RefObject<HTMLButtonElement | null>;
};

const DrawerContext = createContext<Drawer | null>(null);

function useDrawer(): Drawer {
  const drawer = useContext(DrawerContext);
  if (!drawer) throw new Error('Sidebar drawer is missing its provider');
  return drawer;
}

/**
 * Phone sidebar state. From `md` up the rail stays in the page and this stays closed.
 */
export function SidebarDrawerProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dismiss = useCallback(() => {
    setOpen(false);
    buttonRef.current?.focus();
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [path]);

  useEffect(() => {
    const query = window.matchMedia?.('(min-width: 768px)');
    if (!query) return;
    const onChange = () => {
      if (query.matches) setOpen(false);
    };
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  return (
    <DrawerContext.Provider
      value={{
        open,
        panelId,
        toggle: () => setOpen((value) => !value),
        dismiss,
        buttonRef,
      }}
    >
      {children}
    </DrawerContext.Provider>
  );
}

/**
 * The signed-in frame. The phone sidebar is a sibling of the scroller, so the page
 * scroll does not clip it. While it is open, the page underneath does not scroll.
 */
export function AppScroll({ children }: { children: ReactNode }) {
  const { open } = useDrawer();
  return (
    <div className="relative h-dvh">
      <MobileSidebar />
      <div
        className={`flex h-dvh flex-col ps-[env(safe-area-inset-left)] pe-[env(safe-area-inset-right)] ${
          open ? 'overflow-hidden' : 'overflow-y-auto'
        }`}
      >
        {children}
      </div>
    </div>
  );
}

/** Menu button to the left of the logo. Hidden from `md` up. */
export function SidebarMenuButton() {
  const { open, toggle, panelId, buttonRef } = useDrawer();
  return (
    <button
      aria-controls={panelId}
      aria-expanded={open}
      aria-label={open ? 'Hide sidebar' : 'Show sidebar'}
      className={`inline-flex size-11 shrink-0 items-center justify-center rounded-lg text-foreground hover:bg-neutral-200 md:hidden ${focusRing}`}
      onClick={toggle}
      ref={buttonRef}
      type="button"
    >
      <Hamburger />
    </button>
  );
}

/**
 * Full-height sidebar for a phone. It sits over the left of the screen, outside the
 * page scroller. The control that closes it is on the right, away from the menu button,
 * so the tap that opens it does not immediately close it.
 */
function MobileSidebar() {
  const { open, dismiss, panelId } = useDrawer();
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    panel.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        dismiss();
        return;
      }
      if (event.key !== 'Tab' || !panel.current) return;
      const nodes = [
        ...panel.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'),
      ];
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, dismiss]);

  if (!open) return null;

  return (
    <>
      <button
        aria-label="Close sidebar"
        className="absolute inset-0 z-40 bg-foreground/40 md:hidden"
        onClick={dismiss}
        tabIndex={-1}
        type="button"
      />
      <div
        aria-label="Sidebar"
        aria-modal="true"
        className="absolute inset-y-0 left-0 z-50 flex h-full w-64 flex-col bg-background pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] ps-[max(0.75rem,env(safe-area-inset-left))] pe-3 shadow-[var(--shadow-sm)] md:hidden"
        id={panelId}
        ref={panel}
        role="dialog"
        tabIndex={-1}
      >
        <div className="flex shrink-0 justify-end">
          <button
            className={`inline-flex size-11 items-center justify-center rounded-lg text-foreground hover:bg-neutral-200 ${focusRing}`}
            onClick={dismiss}
            type="button"
          >
            <span className="sr-only">Close</span>
            <Cross />
          </button>
        </div>
        <Sidebar fill />
      </div>
    </>
  );
}

function Hamburger() {
  return (
    <span aria-hidden="true" className="flex w-5 flex-col gap-1">
      <span className="block h-0.5 w-full bg-current" />
      <span className="block h-0.5 w-full bg-current" />
      <span className="block h-0.5 w-full bg-current" />
    </span>
  );
}

function Cross() {
  return (
    <span
      aria-hidden="true"
      className="size-5 bg-current"
      style={{
        mask: 'url(/design/icons/cross.svg) center / contain no-repeat',
        WebkitMask: 'url(/design/icons/cross.svg) center / contain no-repeat',
      }}
    />
  );
}
