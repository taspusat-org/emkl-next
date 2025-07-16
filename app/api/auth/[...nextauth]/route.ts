import { authOptions } from '@/lib/utils/options';
import NextAuth from 'next-auth';

const handler = NextAuth(authOptions);

// Export the handler directly for both GET and POST methods
export { handler as GET, handler as POST };
