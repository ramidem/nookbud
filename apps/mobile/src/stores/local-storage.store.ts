import { StateCreator, create } from 'zustand';
import { PersistOptions, createJSONStorage, persist } from 'zustand/middleware';

import { createSpaceSlice, SpaceSlice } from './space.slice';
import { createThemeSlice, ThemeSlice } from './theme.slice';
import { createUserSlice, UserSlice } from './user.slice';

import { MmkvStorage } from '@/stores/mmkvStorage';

export type LocalStorageStore = UserSlice &
  ThemeSlice &
  SpaceSlice & {
    _hasHydrated: boolean;
    setHasHydrated: (hasHydrated: boolean) => void;
    clear: () => void;
  };

type MyPersist = (
  config: StateCreator<LocalStorageStore>,
  options: PersistOptions<LocalStorageStore>,
) => StateCreator<LocalStorageStore>;

export const useLocalStorageStore = create<LocalStorageStore, []>(
  (persist as unknown as MyPersist)(
    (set, get, store) =>
      (() => {
        const userSlice = createUserSlice(set, get, store);
        const themeSlice = createThemeSlice(set, get, store);
        const spaceSlice = createSpaceSlice(set, get, store);

        return {
          ...userSlice,
          ...themeSlice,
          ...spaceSlice,
          _hasHydrated: false,
          clear: () => {
            userSlice.signOut();
          },
          setHasHydrated: (hasHydrated) =>
            set({
              _hasHydrated: hasHydrated,
            }),
        };
      })(),
    {
      name: 'local-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      storage: createJSONStorage(() => MmkvStorage),
    },
  ),
);
