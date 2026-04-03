// app/api/videos/route.ts

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server';

function getSupabase() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key =
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key) {
        throw new Error('Missing Supabase environment variables')
    }
    return createClient(url, key)
}

export async function GET() {
  const supabase = getSupabase()
  const { data } = await supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(3);

  return NextResponse.json(data);
}