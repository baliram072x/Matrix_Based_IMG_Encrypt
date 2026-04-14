import { useState } from "react";
import { ChevronDown } from "lucide-react";

const sections = [
  {
    title: "Images as Matrices",
    content: `Every digital image is a grid (matrix) of pixels. Each pixel contains three color channels — Red, Green, and Blue (RGB) — with values ranging from 0 to 255.

A 100×100 pixel image is represented as three 100×100 matrices, one for each color channel. This matrix representation is the foundation of our encryption.`,
    formula: "Pixel(x, y) = [R, G, B] where R, G, B ∈ {0, 1, ..., 255}",
  },
  {
    title: "Matrix Multiplication in Encryption",
    content: `To encrypt, we multiply each pixel's RGB vector by a 3×3 key matrix K:

E = K × P

This scrambles the color channels together, making the image unrecognizable. Each encrypted pixel value is a linear combination of all three original channels, weighted by the key matrix.`,
    formula: `E = K × [R, G, B]ᵀ

┌ e_R ┐   ┌ k₁₁  k₁₂  k₁₃ ┐   ┌ R ┐
│ e_G │ = │ k₂₁  k₂₂  k₂₃ │ × │ G │
└ e_B ┘   └ k₃₁  k₃₂  k₃₃ ┘   └ B ┘`,
  },
  {
    title: "Modulo Operation",
    content: `Since pixel values must stay within 0–255, we apply modulo 256 after each multiplication:

E = (K × P) mod 256

This ensures all encrypted values wrap around to valid pixel values. The modulo operation also adds an extra layer of complexity, making the encryption harder to break without the key.`,
    formula: "E = (K × P) mod 256",
  },
  {
    title: "Inverse Matrix for Decryption",
    content: `To decrypt, we need K⁻¹ — the modular inverse of the key matrix mod 256. Not every matrix has a modular inverse; the determinant must be coprime with 256 (i.e., it must be odd).

When K⁻¹ exists:  P = (K⁻¹ × E) mod 256

This perfectly recovers the original pixel values, demonstrating that encryption with invertible matrices is lossless and reversible.`,
    formula: "P = (K⁻¹ × E) mod 256  ⟹  Original Image",
  },
];

const MathExplanation = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-display font-bold text-foreground glow-text">
        How It Works
      </h2>
      <p className="text-muted-foreground text-sm">
        A practical demonstration of linear algebra in cybersecurity.
      </p>

      <div className="space-y-2">
        {sections.map((section, i) => (
          <div
            key={i}
            className="border border-border rounded-lg overflow-hidden transition-colors hover:border-primary/30"
          >
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between p-4 text-left"
            >
              <span className="font-display font-medium text-foreground flex items-center gap-3">
                <span className="text-primary font-mono text-sm">0{i + 1}</span>
                {section.title}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-muted-foreground transition-transform ${
                  openIndex === i ? "rotate-180" : ""
                }`}
              />
            </button>
            {openIndex === i && (
              <div className="px-4 pb-4 space-y-3">
                <p className="text-sm text-card-foreground leading-relaxed whitespace-pre-line">
                  {section.content}
                </p>
                <pre className="p-3 bg-muted/50 rounded-md text-xs font-mono text-accent overflow-x-auto">
                  {section.formula}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MathExplanation;
