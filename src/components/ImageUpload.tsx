import { useCallback, useRef, useState } from "react";
import { Upload, Image as ImageIcon } from "lucide-react";

interface ImageUploadProps {
  onImageLoad: (imageData: ImageData, imageUrl: string) => void;
}

const ImageUpload = ({ onImageLoad }: ImageUploadProps) => {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file (JPG/PNG).");
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      onImageLoad(imageData, url);
    };
    img.src = url;
  }, [onImageLoad]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]);
  }, [processFile]);

  return (
    <div
      className={`relative border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all duration-300 ${
        dragOver
          ? "border-primary bg-primary/5 glow-primary"
          : "border-border hover:border-primary/50"
      }`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
      />
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          {dragOver ? (
            <ImageIcon className="w-8 h-8 text-primary" />
          ) : (
            <Upload className="w-8 h-8 text-muted-foreground" />
          )}
        </div>
        <div>
          <p className="text-foreground font-medium text-lg">Drop your image here</p>
          <p className="text-muted-foreground text-sm mt-1">or click to browse • JPG, PNG supported</p>
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;
