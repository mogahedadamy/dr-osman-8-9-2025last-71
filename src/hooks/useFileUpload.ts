import { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UploadedFile {
  file: File;
  preview?: string;
  type: 'image' | 'document' | 'other';
}

export const useFileUpload = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const processFiles = async (files: FileList) => {
    setIsUploading(true);
    const newFiles: UploadedFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "حجم الملف كبير جداً",
          description: `حجم الملف ${file.name} يجب أن يكون أقل من 10 ميجابايت`,
          variant: "destructive"
        });
        continue;
      }

      const fileType = file.type.startsWith('image/') ? 'image' 
                     : file.type.includes('pdf') || file.type.includes('document') ? 'document' 
                     : 'other';

      let preview: string | undefined;
      
      // Create preview for images
      if (fileType === 'image') {
        preview = await createImagePreview(file);
      }

      newFiles.push({
        file,
        preview,
        type: fileType
      });
    }

    setUploadedFiles(prev => [...prev, ...newFiles]);
    setIsUploading(false);

    if (newFiles.length > 0) {
      toast({
        title: "تم رفع الملفات",
        description: `تم رفع ${newFiles.length} ملف بنجاح`
      });
    }
  };

  const createImagePreview = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearFiles = () => {
    setUploadedFiles([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  };

  return {
    uploadedFiles,
    isUploading,
    fileInputRef,
    handleFileSelect,
    removeFile,
    clearFiles,
    handleFileChange
  };
};