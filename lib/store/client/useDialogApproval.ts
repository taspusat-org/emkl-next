// useApprovalDialog.ts
import { create } from 'zustand';

type OpenPayload = {
  module: string;
  mode: string;
  // opsional, dipanggil saat verify sukses
  checkedRows?: Set<number>;
  onSuccess?: () => void;
};

type ApprovalDialogState = {
  open: boolean;
  module?: string;
  checkedRows?: Set<number>;
  mode?: string;
  onSuccess?: () => void;
  openDialog: (p: OpenPayload) => void;
  closeDialog: () => void;
};

export const useApprovalDialog = create<ApprovalDialogState>((set) => ({
  open: false,
  module: undefined,
  mode: undefined,
  checkedRows: undefined,
  onSuccess: undefined,
  openDialog: ({ module, onSuccess, mode, checkedRows }) =>
    set({ open: true, module, onSuccess, mode, checkedRows }),
  closeDialog: () =>
    set({
      open: false,
      mode: undefined,
      module: undefined,
      checkedRows: undefined,
      onSuccess: undefined
    })
}));
