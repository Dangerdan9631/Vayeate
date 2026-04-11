import { useStatusBarViewModel } from '../viewmodel/use-status-bar-viewmodel';

export function StatusBar() {
  const {
    showStatusCluster,
    showBackgroundProgressArea,
    backgroundQueueStatusText,
    showActionQueueProgressArea,
    actionQueueStatusText,
  } = useStatusBarViewModel();

  return (
    <footer className="status-bar">
      <div className="status-bar-left" />
      <div className="status-bar-right">
        {showStatusCluster && (
          <div className="status-queue-cluster">
            {showBackgroundProgressArea && (
              <div className="status-progress-area">
                <div className="status-progress-track">
                  <div className="status-progress-bar" />
                </div>
                <span className="status-queue-text">{backgroundQueueStatusText}</span>
              </div>
            )}
            {showActionQueueProgressArea && (
              <div className="status-progress-area">
                <div className="status-progress-track">
                  <div className="status-progress-bar" />
                </div>
                <span className="status-queue-text">{actionQueueStatusText}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </footer>
  );
}
