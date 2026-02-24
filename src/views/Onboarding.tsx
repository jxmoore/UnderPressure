import React, { useState } from 'react';

interface OnboardingProps {
    onComplete: (name: string) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
    const [name, setName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onComplete(name.trim());
        }
    };

    return (
        <div className="onboarding-container">
            <div className="onboarding-card">
                <h1 className="brand">Under<span>Pressure</span></h1>
                <p className="subtitle">Track your blood pressure trends with ease.</p>

                <form onSubmit={handleSubmit} className="onboarding-form">
                    <div className="form-group">
                        <label htmlFor="name">What is your name?</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your name"
                            required
                            autoFocus
                        />
                    </div>
                    <button type="submit" className="start-btn">
                        Get Started
                    </button>
                </form>
            </div>

            <style>{`
        .onboarding-container {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--bg-secondary);
          padding: 1rem;
        }

        .onboarding-card {
          background-color: var(--card-bg);
          padding: 3rem;
          border-radius: 2rem;
          box-shadow: var(--card-shadow);
          max-width: 480px;
          width: 100%;
          text-align: center;
        }

        .onboarding-card .brand {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
        }

        .subtitle {
          color: var(--text-secondary);
          margin-bottom: 2.5rem;
          font-size: 1.125rem;
        }

        .onboarding-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          text-align: left;
        }

        .form-group label {
          display: block;
          font-weight: 600;
          margin-bottom: 0.75rem;
          color: var(--text-primary);
        }

        .form-group input {
          width: 100%;
          padding: 1rem 1.25rem;
          border-radius: 1rem;
          border: 2px solid var(--border-color);
          background-color: var(--bg-primary);
          color: var(--text-primary);
          font-size: 1.125rem;
          transition: all 0.2s;
        }

        .form-group input:focus {
          outline: none;
          border-color: var(--accent-cyan);
          box-shadow: 0 0 0 4px rgba(6, 182, 212, 0.1);
        }

        .start-btn {
          background-color: var(--accent-cyan);
          color: white;
          padding: 1.125rem;
          border-radius: 1rem;
          font-weight: 700;
          font-size: 1.125rem;
          margin-top: 1rem;
          transition: all 0.2s;
        }

        .start-btn:hover {
          background-color: #0891b2;
          transform: translateY(-2px);
          box-shadow: 0 4px 6px -1px rgba(6, 182, 212, 0.4);
        }
      `}</style>
        </div>
    );
};

export default Onboarding;
