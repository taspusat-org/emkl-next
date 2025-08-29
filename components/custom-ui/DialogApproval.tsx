import React, { useEffect, useState } from 'react';
import { Input } from '../ui/input';
import { LoginInput, loginValidation } from '@/lib/validations/auth.validation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { FaUser, FaEye, FaEyeSlash, FaSave } from 'react-icons/fa';
import {
  setProcessed,
  setProcessing
} from '@/lib/store/loadingSlice/loadingSlice';
import { useDispatch } from 'react-redux';
import { useToast } from '@/hooks/use-toast';
import { verifyForceEditFn } from '@/lib/apis/global.api';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { getParameterApprovalFn } from '@/lib/apis/parameter.api';
import { Button } from '../ui/button';
import useDisableBodyScroll from '@/lib/hooks/useDisableBodyScroll';
import { Icons } from '../icons';
import { useApprovalDialog } from '@/lib/store/client/useDialogApproval';
import { IoMdClose } from 'react-icons/io';
import {
  approvalFn,
  checkApproveFn,
  nonApprovalFn
} from '@/lib/apis/approval.api';
import { useAlert } from '@/lib/store/client/useAlert';
import { useQueryClient } from 'react-query';
import { Textarea } from '../ui/textarea';

const DialogApproval: React.FC = ({}) => {
  const [showErrorKeterangan, setShowErrorKeterangan] = useState(false);
  const [dataParameter, setDataParameter] = useState<any>([]);
  const [showKeteranganDialog, setShowKeteranganDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [keterangan, setKeterangan] = useState('');

  const { open, module, closeDialog, mode, checkedRows } = useApprovalDialog();
  const queryClient = useQueryClient();
  const formattedModule = module?.replace(/-/g, ' ');
  const { alert } = useAlert();
  const dispatch = useDispatch();
  const { toast } = useToast();

  const handleButtonClick = async (item: any) => {
    // Validasi checkedRows terlebih dahulu
    if ((checkedRows?.size ?? 0) <= 0) {
      useApprovalDialog.setState({ open: false });
      alert({
        title:
          mode === 'APPROVAL'
            ? 'PILIH DATA YANG INGIN DI APPROVE'
            : 'PILIH DATA YANG INGIN DI NON APPROVE',
        variant: 'danger',
        submitText: 'OK'
      });
      return;
    }
    // Prepare payload untuk check API
    const checkPayload = {
      tableName: item.subgrp,
      id: item.id,
      transaksi_id: Array.from(checkedRows || []),
      value: mode === 'APPROVAL' ? item.nilai_ya : item.nilai_tidak,
      text: item.text
    };
    try {
      // ========================================
      // CALL CHECK API FIRST
      // ========================================
      dispatch(setProcessing());

      const checkResponse = await checkApproveFn(checkPayload);

      // Jika status 400 atau ada error, tampilkan alert
      console.log('checkResponse', checkResponse);
      if (checkResponse.status === 400 || !checkResponse.isValid) {
        alert({
          title: checkResponse.message || 'Data tidak valid untuk diproses',
          variant: 'danger',
          submitText: 'OK'
        });
        dispatch(setProcessed());
        useApprovalDialog.setState({ open: false });

        return;
      }
      // ========================================
      // JIKA VALIDASI BERHASIL, LANJUTKAN PROSES
      // ========================================
      dispatch(setProcessed());

      // Check apakah keterangan wajib diisi
      if (item.keterangan_wajib_isi === 'YA') {
        setSelectedItem(item);
        setShowKeteranganDialog(true);
        setKeterangan('');
        useApprovalDialog.setState({ open: false });
      } else {
        // Langsung submit tanpa dialog keterangan
        onSubmit(item, '');
      }
    } catch (error) {
      dispatch(setProcessed());
      console.error('Error checking approval:', error);
      alert({
        title: 'Terjadi kesalahan saat validasi data. Silakan coba lagi.',
        variant: 'danger',
        submitText: 'OK'
      });
    }
  };
  // Modifikasi handleKeteranganSubmit untuk re-open dialog jika perlu
  const handleKeteranganSubmit = () => {
    if (!keterangan.trim()) {
      setShowErrorKeterangan(true);
      return;
    }
    setShowKeteranganDialog(false);
    onSubmit(selectedItem, keterangan);
    setKeterangan('');
    setSelectedItem(null);
  };
  const onSubmit = async (item: any, keteranganValue: string) => {
    if (mode === 'APPROVAL') {
      const payload = {
        tableName: item.subgrp,
        id: item.id,
        transaksi_id: Array.from(checkedRows || []),
        value: item.nilai_ya,
        text: item.text,
        keterangan:
          keteranganValue?.toUpperCase() || item.keterangan?.toUpperCase() || ''
      };
      try {
        dispatch(setProcessing());
        const res = await approvalFn(payload);

        if (res.status === 400) {
          alert({
            title: res.message,
            variant: 'danger',
            submitText: 'OK'
          });
          closeDialog();
        } else {
          queryClient.invalidateQueries({
            predicate: () => true
          });
          closeDialog();
        }
      } catch (error) {
        alert({
          title: 'Terjadi Kesalahan saat memproses, coba lagi beberapa saat',
          variant: 'danger',
          submitText: 'OK'
        });
        closeDialog();
      } finally {
        dispatch(setProcessed());
        closeDialog();
      }
    } else {
      const payload = {
        tableName: item.subgrp,
        id: item.id,
        transaksi_id: Array.from(checkedRows || []),
        value: item.nilai_tidak,
        text: item.text,
        keterangan:
          keteranganValue?.toUpperCase() || item.keterangan?.toUpperCase() || ''
      };
      try {
        dispatch(setProcessing());
        const res = await nonApprovalFn(payload);

        if (res.status === 400) {
          alert({
            title: res.message,
            variant: 'danger',
            submitText: 'OK'
          });
        } else {
          queryClient.invalidateQueries({
            predicate: () => true
          });
          closeDialog();
        }
      } catch (error) {
        alert({
          title: 'Terjadi Kesalahan saat memproses, coba lagi beberapa saat',
          variant: 'danger',
          submitText: 'OK'
        });
      } finally {
        dispatch(setProcessed());
      }
    }
  };
  const fetchData = async () => {
    const data = await getParameterApprovalFn({
      filters: { grp: 'DATA PENDUKUNG', subgrp: formattedModule }
    });
    setDataParameter(data.data);
  };
  useEffect(() => {
    if (formattedModule) {
      fetchData();
    }
  }, [formattedModule]);
  useDisableBodyScroll(open || showKeteranganDialog);
  useEffect(() => {
    if (keterangan) {
      setShowErrorKeterangan(false);
    }
  }, [keterangan]);
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeDialog(); // Reset the mode to empty
        setShowErrorKeterangan(false);
        setShowKeteranganDialog(false);
        setSelectedItem(null);
        setKeterangan('');
      }
    };

    // Add event listener for keydown when the component is mounted
    document.addEventListener('keydown', handleEscape);

    // Cleanup event listener when the component is unmounted or the effect is re-run
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);
  return (
    <>
      {open && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget && !showKeteranganDialog) {
              closeDialog();
            }
          }}
          className="fixed inset-0 z-50 flex items-center justify-center border-blue-500 bg-gray-500 bg-opacity-50 p-4"
        >
          <div
            className="max-h-[500px] min-h-[100px] w-full max-w-[400px] rounded bg-white shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex h-[38px] w-full flex-row items-center justify-between rounded-t-sm border-b border-blue-500 px-2"
              style={{
                background:
                  'linear-gradient(to bottom, #eff5ff 0%, #e0ecff 100%)'
              }}
            >
              <p className="text-sm font-semibold text-zinc-800">{mode}</p>
              <div
                className="cursor-pointer rounded-md border border-zinc-200 bg-red-500 p-0 hover:bg-red-400"
                onClick={closeDialog}
              >
                <IoMdClose className="h-5 w-5 font-bold text-white" />
              </div>
            </div>
            <div className="flex h-full w-full overflow-hidden bg-white px-5 py-5">
              <div className="flex h-full w-full flex-col gap-1 overflow-y-auto bg-white">
                {dataParameter.map((item: any, index: any) => (
                  <Button
                    key={index}
                    className="w-full gap-1 py-2"
                    onClick={() => handleButtonClick(item)}
                    style={{
                      backgroundColor: item.warna
                    }}
                  >
                    <Icons name={item.icon} />
                    <p
                      className="text-sm font-semibold"
                      style={{ color: item.warna_tulisan }}
                    >
                      {item.memo_nama}
                    </p>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {showKeteranganDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center border-blue-500 bg-gray-500 bg-opacity-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowKeteranganDialog(false);
              setSelectedItem(null);
              setShowErrorKeterangan(false);
              setKeterangan('');
            }
          }}
        >
          <div
            className="max-h-[500px] min-h-[100px] w-full max-w-[400px] rounded bg-white shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex h-[38px] w-full flex-row items-center justify-between rounded-t-sm border-b border-blue-500 px-2"
              style={{
                background:
                  'linear-gradient(to bottom, #eff5ff 0%, #e0ecff 100%)'
              }}
            >
              <p className="text-sm font-semibold text-zinc-800">{mode}</p>
              <div
                className="cursor-pointer rounded-md border border-zinc-200 bg-red-500 p-0 hover:bg-red-400"
                onClick={() => {
                  setShowKeteranganDialog(false);
                  setSelectedItem(null);
                  setKeterangan('');
                  setShowErrorKeterangan(false);
                }}
              >
                <IoMdClose className="h-5 w-5 font-bold text-white" />
              </div>
            </div>
            <div className="mb-4 p-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Keterangan <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                className="h-24 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Masukkan keterangan..."
                autoFocus
              />
              {showErrorKeterangan ? (
                <p className="text-[0.8rem] text-destructive">
                  KETERANGAN WAJIB DIISI
                </p>
              ) : null}
            </div>

            <div className="flex justify-end gap-2 p-4">
              <Button
                variant="outline"
                className="flex w-fit items-center gap-1 bg-zinc-500 text-sm text-white hover:bg-zinc-400"
                onClick={() => {
                  setShowKeteranganDialog(false);
                  setSelectedItem(null);
                  setKeterangan('');
                  setShowErrorKeterangan(false);
                }}
              >
                <IoMdClose /> <p className="text-center text-white">Cancel</p>
              </Button>
              <Button
                type="submit"
                onClick={handleKeteranganSubmit}
                className="flex w-fit items-center gap-1 text-sm"
              >
                <FaSave />
                <p className="text-center">SUBMIT</p>
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DialogApproval;
