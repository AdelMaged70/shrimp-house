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
        { error: 'عمليات رفع كثيرة، حاول لاحقاً' },
        { status: 429 }
      );
    }

    const payload = await req.json();

    // 1. Generate a signed URL for direct upload
    if (payload.action === 'get_signed_url') {
      const { fileName } = payload;
      
      const { data, error } = await supabase.storage
        .from('reviews-videos')
        .createSignedUploadUrl(fileName);
        
      if (error) throw error;
      
      return NextResponse.json({ ...data }); // returns { token, path, signedUrl }
    }
    
    // 2. Save the uploaded file to Database and clean up old videos
    if (payload.action === 'save_db') {
      const { fileName } = payload;
      
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
    }

    return NextResponse.json({ error: 'Action not valid' }, { status: 400 });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}