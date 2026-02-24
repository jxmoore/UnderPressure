import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell
} from 'recharts';
import { format, parseISO, subDays, isAfter } from 'date-fns';
import { Activity, TrendingUp, TrendingDown, Zap, ChevronRight, Clock } from 'lucide-react';
import type { BloodPressureEntry } from '../types';

interface DashboardProps {
  entries: BloodPressureEntry[];
  onMetricClick: (vizType: string) => void;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div
        style={{
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          padding: '12px 16px',
          borderRadius: '8px',
          boxShadow: 'var(--card-shadow)',
          pointerEvents: 'none',
          zIndex: 1000,
        }}
      >
        {payload.map((entry: any, index: number) => (
          <div key={index} style={{ marginBottom: '8px', color: entry.color }}>
            <p style={{ fontSize: '10px', fontWeight: 700, margin: 0, opacity: 0.8 }}>
              {entry.name}
            </p>
            <p style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>
              {entry.value} {entry.name === 'Pulse' ? 'BPM' : 'mmHg'}
            </p>
          </div>
        ))}
        <p style={{
          fontSize: '12px',
          color: 'var(--text-secondary)',
          marginTop: '4px',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '4px',
          margin: 0
        }}>
          {data.fullDate}
        </p>
      </div>
    );
  }
  return null;
};

