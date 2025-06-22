import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, File, X } from 'lucide-react';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
}

export const FileUploader = ({ onFileSelect }: FileUploaderProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".txt,.pdf,.doc,.docx,.csv,.md,.pptx"
      />
      
      {!selectedFile ? (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/20'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleButtonClick}
        >
          <Upload className="mx-auto mb-2 size-8 text-muted-foreground" />
          <p className="mb-1 font-medium">Drag and drop a file or click to browse</p>
          <p className="text-muted-foreground text-sm">
            Supported formats: TXT, PDF, DOC, DOCX, CSV, MD
          </p>
        </div>
      ) : (
        <div className="p-4 border rounded-lg">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <File className="size-6 text-primary" />
              <div>
                <p className="max-w-[200px] font-medium truncate">{selectedFile.name}</p>
                <p className="text-muted-foreground text-xs">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRemoveFile}
              className="text-muted-foreground hover:text-destructive"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}; 