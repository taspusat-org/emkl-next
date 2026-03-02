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
      <header className="flex h-12 shrink-0 items-center justify-between gap-2 border border-x-0 border-t-0 bg-background-header py-6 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 ">
        <div className="flex items-center gap-2 px-2 sm:px-4">
          <SidebarTrigger className="text-primary-text ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex flex-row items-center gap-2">
            <Image
              src={IcTasSmall}
              width={25}
              height={25}
              alt="icon-tas"
              className="hidden sm:block"
            />
            <p className="text-primary-text text-[10px] font-bold sm:text-sm">
              TAS EMKL SYSTEM
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 px-2 sm:gap-2 sm:px-4">
          <div className="hidden flex-row gap-2 lg:flex">
            <p className="text-primary-text text-[10px] lg:text-sm">
              Your IP Address: ({ip})
            </p>
            <p className="text-primary-text text-[10px] lg:text-sm">
              {currentDateTime}
            </p>
          </div>
          <ThemeToggle />

          {isMobile ? null : <UserNav />}
        </div>
      </header>

      <div className="bg-background pl-6 pt-6">
        <Breadcrumbs />
      </div>
    </div>
  );
}