const Dashboard: React.FC<DashboardProps> = ({ entries, onMetricClick }) => {
  const [visibleLines, setVisibleLines] = useState({
    systolic: true,
    diastolic: true,
    heartRate: true,
  });

  const getLatest = () => entries[entries.length - 1] || null;
  const latest = getLatest();

  // For Dashboard, we only show the LATEST reading in the chart
  const chartData = latest ? [{
    ...latest,
    formattedDate: format(parseISO(latest.timestamp), 'MMM dd, h:mm a'),
    simpleDate: format(parseISO(latest.timestamp), 'MM/dd/yy'),
    fullDate: format(parseISO(latest.timestamp), 'MM/dd/yy h:mm a'),
  }] : [];

  const getSystolicColor = (value: number) => {
    if (value > 140) return '#ef4444';
    if (value > 130) return '#f97316';
    return 'var(--accent-cyan)';
  };

  const getDiastolicColor = (value: number) => {
    if (value >= 90) return '#ef4444';
    if (value > 80) return '#f97316';
    return 'var(--accent-cyan)';
  };

  const handleLegendClick = (details: any) => {
    const { dataKey } = details;
    setVisibleLines(prev => ({
      ...prev,
      [dataKey]: !prev[dataKey as keyof typeof prev],
    }));
  };

  const getAverage = (key: keyof Pick<BloodPressureEntry, 'systolic' | 'diastolic' | 'heartRate'>) => {
    const thirtyDaysAgo = subDays(new Date(), 30);
    const recentEntries = entries.filter(e => isAfter(parseISO(e.timestamp), thirtyDaysAgo));
    const targetEntries = recentEntries.length > 0 ? recentEntries : entries;

    if (targetEntries.length === 0) return 0;
    const sum = targetEntries.reduce((acc, entry) => acc + entry[key], 0);
    return Math.round(sum / targetEntries.length);
  };

  const getMax = (key: keyof Pick<BloodPressureEntry, 'systolic' | 'diastolic' | 'heartRate'>) => {
    const thirtyDaysAgo = subDays(new Date(), 30);
    const recentEntries = entries.filter(e => isAfter(parseISO(e.timestamp), thirtyDaysAgo));
    const targetEntries = recentEntries.length > 0 ? recentEntries : entries;

    if (targetEntries.length === 0) return 0;
    return Math.max(...targetEntries.map(entry => entry[key]));
  };

  const getTrend = (key: keyof Pick<BloodPressureEntry, 'systolic' | 'diastolic' | 'heartRate'>) => {
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);
    const sixtyDaysAgo = subDays(now, 60);

    const currentEntries = entries.filter(e => {
      const date = parseISO(e.timestamp);
      return isAfter(date, thirtyDaysAgo);
    });

    const previousEntries = entries.filter(e => {
      const date = parseISO(e.timestamp);
      return isAfter(date, sixtyDaysAgo) && !isAfter(date, thirtyDaysAgo);
    });

    if (currentEntries.length === 0 || previousEntries.length === 0) return null;

    const currentAvg = currentEntries.reduce((acc, e) => acc + e[key], 0) / currentEntries.length;
    const previousAvg = previousEntries.reduce((acc, e) => acc + e[key], 0) / previousEntries.length;

    const percentChange = ((currentAvg - previousAvg) / previousAvg) * 100;
    return Math.round(percentChange);
  };

  const commonChartProps = {
    data: chartData,
    margin: { left: 20, right: 30, top: 10, bottom: 0 },
  };

  const renderTrend = (key: keyof Pick<BloodPressureEntry, 'systolic' | 'diastolic' | 'heartRate'>) => {
    const percent = getTrend(key);
    if (percent === null) return null;

    const isGood = key === 'heartRate' ? Math.abs(percent) < 10 : percent < 0;
    const isNeutral = percent === 0;

    return (
      <span className={`trend-indicator ${isNeutral ? 'trend-neutral' : isGood ? 'trend-down' : 'trend-up'}`}>
        {percent > 0 ? <TrendingUp size={12} /> : percent < 0 ? <TrendingDown size={12} /> : null}
        {Math.abs(percent)}%
      </span>
    );
  };

  const renderChart = () => {
    const renderLegend = () => {
      const items = [
        { key: 'systolic', label: 'Systolic', color: latest ? getSystolicColor(latest.systolic) : 'var(--accent-cyan)', visible: visibleLines.systolic },
        { key: 'diastolic', label: 'Diastolic', color: latest ? getDiastolicColor(latest.diastolic) : 'var(--accent-cyan)', visible: visibleLines.diastolic },
        { key: 'heartRate', label: 'Pulse', color: 'var(--accent-cyan)', visible: visibleLines.heartRate },
      ];

      return (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', paddingTop: '30px' }}>
          {items.map(item => (
            <div
              key={item.key}
              onClick={() => handleLegendClick({ dataKey: item.key })}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                opacity: item.visible ? 1 : 0.4,
                transition: 'opacity 0.2s'
              }}
            >
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: item.color,
                boxShadow: item.visible ? `0 0 8px ${item.color}44` : 'none'
              }} />
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                color: item.color,
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      );
    };

    return (
      <BarChart {...commonChartProps}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
        <XAxis dataKey="formattedDate" stroke="var(--text-secondary)" fontSize={12} dy={10} />
        <YAxis stroke="var(--text-secondary)" fontSize={12} width={45} />
        <Tooltip content={<CustomTooltip />} />
        <Legend content={renderLegend} />
        <Bar
          dataKey="systolic"
          name="Systolic"
          fill={latest ? getSystolicColor(latest.systolic) : "var(--accent-cyan)"}
          hide={!visibleLines.systolic}
          radius={[4, 4, 0, 0]}
          isAnimationActive={false}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-sys-${index}`} fill={getSystolicColor(entry.systolic)} />
          ))}
        </Bar>
        <Bar
          dataKey="diastolic"
          name="Diastolic"
          fill={latest ? getDiastolicColor(latest.diastolic) : "var(--accent-cyan)"}
          hide={!visibleLines.diastolic}
          radius={[4, 4, 0, 0]}
          isAnimationActive={false}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-dia-${index}`} fill={getDiastolicColor(entry.diastolic)} />
          ))}
        </Bar>
        <Bar
          dataKey="heartRate"
          fill="var(--accent-cyan)"
          name="Pulse"
          hide={!visibleLines.heartRate}
          radius={[4, 4, 0, 0]}
          isAnimationActive={false}
        />
      </BarChart>
    );
  };

  return (
    <div className="dashboard-view">
      <header className="view-header">
        <h1>Health Dashboard</h1>
        <p>Summary of your blood pressure and heart rate trends.</p>
      </header>

      {entries.length > 0 && (
        <section className="overview-chart-section">
          <div
            className="chart-container clickable"
            style={{ position: 'relative', cursor: 'pointer' }}
            onClick={() => onMetricClick('history')}
          >
            <div className="chart-header">
              <h3>Latest Reading Overview</h3>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              {renderChart()}
            </ResponsiveContainer>
          </div>
        </section>
      )}

      <section className="summary-section">
        <div className="summary-card clickable" onClick={() => onMetricClick('history')}>
          <div className="summary-header">
            <div className="summary-title">
              <Activity className="text-cyan" size={24} />
              <h3>Health Summary</h3>
              <span className="total-readings">({entries.length} total readings)</span>
            </div>
            <div className="summary-subtitle">
              Past 30 Days Overview
              <ChevronRight size={18} />
            </div>
          </div>

          <div className="summary-grid">
            <div className="summary-column latest">
              <div className="column-header">
                <Clock size={16} />
                <span>Latest Reading</span>
              </div>
              <div className="metric-row">
                <span className="metric-label">Systolic</span>
                <span className="metric-value" style={{ color: latest ? getSystolicColor(latest.systolic) : 'inherit' }}>
                  {latest ? latest.systolic : '--'} <small>mmHg</small>
                </span>
              </div>
              <div className="metric-row">
                <span className="metric-label">Diastolic</span>
                <span className="metric-value" style={{ color: latest ? getDiastolicColor(latest.diastolic) : 'inherit' }}>
                  {latest ? latest.diastolic : '--'} <small>mmHg</small>
                </span>
              </div>
              <div className="metric-row">
                <span className="metric-label">Pulse</span>
                <span className="metric-value text-cyan">
                  {latest ? latest.heartRate : '--'} <small>BPM</small>
                </span>
              </div>
            </div>

            <div className="summary-column average">
              <div className="column-header">
                <TrendingUp size={16} />
                <span>Monthly Average</span>
              </div>
              <div className="metric-row">
                <span className="metric-label">Systolic</span>
                <span className="metric-value">
                  {getAverage('systolic')} <small>mmHg</small>
                  {renderTrend('systolic')}
                </span>
              </div>
              <div className="metric-row">
                <span className="metric-label">Diastolic</span>
                <span className="metric-value">
                  {getAverage('diastolic')} <small>mmHg</small>
                  {renderTrend('diastolic')}
                </span>
              </div>
              <div className="metric-row">
                <span className="metric-label">Pulse</span>
                <span className="metric-value">
                  {getAverage('heartRate')} <small>BPM</small>
                  {renderTrend('heartRate')}
                </span>
              </div>
            </div>

            <div className="summary-column high">
              <div className="column-header">
                <Zap size={16} />
                <span>Recent Highs</span>
              </div>
              <div className="metric-row">
                <span className="metric-label">Systolic</span>
                <span className="metric-value" style={{ color: getMax('systolic') > 140 ? '#ef4444' : 'inherit' }}>
                  {getMax('systolic')} <small>mmHg</small>
                </span>
              </div>
              <div className="metric-row">
                <span className="metric-label">Diastolic</span>
                <span className="metric-value" style={{ color: getMax('diastolic') >= 90 ? '#ef4444' : 'inherit' }}>
                  {getMax('diastolic')} <small>mmHg</small>
                </span>
              </div>
              <div className="metric-row">
                <span className="metric-label">Pulse</span>
                <span className="metric-value text-cyan">
                  {getMax('heartRate')} <small>BPM</small>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .dashboard-view {
          animation: fadeIn 0.4s ease-out;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .view-header {
          margin-bottom: 0.5rem;
        }

        .view-header h1 {
          font-size: 2rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .view-header p {
          color: var(--text-secondary);
        }

        .chart-container {
          background-color: var(--card-bg);
          padding: 2rem;
          border-radius: 1.5rem;
          box-shadow: var(--card-shadow);
          border: 1px solid var(--border-color);
          transition: all 0.2s;
        }

        .chart-container.clickable:hover {
          transform: translateY(-6px);
          box-shadow: var(--card-glow);
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .chart-header h3 {
          margin-bottom: 0;
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .chart-toggles {
          display: flex;
          background-color: var(--bg-secondary);
          padding: 0.25rem;
          border-radius: 0.5rem;
          gap: 0.25rem;
        }

        .toggle-btn {
          padding: 0.25rem 0.75rem;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-secondary);
          transition: all 0.2s;
        }

        .toggle-btn:hover {
          color: var(--text-primary);
        }

        .toggle-btn.active {
          background-color: var(--card-bg);
          color: var(--accent-cyan);
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }

        .summary-card {
          background-color: var(--card-bg);
          border-radius: 1.5rem;
          padding: 2rem;
          box-shadow: var(--card-shadow);
          border: 1px solid var(--border-color);
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .summary-card.clickable:hover {
          transform: translateY(-6px);
          box-shadow: var(--card-glow);
        }

        .summary-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border-color);
        }

        .summary-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .summary-title h3 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .total-readings {
          font-size: 0.875rem;
          color: var(--text-secondary);
          font-weight: 600;
          opacity: 0.8;
          margin-left: 0.5rem;
          margin-top: 2px;
        }

        .summary-subtitle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .summary-column {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .summary-column:not(:last-child) {
          border-right: 1px solid var(--border-color);
          padding-right: 2rem;
        }

        .column-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.5rem;
        }

        .metric-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
        }

        .metric-label {
          font-size: 0.875rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .metric-value {
          font-size: 1.125rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .metric-value small {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-secondary);
          margin-left: 2px;
        }

        .trend-indicator {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.125rem 0.375rem;
          border-radius: 2rem;
          margin-left: 0.5rem;
        }

        .trend-up {
          color: #ef4444;
          background-color: rgba(239, 68, 68, 0.1);
        }

        .trend-down {
          color: #22c55e;
          background-color: rgba(34, 197, 94, 0.1);
        }

        .trend-neutral {
          color: var(--text-secondary);
          background-color: var(--bg-secondary);
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .summary-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .summary-column:not(:last-child) {
            border-right: none;
            border-bottom: 1px solid var(--border-color);
            padding-right: 0;
            padding-bottom: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
