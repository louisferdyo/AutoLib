import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '../../../../lib/supabaseServer';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.split(' ')[1]

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 👇 Buat Supabase client baru menggunakan access token dari header
    const supabase = createServerSupabaseClient();
    // 👇 Sekarang getUser() akan bekerja karena token sudah ditanam
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Ambil parameter query
    const searchParams = req.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')
    const offset = (page - 1) * limit

    // Query data user_activities
    const { data, error: dbError, count } = await supabase
      .from('user_activities')
      .select(`
        *,
        users:user_id (
          full_name,
          email
        )
      `, { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    return NextResponse.json({
      data,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (err) {
    console.error('Error fetching activities:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
