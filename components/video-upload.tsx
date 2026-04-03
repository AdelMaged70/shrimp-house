'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Video } from 'lucide-react';

export default function VideoUpload() {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      
      if (!res.ok || data.error) {
        alert(data.error || 'حدث خطأ أثناء الرفع');
      } else {
        alert('تم رفع الفيديو بنجاح! شكراً لك ✅');
        window.location.reload(); // Refresh to show new video
      }
    } catch (err) {
      alert('حدث خطأ غير متوقع');
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
            جاري الرفع...
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