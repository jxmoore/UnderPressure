import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { BloodPressureEntry } from '../types';

interface LogEntryModalProps {
  isOpen: boolean;
  entryToEdit?: BloodPressureEntry;
  onClose: () => void;
  onSave: (entry: Omit<BloodPressureEntry, 'id' | 'timestamp'> & { id?: string; timestamp?: string }) => void;
}

const LogEntryModal: React.FC<LogEntryModalProps> = ({ isOpen, entryToEdit, onClose, onSave }) => {
  const [systolic, setSystolic] = useState<string>('');
  const [diastolic, setDiastolic] = useState<string>('');
  const [heartRate, setHeartRate] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [timestamp, setTimestamp] = useState<string>('');

  useEffect(() => {
    if (entryToEdit && isOpen) {
      setSystolic(entryToEdit.systolic.toString());
      setDiastolic(entryToEdit.diastolic.toString());
      setHeartRate(entryToEdit.heartRate.toString());
      setNote(entryToEdit.note || '');

      // Correctly format ISO string to local YYYY-MM-DDThh:mm for datetime-local
      const formattedDate = format(parseISO(entryToEdit.timestamp), "yyyy-MM-dd'T'HH:mm");
      setTimestamp(formattedDate);
    } else {
      setSystolic('');
      setDiastolic('');
      setHeartRate('');
      setNote('');
      setTimestamp('');
    }
  }, [entryToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!systolic || !diastolic || !heartRate) return;

    onSave({
      id: entryToEdit?.id,
      timestamp: entryToEdit ? new Date(timestamp).toISOString() : undefined,
      systolic: parseInt(systolic),
      diastolic: parseInt(diastolic),
      heartRate: parseInt(heartRate),
      note: note.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{entryToEdit ? 'Edit Reading' : 'Log New Reading'}</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {entryToEdit && (
            <div className="form-group">
              <label htmlFor="timestamp">Date & Time</label>
              <input
                type="datetime-local"
                id="timestamp"
                value={timestamp}
                onChange={(e) => setTimestamp(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="systolic">SYS (Top)</label>
              <input
                type="number"
                id="systolic"
                value={systolic}
                onChange={(e) => setSystolic(e.target.value)}
                placeholder="120"
                required
                min="40"
                max="250"
              />
            </div>

            <div className="form-group">
              <label htmlFor="diastolic">DIA (Bottom)</label>
              <input
                type="number"
                id="diastolic"
                value={diastolic}
                onChange={(e) => setDiastolic(e.target.value)}
                placeholder="80"
                required
                min="40"
                max="150"
              />
            </div>

            <div className="form-group">
              <label htmlFor="heartRate">Pulse</label>
              <input
                type="number"
                id="heartRate"
                value={heartRate}
                onChange={(e) => setHeartRate(e.target.value)}
                placeholder="72"
                required
                min="30"
                max="220"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="note">Notes (Optional)</label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="How are you feeling? Any specific activity..."
              rows={3}
            />
          </div>

          <button type="submit" className="submit-btn" style={{ marginTop: '0.5rem' }}>
            {entryToEdit ? 'Update Reading' : 'Save Reading'}
          </button>
        </form>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
          animation: fadeIn 0.2s ease-out;
        }

        .modal-content {
          background-color: rgba(22, 22, 35, 0.38);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          padding: 2rem;
          border-radius: 1.5rem;
          width: 90%;
          max-width: 450px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .modal-header h2 {
          margin-bottom: 0;
          font-size: 1.5rem;
          color: var(--text-primary);
        }

        .close-btn {
          color: var(--text-secondary);
          opacity: 0.7;
        }

        .close-btn:hover {
          opacity: 1;
          color: var(--accent-magenta);
        }

        .modal-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .form-group input,
        .form-group textarea {
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          border: 1px solid var(--border-color);
          background-color: var(--bg-secondary);
          color: var(--text-primary);
          font-size: 1rem;
          transition: all 0.2s;
        }

        .form-group textarea {
          resize: vertical;
          min-height: 80px;
          font-family: inherit;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: var(--accent-cyan);
          box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.1);
        }

        .submit-btn {
          background: var(--accent-gradient);
          color: white;
          padding: 1rem;
          border-radius: 0.75rem;
          font-weight: 700;
          font-size: 1rem;
          margin-top: 1rem;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 15px rgba(217, 70, 239, 0.3);
          border: none;
        }

        .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(217, 70, 239, 0.5);
          filter: brightness(1.1);
        }

        .submit-btn:active {
          transform: translateY(0);
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default LogEntryModal;
