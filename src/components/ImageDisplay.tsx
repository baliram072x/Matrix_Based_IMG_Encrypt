import { Download } from "lucide-react";

interface ImageDisplayProps {
  title: string;
  imageData: ImageData | null;
  label?: string;
}

const ImageDisplay = ({ title, imageData, label }: ImageDisplayProps) => {
  const getDataUrl = (): string | null => {
    if (!imageData) return null;
    const canvas = document.createElement("canvas");
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    canvas.getContext("2d")!.putImageData(imageData, 0, 0);
    return canvas.toDataURL("image/png");
  };

  const handleDownload = () => {
    const url = getDataUrl();
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, "_")}.png`;
    a.click();
  };

  const dataUrl = getDataUrl();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-foreground font-display font-semibold">{title}</h3>
        {imageData && (
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Download
          </button>
        )}
      </div>
      <div className="relative aspect-video bg-muted/30 rounded-lg border border-border overflow-hidden flex items-center justify-center">
        {dataUrl ? (
          <img
            src={dataUrl}
            alt={title}
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <p className="text-muted-foreground text-sm">{label || "No image"}</p>
        )}
      </div>
      {imageData && (
        <p className="text-xs text-muted-foreground font-mono">
          {imageData.width} × {imageData.height} px • {(imageData.data.length / 1024).toFixed(0)} KB
        </p>
      )}
    </div>
  );
};

export default ImageDisplay;
