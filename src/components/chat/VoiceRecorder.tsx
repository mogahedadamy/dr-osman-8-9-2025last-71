import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, Square, Play, Pause, Trash2, Send } from "lucide-react";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";

interface VoiceRecorderProps {
  onSendRecording?: (recording: { url: string; duration: number }) => void;
  onClose?: () => void;
  isOpen: boolean;
}

const VoiceRecorder = ({ onSendRecording, onClose, isOpen }: VoiceRecorderProps) => {
  const {
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
  } = useVoiceRecording();

  if (!isOpen) return null;

  const handleSendRecording = (index: number) => {
    const recording = recordings[index];
    onSendRecording?.({
      url: recording.url,
      duration: recording.duration
    });
    onClose?.();
  };

  return (
    <Card className="fixed bottom-20 left-4 right-4 z-50 shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">التسجيل الصوتي</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>

        {/* Recording Controls */}
        <div className="flex items-center justify-center gap-4 mb-4">
          {!isRecording ? (
            <Button 
              onClick={startRecording}
              className="rounded-full w-16 h-16 bg-red-500 hover:bg-red-600"
            >
              <Mic className="w-6 h-6 text-white" />
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                onClick={isPaused ? resumeRecording : pauseRecording}
                variant="outline"
                size="sm"
                className="rounded-full"
              >
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </Button>
              
              <div className="text-center">
                <div className="text-lg font-mono">
                  {formatTime(recordingTime)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {isPaused ? "متوقف" : "جاري التسجيل..."}
                </div>
              </div>
              
              <Button
                onClick={stopRecording}
                variant="outline"
                size="sm"
                className="rounded-full"
              >
                <Square className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Recording indicator */}
        {isRecording && !isPaused && (
          <div className="flex justify-center mb-4">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}

        {/* Recordings List */}
        {recordings.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-2">التسجيلات ({recordings.length})</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {recordings.map((recording, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                  <audio 
                    controls 
                    src={recording.url}
                    className="flex-1 h-8"
                  />
                  <span className="text-xs text-muted-foreground">
                    {formatTime(recording.duration)}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleSendRecording(index)}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteRecording(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VoiceRecorder;