'use client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import ava from '../../public/image/ava.png';
import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import { Button } from '../ui/button';
import { clearCredentials } from '@/lib/store/authSlice/authSlice';
import { useDispatch } from 'react-redux';
import { persistor } from '@/lib/store/store';
import { deleteCookie } from '@/lib/utils/cookie-actions';
import { useRouter } from 'next/navigation';
import { tokenCache } from '@/lib/utils/AxiosInstance';

export function UserNav() {
  const { data: session } = useSession();
  const router = useRouter();
  const dispatch = useDispatch();

  const logout = async () => {
    try {
      // Clear token cache dari axios instance
      tokenCache.clearCache();

      await persistor.purge();
      dispatch(clearCredentials());
      // Sign out dari NextAuth
      await signOut({ callbackUrl: '/auth/signin' });
    } catch (error) {
      console.error('Logout error:', error);
      // Tetap redirect meskipun ada error
      router.push('/auth/signin');
    }
  };

  if (session) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative h-7 w-10 rounded-full bg-primary lg:h-8 lg:w-8"
          >
            <Image src={ava} alt="ava" layout="fill" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {session.user?.username}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout}>
            Log out
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
}
