'use client';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAlert } from '@/lib/store/client/useAlert';
import { Skeleton } from '@/components/ui/skeleton';

export default function OverViewPage() {
  const { user, token, id } = useSelector((state: RootState) => state.auth);
  const currentYear = new Date().getFullYear();
  const formatDate = (dateString: any) => {
    // Parse the date in dd-MM-yyyy format
    if (dateString) {
      const [day, month, year] = dateString.split('-');
      const dateObj = new Date(`${month}-${day}-${year}`);

      // Array of weekday names in Indonesian
      const weekdays = [
        'MINGGU',
        'SENIN',
        'SELASA',
        'RABU',
        'KAMIS',
        'JUMAT',
        'SABTU'
      ];

      // Get the day of the week (0-6) and format the string
      const dayOfWeek = weekdays[dateObj.getDay()];

      // Format the date as "Day, dd-MM-yyyy"
      return `${dayOfWeek}, ${day}-${month}-${year}`;
    } else {
      return;
    }
  };
  return (
    <div className="max-w-screen w-screen bg-transparent p-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Cuti</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {/* {profile ? (
                profile?.saldocuti
              ) : (
                <Skeleton className="h-10 w-[50px]" />
              )} */}
              -
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Cuti Diambil ({currentYear})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {/* {profile ? (
                profile?.totalCuti
              ) : (
                <Skeleton className="h-10 w-[50px]" />
              )} */}
              -
            </div>
            {/* <p className="text-xs text-muted-foreground">Role</p> */}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              TERAKHIR MENGAJUKAN CUTI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {/* {profile?.tglterakhircuti !== '-' ? (
                profile?.tglterakhircuti ? (
                  formatDate(profile.tglterakhircuti)
                ) : (
                  <Skeleton className="h-10 w-[50px]" />
                )
              ) : (
                '-'
              )} */}
              -
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">TOTAL IZIN</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {/* {profile ? (
                profile?.totalIzin
              ) : (
                <Skeleton className="h-10 w-[50px]" />
              )} */}
              -
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
