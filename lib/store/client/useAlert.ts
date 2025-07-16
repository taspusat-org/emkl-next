import { AlertOptions } from '@/components/custom-ui/AlertCustom';
import { create } from 'zustand';

interface AlertState {
  alertOptions: AlertOptions | null;
  awaitingPromiseRef: {
    resolve: () => void;
    reject: () => void;
  } | null;
  alert: (options: AlertOptions) => Promise<void>;
  handleClose: () => void;
  handleSubmit: () => void;
  setLoadingAlert: (loading: boolean) => void;
}

const useAlertStore = create<AlertState>((set) => ({
  alertOptions: null,
  awaitingPromiseRef: null,
  alert: async (options: AlertOptions) =>
    await new Promise<void>((resolve, reject) => {
      set(() => ({
        alertOptions: options,
        awaitingPromiseRef: { resolve, reject }
      }));
    }),
  handleClose: () => {
    set((state) => {
      if (
        (state.alertOptions?.catchOnCancel ?? false) &&
        state.awaitingPromiseRef != null
      ) {
        state.awaitingPromiseRef.reject();
      }
      return {
        alertOptions: null,
        awaitingPromiseRef: null
      };
    });
  },
  handleSubmit: () => {
    set((state) => {
      if (state.awaitingPromiseRef != null) {
        state.awaitingPromiseRef.resolve();
      }
      return {
        alertOptions: null,
        awaitingPromiseRef: null
      };
    });
  },
  setLoadingAlert: (loading: boolean) =>
    set((state) => ({
      alertOptions:
        state.alertOptions != null
          ? { ...state.alertOptions, isLoading: loading }
          : null
    }))
}));

export const useAlert = () => {
  const { alertOptions, alert, handleClose, handleSubmit, setLoadingAlert } =
    useAlertStore((state) => ({
      alertOptions: state.alertOptions,
      alert: state.alert,
      handleClose: state.handleClose,
      handleSubmit: state.handleSubmit,
      setLoadingAlert: state.setLoadingAlert
    }));

  return {
    alertOptions,
    alert,
    handleClose,
    handleSubmit,
    setLoadingAlert
  };
};
