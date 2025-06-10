import React, { useState } from 'react';

interface KeyPair {
    privateKey: bigint;
    publicKey: bigint;
}

interface X3DHKeys {
    identityKey: KeyPair;
    signedPreKey: KeyPair;
    oneTimePreKeys: KeyPair[];
    ephemeralKey: KeyPair;
}

const X3DHDemo: React.FC = () => {
    const [p, setP] = useState<string>('10007');
    const [g, setG] = useState<string>('2');
    const [supplier, setSupplier] = useState<X3DHKeys>({
        identityKey: { privateKey: 6n, publicKey: 8n },
        signedPreKey: { privateKey: 7n, publicKey: 9n },
        oneTimePreKeys: [{ privateKey: 8n, publicKey: 10n }],
        ephemeralKey: { privateKey: 9n, publicKey: 11n }
    });
    const [mill, setMill] = useState<X3DHKeys>({
        identityKey: { privateKey: 15n, publicKey: 19n },
        signedPreKey: { privateKey: 16n, publicKey: 20n },
        oneTimePreKeys: [{ privateKey: 17n, publicKey: 21n }],
        ephemeralKey: { privateKey: 18n, publicKey: 22n }
    });
    const [sharedSecret, setSharedSecret] = useState<bigint | null>(null);

    const calculatePublicKey = (privateKey: bigint, g: bigint, p: bigint): bigint => {
        // Use a more efficient modular exponentiation to avoid BigInt overflow
        let result = 1n;
        let base = g % p;
        let exp = privateKey;

        while (exp > 0n) {
            if (exp % 2n === 1n) {
                result = (result * base) % p;
            }
            base = (base * base) % p;
            exp = exp / 2n;
        }
        return result;
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

    const handleGenerateIdentityKey = (e: React.MouseEvent, isSupplier: boolean) => {
        e.preventDefault();
        const newPrivateKey = generateMediumPrime();
        const newPublicKey = calculatePublicKey(newPrivateKey, BigInt(g), BigInt(p));

        if (isSupplier) {
            setSupplier(prev => ({
                ...prev,
                identityKey: {
                    privateKey: newPrivateKey,
                    publicKey: newPublicKey
                }
            }));
        } else {
            setMill(prev => ({
                ...prev,
                identityKey: {
                    privateKey: newPrivateKey,
                    publicKey: newPublicKey
                }
            }));
        }
    };

    const handleGenerateSignedPreKey = (e: React.MouseEvent, isSupplier: boolean) => {
        e.preventDefault();
        const newPrivateKey = generateMediumPrime();
        const newPublicKey = calculatePublicKey(newPrivateKey, BigInt(g), BigInt(p));

        if (isSupplier) {
            setSupplier(prev => ({
                ...prev,
                signedPreKey: {
                    privateKey: newPrivateKey,
                    publicKey: newPublicKey
                }
            }));
        } else {
            setMill(prev => ({
                ...prev,
                signedPreKey: {
                    privateKey: newPrivateKey,
                    publicKey: newPublicKey
                }
            }));
        }
    };

    const handleGenerateEphemeralKey = (e: React.MouseEvent) => {
        e.preventDefault();
        const newPrivateKey = generateMediumPrime();
        const newPublicKey = calculatePublicKey(newPrivateKey, BigInt(g), BigInt(p));

        setSupplier(prev => ({
            ...prev,
            ephemeralKey: {
                privateKey: newPrivateKey,
                publicKey: newPublicKey
            }
        }));
    };

    const handleGenerateOneTimePreKey = (e: React.MouseEvent) => {
        e.preventDefault();
        const newPrivateKey = generateMediumPrime();
        const newPublicKey = calculatePublicKey(newPrivateKey, BigInt(g), BigInt(p));

        setMill(prev => ({
            ...prev,
            oneTimePreKeys: [{
                privateKey: newPrivateKey,
                publicKey: newPublicKey
            }]
        }));
    };

    const handleCalculate = () => {
        try {
            const pBig = BigInt(p);
            const gBig = BigInt(g);

            // Calculate X3DH shared secret
            // 1. DH(IK_A, SPK_B)
            const dh1 = calculateSharedSecret(
                supplier.identityKey.privateKey,
                mill.signedPreKey.publicKey,
                pBig
            );

            // 2. DH(EK_A, IK_B)
            const dh2 = calculateSharedSecret(
                supplier.ephemeralKey.privateKey,
                mill.identityKey.publicKey,
                pBig
            );

            // 3. DH(EK_A, SPK_B)
            const dh3 = calculateSharedSecret(
                supplier.ephemeralKey.privateKey,
                mill.signedPreKey.publicKey,
                pBig
            );

            // 4. DH(EK_A, OPK_B) - using first one-time pre-key
            const dh4 = calculateSharedSecret(
                supplier.ephemeralKey.privateKey,
                mill.oneTimePreKeys[0].publicKey,
                pBig
            );

            // Combine all DH results to create final shared secret
            const finalSharedSecret = (dh1 * dh2 * dh3 * dh4) % pBig;
            setSharedSecret(finalSharedSecret);

            // Auto rotate ephemeral key
            const newEphemeralPrivateKey = generateMediumPrime();
            const newEphemeralPublicKey = calculatePublicKey(newEphemeralPrivateKey, gBig, pBig);
            setSupplier(prev => ({
                ...prev,
                ephemeralKey: {
                    privateKey: newEphemeralPrivateKey,
                    publicKey: newEphemeralPublicKey
                }
            }));

            // Auto rotate one-time pre-key
            const newOneTimePrivateKey = generateMediumPrime();
            const newOneTimePublicKey = calculatePublicKey(newOneTimePrivateKey, gBig, pBig);
            setMill(prev => ({
                ...prev,
                oneTimePreKeys: [{
                    privateKey: newOneTimePrivateKey,
                    publicKey: newOneTimePublicKey
                }]
            }));

        } catch (error) {
            alert('Error in calculation. Please check your inputs.');
        }
    };

    return (
        <div className="demo">
            <h1 className="mb-4">Extended Triple Diffie-Hellman (X3DH) Demo</h1>

            <button className="btn btn-primary mb-4" onClick={handleCalculate}>
                Calculate X3DH Keys
            </button>

            <div className="row">
                <div className="col-md-4">
                    <div className="card mb-4 h-100 text-bg-light">
                        <div className="card-body d-flex flex-column">
                            <h3>Supplier</h3>
                            <div className="mb-3">
                                <label className="form-label"><a href="#" onClick={(e) => handleGenerateIdentityKey(e, true)}>Identity Key</a> (<span className="badge rounded-pill text-bg-danger">IK_A</span>): </label>
                                <div className="input-group mb-2">
                                    <span className="input-group-text">Private</span>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={supplier.identityKey.privateKey.toString()}
                                        onChange={(e) => setSupplier(prev => ({
                                            ...prev,
                                            identityKey: { ...prev.identityKey, privateKey: BigInt(e.target.value) }
                                        }))}
                                    />
                                </div>
                                <div className="input-group">
                                    <span className="input-group-text bg-primary text-white">Public</span>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={supplier.identityKey.publicKey.toString()}
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <p>
                                        Supplier's Identity Key:
                                        <br />- Private key: {supplier.identityKey.privateKey.toString()}
                                        <br />- Public key: {g}^{supplier.identityKey.privateKey.toString()} mod {p} = {supplier.identityKey.publicKey.toString()}
                                    </p>
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="form-label"><a href="#" onClick={(e) => handleGenerateSignedPreKey(e, true)}>Signed Pre-Key</a> (<span className="badge rounded-pill text-bg-danger">SPK_A</span>):</label>
                                <div className="input-group mb-2">
                                    <span className="input-group-text">Private</span>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={supplier.signedPreKey.privateKey.toString()}
                                        onChange={(e) => setSupplier(prev => ({
                                            ...prev,
                                            signedPreKey: { ...prev.signedPreKey, privateKey: BigInt(e.target.value) }
                                        }))}
                                        disabled
                                    />
                                </div>
                                <div className="input-group">

                                    <span className="input-group-text bg-secondary text-white">Public</span>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={supplier.signedPreKey.publicKey.toString()}
                                        readOnly
                                        disabled
                                    />
                                </div>
                                <div>
                                    <p>
                                        Supplier's Signed Pre-Key:
                                        <br />- Private key: {supplier.signedPreKey.privateKey.toString()}
                                        <br />- Public key: {g}^{supplier.signedPreKey.privateKey.toString()} mod {p} = {supplier.signedPreKey.publicKey.toString()}
                                    </p>
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Ephemeral Key (<span className="badge rounded-pill text-bg-danger">EK_A</span>):</label>
                                <div className="input-group mb-2">
                                    <span className="input-group-text">Private</span>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={supplier.ephemeralKey.privateKey.toString()}
                                        onChange={(e) => setSupplier(prev => ({
                                            ...prev,
                                            ephemeralKey: { ...prev.ephemeralKey, privateKey: BigInt(e.target.value) }
                                        }))}
                                    />
                                </div>
                                <div className="input-group">

                                    <span className="input-group-text bg-primary text-white">Public</span>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={supplier.ephemeralKey.publicKey.toString()}
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <p>
                                        Supplier's Ephemeral Key:
                                        <br />- Private key: {supplier.ephemeralKey.privateKey.toString()}
                                        <br />- Public key: {g}^{supplier.ephemeralKey.privateKey.toString()} mod {p} = {supplier.ephemeralKey.publicKey.toString()}
                                    </p>
                                </div>
                            </div>

                            <div className="alert alert-info">
                                <strong>Final Shared Secret:</strong> {sharedSecret?.toString() || 'Not calculated yet'}
                            </div>
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

                            <div className="mb-3">
                                <h4>Public Key Calculation</h4>
                                <p className="text-muted">
                                    Public key = g^private_key mod p
                                </p>
                            </div>

                            <div className="mt-3">
                                <h4>Actual X3DH Calculation</h4>
                                <p className="text-muted">
                                    1. DH(IK_A, SPK_B) = {g}^{supplier.identityKey.privateKey.toString()} * {mill.signedPreKey.publicKey.toString()} mod {p} = {calculateSharedSecret(supplier.identityKey.privateKey, mill.signedPreKey.publicKey, BigInt(p)).toString()}
                                    <br />2. DH(EK_A, IK_B) = {g}^{supplier.ephemeralKey.privateKey.toString()} * {mill.identityKey.publicKey.toString()} mod {p} = {calculateSharedSecret(supplier.ephemeralKey.privateKey, mill.identityKey.publicKey, BigInt(p)).toString()}
                                    <br />3. DH(EK_A, SPK_B) = {g}^{supplier.ephemeralKey.privateKey.toString()} * {mill.signedPreKey.publicKey.toString()} mod {p} = {calculateSharedSecret(supplier.ephemeralKey.privateKey, mill.signedPreKey.publicKey, BigInt(p)).toString()}
                                    <br />4. DH(EK_A, OPK_B) = {g}^{supplier.ephemeralKey.privateKey.toString()} * {mill.oneTimePreKeys[0].publicKey.toString()} mod {p} = {calculateSharedSecret(supplier.ephemeralKey.privateKey, mill.oneTimePreKeys[0].publicKey, BigInt(p)).toString()}
                                    <br /><br />
                                    Final shared secret = ({calculateSharedSecret(supplier.identityKey.privateKey, mill.signedPreKey.publicKey, BigInt(p)).toString()} * {calculateSharedSecret(supplier.ephemeralKey.privateKey, mill.identityKey.publicKey, BigInt(p)).toString()} * {calculateSharedSecret(supplier.ephemeralKey.privateKey, mill.signedPreKey.publicKey, BigInt(p)).toString()} * {calculateSharedSecret(supplier.ephemeralKey.privateKey, mill.oneTimePreKeys[0].publicKey, BigInt(p)).toString()}) mod {p} = {sharedSecret?.toString() || 'Not calculated yet'}
                                </p>
                            </div>

                            <div>
                                <h3>X3DH Shared Secret</h3>
                                <p className="text-muted">
                                    The shared secret is calculated using four DH operations:
                                    <br />1. DH(IK_A, SPK_B) = g^(ik_a * spk_b) mod p
                                    <br />2. DH(EK_A, IK_B) = g^(ek_a * ik_b) mod p
                                    <br />3. DH(EK_A, SPK_B) = g^(ek_a * spk_b) mod p
                                    <br />4. DH(EK_A, OPK_B) = g^(ek_a * opk_b) mod p
                                    <br /><br />
                                    Final shared secret = (DH1 * DH2 * DH3 * DH4) mod p
                                    <br /><br />
                                    Where:
                                    <br />- ik_a: Supplier's identity key private key
                                    <br />- spk_b: Mill's signed pre-key public key
                                    <br />- ek_a: Supplier's ephemeral key private key
                                    <br />- ik_b: Mill's identity key public key
                                    <br />- opk_b: Mill's one-time pre-key public key
                                </p>

                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card mb-4 h-100 text-bg-light">
                        <div className="card-body d-flex flex-column">
                            <h3>Mill</h3>
                            <div className="mb-3">
                                <label className="form-label"><a href="#" onClick={(e) => handleGenerateIdentityKey(e, false)}>Identity Key</a> (<span className="badge rounded-pill text-bg-danger">IK_B</span>): </label>
                                <div className="input-group mb-2">
                                    <span className="input-group-text">Private</span>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={mill.identityKey.privateKey.toString()}
                                        onChange={(e) => setMill(prev => ({
                                            ...prev,
                                            identityKey: { ...prev.identityKey, privateKey: BigInt(e.target.value) }
                                        }))}
                                        disabled
                                    />
                                </div>
                                <div className="input-group">
                                    <span className="input-group-text bg-primary text-white">Public</span>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={mill.identityKey.publicKey.toString()}
                                        readOnly
                                    />
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="form-label"><a href="#" onClick={(e) => handleGenerateSignedPreKey(e, false)}>Signed Pre-Key</a> (<span className="badge rounded-pill text-bg-danger">SPK_B</span>):</label>
                                <div className="input-group mb-2">
                                    <span className="input-group-text">Private</span>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={mill.signedPreKey.privateKey.toString()}
                                        onChange={(e) => setMill(prev => ({
                                            ...prev,
                                            signedPreKey: { ...prev.signedPreKey, privateKey: BigInt(e.target.value) }
                                        }))}
                                        disabled
                                    />
                                </div>
                                <div className="input-group">
                                    <span className="input-group-text bg-primary text-white">Public</span>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={mill.signedPreKey.publicKey.toString()}
                                        readOnly
                                    />
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="form-label">One-Time Pre-Key (<span className="badge rounded-pill text-bg-danger">OPK_B</span>):</label>
                                <div className="input-group mb-2">
                                    <span className="input-group-text">Private</span>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={mill.oneTimePreKeys[0].privateKey.toString()}
                                        onChange={(e) => setMill(prev => ({
                                            ...prev,
                                            oneTimePreKeys: [{ ...prev.oneTimePreKeys[0], privateKey: BigInt(e.target.value) }]
                                        }))}
                                        disabled
                                    />
                                </div>
                                <div className="input-group">
                                    <span className="input-group-text bg-primary text-white">Public</span>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={mill.oneTimePreKeys[0].publicKey.toString()}
                                        readOnly
                                    />
                                </div>
                            </div>

                            <div className="alert alert-info">
                                <strong>Final Shared Secret:</strong> {sharedSecret?.toString() || 'Not calculated yet'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default X3DHDemo; 