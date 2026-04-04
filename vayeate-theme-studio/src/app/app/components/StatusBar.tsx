import { useStatusBarViewModel } from '../viewmodel/use-status-bar-viewmodel';

export function StatusBar() {
  const { showProgressArea, queueStatusText } = useStatusBarViewModel();

  return (
    <footer className="status-bar">
      <div className="status-bar-left" />
      <div className="status-bar-right">
        {showProgressArea && (
          <div className="status-progress-area">
            <div className="status-progress-track">
              <div className="status-progress-bar" />
            </div>
            <span className="status-queue-text">{queueStatusText}</span>
          </div>
        )}
      </div>
    </footer>
  );
}
