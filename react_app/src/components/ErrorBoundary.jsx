import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'var(--text-color)', background: 'var(--bg-color)', minHeight: '100vh', fontFamily: 'sans-serif' }}>
          <h2 style={{ color: '#ff3347' }}>Что-то пошло не так (Критическая ошибка)</h2>
          <details style={{ whiteSpace: 'pre-wrap', background: 'var(--card-bg)', padding: '10px', borderRadius: '8px', border: '1px solid #ff3347', overflowX: 'auto' }}>
            <summary>Техническая информация</summary>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
          <button 
            onClick={() => window.location.reload()}
            style={{ marginTop: '20px', padding: '10px 20px', background: 'var(--tab-active)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
          >
            Перезагрузить приложение
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
