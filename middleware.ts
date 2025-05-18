// File: middleware.ts

import { NextRequest, NextResponse } from 'next/server';
import supabase from './lib/supabase';

// Daftar halaman yang tidak memerlukan autentikasi
const publicPages = ['/login', '/register', '/'];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  // Dapatkan token dari cookies
  const token = req.cookies.get('sb-access-token')?.value;
  
  let session = null;
  
  if (token) {
    // Verifikasi token dan dapatkan user
    const { data, error } = await supabase.auth.getUser(token);
    
    if (!error && data.user) {
      session = { user: data.user };
    }
  }
  
  const pathname = req.nextUrl.pathname;
  
  // Handle halaman yang memerlukan autentikasi
  const isPublicPage = publicPages.some(page => 
    pathname === page || pathname.startsWith('/api/')
  );
  
  // Jika bukan halaman publik dan tidak ada session, redirect ke login
  if (!isPublicPage && !session) {
    const redirectUrl = new URL('/login', req.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }
  
  // Jika sudah login dan mengakses halaman login/register, redirect ke dashboard
  if (session && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }
  
  return res;
}

// Konfigurasi jalur mana yang akan menggunakan middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images/ (public images folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|images/).*)',
  ],
};