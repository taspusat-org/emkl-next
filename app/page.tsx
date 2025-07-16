import React from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/utils/options';

const Page = async () => {
  const session = await getServerSession(authOptions);
  if (!session) {
    return redirect('/auth/signin');
  } else {
    return redirect('/dashboard');
  }
};

export default Page;
