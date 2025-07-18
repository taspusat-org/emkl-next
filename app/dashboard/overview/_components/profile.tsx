'use client';
import { AreaGraph } from './area-graph';
import { BarGraph } from './bar-graph';
import { PieGraph } from './pie-graph';
import PageContainer from '@/components/layout/page-container';
import { RecentSales } from './recent-sales';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import {
  useGetCutiKaryawanById,
  useGetKaryawanById
} from '@/lib/server/useKaryawan';
import PicDefault from '@/public/image/ava.png';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { IoMdClose } from 'react-icons/io';
import { FaSave } from 'react-icons/fa';
import { Textarea } from '@/components/ui/textarea';
import { updateProfileKaryawanFn } from '@/lib/apis/karyawan.api';
import { useAlert } from '@/lib/store/client/useAlert';
import InputMask from '@mona-health/react-input-mask';

interface FormErrors {
  email: string;
  noHp: string;
  alamat: string;
}

const Profile = () => {
  const { alert } = useAlert();
  const { user, token, id } = useSelector((state: RootState) => state.auth);
  const [isLoadingSubmit, setLoadingSubmit] = useState(false);
  const router = useRouter(); // Initialize the router
  const [onEdit, setOnEdit] = useState(false);
  const [alamat, setAlamat] = useState('');
  const [dataFetched, setDataFetched] = useState(false);
  const [email, setEmail] = useState('');
  const [nohp, setNoHp] = useState('');
  const {
    data: karyawan,
    isLoading: isLoading,
    refetch
  } = useGetKaryawanById(user.karyawan_id);

  const calculateLamaKerja = (hireDate: string) => {
    // Parse the hireDate in dd-MM-yyyy format
    const [day, month, year] = hireDate.split('-');
    const hireDateObj = new Date(`${month}-${day}-${year}`);

    const currentDate = new Date();

    let years = currentDate.getFullYear() - hireDateObj.getFullYear();
    let months = currentDate.getMonth() - hireDateObj.getMonth();
    let days = currentDate.getDate() - hireDateObj.getDate();

    // Adjust months and years if necessary
    if (months < 0) {
      years--;
      months += 12;
    }

    // Adjust days if necessary
    if (days < 0) {
      months--;
      const lastMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        0
      );
      days += lastMonth.getDate();
    }

    // If months is negative, adjust the years and months
    if (months < 0) {
      months += 12;
      years--;
    }

    // Return formatted result
    return `${years} tahun, ${months} bulan, ${days} hari`;
  };

  // Example usage
  const lamaKerja = calculateLamaKerja(karyawan?.tglmasukkerja || '');

  const [imgSrc, setImgSrc] = useState('');

  // Default image URL in case there's no photo
  const defaultImage = process.env.NEXT_PUBLIC_DEFAULT_IMG_URL; // You can replace this with the actual path of your default image

  const handleImageError = () => {
    setImgSrc(defaultImage || '');
  };

  const [errors, setErrors] = useState<FormErrors>({
    email: '',
    noHp: '',
    alamat: ''
  });

  const validateForm = (): boolean => {
    let formErrors: FormErrors = {
      email: '',
      noHp: '',
      alamat: ''
    };

    if (!email) formErrors.email = 'Email wajib diisi';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      formErrors.email = 'Format email tidak valid';

    if (!nohp) formErrors.noHp = 'No HP wajib diisi';

    if (!alamat) formErrors.alamat = 'Alamat wajib diisi';

    setErrors(formErrors);

    // Kembalikan apakah ada error atau tidak
    return Object.keys(formErrors).every(
      (key) => formErrors[key as keyof FormErrors] === ''
    );
  };
  const onSubmitProfile = async () => {
    setLoadingSubmit(true);

    // Validasi form sebelum melanjutkan
    if (!validateForm()) {
      setLoadingSubmit(false);
      return; // Stop jika form tidak valid
    }

    // Jika validasi sukses, lanjutkan proses submit
    try {
      const data = {
        email: email,
        alamat: alamat,
        nohp: nohp
      };

      const response = await updateProfileKaryawanFn({
        id: user.karyawan_id,
        fields: data
      });

      alert({
        title: 'Profile Berhasil di Ubah',
        variant: 'success',
        submitText: 'OK'
      });

      setLoadingSubmit(false);
      setOnEdit(false); // Set onEdit to false after successful update
      setErrors({ email: '', noHp: '', alamat: '' }); // Reset errors setelah submit
      refetch();
    } catch (error: any) {
      alert({
        title: error?.response.data.message,
        variant: 'danger',
        submitText: 'OK'
      });
      setLoadingSubmit(false);
    }
  };

  const handleCancel = () => {
    setOnEdit(false);
    setErrors({ email: '', noHp: '', alamat: '' }); // Reset errors
    setEmail(karyawan?.email || ''); // Set the email from karyawan data or default to an empty string
    setAlamat(karyawan?.alamat || ''); // Set the alamat from karyawan data
    setNoHp(karyawan?.nohp || ''); // Set the noHp from karyawan data
  };

  useEffect(() => {
    // If karyawan.foto is available, construct the image URL, otherwise use the default image.
    const photo = karyawan?.foto
      ? `${
          process.env.NEXT_PUBLIC_IMG_URL
        }medium_${karyawan.foto.toLowerCase()}`
      : defaultImage;
    setImgSrc(photo || ''); // Set the source when the component is loaded
  }, [karyawan?.foto]);
  useEffect(() => {
    // Cek jika data belum di-fetch
    if (!dataFetched && karyawan) {
      setDataFetched(true); // Menandakan data sudah di-fetch
    }
  }, [karyawan, dataFetched]);
  useEffect(() => {
    if (!token) {
      // If token is not available, redirect to login page
      router.push('/auth/signin');
    }
  }, [token, router]); // Add router as dependency to avoid warnings
  useEffect(() => {
    if (karyawan) {
      setEmail(karyawan?.email || ''); // Set the email from karyawan? data or default to an empty string
      setAlamat(karyawan?.alamat || ''); // Set the email from karyawan? data
      setNoHp(karyawan?.nohp || ''); // Set the email from karyawan data
    }
  }, [karyawan]); // Re-run the effect when karyawan changes
  useEffect(() => {
    if (!dataFetched) {
      refetch(); // Refetch data saat pertama kali
    }
  }, [dataFetched, refetch]);
  return (
    <div className="flex min-h-full flex-col items-center justify-center px-2 py-4 lg:px-12">
      <div className="flex min-h-full w-full flex-col-reverse justify-between lg:flex-row">
        <div className="flex w-full flex-col lg:w-[75%]">
          <table>
            <tbody className="">
              <tr className="border border-x-0 border-t-0 border-zinc-300">
                <td className="pt-2 text-sm font-semibold  text-zinc-800">
                  Nama Karyawan
                </td>
                <td>
                  {isLoading ? (
                    <Skeleton className="h-4 w-[300px]" />
                  ) : (
                    <p className="pt-2 text-sm  text-zinc-800">
                      :{karyawan?.namakaryawan}
                    </p>
                  )}
                </td>
              </tr>
              <tr className="border border-x-0 border-t-0 border-zinc-300">
                <td className="pt-2 text-sm font-semibold  text-zinc-800">
                  Nama Panggilan
                </td>
                <td>
                  {isLoading ? (
                    <Skeleton className="h-4 w-[300px]" />
                  ) : (
                    <p className="pt-2 text-sm  text-zinc-800">
                      :{karyawan?.namaalias}
                    </p>
                  )}
                </td>
              </tr>
              <tr className="border border-x-0 border-t-0 border-zinc-300">
                <td className="pt-2 text-sm font-semibold  text-zinc-800">
                  Email
                </td>
                <td>
                  {isLoading ? (
                    <Skeleton className="h-4 w-[300px]" />
                  ) : onEdit ? (
                    <div className="flex flex-col">
                      <div className="flex flex-row">
                        <p className="pt-2 text-sm text-zinc-800">:</p>
                        <Input
                          type="text"
                          autoFocus
                          value={email} // Bind the input value to the email state
                          onChange={(e) => setEmail(e.target.value)} // Update the email state on change
                          className="rounded-none text-sm text-zinc-800"
                        />
                      </div>
                      {/* Tampilkan pesan error jika ada */}
                      <div className="ml-2 pt-1">
                        {errors.email ? (
                          <p className="text-xs text-red-500">{errors.email}</p>
                        ) : (
                          <p className="text-xs text-transparent">_</p> // Invisible space
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="pt-2 text-sm text-zinc-800">
                      :{karyawan?.email}
                    </p>
                  )}
                </td>
              </tr>
              <tr className="border border-x-0 border-t-0 border-zinc-300">
                <td className="pt-2 text-sm font-semibold  text-zinc-800">
                  No Hp
                </td>
                <td>
                  {isLoading ? (
                    <Skeleton className="h-4 w-[300px]" />
                  ) : onEdit ? (
                    <div className="flex flex-col">
                      <div className="flex flex-row">
                        <p className="pt-2 text-sm  text-zinc-800">:</p>
                        <InputMask
                          mask="9999-9999-999999"
                          maskPlaceholder={null}
                          maskChar={null}
                          value={nohp} // Bind the input value to the noHp state
                          onChange={
                            (e: React.ChangeEvent<HTMLInputElement>) =>
                              setNoHp(e.target.value) // Kirimkan nilai yang valid
                          }
                          maxLength={15}
                          className={`h-9 w-full rounded-none border border-zinc-300 p-2 text-sm text-zinc-800 focus:border-blue-500 focus:bg-[#ffffee] focus:outline-none focus:ring-0`}
                        />
                      </div>
                      <div className="ml-2 pt-1">
                        {errors.noHp ? (
                          <p className="text-xs text-red-500">{errors.noHp}</p>
                        ) : (
                          <p className="text-xs text-transparent">_</p> // Invisible space
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="pt-2 text-sm  text-zinc-800">
                      :{karyawan?.nohp}
                    </p>
                  )}
                </td>
              </tr>
              <tr className="border border-x-0 border-t-0 border-zinc-300">
                <td className="pt-2 text-sm font-semibold  text-zinc-800">
                  Alamat
                </td>
                <td>
                  {isLoading ? (
                    <Skeleton className="h-4 w-[300px]" />
                  ) : onEdit ? (
                    <div className="flex flex-col">
                      <div className="flex flex-row">
                        <p className="pt-2 text-sm  text-zinc-800">:</p>
                        <Textarea
                          className="rounded-none border-zinc-300 text-sm text-zinc-800"
                          onChange={(e) => setAlamat(e.target.value)}
                          defaultValue={alamat}
                        ></Textarea>
                      </div>
                      <div className="ml-2 pt-1">
                        {errors.alamat ? (
                          <p className="text-xs text-red-500">
                            {errors.alamat}
                          </p>
                        ) : (
                          <p className="text-xs text-transparent">_</p> // Invisible space
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="pt-2 text-sm  text-zinc-800">
                      :{karyawan?.alamat}
                    </p>
                  )}
                </td>
              </tr>
              <tr className="border border-x-0 border-t-0 border-zinc-300">
                <td className="pt-2 text-sm font-semibold  text-zinc-800">
                  Gender
                </td>
                <td>
                  {isLoading ? (
                    <Skeleton className="h-4 w-[300px]" />
                  ) : (
                    <p className="pt-2 text-sm  text-zinc-800">
                      :{karyawan?.jeniskelamin_text}
                    </p>
                  )}
                </td>
              </tr>
              <tr className="border border-x-0 border-t-0 border-zinc-300">
                <td className="pt-2 text-sm font-semibold  text-zinc-800">
                  Tempat/Tanggal Lahir
                </td>
                <td>
                  {isLoading ? (
                    <Skeleton className="h-4 w-[300px]" />
                  ) : (
                    <p className="pt-2 text-sm  text-zinc-800">
                      :{karyawan?.tempatlahir ? karyawan?.tempatlahir : '-'}/
                      {karyawan?.tgllahir}
                    </p>
                  )}
                </td>
              </tr>
              <tr className="border border-x-0 border-t-0 border-zinc-300">
                <td className="pt-2 text-sm font-semibold  text-zinc-800">
                  Tanggal Masuk Kerja
                </td>
                <td>
                  {isLoading ? (
                    <Skeleton className="h-4 w-[300px]" />
                  ) : (
                    <p className="pt-2 text-sm  text-zinc-800">
                      :{karyawan?.tglmasukkerja}
                    </p>
                  )}
                </td>
              </tr>
              <tr className="border border-x-0 border-t-0 border-zinc-300">
                <td className="pt-2 text-sm font-semibold  text-zinc-800">
                  Lama Kerja
                </td>
                <td>
                  {isLoading ? (
                    <Skeleton className="h-4 w-[300px]" />
                  ) : (
                    <p className="pt-2 text-sm  text-zinc-800">
                      :{karyawan?.tglmasukkerja ? lamaKerja : null}
                    </p>
                  )}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="mt-4 flex w-full justify-end">
            {onEdit ? (
              <div className="flex items-end gap-2">
                <Button
                  type="button"
                  disabled={isLoadingSubmit}
                  onClick={onSubmitProfile}
                  className="w-36 rounded-none border border-blue-500 bg-[#d7ebf9] text-[#2779aa] hover:bg-[#cae8fe]"
                >
                  {isLoadingSubmit ? (
                    <p className="text-center">Updating...</p>
                  ) : (
                    <>
                      <FaSave />
                      <p className="text-center">Save</p>
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="mt-6 flex w-fit items-center gap-1 rounded-none border border-zinc-300"
                  onClick={handleCancel}
                >
                  <IoMdClose /> <p className="text-center">Cancel</p>
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setOnEdit(true)}
                className="w-52 rounded-none border border-blue-500 bg-[#d7ebf9] text-[#2779aa] hover:bg-[#cae8fe]"
              >
                <p className="text-sm font-bold">EDIT DATA</p>
              </Button>
            )}
          </div>
        </div>
        {isLoading ? (
          <Skeleton className="h-[250px] w-[180px]" />
        ) : (
          <div className="flex w-full justify-center lg:w-[20%]">
            <div className="flex h-fit w-[35%] items-start justify-start lg:w-full">
              <Image
                src={imgSrc || ''}
                alt="foto"
                width={250}
                height={250}
                className="h-fit max-h-[350px] w-[250px] rounded-none object-contain"
                onError={handleImageError}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
