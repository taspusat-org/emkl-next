// useApprovalDialog.ts
import { create } from 'zustand';

type OpenPayload = {
  module: string;
  mode: string;
  // opsional, dipanggil saat verify sukses
  checkedRows?: Set<number>;
  successApproved?: boolean;
};

type ApprovalDialogState = {
  open: boolean;
  module?: string;
  checkedRows?: Set<number>;
  mode?: string;
  successApproved?: boolean;
  openDialog: (p: OpenPayload) => void;
  closeDialog: () => void;
};

export const useApprovalDialog = create<ApprovalDialogState>((set) => ({
  open: false,
  module: undefined,
  mode: undefined,
  checkedRows: undefined,
  successApproved: false,
  openDialog: ({ module, successApproved, mode, checkedRows }) =>
    set({ open: true, module, successApproved, mode, checkedRows }),
  closeDialog: () =>
    set({
      open: false,
      mode: undefined,
      module: undefined,
      checkedRows: undefined
    })
}));
