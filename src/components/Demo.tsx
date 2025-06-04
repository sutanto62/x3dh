import React, { useState } from 'react';
import SharedSecret from './SharedSecret';
import { MathJaxContext, MathJax } from 'better-react-mathjax';

interface KeyPair {
    privateKey: bigint;
    publicKey: bigint;
}

const Demo: React.FC = () => {
    const [p, setP] = useState<string>('13');
    const [g, setG] = useState<string>('2');
    const [supplier, setSupplier] = useState<KeyPair>({ privateKey: 6n, publicKey: 8n });
    const [mill, setMill] = useState<KeyPair>({ privateKey: 15n, publicKey: 19n });
    const [sharedSecret, setSharedSecret] = useState<bigint | null>(null);

    const calculatePublicKey = (privateKey: bigint, g: bigint, p: bigint): bigint => {
        return BigInt(g) ** privateKey % BigInt(p);
    };

    const calculateSharedSecret = (privateKey: bigint, publicKey: bigint, p: bigint): bigint => {
        return publicKey ** privateKey % BigInt(p);
    };

    const rotateP = (p: bigint): bigint => {
        const min = 10000n; // 5 digits minimum
        const max = 99999n; // 5 digits maximum

        while (true) {
            // Generate random number between min and max
            const range = max - min;
            const randomOffset = BigInt(Math.floor(Math.random() * Number(range)));
            const candidate = min + randomOffset;

            // Check if candidate is prime
            let isPrime = true;
            const sqrt = BigInt(Math.floor(Math.sqrt(Number(candidate))));
            for (let i = 2n; i <= sqrt; i++) {
                if (candidate % i === 0n) {
                    isPrime = false;
                    break;
                }
            }
            if (isPrime) {
                return candidate;
            }
        }
    };

    const findPrimitiveRoot = (p: bigint): bigint => {
        // For a prime p, we need to find a primitive root
        // A primitive root g satisfies: g^(p-1) ≡ 1 (mod p)
        // and no smaller positive power of g is congruent to 1

        // For small primes, we can try numbers from 2 to p-1
        for (let g = 2n; g < p; g++) {
            if (isPrimitiveRoot(g, p)) {
                return g;
            }
        }
        return 2n; // Fallback to 2 if no primitive root is found
    };

    const isPrimitiveRoot = (g: bigint, p: bigint): boolean => {
        // Check if g is a primitive root modulo p
        const phi = p - 1n; // For prime p, φ(p) = p-1

        // Check if g and p are coprime
        if (gcd(g, p) !== 1n) {
            return false;
        }

        // Check if g^(p-1) ≡ 1 (mod p)
        if (modPow(g, phi, p) !== 1n) {
            return false;
        }

        // Check that no smaller positive power of g is congruent to 1
        const factors = getPrimeFactors(phi);
        for (const factor of factors) {
            const power = phi / factor;
            if (modPow(g, power, p) === 1n) {
                return false;
            }
        }

        return true;
    };

    const gcd = (a: bigint, b: bigint): bigint => {
        while (b !== 0n) {
            [a, b] = [b, a % b];
        }
        return a;
    };

    const modPow = (base: bigint, exp: bigint, mod: bigint): bigint => {
        let result = 1n;
        base = base % mod;
        while (exp > 0n) {
            if (exp % 2n === 1n) {
                result = (result * base) % mod;
            }
            base = (base * base) % mod;
            exp = exp / 2n;
        }
        return result;
    };

    const getPrimeFactors = (n: bigint): bigint[] => {
        const factors: bigint[] = [];
        let d = 2n;

        while (n > 1n) {
            while (n % d === 0n) {
                if (!factors.includes(d)) {
                    factors.push(d);
                }
                n = n / d;
            }
            d = d + 1n;
            if (d * d > n) {
                if (n > 1n && !factors.includes(n)) {
                    factors.push(n);
                }
                break;
            }
        }
        return factors;
    };

    const handleRotate = (e: React.MouseEvent) => {
        e.preventDefault();
        const newP = rotateP(BigInt(p));
        const newG = findPrimitiveRoot(newP);
        setP(newP.toString());
        setG(newG.toString());
    };

    const handleGChange = (newG: string) => {
        const gBig = BigInt(newG);
        const pBig = BigInt(p);

        if (isPrimitiveRoot(gBig, pBig)) {
            setG(newG);
        } else {
            alert('Invalid generator! g must be a primitive root modulo p.');
        }
    };

    const generateMediumPrime = (): bigint => {
        const min = 10000n; // 5 digits minimum
        const max = 99999n; // 5 digits maximum

        while (true) {
            // Generate random number between min and max
            const range = max - min;
            const randomOffset = BigInt(Math.floor(Math.random() * Number(range)));
            const candidate = min + randomOffset;

            // Check if candidate is prime
            let isPrime = true;
            const sqrt = BigInt(Math.floor(Math.sqrt(Number(candidate))));
            for (let i = 2n; i <= sqrt; i++) {
                if (candidate % i === 0n) {
                    isPrime = false;
                    break;
                }
            }
            if (isPrime) {
                return candidate;
            }
        }
    };

    const handleGeneratePrivateKey = (e: React.MouseEvent, isSupplier: boolean) => {
        e.preventDefault();
        const newPrivateKey = generateMediumPrime();

        if (isSupplier) {
            setSupplier(prev => ({
                ...prev,
                privateKey: newPrivateKey
            }));
        } else {
            setMill(prev => ({
                ...prev,
                privateKey: newPrivateKey
            }));
        }
    };

    const handleCalculate = () => {
        try {
            const pBig = BigInt(p);
            const gBig = BigInt(g);

            // Calculate public keys
            const supplierPublicKey = calculatePublicKey(supplier.privateKey, gBig, pBig);
            const millPublicKey = calculatePublicKey(mill.privateKey, gBig, pBig);

            // Calculate shared secret
            const supplierSharedSecret = calculateSharedSecret(supplier.privateKey, millPublicKey, pBig);
            const millSharedSecret = calculateSharedSecret(mill.privateKey, supplierPublicKey, pBig);

            // Update state
            setSupplier(prev => ({ ...prev, publicKey: supplierPublicKey }));
            setMill(prev => ({ ...prev, publicKey: millPublicKey }));
            setSharedSecret(supplierSharedSecret);

            // Verify that both parties calculated the same shared secret
            if (supplierSharedSecret !== millSharedSecret) {
                alert('Error: Shared secrets do not match!');
            }
        } catch (error) {
            alert('Error in calculation. Please check your inputs.');
        }
    };

    return (
        <div className="demo">
            <h1 className="mb-4">Diffie-Hellman Shared Key Demo</h1>

            <button className="btn btn-primary mb-4" onClick={handleCalculate}>
                Calculate Keys
            </button>

            <div className="row">
                <div className="col-md-4">
                    <div className="card mb-4 h-100 text-bg-light">
                        <div className="card-body d-flex flex-column">
                            <h3>Supplier</h3>
                            <div className="mb-3">
                                <label className="form-label"><a href="#" onClick={(e) => handleGeneratePrivateKey(e, true)}>Private Key</a> (<span className="badge rounded-pill text-bg-danger">a</span>):</label>
                                <div className="input-group mb-2">
                                    <span className="input-group-text bg-danger text-white">Private</span>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={supplier.privateKey.toString()}
                                        onChange={(e) => setSupplier(prev => ({ ...prev, privateKey: BigInt(e.target.value) }))}
                                    />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Public Key (<span className="badge rounded-pill text-bg-primary">A</span>):</label>
                                <MathJaxContext>
                                    <MathJax>{"\\(A = g^a \\mod p\\)"}</MathJax>
                                </MathJaxContext>
                                <div className="input-group">
                                    <span className="input-group-text bg-primary text-white">Public</span>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={supplier.publicKey.toString()}
                                        readOnly
                                    />
                                </div>
                            </div>
                            <SharedSecret secret={sharedSecret} publicKey={'B'} />
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card mb-4 h-100">
                        <div className="card-body d-flex flex-column">
                            <h3>Public</h3>
                            <div className="mb-3">
                                <label className="form-label">Prime Number (<span className="badge rounded-pill text-bg-primary">p</span>):</label>
                                <div className="input-group">
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={p}
                                        onChange={(e) => setP(e.target.value)}
                                    />
                                    <button
                                        className="btn btn-outline-primary"
                                        onClick={handleRotate}
                                    >
                                        Rotate
                                    </button>
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Generator (<span className="badge rounded-pill text-bg-primary">g</span>):</label>
                                <div className="input-group">
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={g}
                                        onChange={(e) => handleGChange(e.target.value)}
                                    />
                                </div>
                                <small className="text-muted">g must be a primitive root modulo p</small>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card mb-4 h-100 text-bg-light">
                        <div className="card-body d-flex flex-column">
                            <h3>Mill</h3>
                            <div className="mb-3">
                                <label className="form-label"><a href="#" onClick={(e) => handleGeneratePrivateKey(e, false)}>Private Key</a> (<span className="badge rounded-pill text-bg-danger">b</span>):</label>
                                <div className="input-group mb-2">
                                    <span className="input-group-text bg-danger text-white">Private</span>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={mill.privateKey.toString()}
                                        onChange={(e) => setMill(prev => ({ ...prev, privateKey: BigInt(e.target.value) }))}
                                    />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Public Key (<span className="badge rounded-pill text-bg-primary">B</span>):</label>
                                <MathJaxContext>
                                    <MathJax>{"\\(B = g^b \\bmod p\\)"}</MathJax>
                                </MathJaxContext>
                                <div className="input-group">
                                    <span className="input-group-text bg-primary text-white">Public</span>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={mill.publicKey.toString()}
                                        readOnly
                                    />
                                </div>
                            </div>
                            <SharedSecret secret={sharedSecret} publicKey={'A'} />
                        </div>
                    </div>
                </div>
            </div>


        </div>
    );
};

export default Demo; 