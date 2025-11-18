import { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import CallRecordsList from '@/components/CallRecordsList';
import AudioPlayer from '@/components/AudioPlayer';
import SettingsDialog from '@/components/SettingsDialog';
import { CallRecord } from '@/components/CallRecordItem';

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
  const [filterType, setFilterType] = useState<'all' | 'incoming' | 'outgoing' | 'missed'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'duration'>('date');
  const [showFilters, setShowFilters] = useState(false);
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

  const filteredRecords = callRecords
    .filter(record => {
      const matchesSearch = record.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.phone.includes(searchQuery);
      const matchesType = filterType === 'all' || record.type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return b.date.getTime() - a.date.getTime();
      } else {
        const durationA = a.duration.split(':').reduce((acc, time) => (60 * acc) + +time, 0);
        const durationB = b.duration.split(':').reduce((acc, time) => (60 * acc) + +time, 0);
        return durationB - durationA;
      }
    });

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
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowFilters(!showFilters)}
                  className={showFilters ? "text-primary bg-primary/10" : "text-gray-600"}
                >
                  <Icon name="Filter" size={24} />
                </Button>
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

              {showFilters && (
                <div className="space-y-3 animate-fade-in">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-gray-700">Тип звонков</Label>
                    <div className="flex gap-2">
                      <Button
                        variant={filterType === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterType('all')}
                        className="flex-1 text-xs"
                      >
                        Все
                      </Button>
                      <Button
                        variant={filterType === 'incoming' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterType('incoming')}
                        className="flex-1 text-xs"
                      >
                        <Icon name="PhoneIncoming" size={14} className="mr-1" />
                        Входящие
                      </Button>
                      <Button
                        variant={filterType === 'outgoing' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterType('outgoing')}
                        className="flex-1 text-xs"
                      >
                        <Icon name="PhoneOutgoing" size={14} className="mr-1" />
                        Исходящие
                      </Button>
                      <Button
                        variant={filterType === 'missed' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterType('missed')}
                        className="flex-1 text-xs"
                      >
                        <Icon name="PhoneMissed" size={14} className="mr-1" />
                        Пропущенные
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-gray-700">Сортировка</Label>
                    <div className="flex gap-2">
                      <Button
                        variant={sortBy === 'date' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSortBy('date')}
                        className="flex-1 text-xs"
                      >
                        <Icon name="Calendar" size={14} className="mr-1" />
                        По дате
                      </Button>
                      <Button
                        variant={sortBy === 'duration' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSortBy('duration')}
                        className="flex-1 text-xs"
                      >
                        <Icon name="Clock" size={14} className="mr-1" />
                        По длительности
                      </Button>
                    </div>
                  </div>
                </div>
              )}

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

        <CallRecordsList
          filteredRecords={filteredRecords}
          groupByContact={groupByContact}
          expandedGroups={expandedGroups}
          playingId={playingId}
          onPlayPause={handlePlayPause}
          toggleGroup={toggleGroup}
          formatDate={formatDate}
          formatTime={formatTime}
          getCallIcon={getCallIcon}
          getCallTypeLabel={getCallTypeLabel}
          groupedRecords={groupedRecords}
        />
      </div>

      <AudioPlayer
        playingId={playingId}
        currentTime={currentTime}
        duration={duration}
        callRecords={callRecords}
        onPlayPause={handlePlayPause}
        onClose={() => {
          if (audioRef.current) {
            audioRef.current.pause();
            setPlayingId(null);
          }
        }}
        formatTime={formatTime}
      />

      <audio ref={audioRef} />

      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        audioQuality={audioQuality}
        storageLimit={storageLimit}
        onAudioQualityChange={setAudioQuality}
        onStorageLimitChange={setStorageLimit}
      />
    </div>
  );
};

export default Index;
