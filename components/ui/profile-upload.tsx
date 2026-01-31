"use client";

import { User } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface ProfileUploadProps {
  currentImage?: string | null;
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export function ProfileUpload({
  currentImage,
  onFileSelect,
  disabled,
}: ProfileUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset preview if currentImage changes externally (e.g. after save)
  useEffect(() => {
    // If we want to clear preview after successful save, parent might need to trigger this.
    // For now, if currentImage changes, we assume it's the new source of truth?
    // Or we just keep preview until component unmounts?
    // Let's rely on parent passing a key or just manual reset if needed.
    // Actually simplicity: If currentImage matches preview, logic? No.
  }, [currentImage]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      onFileSelect(file);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group">
        <div className="h-24 w-24 rounded-full overflow-hidden bg-muted border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              className="h-full w-full object-cover"
            />
          ) : currentImage ? (
            <img
              src={currentImage}
              alt="Current"
              className="h-full w-full object-cover"
            />
          ) : (
            <User className="h-8 w-8 text-muted-foreground" />
          )}
        </div>
        <label
          htmlFor="avatar-upload-component"
          className={`absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full ${disabled ? "pointer-events-none" : ""}`}
        >
          <span className="text-xs text-white font-medium">Change</span>
        </label>
        <input
          id="avatar-upload-component"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={disabled}
          ref={inputRef}
        />
      </div>
      <p className="text-sm text-muted-foreground">Upload a profile picture</p>
    </div>
  );
}
