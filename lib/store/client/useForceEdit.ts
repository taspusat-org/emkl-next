// useForceEditDialog.ts
import { create } from 'zustand';

type OpenPayload = {
  tableName: string;
  value: string | number;
  // opsional, dipanggil saat verify sukses
  onSuccess?: () => void;
};

type ForceEditDialogState = {
  open: boolean;
  tableName?: string;
  value?: string | number;
  onSuccess?: () => void;
  openDialog: (p: OpenPayload) => void;
  closeDialog: () => void;
};

export const useForceEditDialog = create<ForceEditDialogState>((set) => ({
  open: false,
  tableName: undefined,
  value: undefined,
  onSuccess: undefined,
  openDialog: ({ tableName, value, onSuccess }) =>
    set({ open: true, tableName, value, onSuccess }),
  closeDialog: () =>
    set({
      open: false,
      tableName: undefined,
      value: undefined,
      onSuccess: undefined
    })
}));
