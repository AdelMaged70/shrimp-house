'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function VideoList() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const res = await fetch('/api/videos');
      if (res.ok) {
        const data = await res.json();
        setVideos(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground bg-white rounded-2xl border border-slate-100 shadow-sm">
        <p className="text-lg">لا توجد تقييمات حتى الآن. كن أول من يشاركنا رأيه!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {videos.map((vid) => (
        <div key={vid.id} className="rounded-2xl overflow-hidden bg-black shadow-sm border border-slate-200 aspect-[9/16] relative flex items-center justify-center">
          <video 
            controls 
            className="w-full h-full object-contain"
            preload="metadata"
          >
            <source src={vid.video_url} />
          </video>
        </div>
      ))}
    </div>
  );
}