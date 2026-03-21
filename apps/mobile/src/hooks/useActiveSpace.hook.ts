import { useEffect } from 'react';

import { SpaceService } from '@/services';
import { useLocalStorageStore } from '@/stores';

export function useActiveSpace() {
  const activeSpaceId = useLocalStorageStore((s) => s.activeSpaceId);
  const activeSpace = useLocalStorageStore((s) => s.activeSpace);
  const isAllSpaces = useLocalStorageStore((s) => s.isAllSpaces);
  const setActiveSpaceId = useLocalStorageStore((s) => s.setActiveSpaceId);
  const setActiveSpace = useLocalStorageStore((s) => s.setActiveSpace);

  // Load Space object when activeSpaceId changes
  useEffect(() => {
    if (!activeSpaceId) {
      setActiveSpace(null);

      return;
    }

    SpaceService.getSpaceById(activeSpaceId)
      .then((space) => {
        if (space) {
          setActiveSpace(space);
        } else {
          // Space no longer exists — fall back to first available
          SpaceService.listSpaces().then((spaces) => {
            if (spaces.length > 0) {
              setActiveSpaceId(spaces[0].id);
            } else {
              setActiveSpaceId(null);
            }
          });
        }
      })
      .catch(() => setActiveSpaceId(null));
  }, [activeSpaceId, setActiveSpace, setActiveSpaceId]);

  const switchToSpace = (spaceId: string | null) => {
    setActiveSpaceId(spaceId);
  };

  return {
    activeSpace,
    activeSpaceId,
    isAllSpaces,
    switchToSpace,
  };
}
