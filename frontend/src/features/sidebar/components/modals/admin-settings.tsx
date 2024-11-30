import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const AdminSettings = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Label>System Settings</Label>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="space-y-0.5">
              <Label>Maintenance Mode</Label>
              <p className="text-sm text-muted-foreground">
                Temporarily disable access to the application
              </p>
            </div>
            <Switch />
          </div>

          <div className="flex justify-between items-center">
            <div className="space-y-0.5">
              <Label>Debug Mode</Label>
              <p className="text-sm text-muted-foreground">
                Enable detailed logging and debugging features
              </p>
            </div>
            <Switch />
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <Label>Rate Limiting</Label>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Requests per minute</Label>
            <Input type="number" placeholder="60" />
          </div>
          <div className="space-y-1">
            <Label>Concurrent connections</Label>
            <Input type="number" placeholder="10" />
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <Label>Access Control</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select access level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="public">Public Access</SelectItem>
            <SelectItem value="private">Private Access</SelectItem>
            <SelectItem value="restricted">Restricted Access</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label>API Configuration</Label>
        <div className="space-y-4">
          <div className="space-y-1">
            <Label>API Version</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select API version" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="v1">Version 1.0</SelectItem>
                <SelectItem value="v2">Version 2.0</SelectItem>
                <SelectItem value="beta">Beta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>API Timeout (seconds)</Label>
            <Input type="number" placeholder="30" />
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <Label>Backup Settings</Label>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="space-y-0.5">
              <Label>Automatic Backups</Label>
              <p className="text-sm text-muted-foreground">Enable scheduled system backups</p>
            </div>
            <Switch />
          </div>

          <div className="space-y-1">
            <Label>Backup Frequency</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};
