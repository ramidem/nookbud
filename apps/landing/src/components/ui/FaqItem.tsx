'use client';

import { useState } from 'react';

type FaqItemProps = {
  question: string;
  answer: string;
};

export function FaqItem({ question, answer }: FaqItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-brand-border">
      <button
        className="flex w-full items-center justify-between py-6 text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="pr-4 text-lg font-medium text-brand-charcoal">
          {question}
        </span>
        <span
          className={`shrink-0 text-2xl text-brand-gray transition-transform duration-200 ${
            isOpen ? 'rotate-45' : ''
          }`}
        >
          +
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-96 pb-6' : 'max-h-0'
        }`}
      >
        <p className="leading-relaxed text-brand-gray">{answer}</p>
      </div>
    </div>
  );
}
