import React from 'react';
import OverViewPage from './overview/_components/overview';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/utils/options';

const Page = async () => {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  return <OverViewPage />;
};

export default Page;
