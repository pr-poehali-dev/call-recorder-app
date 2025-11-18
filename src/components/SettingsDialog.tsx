import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  audioQuality: string;
  storageLimit: string;
  onAudioQualityChange: (value: string) => void;
  onStorageLimitChange: (value: string) => void;
}

const SettingsDialog = ({
  open,
  onOpenChange,
  audioQuality,
  storageLimit,
  onAudioQualityChange,
  onStorageLimitChange
}: SettingsDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium">Настройки записи</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="quality" className="text-sm font-medium">
              Качество звука
            </Label>
            <Select value={audioQuality} onValueChange={onAudioQualityChange}>
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
            <Select value={storageLimit} onValueChange={onStorageLimitChange}>
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            Сохранить
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
