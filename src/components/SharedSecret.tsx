import { MathJaxContext, MathJax } from 'better-react-mathjax';
import React from 'react';

interface SharedSecretProps {
  secret: bigint | null;
  publicKey: string;
}

const SharedSecret: React.FC<SharedSecretProps> = ({ secret, publicKey }) => {
  return (
    <div className="mb-3">
      <label className="form-label">Shared Secret:</label>
      <MathJaxContext>
        <MathJax>{"\\(s = " + (publicKey === 'B' ? 'B^a' : 'A^b') + " \\mod p\\)"}</MathJax>
      </MathJaxContext>
      <div className="alert alert-info">
        <strong>Final Shared Secret:</strong> {secret?.toString() || 'Not calculated yet'}
      </div>
    </div>
  );
};

export default SharedSecret; 