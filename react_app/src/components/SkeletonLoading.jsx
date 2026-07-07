import React from 'react';

export default function SkeletonLoading() {
  const dummyItems = Array.from({ length: 5 });

  return (
    <div style={{ padding: '10px' }}>
      {dummyItems.map((_, i) => (
        <div key={i} style={{
          background: 'var(--card-bg)',
          borderRadius: '16px',
          marginBottom: '16px',
          padding: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="skeleton-pulse" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--border-color)' }}></div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div className="skeleton-pulse" style={{ width: '40%', height: '14px', borderRadius: '4px', background: 'var(--border-color)' }}></div>
              <div className="skeleton-pulse" style={{ width: '70%', height: '18px', borderRadius: '4px', background: 'var(--border-color)' }}></div>
            </div>
          </div>
          {/* Image */}
          <div className="skeleton-pulse" style={{ width: '100%', height: '250px', borderRadius: '12px', background: 'var(--border-color)' }}></div>
          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div className="skeleton-pulse" style={{ width: '30%', height: '30px', borderRadius: '16px', background: 'var(--border-color)' }}></div>
            <div className="skeleton-pulse" style={{ width: '30%', height: '30px', borderRadius: '16px', background: 'var(--border-color)' }}></div>
          </div>
        </div>
      ))}
      <style>{`
        .skeleton-pulse {
          animation: pulse 1.5s infinite ease-in-out;
        }
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 0.3; }
          100% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
