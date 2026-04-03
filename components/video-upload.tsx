'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Video } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Setup Supabase Client for frontend direct upload
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function VideoUpload() {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 100 * 1024 * 1024) {
      alert('نعتذر، الحد الأقصى لحجم الفيديو هو 100 ميجابايت.');
      return;
    }

    if (!file.type.startsWith('video/')) {
      alert('يرجى اختيار ملف فيديو فقط.');
      return;
    }

    setLoading(true);

    try {
      const ext = file.name.split('.').pop();
      const fileName = `videos/${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;

      // 1. Request Signed Upload URL from our secure API
      const signRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_signed_url', fileName }),
      });
      const signData = await signRes.json();
      
      if (!signRes.ok || signData.error) {
        throw new Error(signData.error || 'فشل الحصول على تصريح الرفع');
      }

      // 2. Upload file directly to Supabase Storage utilizing the signed URL and token 
      // This completely bypasses Vercel's payload limits!
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('reviews-videos')
        .uploadToSignedUrl(fileName, signData.token, file);

      if (uploadError) {
        throw uploadError;
      }

      // 3. Confirm upload and save to Database via API
      const saveRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save_db', fileName }),
      });
      const saveData = await saveRes.json();

      if (!saveRes.ok || saveData.error) {
        throw new Error(saveData.error || 'حدث خطأ أثناء حفظ التقييم');
      }

      alert('تم رفع الفيديو بنجاح! شكراً لك ✅');
      window.location.reload(); // Refresh to show new video
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
      // Reset input so the same file could be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <input 
        type="file" 
        accept="video/*" 
        onChange={handleUpload} 
        className="hidden" 
        ref={fileInputRef}
      />
      
      <Button 
        onClick={handleButtonClick} 
        disabled={loading}
        size="lg"
        className="gap-2 w-full sm:w-auto font-bold text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all"
      >
        {loading ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin" />
            جاري الرفع... (قد يستغرق بعض الوقت)
          </>
        ) : (
          <>
            <Video className="w-6 h-6" />
            اختر فيديو للتقييم من جهازك
          </>
        )}
      </Button>
      
      <p className="text-sm text-muted-foreground mt-2">
        مسموح برفع الفيديوهات فقط. (الحد الأقصى 100 ميجابايت)
      </p>
    </div>
  );
}