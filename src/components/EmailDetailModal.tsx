import { X, Mail, Clock, User } from 'lucide-react';
import { Email } from '@/lib/supabase';

interface EmailDetailModalProps {
  email: Email | null;
  onClose: () => void;
}

export const EmailDetailModal = ({ email, onClose }: EmailDetailModalProps) => {
  if (!email) return null;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString([], { 
      dateStyle: 'medium', 
      timeStyle: 'short' 
    });
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl max-h-[80vh] rounded-xl overflow-hidden flex flex-col"
        style={{ backgroundColor: '#211e1a', border: '1px solid #2d2a26' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid #2d2a26' }}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(201, 169, 98, 0.1)', border: '1px solid rgba(201, 169, 98, 0.2)' }}>
              <Mail className="w-4 h-4" style={{ color: '#c9a962' }} />
            </div>
            <span className="font-medium" style={{ color: '#e8e0d5', fontFamily: 'Playfair Display, serif' }}>Email Details</span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg transition-colors hover:opacity-80"
            style={{ backgroundColor: 'rgba(45, 42, 38, 0.5)' }}
          >
            <X className="w-4 h-4" style={{ color: '#8a8279' }} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Subject */}
          <h2 className="text-xl font-semibold mb-4" style={{ color: '#e8e0d5' }}>
            {email.subject}
          </h2>

          {/* Meta info */}
          <div className="space-y-2 mb-6 pb-4" style={{ borderBottom: '1px solid rgba(45, 42, 38, 0.5)' }}>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" style={{ color: '#8a8279' }} />
              <span className="text-sm" style={{ color: '#8a8279' }}>From:</span>
              <span className="text-sm" style={{ color: '#e8e0d5' }}>{email.sender}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" style={{ color: '#8a8279' }} />
              <span className="text-sm" style={{ color: '#8a8279' }}>Received:</span>
              <span className="text-sm" style={{ color: '#e8e0d5' }}>{formatDate(email.created_at)}</span>
            </div>
          </div>

          {/* Body */}
          <div 
            className="prose prose-invert max-w-none"
            style={{ color: 'rgba(232, 224, 213, 0.9)' }}
          >
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed" style={{ color: 'rgba(232, 224, 213, 0.9)' }}>
              {email.body}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
