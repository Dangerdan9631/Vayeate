import { useAppState } from '../context/AppContext';

export function StatusBar() {
  const { state } = useAppState();
  const { isProcessing, queueLength } = state.queueStatus;
  const visible = isProcessing || queueLength > 0;

  return (
    <footer className="status-bar">
      <div className="status-bar-left" />
      <div className="status-bar-right">
        {visible && (
          <div className="status-progress-area">
            <div className="status-progress-track">
              <div className="status-progress-bar" />
            </div>
            <span className="status-queue-text">
              {queueLength} action{queueLength !== 1 ? 's' : ''} in queue
            </span>
          </div>
        )}
      </div>
    </footer>
  );
}
