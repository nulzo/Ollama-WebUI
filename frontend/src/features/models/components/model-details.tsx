import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
  CardFooter,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { useQueryClient } from '@tanstack/react-query';

type ModelListProps = {
  id: string;
};

export const ModelList = ({ id }: ModelListProps) => {
  const queryClient = useQueryClient();

  const cachedData = queryClient.getQueryData(['models']);

  if (!cachedData) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const searchedObject = cachedData?.models.find(item => item.name === id);

  console.log(searchedObject);

  if (!searchedObject) {
    return <div>error...</div>;
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="uppercase">{searchedObject.name || ''}</CardTitle>
          <CardDescription className="text-xs">{searchedObject.license || ''}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <Label>Template</Label>
            <div className="text-xs leading-3 mb-1 font-normal text-muted-foreground">
              Model template (usually provided by the model creator).
            </div>
            <Textarea className="resize-none" value={searchedObject?.template || ''} />
          </div>
          <div>
            <Label>System</Label>
            <div className="text-xs leading-3 mb-1 font-normal text-muted-foreground">
              The System Prompt that the model should conform to.
            </div>
            <Textarea
              className="resize-none"
              value={searchedObject?.system || ''}
              placeholder="System Prompt"
            />
          </div>
          <div>
            <Label>Parameters</Label>
            <div className="text-xs leading-3 mb-1 font-normal text-muted-foreground">
              Additional parameters required by the model (usually stop conditions, temperature,
              top_k, etc.).
            </div>
            <Textarea
              className="resize-none"
              value={searchedObject?.parameters || ''}
              placeholder="Parameters"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end items-end gap-3">
          <Button variant="secondary">Cancel</Button>
          <Button variant="default">Save Changes</Button>
        </CardFooter>
      </Card>
    </div>
  );
};
