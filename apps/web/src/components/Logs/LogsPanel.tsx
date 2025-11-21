import { useEffect, useRef } from 'react';
import { useLogsStore } from '../../stores/logsStore';
import { MagnifyingGlassIcon, DownloadIcon, TrashIcon } from '@radix-ui/react-icons';
import classNames from 'classnames';

const LOG_LEVELS = ['all', 'info', 'warn', 'error', 'success'] as const;

export default function LogsPanel() {
  const {
    filter,
    searchQuery,
    autoScroll,
    setFilter,
    setSearchQuery,
    setAutoScroll,
    clearLogs,
    getFilteredLogs
  } = useLogsStore();
  
  const logsContainerRef = useRef<HTMLDivElement>(null);
  const filteredLogs = getFilteredLogs();

  useEffect(() => {
    if (autoScroll && logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [filteredLogs, autoScroll]);

  const exportLogs = () => {
    const logsText = filteredLogs
      .map(log => `[${log.timestamp.toISOString()}] [${log.level.toUpperCase()}] ${log.message}`)
      .join('\n');
    
    const blob = new Blob([logsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-full flex-col bg-bolt-elements-background-depth-2" data-testid="logs-panel">
      {/* Header */}
      <div className="border-b border-bolt-elements-borderColor p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-bolt-elements-textPrimary">
            Build Logs
          </h2>
          <div className="flex gap-2">
            <button
              onClick={exportLogs}
              className="rounded-lg bg-bolt-elements-background-depth-1 p-2 text-bolt-elements-textPrimary hover:bg-bolt-elements-background-depth-3"
              title="Export logs"
              data-testid="export-logs"
            >
              <DownloadIcon className="h-4 w-4" />
            </button>
            <button
              onClick={clearLogs}
              className="rounded-lg bg-bolt-elements-background-depth-1 p-2 text-bolt-elements-textPrimary hover:bg-bolt-elements-background-depth-3"
              title="Clear logs"
              data-testid="clear-logs"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-bolt-elements-textSecondary" />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-bolt-elements-borderColor bg-bolt-elements-background-depth-1 py-2 pl-10 pr-4 text-sm text-bolt-elements-textPrimary focus:border-blue-500 focus:outline-none"
            data-testid="search-logs"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {LOG_LEVELS.map((level) => (
              <button
                key={level}
                onClick={() => setFilter(level)}
                className={classNames(
                  'rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors',
                  {
                    'bg-blue-500 text-white': filter === level,
                    'bg-bolt-elements-background-depth-1 text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary': filter !== level
                  }
                )}
                data-testid={`filter-${level}`}
              >
                {level}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 text-xs text-bolt-elements-textSecondary">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="h-4 w-4 rounded border-bolt-elements-borderColor bg-bolt-elements-background-depth-1 text-blue-500"
              data-testid="auto-scroll-toggle"
            />
            Auto-scroll
          </label>
        </div>
      </div>

      {/* Logs */}
      <div
        ref={logsContainerRef}
        className="flex-1 overflow-auto p-4 font-mono text-xs"
        data-testid="logs-container"
      >
        {filteredLogs.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-bolt-elements-textSecondary">
              No logs to display
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredLogs.map((log) => (
              <LogEntry key={log.id} log={log} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function LogEntry({ log }: { log: any }) {
  const levelColors: Record<string, string> = {
    info: 'text-blue-400',
    warn: 'text-yellow-400',
    error: 'text-red-400',
    success: 'text-green-400'
  };

  return (
    <div className="flex gap-3" data-testid={`log-entry-${log.id}`}>
      <span className="flex-shrink-0 text-bolt-elements-textSecondary">
        {log.timestamp.toLocaleTimeString()}
      </span>
      <span className={classNames('flex-shrink-0 font-bold uppercase', levelColors[log.level] || 'text-bolt-elements-textPrimary')}>
        [{log.level}]
      </span>
      {log.phase && (
        <span className="flex-shrink-0 text-bolt-elements-textSecondary">
          [{log.phase}]
        </span>
      )}
      <span className="flex-1 text-bolt-elements-textPrimary">
        {log.message}
      </span>
    </div>
  );
}
