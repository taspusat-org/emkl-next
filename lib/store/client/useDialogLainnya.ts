// useLainnyaDialog.ts
import { create } from 'zustand';

type OpenPayload = {
  module: string;
  mode: string;
  // opsional, dipanggil saat verify sukses
  checkedRows?: Set<number>;
  onSuccess?: () => void;
};

type LainnyaDialogState = {
  open: boolean;
  module?: string;
  checkedRows?: Set<number>;
  mode?: string;
  onSuccess?: () => void;
  openDialog: (p: OpenPayload) => void;
  closeDialog: () => void;
  openForm?: boolean;
};

export const useLainnyaDialog = create<LainnyaDialogState>((set) => ({
  open: false,
  module: undefined,
  mode: undefined,
  checkedRows: undefined,
  onSuccess: undefined,
  openForm: false,
  openDialog: ({ module, onSuccess, mode, checkedRows }) =>
    set({ open: true, module, onSuccess, mode, checkedRows }),
  closeDialog: () =>
    set({
      open: false,
      mode: undefined,
      module: undefined,
      checkedRows: undefined,
      onSuccess: undefined,
      openForm: false
    })
}));
