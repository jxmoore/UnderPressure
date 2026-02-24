import React from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { ArrowLeft } from 'lucide-react';
import type { BloodPressureEntry } from '../types';

interface VisualizationsProps {
    entries: BloodPressureEntry[];
    type: string;
    onBack: () => void;
}

const Visualizations: React.FC<VisualizationsProps> = ({ entries, type, onBack }) => {
    const chartData = entries.map(entry => ({
        ...entry,
        formattedDate: format(parseISO(entry.timestamp), 'MMM dd, HH:mm'),
        shortDate: format(parseISO(entry.timestamp), 'MMM dd'),
    }));

    const renderChart = () => {
        switch (type) {
            case 'bp-over-time':
                return (
                    <div className="chart-container">
                        <h3>Blood Pressure Evolution</h3>
                        <ResponsiveContainer width="100%" height={400}>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                                <XAxis dataKey="formattedDate" stroke="var(--text-secondary)" fontSize={12} />
                                <YAxis stroke="var(--text-secondary)" fontSize={12} domain={['dataMin - 10', 'dataMax + 10']} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="systolic" stroke="var(--accent-cyan)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Systolic" />
                                <Line type="monotone" dataKey="diastolic" stroke="var(--accent-magenta)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Diastolic" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                );

            case 'hr-over-time':
                return (
                    <div className="chart-container">
                        <h3>Heart Rate Over Time</h3>
                        <ResponsiveContainer width="100%" height={400}>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                                <XAxis dataKey="formattedDate" stroke="var(--text-secondary)" fontSize={12} />
                                <YAxis stroke="var(--text-secondary)" fontSize={12} domain={['dataMin - 5', 'dataMax + 5']} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                                />
                                <Line type="monotone" dataKey="heartRate" stroke="var(--accent-magenta)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Heart Rate (BPM)" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                );

            case 'bp-by-day':
                // Average by day
                const dayDataMap: Record<string, { systolic: number[], diastolic: number[], count: number }> = {};
                entries.forEach(e => {
                    const day = format(parseISO(e.timestamp), 'MMM dd');
                    if (!dayDataMap[day]) dayDataMap[day] = { systolic: [], diastolic: [], count: 0 };
                    dayDataMap[day].systolic.push(e.systolic);
                    dayDataMap[day].diastolic.push(e.diastolic);
                    dayDataMap[day].count++;
                });

                const dayData = Object.keys(dayDataMap).map(day => ({
                    day,
                    avgSystolic: Math.round(dayDataMap[day].systolic.reduce((a, b) => a + b, 0) / dayDataMap[day].count),
                    avgDiastolic: Math.round(dayDataMap[day].diastolic.reduce((a, b) => a + b, 0) / dayDataMap[day].count),
                }));

                return (
                    <div className="chart-container">
                        <h3>Average Blood Pressure by Day</h3>
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={dayData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                                <XAxis dataKey="day" stroke="var(--text-secondary)" fontSize={12} />
                                <YAxis stroke="var(--text-secondary)" fontSize={12} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                                />
                                <Legend />
                                <Bar dataKey="avgSystolic" fill="var(--accent-cyan)" radius={[4, 4, 0, 0]} name="Avg Systolic" />
                                <Bar dataKey="avgDiastolic" fill="var(--accent-magenta)" radius={[4, 4, 0, 0]} name="Avg Diastolic" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                );

            case 'hr-by-day':
                const hrDayDataMap: Record<string, { hr: number[], count: number }> = {};
                entries.forEach(e => {
                    const day = format(parseISO(e.timestamp), 'MMM dd');
                    if (!hrDayDataMap[day]) hrDayDataMap[day] = { hr: [], count: 0 };
                    hrDayDataMap[day].hr.push(e.heartRate);
                    hrDayDataMap[day].count++;
                });

                const hrDayData = Object.keys(hrDayDataMap).map(day => ({
                    day,
                    avgHR: Math.round(hrDayDataMap[day].hr.reduce((a, b) => a + b, 0) / hrDayDataMap[day].count),
                }));

                return (
                    <div className="chart-container">
                        <h3>Average Heart Rate by Day</h3>
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={hrDayData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                                <XAxis dataKey="day" stroke="var(--text-secondary)" fontSize={12} />
                                <YAxis stroke="var(--text-secondary)" fontSize={12} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                                />
                                <Bar dataKey="avgHR" fill="var(--accent-magenta)" radius={[4, 4, 0, 0]} name="Avg HR (BPM)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                );

            default:
                return <div>Select a visualization</div>;
        }
    };

    return (
        <div className="visualizations-view">
            <button className="back-btn" onClick={onBack}>
                <ArrowLeft size={20} />
                Back to Dashboard
            </button>

            {renderChart()}

            <style>{`
        .visualizations-view {
          animation: fadeIn 0.4s ease-out;
        }

        .back-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-secondary);
          font-weight: 600;
          margin-bottom: 2rem;
          padding: 0.5rem 0.75rem;
          border-radius: 0.5rem;
        }

        .back-btn:hover {
          background-color: var(--card-bg);
          color: var(--accent-cyan);
        }

        .chart-container {
          background-color: var(--card-bg);
          padding: 2rem;
          border-radius: 1.5rem;
          box-shadow: var(--card-shadow);
        }

        .chart-container h3 {
          margin-bottom: 2rem;
          font-size: 1.25rem;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
        </div>
    );
};

export default Visualizations;
