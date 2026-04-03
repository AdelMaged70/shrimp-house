// app/api/upload/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js'
import { checkRateLimit } from '@/lib/rate-limit';

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

export async function POST(req: NextRequest) {
    const supabase = getSupabase()
  try {
    const ip =
      req.headers.get('x-forwarded-for') ||
      req.headers.get('x-real-ip') ||
      'unknown';

    // 🚫 Rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many uploads, try later' },
        { status: 429 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file' }, { status: 400 });
    }

    // 📏 Validation (size)
    if (file.size > 100 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large (max 20MB)' },
        { status: 400 }
      );
    }

    // 🎥 Validation (type)
    if (!file.type.startsWith('video/')) {
      return NextResponse.json(
        { error: 'Only video allowed' },
        { status: 400 }
      );
    }

    const fileName = `videos/${Date.now()}-${file.name}`;

    // ⬆️ Upload
    const { data, error } = await supabase.storage
      .from('reviews-videos')
      .upload(fileName, file);

    if (error) throw error;

    // 🔗 public URL
    const { data: publicUrl } = supabase.storage
      .from('reviews-videos')
      .getPublicUrl(fileName);

    // 💾 Save in DB
    await supabase.from('reviews').insert({
      video_url: publicUrl.publicUrl,
    });

    // 📥 Get all videos
    const { data: videos } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    // 🧹 delete extra (keep only 3)
    if (videos && videos.length > 3) {
      const extra = videos.slice(3);

      for (const vid of extra) {
        const path = vid.video_url.split('/').slice(-2).join('/');

        await supabase.storage
          .from('reviews-videos')
          .remove([path]);

        await supabase.from('reviews').delete().eq('id', vid.id);
      }
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}