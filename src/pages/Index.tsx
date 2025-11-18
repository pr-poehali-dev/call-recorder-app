import { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface CallRecord {
  id: string;
  contact: string;
  phone: string;
  type: 'incoming' | 'outgoing' | 'missed';
  duration: string;
  date: Date;
  fileSize: string;
  audioUrl?: string;
}

const mockCallRecords: CallRecord[] = [
  {
    id: '1',
    contact: 'Анна Петрова',
    phone: '+7 (999) 123-45-67',
    type: 'incoming',
    duration: '5:32',
    date: new Date('2025-01-18T14:30:00'),
    fileSize: '2.8 МБ',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
  },
  {
    id: '2',
    contact: 'Офис',
    phone: '+7 (495) 555-01-01',
    type: 'outgoing',
    duration: '12:45',
    date: new Date('2025-01-18T11:15:00'),
    fileSize: '6.5 МБ',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
  },
  {
    id: '3',
    contact: 'Неизвестно',
    phone: '+7 (900) 888-77-66',
    type: 'missed',
    duration: '0:00',
    date: new Date('2025-01-17T18:45:00'),
    fileSize: '0 МБ'
  },
  {
    id: '4',
    contact: 'Мама',
    phone: '+7 (916) 234-56-78',
    type: 'incoming',
    duration: '8:12',
    date: new Date('2025-01-17T16:20:00'),
    fileSize: '4.2 МБ',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
  },
  {
    id: '5',
    contact: 'Иван Сидоров',
    phone: '+7 (903) 777-88-99',
    type: 'outgoing',
    duration: '3:27',
    date: new Date('2025-01-17T10:05:00'),
    fileSize: '1.7 МБ',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'
  }
];

const Index = () => {
  const [autoRecord, setAutoRecord] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [audioQuality, setAudioQuality] = useState('high');
  const [storageLimit, setStorageLimit] = useState('100');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [callRecords, setCallRecords] = useState<CallRecord[]>(mockCallRecords);
  const [groupByContact, setGroupByContact] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setPlayingId(null);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  useEffect(() => {
    if (isRecording) {
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }

    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, [isRecording]);

  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
  };

  const stopRecording = () => {
    setIsRecording(false);
    
    const newRecord: CallRecord = {
      id: Date.now().toString(),
      contact: 'Новая запись',
      phone: '+7 (XXX) XXX-XX-XX',
      type: 'outgoing',
      duration: formatTime(recordingTime),
      date: new Date(),
      fileSize: `${(recordingTime * 0.5).toFixed(1)} МБ`,
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
    };
    
    setCallRecords([newRecord, ...callRecords]);
    setRecordingTime(0);
  };

  const handlePlayPause = (record: CallRecord) => {
    if (!record.audioUrl) return;

    const audio = audioRef.current;
    if (!audio) return;

    if (playingId === record.id) {
      audio.pause();
      setPlayingId(null);
    } else {
      if (playingId !== record.id) {
        audio.src = record.audioUrl;
        setCurrentTime(0);
      }
      audio.play();
      setPlayingId(record.id);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Сегодня, ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Вчера, ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    }
  };

  const getCallIcon = (type: string) => {
    switch (type) {
      case 'incoming':
        return <Icon name="PhoneIncoming" className="text-green-500" size={20} />;
      case 'outgoing':
        return <Icon name="PhoneOutgoing" className="text-orange-500" size={20} />;
      case 'missed':
        return <Icon name="PhoneMissed" className="text-red-500" size={20} />;
      default:
        return <Icon name="Phone" size={20} />;
    }
  };

  const getCallTypeLabel = (type: string) => {
    switch (type) {
      case 'incoming':
        return 'Входящий';
      case 'outgoing':
        return 'Исходящий';
      case 'missed':
        return 'Пропущенный';
      default:
        return '';
    }
  };

  const filteredRecords = callRecords.filter(record =>
    record.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.phone.includes(searchQuery)
  );

  const groupedRecords = () => {
    if (!groupByContact) return null;

    const groups = new Map<string, CallRecord[]>();
    filteredRecords.forEach(record => {
      const key = record.contact;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(record);
    });

    return Array.from(groups.entries()).map(([contact, records]) => ({
      contact,
      records: records.sort((a, b) => b.date.getTime() - a.date.getTime()),
      totalCalls: records.length,
      totalDuration: records.reduce((sum, r) => {
        const [mins, secs] = r.duration.split(':').map(Number);
        return sum + (mins * 60) + secs;
      }, 0)
    })).sort((a, b) => b.records[0].date.getTime() - a.records[0].date.getTime());
  };

  const toggleGroup = (contact: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(contact)) {
      newExpanded.delete(contact);
    } else {
      newExpanded.add(contact);
    }
    setExpandedGroups(newExpanded);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto bg-white min-h-screen shadow-lg">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-medium text-gray-900">Записи звонков</h1>
              <div className="flex gap-2">
                {!isRecording ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={startRecording}
                    className="text-red-500 hover:bg-red-50"
                  >
                    <Icon name="Mic" size={24} />
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={stopRecording}
                    className="text-red-500 hover:bg-red-50 animate-pulse"
                  >
                    <Icon name="Square" size={24} />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSettingsOpen(true)}
                  className="text-gray-600"
                >
                  <Icon name="Settings" size={24} />
                </Button>
              </div>
            </div>

            {isRecording && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <div>
                      <p className="text-sm font-medium text-red-900">Идёт запись...</p>
                      <p className="text-xs text-red-600">{formatTime(recordingTime)}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={stopRecording}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    <Icon name="Square" size={16} className="mr-2" />
                    Остановить
                  </Button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg mb-4">
              <div className="flex items-center gap-3">
                <Icon name="Mic" size={20} className="text-primary" />
                <span className="text-sm font-medium text-gray-900">Автозапись звонков</span>
              </div>
              <Switch checked={autoRecord} onCheckedChange={setAutoRecord} />
            </div>

            <div className="space-y-3">
              <div className="relative">
                <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Поиск по контактам..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-50 border-gray-200"
                />
              </div>

              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-3">
                  <Icon name="Users" size={18} className="text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">Группировать по контактам</span>
                </div>
                <Switch checked={groupByContact} onCheckedChange={setGroupByContact} />
              </div>
            </div>
          </div>
        </div>

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
                                handlePlayPause(record);
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
              <Card key={record.id} className="border-0 rounded-none shadow-none hover:bg-gray-50 transition-colors">
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
                        onClick={() => handlePlayPause(record)}
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
            ))
          )}

          {filteredRecords.length === 0 && (
            <div className="py-16 text-center">
              <Icon name="Phone" size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Записи не найдены</p>
            </div>
          )}
        </div>
      </div>

      {playingId && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-20">
          <div className="max-w-2xl mx-auto px-4 py-3">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  const record = callRecords.find(r => r.id === playingId);
                  if (record) handlePlayPause(record);
                }}
                className="flex-shrink-0 text-primary"
              >
                <Icon name="Pause" size={24} />
              </Button>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">
                    {callRecords.find(r => r.id === playingId)?.contact}
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
                onClick={() => {
                  if (audioRef.current) {
                    audioRef.current.pause();
                    setPlayingId(null);
                  }
                }}
                className="flex-shrink-0 text-gray-400"
              >
                <Icon name="X" size={20} />
              </Button>
            </div>
          </div>
        </div>
      )}

      <audio ref={audioRef} />

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-medium">Настройки записи</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="quality" className="text-sm font-medium">
                Качество звука
              </Label>
              <Select value={audioQuality} onValueChange={setAudioQuality}>
                <SelectTrigger id="quality">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Низкое (64 kbps)</SelectItem>
                  <SelectItem value="medium">Среднее (128 kbps)</SelectItem>
                  <SelectItem value="high">Высокое (256 kbps)</SelectItem>
                  <SelectItem value="lossless">Без потерь (320 kbps)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Высокое качество требует больше места
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="storage" className="text-sm font-medium">
                Лимит хранения (МБ)
              </Label>
              <Select value={storageLimit} onValueChange={setStorageLimit}>
                <SelectTrigger id="storage">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="50">50 МБ</SelectItem>
                  <SelectItem value="100">100 МБ</SelectItem>
                  <SelectItem value="250">250 МБ</SelectItem>
                  <SelectItem value="500">500 МБ</SelectItem>
                  <SelectItem value="unlimited">Без ограничений</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Старые записи будут удаляться автоматически
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-normal">Запись входящих</Label>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm font-normal">Запись исходящих</Label>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm font-normal">Уведомления о записи</Label>
                <Switch />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setSettingsOpen(false)}>
              Отмена
            </Button>
            <Button onClick={() => setSettingsOpen(false)}>
              Сохранить
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;