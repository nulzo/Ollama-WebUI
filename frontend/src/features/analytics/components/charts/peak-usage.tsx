import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatNumber } from '@/lib/utils';

interface PeakUsageProps {
  data: any[];
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function PeakUsageHeatmap({ data }: PeakUsageProps) {
  // Create 2D array for heatmap [day][hour]
  const heatmapData = DAYS.map(day => 
    HOURS.map(hour => {
      const entry = data.find(d => d.day === DAYS.indexOf(day) && d.hour === hour);
      return {
        requests: entry?.requests || 0,
        tokens: entry?.tokens || 0,
        cost: entry?.cost || 0,
      };
    })
  );

  const maxRequests = Math.max(...data.map(d => d.requests));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Peak Usage Times</CardTitle>
        <CardDescription>Request volume by day and hour</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-[auto_1fr] gap-4">
          <div className="flex flex-col justify-around text-sm text-muted-foreground">
            {DAYS.map(day => (
              <div key={day} className="h-8">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-24 gap-1">
            {heatmapData.map((day, dayIndex) => (
              day.map((hour, hourIndex) => {
                const intensity = hour.requests / maxRequests;
                return (
                  <div
                    key={`${dayIndex}-${hourIndex}`}
                    className="group relative h-8"
                  >
                    <div
                      className="absolute inset-0 rounded-sm"
                      style={{
                        backgroundColor: `hsl(var(--chart-1))`,
                        opacity: intensity * 0.9,
                      }}
                    />
                    <div className="absolute hidden group-hover:block bottom-full left-1/2 -translate-x-1/2 p-2 rounded-lg border bg-background shadow-sm">
                      <div className="grid gap-1 text-xs">
                        <div className="font-semibold">
                          {DAYS[dayIndex]} {hourIndex}:00
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <span>Requests:</span>
                          <span>{formatNumber(hour.requests)}</span>
                          <span>Tokens:</span>
                          <span>{formatNumber(hour.tokens)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ))}
          </div>
          <div className="col-start-2 flex justify-between text-xs text-muted-foreground">
            {[0, 6, 12, 18, 23].map(hour => (
              <div key={hour}>{hour}:00</div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}