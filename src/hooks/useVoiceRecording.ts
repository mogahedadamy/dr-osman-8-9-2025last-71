import { useState, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface VoiceRecording {
  blob: Blob;
  url: string;
  duration: number;
  timestamp: string;
}

export const useVoiceRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordings, setRecordings] = useState<VoiceRecording[]>([]);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  
  const { toast } = useToast();

  const startRecording = useCallback(async () => {
    try {
      console.log("🎤 بدء التسجيل الصوتي");
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      streamRef.current = stream;
      chunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm;codecs=opus' });
        const url = URL.createObjectURL(blob);
        
        const newRecording: VoiceRecording = {
          blob,
          url,
          duration: recordingTime,
          timestamp: new Date().toLocaleTimeString('ar-SA', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })
        };

        setRecordings(prev => [...prev, newRecording]);
        
        toast({
          title: "تم حفظ التسجيل",
          description: `مدة التسجيل: ${Math.floor(recordingTime / 60)}:${(recordingTime % 60).toString().padStart(2, '0')}`
        });
      };

      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error("خطأ في بدء التسجيل:", error);
      toast({
        title: "خطأ في التسجيل",
        description: "لا يمكن الوصول للميكروفون. تأكدي من السماح بالوصول للميكروفون.",
        variant: "destructive"
      });
    }
  }, [recordingTime, toast]);

  const stopRecording = useCallback(() => {
    console.log("🛑 إيقاف التسجيل الصوتي");
    
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [isRecording]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }, [isRecording, isPaused]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
  }, [isRecording, isPaused]);

  const deleteRecording = useCallback((index: number) => {
    setRecordings(prev => {
      const newRecordings = [...prev];
      URL.revokeObjectURL(newRecordings[index].url);
      newRecordings.splice(index, 1);
      return newRecordings;
    });
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    isRecording,
    isPaused,
    recordingTime,
    recordings,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    deleteRecording,
    formatTime
  };
};