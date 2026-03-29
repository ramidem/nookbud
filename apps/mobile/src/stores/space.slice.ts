import { StateCreator } from 'zustand';

import type { Space } from '@/types';

export type SpaceSlice = {
  activeSpace: Space | null;
  activeSpaceId: string | null;
  isAllSpaces: boolean;
  setActiveSpace: (space: Space | null) => void;
  setActiveSpaceId: (id: string | null) => void;
};

export const createSpaceSlice: StateCreator<SpaceSlice> = (set) => ({
  activeSpace: null,
  activeSpaceId: null,
  isAllSpaces: true,
  setActiveSpace: (space) => set({ activeSpace: space }),
  setActiveSpaceId: (id) => set({ activeSpaceId: id, isAllSpaces: id === null }),
});
