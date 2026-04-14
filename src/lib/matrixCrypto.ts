// Matrix-based image encryption/decryption using modular arithmetic

export type Matrix3x3 = [
  [number, number, number],
  [number, number, number],
  [number, number, number]
];

// Modular arithmetic helper: always returns positive result
function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

// Compute determinant of a 3x3 matrix
export function determinant(m: Matrix3x3): number {
  return (
    m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
    m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
    m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0])
  );
}

// Extended Euclidean Algorithm to find modular inverse
function modInverse(a: number, m: number): number | null {
  a = mod(a, m);
  for (let x = 1; x < m; x++) {
    if (mod(a * x, m) === 1) return x;
  }
  return null;
}

// Compute the modular inverse of a 3x3 matrix mod 256
export function inverseMatrix(m: Matrix3x3): Matrix3x3 | null {
  const det = determinant(m);
  const detMod = mod(det, 256);
  const detInv = modInverse(detMod, 256);

  if (detInv === null) return null; // Matrix not invertible mod 256

  // Cofactor matrix
  const cof: Matrix3x3 = [
    [
      m[1][1] * m[2][2] - m[1][2] * m[2][1],
      -(m[1][0] * m[2][2] - m[1][2] * m[2][0]),
      m[1][0] * m[2][1] - m[1][1] * m[2][0],
    ],
    [
      -(m[0][1] * m[2][2] - m[0][2] * m[2][1]),
      m[0][0] * m[2][2] - m[0][2] * m[2][0],
      -(m[0][0] * m[2][1] - m[0][1] * m[2][0]),
    ],
    [
      m[0][1] * m[1][2] - m[0][2] * m[1][1],
      -(m[0][0] * m[1][2] - m[0][2] * m[1][0]),
      m[0][0] * m[1][1] - m[0][1] * m[1][0],
    ],
  ];

  // Adjugate = transpose of cofactor matrix
  const adj: Matrix3x3 = [
    [cof[0][0], cof[1][0], cof[2][0]],
    [cof[0][1], cof[1][1], cof[2][1]],
    [cof[0][2], cof[1][2], cof[2][2]],
  ];

  // Multiply adjugate by detInv mod 256
  const inv: Matrix3x3 = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      inv[i][j] = mod(adj[i][j] * detInv, 256);
    }
  }

  return inv;
}

// Check if matrix is invertible mod 256
export function isInvertible(m: Matrix3x3): boolean {
  return inverseMatrix(m) !== null;
}

// Multiply a 3x3 key matrix by an RGB pixel vector, mod 256
function multiplyMatrixVector(m: Matrix3x3, v: [number, number, number]): [number, number, number] {
  return [
    mod(m[0][0] * v[0] + m[0][1] * v[1] + m[0][2] * v[2], 256),
    mod(m[1][0] * v[0] + m[1][1] * v[1] + m[1][2] * v[2], 256),
    mod(m[2][0] * v[0] + m[2][1] * v[1] + m[2][2] * v[2], 256),
  ];
}

// Process image data (encrypt or decrypt) using a key matrix
export function processImage(
  imageData: ImageData,
  key: Matrix3x3
): ImageData {
  const data = new Uint8ClampedArray(imageData.data);
  const pixels = data.length / 4;

  for (let i = 0; i < pixels; i++) {
    const offset = i * 4;
    const rgb: [number, number, number] = [data[offset], data[offset + 1], data[offset + 2]];
    const result = multiplyMatrixVector(key, rgb);
    data[offset] = result[0];
    data[offset + 1] = result[1];
    data[offset + 2] = result[2];
    // Alpha channel remains unchanged
  }

  return new ImageData(data, imageData.width, imageData.height);
}

// Default key matrix (invertible mod 256)
export const DEFAULT_KEY: Matrix3x3 = [
  [1, 2, 3],
  [0, 1, 4],
  [5, 6, 0],
];

// Format matrix for display
export function formatMatrix(m: Matrix3x3): string {
  return m.map(row => `[ ${row.map(v => String(v).padStart(4)).join(', ')} ]`).join('\n');
}
