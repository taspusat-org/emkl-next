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
import { IoMdClose } from 'react-icons/io';
import {
  approvalFn,
  checkApproveFn,
  nonApprovalFn
} from '@/lib/apis/approval.api';
import { useAlert } from '@/lib/store/client/useAlert';
import { useQueryClient } from 'react-query';
import { Textarea } from '../ui/textarea';
import { getPermissionFn } from '@/lib/apis/menu.api';
import { useLainnyaDialog } from '@/lib/store/client/useDialogLainnya';

const DialogLainnya: React.FC = ({}) => {
  const [showErrorKeterangan, setShowErrorKeterangan] = useState(false);
  const [dataParameter, setDataParameter] = useState<any>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [keterangan, setKeterangan] = useState('');
  const { id } = useSelector((state: RootState) => state.auth);

  const { open, module, closeDialog, mode, checkedRows } = useLainnyaDialog();
  const queryClient = useQueryClient();
  const formattedModule = module?.replace(/-/g, ' ');
  const { alert } = useAlert();
  const dispatch = useDispatch();
  const { toast } = useToast();

  const handleButtonClick = async (item: any) => {
    try {
      useLainnyaDialog.setState({
        openForm: true,
        open: false,
        mode: item.text
      });
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

  // const onSubmit = async (item: any, keteranganValue: string) => {
  //   useLainnyaDialog.setState({ openForm: true })

  // };

  const fetchData = async () => {
    dispatch(setProcessing());
    try {
      const data = await getParameterApprovalFn({
        filters: { grp: 'DATA LAINNYA', subgrp: formattedModule }
      });
      const res = await getPermissionFn(String(id));

      if (res?.abilities) {
        const filteredPermission = res.abilities.filter((item: any) =>
          item.action.includes('DATA LAINNYA -> YA')
        );

        const filteredData = data.data.filter((item: any) =>
          filteredPermission.some(
            (filteredItem: any) =>
              Number(filteredItem.id) === Number(item.role_ya)
          )
        );
        setDataParameter(filteredData);
      }
    } catch (error) {
      dispatch(setProcessed());
      console.error('Error fetching data:', error);
      alert({
        title: 'Terjadi kesalahan saat memproses, coba lagi beberapa saat',
        variant: 'danger',
        submitText: 'OK'
      });
    } finally {
      dispatch(setProcessed());
    }
  };

  useEffect(() => {
    if (formattedModule) {
      fetchData();
    }
  }, [formattedModule, mode, id]);

  useDisableBodyScroll(open);
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
            if (e.target === e.currentTarget) {
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
            <div className="flex h-fit max-h-[500px] w-full overflow-hidden bg-white px-5 py-5">
              <div className="flex h-fit max-h-[450px] w-full flex-col gap-1 overflow-y-auto bg-white">
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
                      {item.text}
                    </p>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DialogLainnya;
