// File: app/api/auth/session/route.ts

import { NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    // Buat supabase client dengan cookie store dari next/headers (server side)
    const supabase = createServerComponentClient({ cookies })

    // Ambil session user saat ini
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json(
        {
          user: null,
          session: null,
        },
        { status: 401 }
      )
    }

    // Ambil data user dari tabel users berdasarkan session user id
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (userError) {
      console.error('Error fetching user data:', userError)
      // Kembalikan data session tanpa user detail jika error
      return NextResponse.json({
        user: session.user,
        session: session,
      })
    }

    return NextResponse.json({
      user: userData || session.user,
      session: session,
    })
  } catch (error) {
    console.error('Error fetching session:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
