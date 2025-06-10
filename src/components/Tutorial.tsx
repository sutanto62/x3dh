import React, { useState } from 'react';

const Tutorial: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    {
      title: "Introduction to Key Exchange",
      content: "Key exchange is a method by which two parties can establish a shared secret key over an insecure channel. This key can then be used for secure communication."
    },
    {
      title: "Basic Concepts of Diffie-Hellman",
      content: "The Diffie-Hellman key exchange protocol allows two parties to establish a shared secret key without having met before or exchanged any secret information."
    },
    {
      title: "Mathematical Foundations",
      content: "The protocol is based on the mathematical properties of modular exponentiation and the difficulty of the discrete logarithm problem."
    },
    {
      title: "Step-by-step Protocol",
      content: "1. Both parties agree on a prime number p and a generator g\n2. Each party generates a private key\n3. Each party calculates their public key\n4. Parties exchange public keys\n5. Each party calculates the shared secret"
    },
    {
      title: "Interactive Demonstration",
      content: "Try the interactive demo to see the protocol in action with your own values!"
    },
    {
      title: "Introduction to Extended Triple Diffie-Hellman (X3DH)",
      content: "X3DH is an advanced key agreement protocol that provides forward secrecy and cryptographic deniability. It's commonly used in modern secure messaging applications."
    },
    {
      title: "X3DH Key Components",
      content: "The protocol uses several types of keys:\n\n1. Identity Key (IK): A long-term public key\n2. Signed Pre-Key (SPK): A medium-term key signed by the identity key\n3. One-Time Pre-Keys (OPK): Short-term keys used once\n4. Ephemeral Key (EK): A temporary key generated for each session"
    },
    {
      title: "X3DH Protocol Steps",
      content: "1. Supplier fetches Mill's public keys (IK, SPK, OPK)\n2. Supplier generates an ephemeral key pair\n3. Supplier performs three DH calculations:\n   - DH(IK_A, SPK_B)\n   - DH(EK_A, IK_B)\n   - DH(EK_A, SPK_B)\n4. If Mill has published OPKs, Supplier also calculates:\n   - DH(EK_A, OPK_B)\n5. The results are combined to create the shared secret"
    },
    {
      title: "Security Properties",
      content: "X3DH provides:\n\n1. Forward Secrecy: Past messages remain secure even if long-term keys are compromised\n2. Cryptographic Deniability: Messages can't be cryptographically proven to come from a specific sender\n3. Protection against Key Compromise: Compromise of one key doesn't affect the security of other sessions"
    }
  ];

  return (
    <div className="tutorial">
      <h1 className="mb-4">Diffie-Hellman Tutorial</h1>

      <div className="progress mb-4">
        <div
          className="progress-bar"
          role="progressbar"
          style={{ width: `${(currentStep / steps.length) * 100}%` }}
          aria-valuenow={currentStep}
          aria-valuemin={1}
          aria-valuemax={steps.length}
        />
      </div>

      <div className="card">
        <div className="card-body">
          <h2 className="card-title">{steps[currentStep - 1].title}</h2>
          <div
            className="card-text"
            dangerouslySetInnerHTML={{ __html: steps[currentStep - 1].content.replace(/\n/g, '<br/>') }}
          />
        </div>
      </div>

      <div className="mt-4">
        <button
          className="btn btn-primary me-2"
          onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
          disabled={currentStep === 1}
        >
          Previous
        </button>
        <button
          className="btn btn-primary"
          onClick={() => setCurrentStep(prev => Math.min(steps.length, prev + 1))}
          disabled={currentStep === steps.length}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Tutorial; 