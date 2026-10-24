'use client';

import { useState } from 'react';

import styles from './design.module.css';

type Theme = 'system' | 'light' | 'dark';

const THEMES: Theme[] = ['system', 'light', 'dark'];

export function ThemeToggle({ targetId }: { targetId: string }) {
  const [theme, setTheme] = useState<Theme>('system');

  const select = (next: Theme) => {
    setTheme(next);
    const root = document.getElementById(targetId);
    if (!root) return;
    if (next === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', next);
  };

  return (
    <div aria-label="Theme" className={styles.toggle} role="radiogroup">
      {THEMES.map((option) => (
        <button
          aria-checked={theme === option}
          className={styles.toggleOption}
          key={option}
          onClick={() => select(option)}
          role="radio"
          type="button"
        >
          {option}
        </button>
      ))}
    </div>
  );
}
