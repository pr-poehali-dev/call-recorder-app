import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import CallRecordItem, { CallRecord } from './CallRecordItem';

interface CallRecordsListProps {
  filteredRecords: CallRecord[];
  groupByContact: boolean;
  expandedGroups: Set<string>;
  playingId: string | null;
  onPlayPause: (record: CallRecord) => void;
  toggleGroup: (contact: string) => void;
  formatDate: (date: Date) => string;
  formatTime: (seconds: number) => string;
  getCallIcon: (type: string) => JSX.Element;
  getCallTypeLabel: (type: string) => string;
  groupedRecords: () => Array<{
    contact: string;
    records: CallRecord[];
    totalCalls: number;
    totalDuration: number;
  }> | null;
}

const CallRecordsList = ({
  filteredRecords,
  groupByContact,
  expandedGroups,
  playingId,
  onPlayPause,
  toggleGroup,
  formatDate,
  formatTime,
  getCallIcon,
  getCallTypeLabel,
  groupedRecords
}: CallRecordsListProps) => {
  return (
    <div className="divide-y divide-gray-100">
      {groupByContact ? (
        groupedRecords()?.map((group) => (
          <div key={group.contact} className="border-0">
            <Card 
              className="border-0 rounded-none shadow-none hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => toggleGroup(group.contact)}
            >
              <div className="p-4 flex items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon name="User" className="text-primary" size={24} />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-base font-medium text-gray-900 truncate">
                      {group.contact}
                    </h3>
                    <Icon 
                      name={expandedGroups.has(group.contact) ? "ChevronUp" : "ChevronDown"} 
                      size={20} 
                      className="text-gray-400"
                    />
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Icon name="Phone" size={14} />
                      {group.totalCalls} {group.totalCalls === 1 ? 'звонок' : 'звонков'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon name="Clock" size={14} />
                      {formatTime(group.totalDuration)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {expandedGroups.has(group.contact) && (
              <div className="bg-gray-50 divide-y divide-gray-200 animate-accordion-down">
                {group.records.map((record) => (
                  <div key={record.id} className="pl-8 pr-4 py-3 flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                        {getCallIcon(record.type)}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant="secondary" className="text-xs font-normal">
                          {getCallTypeLabel(record.type)}
                        </Badge>
                        <span className="text-xs text-gray-500">{formatDate(record.date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{record.phone}</span>
                        <span>•</span>
                        <span>{record.duration}</span>
                        <span>•</span>
                        <span>{record.fileSize}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {record.audioUrl && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-primary hover:bg-primary/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            onPlayPause(record);
                          }}
                        >
                          <Icon name={playingId === record.id ? "Pause" : "Play"} size={16} />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      ) : (
        filteredRecords.map((record) => (
          <CallRecordItem
            key={record.id}
            record={record}
            playingId={playingId}
            onPlayPause={onPlayPause}
            formatDate={formatDate}
            getCallIcon={getCallIcon}
            getCallTypeLabel={getCallTypeLabel}
          />
        ))
      )}

      {filteredRecords.length === 0 && (
        <div className="py-16 text-center">
          <Icon name="Phone" size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Записи не найдены</p>
        </div>
      )}
    </div>
  );
};

export default CallRecordsList;
