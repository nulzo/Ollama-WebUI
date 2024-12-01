import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const PrivacySettings = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Label>Data Collection</Label>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="space-y-0.5">
              <Label>Usage Analytics</Label>
              <p className="text-sm text-muted-foreground">
                Help us improve by sending anonymous usage data
              </p>
            </div>
            <Switch />
          </div>

          <div className="flex justify-between items-center">
            <div className="space-y-0.5">
              <Label>Error Reporting</Label>
              <p className="text-sm text-muted-foreground">
                Automatically send error reports to help fix issues
              </p>
            </div>
            <Switch />
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <Label>Chat History</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select retention period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="forever">Keep Forever</SelectItem>
            <SelectItem value="1year">1 Year</SelectItem>
            <SelectItem value="6months">6 Months</SelectItem>
            <SelectItem value="3months">3 Months</SelectItem>
            <SelectItem value="1month">1 Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label>Data Export</Label>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="space-y-0.5">
              <Label>Export Format</Label>
              <p className="text-sm text-muted-foreground">
                Choose the format for your data exports
              </p>
            </div>
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="txt">Plain Text</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <Label>Custom Privacy Notice</Label>
        <Textarea
          placeholder="Enter any specific privacy requirements or notes"
          className="min-h-[100px]"
        />
      </div>
    </div>
  );
};
