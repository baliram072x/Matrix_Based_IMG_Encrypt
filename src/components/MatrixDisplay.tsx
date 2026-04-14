import { useState } from "react";
import { Copy, Check, Upload } from "lucide-react";

interface MatrixDisplayProps {
  title: string;
  imageData: ImageData | null;
  maxDisplaySize?: number;
  onPasteDecrypt?: (imageData: ImageData) => void;
}

const MatrixDisplay = ({ title, imageData, maxDisplaySize = 8, onPasteDecrypt }: MatrixDisplayProps) => {
  const [showFullMatrix, setShowFullMatrix] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPasteArea, setShowPasteArea] = useState(false);
  const [pasteError, setPasteError] = useState<string | null>(null);

  if (!imageData) {
    return (
      <div className="space-y-3">
        <h3 className="text-foreground font-display font-semibold">{title}</h3>
        <div className="aspect-video bg-muted/30 rounded-lg border border-border flex items-center justify-center">
          <p className="text-muted-foreground text-sm">No data</p>
        </div>
      </div>
    );
  }

  const getPixelMatrix = (): number[][][] => {
    const matrix: number[][][] = [];
    const displaySize = showFullMatrix ? imageData.height : Math.min(maxDisplaySize, imageData.height);
    
    for (let y = 0; y < displaySize; y++) {
      const row: number[][] = [];
      for (let x = 0; x < Math.min(maxDisplaySize, imageData.width); x++) {
        const idx = (y * imageData.width + x) * 4;
        row.push([imageData.data[idx], imageData.data[idx + 1], imageData.data[idx + 2]]);
      }
      matrix.push(row);
    }
    return matrix;
  };

  const getMatrixAsText = (): string => {
    const matrix: number[][][] = [];
    for (let y = 0; y < imageData.height; y++) {
      const row: number[][] = [];
      for (let x = 0; x < imageData.width; x++) {
        const idx = (y * imageData.width + x) * 4;
        row.push([imageData.data[idx], imageData.data[idx + 1], imageData.data[idx + 2]]);
      }
      matrix.push(row);
    }
    
    const lines = matrix.map(row => 
      row.map(pixel => `[${pixel[0]},${pixel[1]},${pixel[2]}]`).join('|')
    );
    return `${imageData.width},${imageData.height}\n` + lines.join('\n');
  };

  const handleCopy = async () => {
    const text = getMatrixAsText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const parsePastedData = (text: string): ImageData | null => {
    try {
      const lines = text.trim().split('\n');
      if (lines.length < 2) return null;
      
      const [dimensions, ...matrixLines] = lines;
      const [width, height] = dimensions.split(',').map(Number);
      
      if (isNaN(width) || isNaN(height) || matrixLines.length !== height) {
        return null;
      }
      
      const data = new Uint8ClampedArray(width * height * 4);
      let dataIdx = 0;
      
      for (let y = 0; y < height; y++) {
        const cells = matrixLines[y].split('|');
        for (let x = 0; x < Math.min(width, cells.length); x++) {
          const pixel = cells[x].replace('[', '').replace(']', '').split(',').map(Number);
          if (pixel.length === 3) {
            data[dataIdx] = pixel[0];
            data[dataIdx + 1] = pixel[1];
            data[dataIdx + 2] = pixel[2];
            data[dataIdx + 3] = 255;
            dataIdx += 4;
          }
        }
      }
      
      return new ImageData(data, width, height);
    } catch {
      return null;
    }
  };

  const handlePaste = () => {
    navigator.clipboard.readText().then(text => {
      const parsed = parsePastedData(text);
      if (parsed && onPasteDecrypt) {
        onPasteDecrypt(parsed);
        setShowPasteArea(false);
        setPasteError(null);
      } else {
        setPasteError("Invalid matrix format. Please paste valid encrypted matrix data.");
      }
    }).catch(() => {
      setPasteError("Could not read clipboard. Please paste manually below.");
      setShowPasteArea(true);
    });
  };

  const handleManualPaste = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    const parsed = parsePastedData(text);
    if (parsed && onPasteDecrypt) {
      onPasteDecrypt(parsed);
      setShowPasteArea(false);
      setPasteError(null);
    } else {
      setPasteError("Invalid matrix format");
    }
  };

  const pixelMatrix = getPixelMatrix();
  const displaySize = showFullMatrix ? imageData.height : Math.min(maxDisplaySize, imageData.height);
  const displayWidth = Math.min(maxDisplaySize, imageData.width);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-foreground font-display font-semibold">{title}</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-mono">
            {imageData.width} × {imageData.height} px
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
            title="Copy matrix data"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied!" : "Copy"}
          </button>
          {onPasteDecrypt && (
            <button
              onClick={handlePaste}
              className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
              title="Paste & Decrypt"
            >
              <Upload className="w-3.5 h-3.5" />
              Paste
            </button>
          )}
        </div>
      </div>
      
      <div className="border border-border rounded-lg bg-card overflow-hidden">
        <div className="overflow-auto max-h-80">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="px-1 py-1 text-left text-muted-foreground w-8">R\C</th>
                {Array.from({ length: displayWidth }, (_, i) => (
                  <th key={i} className="px-1 py-1 text-center text-muted-foreground min-w-[40px]">
                    {i}
                  </th>
                ))}
                {imageData.width > maxDisplaySize && !showFullMatrix && (
                  <th className="px-1 py-1 text-center text-muted-foreground">...</th>
                )}
              </tr>
            </thead>
            <tbody>
              {pixelMatrix.map((row, y) => (
                <tr key={y} className="border-b border-border/50 hover:bg-muted/20">
                  <td className="px-1 py-1 text-muted-foreground bg-muted/30">{y}</td>
                  {row.map((pixel, x) => (
                    <td key={x} className="px-1 py-1 text-center">
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-red-500">{pixel[0]}</span>
                        <span className="text-green-500">{pixel[1]}</span>
                        <span className="text-blue-500">{pixel[2]}</span>
                      </div>
                    </td>
                  ))}
                  {imageData.width > maxDisplaySize && !showFullMatrix && (
                    <td className="px-1 py-1 text-center text-muted-foreground">...</td>
                  )}
                </tr>
              ))}
              {imageData.height > maxDisplaySize && !showFullMatrix && (
                <tr>
                  <td className="px-1 py-1 text-muted-foreground bg-muted/30">...</td>
                  <td colSpan={displayWidth + (imageData.width > maxDisplaySize ? 1 : 0)} className="text-center text-muted-foreground py-1">
                    ...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {(imageData.width > maxDisplaySize || imageData.height > maxDisplaySize) && (
        <button
          onClick={() => setShowFullMatrix(!showFullMatrix)}
          className="text-xs text-primary hover:underline font-mono"
        >
          {showFullMatrix ? "Show Less" : `Show Full Matrix (${imageData.width * imageData.height} pixels)`}
        </button>
      )}

      {showPasteArea && onPasteDecrypt && (
        <div className="mt-3 p-3 border border-border rounded-lg bg-card">
          <label className="text-xs text-muted-foreground mb-2 block">Paste encrypted matrix data:</label>
          <textarea
            className="w-full h-24 text-xs font-mono p-2 border border-border rounded bg-background text-foreground"
            placeholder="Paste matrix data here... (format: width,height followed by pixel rows)"
            onChange={handleManualPaste}
          />
          {pasteError && <p className="text-xs text-red-500 mt-1">{pasteError}</p>}
        </div>
      )}
    </div>
  );
};

export default MatrixDisplay;