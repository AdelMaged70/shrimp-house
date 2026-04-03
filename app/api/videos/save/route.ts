// app/api/videos/save/route.ts
// يُستدعى من المتصفح بعد اكتمال رفع الفيديو مباشرة إلى Supabase
// يحفظ الـ publicUrl في قاعدة البيانات ويحذف الفيديوهات الزائدة (يبقي فقط 3)

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key =
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
        throw new Error('Missing Supabase environment variables');
    }
    return createClient(url, key);
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { publicUrl, storagePath } = body;

        if (!publicUrl || !storagePath) {
            return NextResponse.json({ error: 'Missing data' }, { status: 400 });
        }

        const supabase = getSupabase();

        // 💾 حفظ في قاعدة البيانات
        await supabase.from('reviews').insert({ video_url: publicUrl });

        // 📥 جلب كل الفيديوهات
        const { data: videos } = await supabase
            .from('reviews')
            .select('*')
            .order('created_at', { ascending: false });

        // 🧹 حذف الزيادة (يبقي فقط 3)
        if (videos && videos.length > 3) {
            const extra = videos.slice(3);

            for (const vid of extra) {
                const path = vid.video_url.split('/storage/v1/object/public/reviews-videos/')[1];
                if (path) {
                    await supabase.storage
                        .from('reviews-videos')
                        .remove([path]);
                }
                await supabase.from('reviews').delete().eq('id', vid.id);
            }
        }

        return NextResponse.json({ success: true });

    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
