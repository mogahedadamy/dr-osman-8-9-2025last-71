import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, FileText, Image, File } from "lucide-react";

interface UploadedFile {
  file: File;
  preview?: string;
  type: 'image' | 'document' | 'other';
}

interface FileUploadPreviewProps {
  files: UploadedFile[];
  onRemove: (index: number) => void;
  onClear: () => void;
}

const FileUploadPreview = ({ files, onRemove, onClear }: FileUploadPreviewProps) => {
  if (files.length === 0) return null;

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="w-4 h-4" />;
      case 'document':
        return <FileText className="w-4 h-4" />;
      default:
        return <File className="w-4 h-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="mb-4 bg-muted/50">
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">ملفات مرفقة ({files.length})</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="text-muted-foreground hover:text-destructive"
          >
            حذف الكل
          </Button>
        </div>
        
        <div className="space-y-2">
          {files.map((uploadedFile, index) => (
            <div key={index} className="flex items-center gap-3 p-2 bg-background rounded border">
              {uploadedFile.type === 'image' && uploadedFile.preview ? (
                <img 
                  src={uploadedFile.preview} 
                  alt={uploadedFile.file.name}
                  className="w-10 h-10 object-cover rounded"
                />
              ) : (
                <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                  {getFileIcon(uploadedFile.type)}
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {uploadedFile.file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(uploadedFile.file.size)}
                </p>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(index)}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FileUploadPreview;