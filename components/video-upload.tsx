'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Video } from 'lucide-react';

export default function VideoUpload() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setProgress(0);

    try {
      // ① طلب Signed URL من الـ API — لا يمر الفيديو على Vercel هنا
      const signRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        }),
      });

      const signData = await signRes.json();

      if (!signRes.ok || signData.error) {
        alert(signData.error || 'حدث خطأ أثناء التحضير');
        return;
      }

      const { signedUrl, publicUrl, storagePath } = signData;

      // ② رفع الفيديو مباشرة من المتصفح إلى Supabase Storage (بدون Vercel)
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const pct = Math.round((event.loaded / event.total) * 100);
            setProgress(pct);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed: ${xhr.status} ${xhr.responseText}`));
          }
        });

        xhr.addEventListener('error', () => reject(new Error('Network error during upload')));
        xhr.addEventListener('abort', () => reject(new Error('Upload aborted')));

        xhr.open('PUT', signedUrl);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
      });

      // ③ إخبار الـ API بحفظ الـ URL في قاعدة البيانات
      const saveRes = await fetch('/api/videos/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicUrl, storagePath }),
      });

      const saveData = await saveRes.json();

      if (!saveRes.ok || saveData.error) {
        alert(saveData.error || 'حدث خطأ أثناء الحفظ');
      } else {
        alert('تم رفع الفيديو بنجاح! شكراً لك ✅');
        window.location.reload();
      }
    } catch (err: any) {
      console.error(err);
      alert('حدث خطأ غير متوقع: ' + err.message);
    } finally {
      setLoading(false);
      setProgress(0);
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
            {progress > 0 ? `جاري الرفع... ${progress}%` : 'جاري التحضير...'}
          </>
        ) : (
          <>
            <Video className="w-6 h-6" />
            اختر فيديو للتقييم من جهازك
          </>
        )}
      </Button>

      {loading && progress > 0 && (
        <div className="w-full max-w-xs bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <p className="text-sm text-muted-foreground mt-2">
        مسموح برفع الفيديوهات فقط. (الحد الأقصى 100 ميجابايت)
      </p>
    </div>
  );
}