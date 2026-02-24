import React, { useState, useRef } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell
} from 'recharts';
import { format, parseISO, subDays, isAfter } from 'date-fns';
import { ArrowLeft, ChevronRight, Clock, Trash2, AlertTriangle, X, Edit2 } from 'lucide-react';
import type { BloodPressureEntry } from '../types';

interface HistoryViewProps {
  entries: BloodPressureEntry[];
  onBack: () => void;
  onDeleteEntry: (id: string) => void;
  onEditEntry: (entry: BloodPressureEntry) => void;
}

type Timeframe = 'selected' | '7days' | '30days';

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

const HistoryView: React.FC<HistoryViewProps> = ({ entries, onBack, onDeleteEntry, onEditEntry }) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('selected');
  const [selectedId, setSelectedId] = useState<string | null>(
    entries.length > 0 ? entries[entries.length - 1].id : null
  );
  const [chartType, setChartType] = useState<'line' | 'bar'>('bar');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const [visibleLines, setVisibleLines] = useState({
    systolic: true,
    diastolic: true,
    heartRate: true,
  });

  const getLatest = () => entries[entries.length - 1] || null;

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

  const renderLegend = () => {
    const selectedEntry = entries.find(e => e.id === selectedId);
    const latest = getLatest();
    // Use selected entry color if in "selected" mode, otherwise use latest for consistency or base theme
    const activeEntry = timeframe === 'selected' ? selectedEntry : latest;

    const items = [
      { key: 'systolic', label: 'Systolic', color: activeEntry ? getSystolicColor(activeEntry.systolic) : 'var(--accent-cyan)', visible: visibleLines.systolic },
      { key: 'diastolic', label: 'Diastolic', color: activeEntry ? getDiastolicColor(activeEntry.diastolic) : 'var(--accent-cyan)', visible: visibleLines.diastolic },
      { key: 'heartRate', label: 'Pulse', color: 'var(--accent-cyan)', visible: visibleLines.heartRate },
    ];

    return (
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', paddingTop: '20px' }}>
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

  const handleLegendClick = (details: any) => {
    const { dataKey } = details;
    setVisibleLines(prev => ({
      ...prev,
      [dataKey]: !prev[dataKey as keyof typeof prev],
    }));
  };

  const scrollToTop = () => {
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCardClick = (id: string) => {
    setSelectedId(id);
    setTimeframe('selected');
    scrollToTop();
  };

  const handleConfirmDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeleteConfirmId(id);
  };

  const handleEdit = (e: React.MouseEvent, entry: BloodPressureEntry) => {
    e.stopPropagation();
    onEditEntry(entry);
  };

  const handleDelete = () => {
    if (deleteConfirmId) {
      onDeleteEntry(deleteConfirmId);
      if (selectedId === deleteConfirmId) {
        const remaining = entries.filter(e => e.id !== deleteConfirmId);
        setSelectedId(remaining.length > 0 ? remaining[remaining.length - 1].id : null);
      }
      setDeleteConfirmId(null);
    }
  };

  const getChartData = () => {
    if (timeframe === 'selected') {
      const entry = entries.find(e => e.id === selectedId);
      if (!entry) return [];
      return [{
        ...entry,
        formattedDate: format(parseISO(entry.timestamp), 'MMM dd, h:mm a') + '',
        fullDate: format(parseISO(entry.timestamp), 'MM/dd/yy h:mm a') + '',
      }];
    }

    const days = timeframe === '7days' ? 7 : 30;
    const cutoff = subDays(new Date(), days);

    return entries
      .filter(e => isAfter(parseISO(e.timestamp), cutoff))
      .map(e => ({
        ...e,
        formattedDate: format(parseISO(e.timestamp), 'MM/dd, h:mm a') + '',
        fullDate: format(parseISO(e.timestamp), 'MM/dd/yy h:mm a') + '',
      }));
  };

  const chartData = getChartData();

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { left: 10, right: 10, top: 10, bottom: 0 },
    };

    const axisProps = {
      stroke: "var(--text-secondary)",
      fontSize: 11,
    };

    if (chartType === 'line') {
      return (
        <LineChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
          <XAxis dataKey="formattedDate" {...axisProps} dy={10} hide={chartData.length > 15} />
          <YAxis {...axisProps} width={40} />
          <Tooltip content={<CustomTooltip />} shared={true} />
          <Legend content={renderLegend} />
          <Line
            dataKey="systolic"
            stroke={selectedId && timeframe === 'selected' ? getSystolicColor(entries.find(e => e.id === selectedId)?.systolic || 0) : "var(--accent-cyan)"}
            strokeWidth={3}
            dot={{ r: timeframe === 'selected' ? 8 : 4 }}
            name="Systolic"
            hide={!visibleLines.systolic}
            isAnimationActive={false}
          />
          <Line
            dataKey="diastolic"
            stroke={selectedId && timeframe === 'selected' ? getDiastolicColor(entries.find(e => e.id === selectedId)?.diastolic || 0) : "var(--accent-cyan)"}
            strokeWidth={3}
            dot={{ r: timeframe === 'selected' ? 8 : 4 }}
            name="Diastolic"
            hide={!visibleLines.diastolic}
            isAnimationActive={false}
          />
          <Line
            dataKey="heartRate"
            stroke="var(--accent-cyan)"
            strokeWidth={3}
            dot={{ r: timeframe === 'selected' ? 8 : 4 }}
            name="Pulse"
            hide={!visibleLines.heartRate}
            isAnimationActive={false}
          />
        </LineChart>
      );
    }

    return (
      <BarChart {...commonProps}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
        <XAxis dataKey="formattedDate" {...axisProps} dy={10} hide={chartData.length > 15} />
        <YAxis {...axisProps} width={40} />
        <Tooltip content={<CustomTooltip />} shared={true} />
        <Legend content={renderLegend} />
        <Bar
          dataKey="systolic"
          name="Systolic"
          fill={selectedId && timeframe === 'selected' ? getSystolicColor(entries.find(e => e.id === selectedId)?.systolic || 0) : "var(--accent-cyan)"}
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
          fill={selectedId && timeframe === 'selected' ? getDiastolicColor(entries.find(e => e.id === selectedId)?.diastolic || 0) : "var(--accent-cyan)"}
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
    <div className="history-view" ref={topRef}>
      <button className="back-btn" onClick={onBack}>
        <ArrowLeft size={20} />
        Back to Dashboard
      </button>

      {deleteConfirmId && (
        <div className="modal-overlay">
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="warning-icon">
                <AlertTriangle size={24} />
              </div>
              <h3>Confirm Deletion</h3>
              <button className="close-btn" onClick={() => setDeleteConfirmId(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this reading? This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setDeleteConfirmId(null)}>Cancel</button>
              <button className="confirm-delete-btn" onClick={handleDelete}>Delete Permanently</button>
            </div>
          </div>
        </div>
      )}

      <section className="chart-section">
        <div className="chart-container">
          <div className="chart-header">
            <h3>{timeframe === 'selected' ? 'Selected Reading' : `Past ${timeframe === '7days' ? '7' : '30'} Days`}</h3>
            <div className="chart-toggles">
              <button className={`toggle-btn ${chartType === 'line' ? 'active' : ''}`} onClick={() => setChartType('line')}>Line</button>
              <button className={`toggle-btn ${chartType === 'bar' ? 'active' : ''}`} onClick={() => setChartType('bar')}>Bar</button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </section>

      <section className="controls-section">
        <div className="timeframe-buttons">
          <button className={`filter-btn ${timeframe === 'selected' ? 'active' : ''}`} onClick={() => setTimeframe('selected')}>Selected</button>
          <button className={`filter-btn ${timeframe === '7days' ? 'active' : ''}`} onClick={() => setTimeframe('7days')}>Past 7 Days</button>
          <button className={`filter-btn ${timeframe === '30days' ? 'active' : ''}`} onClick={() => setTimeframe('30days')}>Past 30 Days</button>
        </div>
      </section>

      <section className="history-section">
        <h3>Historical Readings</h3>
        <div className="history-list">
          {[...entries].reverse().map(entry => (
            <div
              key={entry.id}
              className={`history-card ${selectedId === entry.id ? 'active' : ''}`}
              onClick={() => handleCardClick(entry.id)}
            >
              <div className="card-content">
                <div className="card-top">
                  <div className="card-left">
                    <Clock size={16} className="text-secondary" />
                    <div className="date-group">
                      <p className="card-date">{format(parseISO(entry.timestamp), 'MMM dd, yyyy')}</p>
                      <p className="card-time">{format(parseISO(entry.timestamp), 'h:mm a')}</p>
                    </div>
                  </div>
                  <div className="card-readings">
                    <div className="reading-item">
                      <span className="reading-label">SYS</span>
                      <span className="reading-value" style={{ color: getSystolicColor(entry.systolic) }}>{entry.systolic}</span>
                    </div>
                    <div className="reading-item">
                      <span className="reading-label">DIA</span>
                      <span className="reading-value" style={{ color: getDiastolicColor(entry.diastolic) }}>{entry.diastolic}</span>
                    </div>
                    <div className="reading-item">
                      <span className="reading-label">Pulse</span>
                      <span className="reading-value text-cyan">{entry.heartRate}</span>
                    </div>
                  </div>
                </div>
                {entry.note && (
                  <div className="card-note">
                    <p>{entry.note}</p>
                  </div>
                )}
              </div>
              <div className="card-actions">
                <div className="action-buttons">
                  <button
                    className="action-btn edit"
                    onClick={(e) => handleEdit(e, entry)}
                    title="Edit reading"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    className="action-btn delete"
                    onClick={(e) => handleConfirmDelete(e, entry.id)}
                    title="Delete reading"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <ChevronRight size={20} className="card-arrow" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <style>{`
        .history-view {
          animation: fadeIn 0.4s ease-out;
          display: flex;
          flex-direction: column;
          gap: 2rem;
          padding-bottom: 2rem;
        }

        .back-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-secondary);
          font-weight: 600;
          padding: 0.5rem 0.75rem;
          border-radius: 0.5rem;
          width: fit-content;
        }

        .back-btn:hover {
          background-color: var(--card-bg);
          color: var(--accent-cyan);
        }

        .chart-container {
          background-color: var(--card-bg);
          padding: 1.5rem;
          border-radius: 1.5rem;
          box-shadow: var(--card-shadow);
          border: 1px solid var(--border-color);
          transition: all 0.3s ease;
        }

        .chart-container:hover {
          box-shadow: var(--card-glow);
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .chart-header h3 {
          margin: 0;
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .chart-toggles {
          display: flex;
          padding: 0.25rem;
          border-radius: 0.75rem;
          gap: 0.25rem;
        }

        .toggle-btn {
          padding: 0.375rem 0.75rem;
          border-radius: 0.5rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-secondary);
          border: 1px solid var(--border-color);
          background: transparent;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .toggle-btn:hover {
          box-shadow: var(--card-glow);
          border-color: transparent;
          color: var(--text-primary);
        }

        .toggle-btn.active {
          background: var(--accent-gradient);
          color: white;
          border-color: transparent;
          box-shadow: 0 4px 15px rgba(217, 70, 239, 0.3);
        }

        .timeframe-buttons {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .filter-btn {
          padding: 0.625rem 1.25rem;
          border-radius: 1rem;
          background: transparent;
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          font-weight: 600;
          font-size: 0.875rem;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .filter-btn:hover {
          box-shadow: var(--card-glow);
          border-color: transparent;
          color: var(--text-primary);
        }

        .filter-btn.active {
          background: var(--accent-gradient);
          color: white;
          border-color: transparent;
          box-shadow: 0 4px 15px rgba(217, 70, 239, 0.3);
        }

        .history-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: 1rem;
        }

        .history-card {
          background-color: var(--card-bg);
          padding: 1.25rem;
          border-radius: 1.25rem;
          border: 1px solid var(--border-color);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1.5rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .card-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .card-top {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .card-note {
          background-color: var(--bg-secondary);
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          font-size: 0.875rem;
          color: var(--text-primary);
          border-left: 3px solid var(--accent-cyan);
          line-height: 1.4;
        }

        .card-note p {
          margin: 0;
          font-style: italic;
          opacity: 0.9;
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
          margin-right: 0.5rem;
        }

        .action-btn {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.2s;
          background-color: var(--bg-secondary);
        }

        .action-btn.edit {
          color: var(--accent-cyan);
        }

        .action-btn.edit:hover {
          background-color: var(--accent-cyan);
          color: white;
        }

        .action-btn.delete {
          color: var(--accent-magenta);
        }

        .action-btn.delete:hover {
          background-color: var(--accent-magenta);
          color: white;
        }

        .history-card:hover {
          transform: translateY(-4px) translateX(4px);
          box-shadow: var(--card-glow);
        }

        .history-card.active {
          border-color: var(--accent-magenta);
          box-shadow: 0 0 15px rgba(217, 70, 239, 0.2);
        }

        .history-card.active .card-note {
          border-left-color: var(--accent-magenta);
        }

        .card-left {
          display: flex;
          align-items: center;
          gap: 1rem;
          min-width: 140px;
        }

        .date-group {
          display: flex;
          flex-direction: column;
        }

        .card-date {
          font-weight: 700;
          font-size: 0.9375rem;
          color: var(--text-primary);
        }

        .card-time {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .card-readings {
          flex: 1;
          display: flex;
          gap: 2rem;
        }

        .reading-item {
          display: flex;
          flex-direction: column;
        }

        .reading-label {
          font-size: 0.65rem;
          font-weight: 800;
          color: var(--text-secondary);
          text-transform: uppercase;
        }

        .reading-value {
          font-size: 1.25rem;
          font-weight: 800;
        }

        .text-cyan { color: var(--accent-cyan); }
        .text-blue { color: var(--accent-cyan); }

        .card-arrow {
          color: var(--border-color);
          transition: transform 0.2s;
        }

        .history-card:hover .card-arrow {
          transform: translateX(4px);
          color: var(--accent-cyan);
        }

        .card-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .delete-item-btn {
          color: var(--text-secondary);
          opacity: 0.5;
          transition: all 0.2s;
          padding: 0.5rem;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .delete-item-btn:hover {
          color: #ef4444;
          background-color: rgba(239, 68, 68, 0.1);
          opacity: 1;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          animation: fadeInOverlay 0.2s ease-out;
        }

        .delete-modal {
          background-color: var(--card-bg);
          width: 90%;
          max-width: 400px;
          border-radius: 1.5rem;
          padding: 2rem;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          animation: slideInModal 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          border: 1px solid var(--border-color);
        }

        .modal-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 1.5rem;
          position: relative;
        }

        .warning-icon {
          width: 60px;
          height: 60px;
          background-color: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .close-btn {
          position: absolute;
          top: -0.5rem;
          right: -0.5rem;
          color: var(--text-secondary);
          padding: 0.5rem;
          border-radius: 50%;
        }

        .close-btn:hover {
          background-color: var(--bg-secondary);
        }

        .modal-body {
          text-align: center;
          margin-bottom: 2rem;
        }

        .modal-body p {
          color: var(--text-secondary);
          line-height: 1.5;
          margin: 0;
        }

        .modal-footer {
          display: flex;
          gap: 1rem;
        }

        .modal-footer button {
          flex: 1;
          padding: 0.75rem;
          border-radius: 0.75rem;
          font-weight: 700;
          font-size: 0.875rem;
          transition: all 0.2s;
        }

        .cancel-btn {
          background-color: var(--bg-secondary);
          color: var(--text-primary);
        }

        .cancel-btn:hover {
          background-color: var(--border-color);
        }

        .confirm-delete-btn {
          background-color: #ef4444;
          color: white;
        }

        .confirm-delete-btn:hover {
          background-color: #dc2626;
          box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.2);
        }

        @keyframes fadeInOverlay {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideInModal {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @media (max-width: 640px) {
          .history-card {
            flex-direction: column;
            align-items: flex-start;
            gap: 0rem;
            padding: 1rem;
            position: relative;
          }
          .card-actions {
            position: absolute;
            top: 50%;
            right: 1rem;
            transform: translateY(-50%);
            gap: 0.5rem;
          }
          .card-readings {
            width: 100%;
            flex-direction: column;
            gap: 0rem;
          }
          .card-left {
            gap: 0.5rem;
            min-width: unset;
          }
          .card-date, .card-time {
            margin: 0;
            line-height: 1.2;
          }
          .reading-item {
            flex-direction: row;
            align-items: baseline;
            gap: 0.25rem;
            min-width: 80px;
          }
          .reading-label {
            min-width: 40px;
          }
          .card-arrow {
            display: none;
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div >
  );
};

export default HistoryView;
