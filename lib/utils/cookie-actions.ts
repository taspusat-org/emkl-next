// actions/cookie-actions.js
'use server';

import { cookies } from 'next/headers';

export async function deleteCookie() {
  cookies().delete('next-auth.session-token');
}
export async function setCookie(accessToken: string) {
  const cookieStore = cookies();
  const maxAgeInSeconds = 8 * 60 * 60; // 8 hours in seconds

  cookieStore.set('next-auth.session-token', accessToken, {
    httpOnly: true, // Set agar cookie hanya dapat diakses server
    path: '/', // Path cookie bisa diakses di seluruh domain
    secure: process.env.NODE_ENV === 'production', // Aktifkan secure cookie di production
    maxAge: maxAgeInSeconds // Set maxAge sesuai dengan 8 jam
  });
}
