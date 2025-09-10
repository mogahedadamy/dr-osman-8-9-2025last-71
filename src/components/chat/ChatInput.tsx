import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Mic, Camera, Paperclip } from "lucide-react";
import { useFileUpload } from "@/hooks/useFileUpload";
import FileUploadPreview from "./FileUploadPreview";
import VoiceRecorder from "./VoiceRecorder";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onSendWithAttachments?: (message: string, attachments: { files: File[], recordings: any[] }) => void;
}

const ChatInput = ({ value, onChange, onSend, onSendWithAttachments }: ChatInputProps) => {
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const { 
    uploadedFiles, 
    isUploading, 
    fileInputRef, 
    handleFileSelect, 
    removeFile, 
    clearFiles, 
    handleFileChange 
  } = useFileUpload();
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      console.log("💬 ChatInput: إرسال رسالة بالضغط على Enter", { messageLength: value.length });
      onSend();
    }
  };

  const handleAttach = () => {
    console.log("📎 ChatInput: فتح مربع اختيار الملفات");
    handleFileSelect();
  };

  const handleCamera = () => {
    console.log("📷 ChatInput: فتح الكاميرا للتصوير");
    // Create camera input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) handleFileChange({ target: { files } } as any);
    };
    input.click();
  };

  const handleVoice = () => {
    console.log("🎤 ChatInput: فتح مسجل الصوت");
    setShowVoiceRecorder(true);
  };

  const handleSend = () => {
    console.log("📤 ChatInput: إرسال رسالة", { 
      messageLength: value.length, 
      hasContent: !!value.trim(),
      attachments: uploadedFiles.length 
    });
    
    if (uploadedFiles.length > 0 && onSendWithAttachments) {
      onSendWithAttachments(value, { files: uploadedFiles.map(f => f.file), recordings: [] });
      clearFiles();
    } else {
      onSend();
    }
  };

  const handleSendRecording = (recording: { url: string; duration: number }) => {
    console.log("🎤 ChatInput: إرسال تسجيل صوتي", recording);
    if (onSendWithAttachments) {
      onSendWithAttachments(`[تسجيل صوتي - ${Math.floor(recording.duration / 60)}:${(recording.duration % 60).toString().padStart(2, '0')}]`, 
        { files: [], recordings: [recording] });
    }
    setShowVoiceRecorder(false);
  };

  return (
    <div className="bg-background/80 backdrop-blur-md border-t border-border p-4">
      <div className="container mx-auto">
        <FileUploadPreview 
          files={uploadedFiles}
          onRemove={removeFile}
          onClear={clearFiles}
        />
        
        <div className="flex items-center gap-2">
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-2"
              onClick={handleAttach}
              disabled={isUploading}
            >
              <Paperclip className={`w-5 h-5 ${isUploading ? 'animate-spin text-primary' : 'text-muted-foreground'}`} />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-2"
              onClick={handleCamera}
            >
              <Camera className="w-5 h-5 text-muted-foreground" />
            </Button>
          </div>
          
          <div className="flex-1 relative">
            <Input
              placeholder="اكتبي سؤالك هنا..."
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pr-4 pl-12 py-3 text-right"
            />
            <Button 
              variant="ghost" 
              size="sm" 
              className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2"
              onClick={handleVoice}
            >
              <Mic className="w-5 h-5 text-muted-foreground" />
            </Button>
          </div>
          
          <Button 
            onClick={handleSend}
            disabled={!value.trim() && uploadedFiles.length === 0}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-3"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,document/*,.pdf,.doc,.docx"
          onChange={handleFileChange}
          className="hidden"
        />
        
        <VoiceRecorder
          isOpen={showVoiceRecorder}
          onClose={() => setShowVoiceRecorder(false)}
          onSendRecording={handleSendRecording}
        />
      </div>
    </div>
  );
};

export default ChatInput;