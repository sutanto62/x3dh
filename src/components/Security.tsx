import React from 'react';

const Security: React.FC = () => {
  const securityTopics = [
    {
      title: "Potential Attacks",
      content: [
        "Man-in-the-Middle (MITM) Attack: An attacker intercepts the communication and impersonates both parties.",
        "Discrete Logarithm Problem: The security relies on the difficulty of solving the discrete logarithm problem.",
        "Small Subgroup Attack: Using a generator that generates a small subgroup can make the protocol vulnerable."
      ]
    },
    {
      title: "Best Practices",
      content: [
        "Use large prime numbers (at least 2048 bits) for p",
        "Choose a generator g that generates a large subgroup",
        "Implement proper key validation",
        "Use authenticated key exchange when possible",
        "Regularly update and rotate keys"
      ]
    },
    {
      title: "Common Pitfalls",
      content: [
        "Using small prime numbers",
        "Not validating received public keys",
        "Reusing private keys",
        "Not implementing proper key derivation",
        "Ignoring forward secrecy"
      ]
    }
  ];

  return (
    <div className="security">
      <h1 className="mb-4">Security Considerations</h1>
      
      {securityTopics.map((topic, index) => (
        <div key={index} className="card mb-4">
          <div className="card-body">
            <h2 className="card-title">{topic.title}</h2>
            <ul className="list-group list-group-flush">
              {topic.content.map((item, itemIndex) => (
                <li key={itemIndex} className="list-group-item">{item}</li>
              ))}
            </ul>
          </div>
        </div>
      ))}

      <div className="card">
        <div className="card-body">
          <h2 className="card-title">Security Recommendations</h2>
          <p className="card-text">
            When implementing Diffie-Hellman in a real-world application, always:
          </p>
          <ul className="list-group list-group-flush">
            <li className="list-group-item">Use well-tested cryptographic libraries</li>
            <li className="list-group-item">Implement proper key validation</li>
            <li className="list-group-item">Consider using authenticated key exchange</li>
            <li className="list-group-item">Keep cryptographic parameters up to date</li>
            <li className="list-group-item">Follow security best practices and standards</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Security; 