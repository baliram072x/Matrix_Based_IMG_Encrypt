import { useState, useCallback } from "react";
import { Lock, Unlock, Shield, Zap } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";
import MatrixInput from "@/components/MatrixInput";
import ImageDisplay from "@/components/ImageDisplay";
import MathExplanation from "@/components/MathExplanation";
import {
  type Matrix3x3,
  DEFAULT_KEY,
  processImage,
  inverseMatrix,
  isInvertible,
} from "@/lib/matrixCrypto";

const Index = () => {
  const [originalImageData, setOriginalImageData] = useState<ImageData | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [encryptedImageData, setEncryptedImageData] = useState<ImageData | null>(null);
  const [decryptedImageData, setDecryptedImageData] = useState<ImageData | null>(null);
  const [keyMatrix, setKeyMatrix] = useState<Matrix3x3>(
    DEFAULT_KEY.map((r) => [...r]) as Matrix3x3
  );
  const [processing, setProcessing] = useState(false);

  const handleImageLoad = useCallback((imageData: ImageData, url: string) => {
    setOriginalImageData(imageData);
    setOriginalUrl(url);
    setEncryptedImageData(null);
    setDecryptedImageData(null);
  }, []);

  const handleEncrypt = useCallback(() => {
    if (!originalImageData || !isInvertible(keyMatrix)) return;
    setProcessing(true);
    // Use setTimeout to allow UI to update with loading state
    setTimeout(() => {
      const encrypted = processImage(originalImageData, keyMatrix);
      setEncryptedImageData(encrypted);
      setDecryptedImageData(null);
      setProcessing(false);
    }, 50);
  }, [originalImageData, keyMatrix]);

  const handleDecrypt = useCallback(() => {
    if (!encryptedImageData) return;
    const inv = inverseMatrix(keyMatrix);
    if (!inv) return;
    setProcessing(true);
    setTimeout(() => {
      const decrypted = processImage(encryptedImageData, inv);
      setDecryptedImageData(decrypted);
      setProcessing(false);
    }, 50);
  }, [encryptedImageData, keyMatrix]);

  return (
    <div className="min-h-screen bg-background matrix-grid-bg">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center glow-primary">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-foreground">
              Matrix<span className="text-primary">Crypt</span>
            </h1>
            <p className="text-xs text-muted-foreground">
              Image encryption through linear algebra
            </p>
          </div>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-8 space-y-10">
        {/* Hero */}
        <section className="text-center py-8">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            Encrypt Images with{" "}
            <span className="text-primary glow-text">Mathematics</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Upload an image, define a key matrix, and watch linear algebra
            transform your pixels into encrypted data — then reverse it
            perfectly.
          </p>
        </section>

        {/* Upload + Key Matrix */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono">
              <Zap className="w-4 h-4 text-primary" /> STEP 1 — Upload Image
            </div>
            <ImageUpload onImageLoad={handleImageLoad} />
          </div>
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono">
              <Zap className="w-4 h-4 text-primary" /> STEP 2 — Configure Key
            </div>
            <div className="p-6 border border-border rounded-lg bg-card">
              <MatrixInput matrix={keyMatrix} onChange={setKeyMatrix} />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {originalImageData && (
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={handleEncrypt}
              disabled={processing || !isInvertible(keyMatrix)}
              className="flex items-center gap-2 px-8 py-3 rounded-lg bg-primary text-primary-foreground font-display font-semibold transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed glow-primary"
            >
              <Lock className="w-5 h-5" />
              {processing ? "Processing..." : "Encrypt"}
            </button>
            <button
              onClick={handleDecrypt}
              disabled={processing || !encryptedImageData}
              className="flex items-center gap-2 px-8 py-3 rounded-lg bg-accent text-accent-foreground font-display font-semibold transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed glow-accent"
            >
              <Unlock className="w-5 h-5" />
              {processing ? "Processing..." : "Decrypt"}
            </button>
          </div>
        )}

        {/* Image Outputs */}
        {originalImageData && (
          <div className="grid md:grid-cols-3 gap-6">
            <ImageDisplay title="Original" imageData={originalImageData} label="Upload an image" />
            <ImageDisplay title="Encrypted" imageData={encryptedImageData} label="Click Encrypt" />
            <ImageDisplay title="Decrypted" imageData={decryptedImageData} label="Click Decrypt" />
          </div>
        )}

        {/* Processing indicator */}
        {processing && (
          <div className="flex items-center justify-center gap-3 text-primary">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="font-mono text-sm animate-pulse-glow">
              Processing pixel matrices...
            </span>
          </div>
        )}

        {/* Math Explanation */}
        <section className="py-8 border-t border-border">
          <MathExplanation />
        </section>

        {/* Footer */}
        <footer className="text-center py-6 border-t border-border">
          <p className="text-xs text-muted-foreground font-mono">
            MatrixCrypt • Educational demonstration of linear algebra in cryptography
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
