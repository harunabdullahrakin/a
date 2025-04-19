import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, CheckCheck, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  accept?: string;
  maxSizeMB?: number;
  onFileSelect: (base64: string) => void;
  className?: string;
  buttonText?: string;
  currentValue?: string;
}

export function FileUpload({
  accept = 'image/*',
  maxSizeMB = 2,
  onFileSelect,
  className = '',
  buttonText = 'Upload File',
  currentValue
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(currentValue || null);

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);

    if (!file) return;

    // Check file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size exceeds ${maxSizeMB}MB limit`);
      return;
    }

    setIsProcessing(true);
    
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setPreview(base64);
      onFileSelect(base64);
      setIsProcessing(false);
    };
    
    reader.onerror = () => {
      setError('Failed to read file');
      setIsProcessing(false);
    };
    
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setPreview(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    onFileSelect('');
  };

  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleButtonClick}
          disabled={isProcessing}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          {isProcessing ? 'Processing...' : buttonText}
        </Button>
        
        {preview && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="h-9 px-2 text-destructive hover:text-destructive/90"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
      
      {error && (
        <div className="flex items-center text-destructive text-sm mt-1">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error}
        </div>
      )}
      
      {preview && (
        <div className="mt-2 flex items-center">
          <div className="bg-muted p-2 rounded-md mr-2">
            <img
              src={preview}
              alt="Preview"
              className="h-10 w-10 object-contain"
              onError={() => setError('Invalid image format')}
            />
          </div>
          <div className="text-sm text-muted-foreground flex items-center">
            <CheckCheck className="h-4 w-4 mr-1 text-green-500" />
            File ready to upload
          </div>
        </div>
      )}
    </div>
  );
}