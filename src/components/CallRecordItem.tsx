import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export interface CallRecord {
  id: string;
  contact: string;
  phone: string;
  type: 'incoming' | 'outgoing' | 'missed';
  duration: string;
  date: Date;
  fileSize: string;
  audioUrl?: string;
}

interface CallRecordItemProps {
  record: CallRecord;
  playingId: string | null;
  onPlayPause: (record: CallRecord) => void;
  formatDate: (date: Date) => string;
  getCallIcon: (type: string) => JSX.Element;
  getCallTypeLabel: (type: string) => string;
}

const CallRecordItem = ({ 
  record, 
  playingId, 
  onPlayPause, 
  formatDate, 
  getCallIcon, 
  getCallTypeLabel 
}: CallRecordItemProps) => {
  return (
    <Card className="border-0 rounded-none shadow-none hover:bg-gray-50 transition-colors">
      <div className="p-4 flex items-center gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
            {getCallIcon(record.type)}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-base font-medium text-gray-900 truncate">
              {record.contact}
            </h3>
            <span className="text-sm text-gray-500">{formatDate(record.date)}</span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="secondary" className="text-xs font-normal">
              {getCallTypeLabel(record.type)}
            </Badge>
            <span className="text-sm text-gray-500">{record.phone}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Icon name="Clock" size={12} />
              {record.duration}
            </span>
            <span className="flex items-center gap-1">
              <Icon name="HardDrive" size={12} />
              {record.fileSize}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          {record.audioUrl && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-primary hover:bg-primary/10"
              onClick={() => onPlayPause(record)}
            >
              <Icon name={playingId === record.id ? "Pause" : "Play"} size={20} />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="text-gray-400 hover:bg-gray-100">
            <Icon name="MoreVertical" size={20} />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default CallRecordItem;
