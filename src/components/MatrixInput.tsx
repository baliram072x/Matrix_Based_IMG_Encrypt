import { useState, useEffect } from "react";
import { type Matrix3x3, DEFAULT_KEY, isInvertible, inverseMatrix, formatMatrix } from "@/lib/matrixCrypto";
import { AlertTriangle, Check, RotateCcw } from "lucide-react";

interface MatrixInputProps {
  matrix: Matrix3x3;
  onChange: (matrix: Matrix3x3) => void;
}

const MatrixInput = ({ matrix, onChange }: MatrixInputProps) => {
  const [invertible, setInvertible] = useState(true);
  const [inverse, setInverse] = useState<Matrix3x3 | null>(null);

  useEffect(() => {
    const inv = inverseMatrix(matrix);
    setInvertible(inv !== null);
    setInverse(inv);
  }, [matrix]);

  const updateCell = (row: number, col: number, value: string) => {
    const num = parseInt(value) || 0;
    const newMatrix: Matrix3x3 = matrix.map((r, i) =>
      r.map((c, j) => (i === row && j === col ? num : c)) as [number, number, number]
    ) as Matrix3x3;
    onChange(newMatrix);
  };

  const reset = () => onChange([...DEFAULT_KEY.map(r => [...r])] as Matrix3x3);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-foreground font-display font-semibold text-lg">Key Matrix (K)</h3>
        <button
          onClick={reset}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>

      <div className="flex items-center gap-2">
        {/* Left bracket */}
        <div className="text-primary text-4xl font-mono leading-none select-none">[</div>

        <div className="grid grid-cols-3 gap-2">
          {matrix.map((row, i) =>
            row.map((val, j) => (
              <input
                key={`${i}-${j}`}
                type="number"
                value={val}
                onChange={(e) => updateCell(i, j, e.target.value)}
                className="w-16 h-12 text-center font-mono text-sm bg-muted border border-border rounded-md text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
            ))
          )}
        </div>

        {/* Right bracket */}
        <div className="text-primary text-4xl font-mono leading-none select-none">]</div>
      </div>

      {/* Validation */}
      <div className={`flex items-center gap-2 text-sm ${invertible ? "text-primary" : "text-destructive"}`}>
        {invertible ? (
          <>
            <Check className="w-4 h-4" />
            <span>Matrix is invertible mod 256 ✓</span>
          </>
        ) : (
          <>
            <AlertTriangle className="w-4 h-4" />
            <span>Matrix is NOT invertible mod 256 — choose a different key</span>
          </>
        )}
      </div>

      {/* Show inverse */}
      {inverse && (
        <div className="mt-3 p-3 bg-muted/50 rounded-md border border-border">
          <p className="text-xs text-muted-foreground mb-2 font-mono">K⁻¹ mod 256 =</p>
          <pre className="text-xs font-mono text-accent leading-relaxed">{formatMatrix(inverse)}</pre>
        </div>
      )}
    </div>
  );
};

export default MatrixInput;
