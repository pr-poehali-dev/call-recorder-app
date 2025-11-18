import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { CallRecord } from './CallRecordItem';

interface AudioPlayerProps {
  playingId: string | null;
  currentTime: number;
  duration: number;
  callRecords: CallRecord[];
  onPlayPause: (record: CallRecord) => void;
  onClose: () => void;
  formatTime: (seconds: number) => string;
}

const AudioPlayer = ({
  playingId,
  currentTime,
  duration,
  callRecords,
  onPlayPause,
  onClose,
  formatTime
}: AudioPlayerProps) => {
  if (!playingId) return null;

  const currentRecord = callRecords.find(r => r.id === playingId);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-20">
      <div className="max-w-2xl mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (currentRecord) onPlayPause(currentRecord);
            }}
            className="flex-shrink-0 text-primary"
          >
            <Icon name="Pause" size={24} />
          </Button>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-900">
                {currentRecord?.contact}
              </span>
              <span className="text-xs text-gray-500">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
            <div className="relative h-1 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="absolute h-full bg-primary transition-all duration-100"
                style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
              />
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="flex-shrink-0 text-gray-400"
          >
            <Icon name="X" size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
