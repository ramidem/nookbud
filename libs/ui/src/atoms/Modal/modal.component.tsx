'use client';

import React, { useCallback, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';

import { cn } from '../../utils/cn';

type Props = {
  children?: React.ReactNode;
  className?: string;
  isVisible: boolean;
  onClose: () => void;
};

export function Modal(props: Props) {
  const { children, className, isVisible, onClose } = props;

  return (
    <Dialog.Root open={isVisible} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-overlay/60 data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2',
            'rounded-2xl bg-sheet p-6 shadow-xl dark:bg-dark-sheet',
            'data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in',
            className,
          )}
        >
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function useModal(initialState = false) {
  const [isVisible, setIsVisible] = useState(initialState);

  const showModal = useCallback(() => setIsVisible(true), []);
  const hideModal = useCallback(() => setIsVisible(false), []);

  return { hideModal, isVisible, showModal };
}
