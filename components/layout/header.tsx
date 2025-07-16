import React from 'react';
import { SidebarTrigger, useSidebar } from '../ui/sidebar';
import { Separator } from '../ui/separator';
import { Breadcrumbs } from '../breadcrumbs';
import SearchInput from '../search-input';
import { UserNav } from './user-nav';
import ThemeToggle from './ThemeToggle/theme-toggle';
import { GetServerSideProps } from 'next';
import Image from 'next/image';
import IcTasSmall from '@/public/image/IcTas-Small.png';

interface Props {
  ip: string;
  currentDateTime: string;
}
export default function Header({ ip, currentDateTime }: Props) {
  const { isMobile } = useSidebar();
  return (
    <div>
      <header className="mb-6 flex h-12 shrink-0 items-center justify-between gap-2 border border-x-0 border-t-0 bg-white transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1 text-black" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex flex-row items-center gap-2">
            <Image src={IcTasSmall} width={25} height={25} alt="icon-tas" />
            <p className="text-sm font-bold text-black">
              HUMAN RESOURCES SYSTEM
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-4">
          <div className="flex flex-row gap-2">
            <p className="text-[10px] text-zinc-900 lg:text-sm">
              Your IP Address: ({ip})
            </p>
            <p className="text-[10px] text-zinc-900 lg:text-sm">
              {currentDateTime}
            </p>
          </div>
          {isMobile ? null : <UserNav />}
        </div>
      </header>

      <div className="mt-6 bg-[#f4f6f9] pl-6">
        <Breadcrumbs />
      </div>
    </div>
  );
}
