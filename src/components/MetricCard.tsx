import React from 'react';

interface MetricCardProps {
    title: string;
    value: string | number;
    unit?: string;
    color?: 'cyan' | 'magenta';
    onClick: () => void;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, unit, color = 'cyan', onClick }) => {
    return (
        <div className={`metric-card border-${color}`} onClick={onClick}>
            <h3 className="metric-title">{title}</h3>
            <div className="metric-value-container">
                <span className="metric-value">{value}</span>
                {unit && <span className="metric-unit">{unit}</span>}
            </div>

            <style>{`
        .metric-card {
          background-color: var(--card-bg);
          border: 2px solid transparent;
          border-radius: 1rem;
          padding: 1.5rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: var(--card-shadow);
          display: flex;
          flex-direction: column;
          justify-content: center;
          min-height: 120px;
        }

        .metric-card:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }

        .border-cyan:hover {
          border-color: var(--accent-cyan);
        }

        .border-magenta:hover {
          border-color: var(--accent-magenta);
        }

        .metric-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.025em;
        }

        .metric-value-container {
          display: flex;
          align-items: baseline;
          gap: 0.25rem;
        }

        .metric-value {
          font-size: 2rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .metric-unit {
          font-size: 1rem;
          font-weight: 500;
          color: var(--text-secondary);
        }

        [data-theme='dark'] .metric-card:hover {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
        }
      `}</style>
        </div>
    );
};

export default MetricCard;
