// actions/cookie-actions.js
'use server';

import { cookies } from 'next/headers';

export async function deleteCookie() {
  cookies().delete('next-auth.session-token');
}
