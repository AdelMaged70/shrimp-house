// app/api/upload/route.ts
// هذا الـ API لا يستقبل الفيديو — فقط يولّد Signed URL من Supabase
// الفيديو يُرفع مباشرة من المتصفح إلى Supabase Storage

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkRateLimit } from '@/lib/rate-limit';

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

        const body = await req.json();
        const { fileName, fileType, fileSize } = body;

        if (!fileName || !fileType || !fileSize) {
            return NextResponse.json({ error: 'Missing file info' }, { status: 400 });
        }

        // 📏 Validate size (max 100MB)
        if (fileSize > 100 * 1024 * 1024) {
            return NextResponse.json(
                { error: 'File too large (max 100MB)' },
                { status: 400 }
            );
        }

        // 🎥 Validate type
        if (!fileType.startsWith('video/')) {
            return NextResponse.json(
                { error: 'Only video allowed' },
                { status: 400 }
            );
        }

        const supabase = getSupabase();
        const storagePath = `videos/${Date.now()}-${fileName}`;

        // 🔑 إنشاء Signed Upload URL — الفيديو سيُرفع مباشرة من المتصفح
        const { data, error } = await supabase.storage
            .from('reviews-videos')
            .createSignedUploadUrl(storagePath);

        if (error || !data) {
            console.error('Signed URL error:', error);
            return NextResponse.json({ error: 'Failed to create upload URL' }, { status: 500 });
        }

        // 🔗 Public URL (ستُحفظ في DB بعد اكتمال الرفع)
        const { data: publicUrlData } = supabase.storage
            .from('reviews-videos')
            .getPublicUrl(storagePath);

        return NextResponse.json({
            signedUrl: data.signedUrl,
            token: data.token,
            storagePath,
            publicUrl: publicUrlData.publicUrl,
        });

    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}