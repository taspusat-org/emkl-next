'use client';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar
} from '@/components/ui/sidebar';
import { ChevronRight, GalleryVerticalEnd, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';
import { Breadcrumbs } from '../breadcrumbs';
import { Icons } from '../icons';
import { UserNav } from './user-nav';
import { Input } from '../ui/input';
import { IoSearch } from 'react-icons/io5';
import { setCollapse } from '@/lib/store/collapseSlice/collapseSlice';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { persistor, RootState, store } from '@/lib/store/store';
import { api, api2, tokenCache } from '@/lib/utils/AxiosInstance';
import JsxParser from 'react-jsx-parser';
import { useLocation } from 'react-router-dom';
import { useGetSearchMenu } from '@/lib/server/useMenu';
import { FaTimes } from 'react-icons/fa';
import IcTasSmall from '@/public/image/IcTas-Small.png';

import Image from 'next/image';
import Header from './header';
import { signOut } from 'next-auth/react';
import { clearCredentials } from '@/lib/store/authSlice/authSlice';
import { deleteCookie } from '@/lib/utils/cookie-actions';
import { clearHeaderData } from '@/lib/store/headerSlice/headerSlice';
import { setLoaded, setLoading } from '@/lib/store/loadingSlice/loadingSlice';
import useDisableBodyScroll from '@/lib/hooks/useDisableBodyScroll';
export const company = {
  name: 'PT. TRANSPORINDO AGUNG SEJAHTERA',
  logo: GalleryVerticalEnd
};

interface Ability {
  action: string[];
  subject: string;
}

interface AppSidebarProps {
  children: React.ReactNode;
  ip: string;
  initialDateTime: string;
}
export default function AppSidebar({
  children,
  ip,
  initialDateTime
}: AppSidebarProps) {
  const router = useRouter();
  const { setOpen } = useSidebar(); // Get setOpen from SidebarContext
  const [mounted, setMounted] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [menuData, setMenuData] = React.useState<string | null>(null);
  const [currentDateTime, setCurrentDateTime] = React.useState(initialDateTime);
  const [searchResults, setSearchResults] = React.useState<any[]>([]);

  const dispatch = useDispatch();
  const logout = async () => {
    tokenCache.clearCache();
    dispatch(clearCredentials());
    await persistor.purge();
    await signOut({ callbackUrl: '/auth/signin' });
  };
  const { user, token } = useSelector((state: RootState) => state.auth);
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [activePath, setActivePath] = React.useState<string>('');
  const [hoveredItemId, setHoveredItemId] = React.useState<string | null>(null);

  const pathname = usePathname();
  const [openMenus, setOpenMenus] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    setActivePath(pathname);
  }, [pathname]);
  React.useEffect(() => {
    setMounted(true);
  }, []);
  React.useEffect(() => {
    if (activePath != pathname) {
      dispatch(clearHeaderData());
    }
  }, [pathname]);
  const [filters, setFilters] = React.useState({
    search: '',
    userId: user.id ?? ''
  });

  const { data: allMenu, isLoading: isLoadingMenu } = useGetSearchMenu(filters);
  React.useEffect(() => {
    if (filters.search) {
      setSearchResults(allMenu || []);
    } else {
      setSearchResults([]);
    }
  }, [filters, allMenu]);

  React.useEffect(() => {
    if (user.id) {
      api2
        .get(`/menu/sidebar?userId=${user.id}`)
        .then((response) => {
          setMenuData(response.data);
        })
        .catch((error) => console.error('Failed to fetch menu data:', error));
    }
  }, [user.id]);
  React.useEffect(() => {
    const interval = setInterval(() => {
      const currentDate = new Date();
      const hours = String(currentDate.getHours()).padStart(2, '0');
      const minutes = String(currentDate.getMinutes()).padStart(2, '0');
      const seconds = String(currentDate.getSeconds()).padStart(2, '0');
      const formattedTime = `${hours}:${minutes}:${seconds}`;

      const formattedDate = `${currentDate
        .getDate()
        .toString()
        .padStart(2, '0')}-${(currentDate.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${currentDate.getFullYear()}`;
      setCurrentDateTime(`${formattedDate} ${formattedTime}`);
    }, 1000); // Update every second

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  if (!mounted) {
    return null;
  }
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearch(query);
    setFilters((prev) => ({ ...prev, search: query })); // Update filters when search term changes
  };
  const handleClearSearch = () => {
    setSearch('');
    setFilters((prev) => ({ ...prev, search: '' })); // Clear search and filters
  };
  const handleCollapseToggle = () => {
    setIsCollapsed(!isCollapsed);
    dispatch(setCollapse(!isCollapsed));
  };
  const handleClickSearch = () => {
    setSearch('');
    setFilters((prev) => ({ ...prev, search: '' })); // Clear search and filters
    setOpen(false);
  };
  const handleToggle = (title: string) => {
    setOpenMenus((prevOpenMenus: Record<string, boolean>) => ({
      ...prevOpenMenus,
      [title]: !prevOpenMenus[title]
    }));
  };
  const isMenuOpen = (menuName: string) => openMenus[menuName] || false;

  return (
    <>
      <Sidebar collapsible="offcanvas" variant="floating">
        <SidebarHeader>
          <div className="flex gap-2 py-2 text-sidebar-accent-foreground">
            <div className="text-sidebar-black flex aspect-square size-10 items-center justify-center rounded-lg bg-white">
              <Image src={IcTasSmall} alt="logo tas" />
            </div>
            <div className="grid flex-1 text-left text-xs leading-tight">
              <span className="break-words font-semibold text-white">
                {company.name}
              </span>
            </div>
          </div>
          <div className="relative flex items-center">
            <Input
              value={search}
              onChange={handleSearchChange}
              className="h-8 rounded-sm border bg-transparent text-white placeholder:text-white focus:bg-transparent"
              placeholder="Search.."
            />

            {filters.search ? (
              <FaTimes
                className="absolute right-2 cursor-pointer"
                onClick={handleClearSearch}
              />
            ) : (
              <IoSearch className="absolute right-2" />
            )}

            {filters.search ? (
              searchResults.length > 0 ? (
                <div className="absolute top-full z-50 h-fit w-full overflow-y-auto rounded bg-white shadow-md">
                  {searchResults.map((menu) => {
                    return (
                      <Link
                        key={menu.id}
                        onClick={handleClickSearch}
                        href={`/dashboard/${menu.url.toLowerCase()}`}
                        className="flex cursor-pointer flex-col border border-gray-400 bg-gray-700 px-2 py-1 hover:bg-gray-500"
                      >
                        <span className="text-sm">{menu.title}</span>
                        <span className="text-[8px]">
                          {menu.parentBreadcrumb}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="absolute top-full z-50 mt-2 h-fit w-full overflow-y-auto rounded bg-white shadow-md">
                  <div className="flex cursor-pointer items-center bg-gray-500 px-4 py-2 text-sm hover:bg-gray-400">
                    No Element Found
                  </div>
                </div>
              )
            ) : null}
          </div>
        </SidebarHeader>
        <SidebarContent className="scroll overflow-x-hidden">
          <SidebarGroup>
            <SidebarGroupLabel className="mt-2">MENU</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuSubItem
                onMouseEnter={() => setHoveredItemId('DASHBOARD')}
                onMouseLeave={() => setHoveredItemId(null)}
              >
                <SidebarMenuSubButton
                  asChild
                  isActive={activePath === '/dashboard'}
                >
                  <Link prefetch={true} href="/dashboard" className="py-4">
                    <Icons
                      name="PERSONSETTINGS"
                      className={
                        hoveredItemId === 'DASHBOARD' ||
                        activePath === '/dashboard'
                          ? 'icon-white text-white'
                          : 'icon-white text-white'
                      }
                    />
                    <span className="text-sm">DASHBOARD</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
              <JsxParser
                bindings={{
                  handleToggle: (title: any) => {
                    setOpenMenus((prev) => ({
                      ...prev,
                      [title]: !prev[title]
                    }));
                  },
                  openMenus,
                  setOpenMenus,
                  isMenuOpen,
                  setHoveredItemId,
                  hoveredItemId
                }}
                allowUnknownElements={true}
                autoCloseVoidElements={false}
                blacklistedAttrs={[]}
                components={{
                  Sidebar,
                  SidebarContent,
                  SidebarGroup,
                  SidebarGroupLabel,
                  SidebarHeader,
                  SidebarInset,
                  SidebarMenu,
                  SidebarMenuButton,
                  SidebarMenuItem,
                  SidebarMenuSub,
                  SidebarMenuSubButton,
                  SidebarMenuSubItem,
                  SidebarProvider,
                  SidebarTrigger,
                  Icons: (props: any) => <Icons {...props} />, // Wrap Icons
                  Collapsible,
                  CollapsibleContent,
                  CollapsibleTrigger,
                  ChevronRight,
                  Link: (props: any) => <Link {...props} /> // Wrap Link
                }}
                jsx={menuData || ''} // Ensure it's a string
              />
              <SidebarMenuSubItem
                onMouseEnter={() => setHoveredItemId('LOGOUT')}
                onMouseLeave={() => setHoveredItemId(null)}
              >
                <SidebarMenuSubButton
                  asChild
                  onClick={logout}
                  className="cursor-pointer"
                >
                  <div>
                    <Icons
                      name="LOGOUT"
                      className={
                        hoveredItemId === 'LOGOUT'
                          ? 'icon-white text-white'
                          : 'icon-white text-white'
                      }
                    />
                    <span className="text-sm">LOGOUT</span>
                  </div>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="mt-8">
          <div>
            <p className="text-center">
              VERSION {process.env.NEXT_PUBLIC_VERSION}
            </p>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <Header ip={ip} currentDateTime={currentDateTime} />
        {children}
      </SidebarInset>
    </>
  );
}
