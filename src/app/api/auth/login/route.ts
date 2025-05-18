// app/api/auth/login/route.ts
import { NextResponse } from 'next/server'
import {createServerSupabaseClient} from '../../../../../lib/supabaseServer'  // sesuaikan path ini

export async function POST(request: Request) {
  const supabase = createServerSupabaseClient()
  const { email, password } = await request.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }

  return NextResponse.json({
    message: 'Login successful',
    user: data.user,
    session: data.session,
  })
}
