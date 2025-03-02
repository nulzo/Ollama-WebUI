import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Knowledge } from '../knowledge';
import { useForm } from 'react-hook-form';
import { FileUploader } from './file-uploader';

interface KnowledgeFormProps {
  knowledge?: Knowledge;
  onSubmit: (values: any) => void;
  isUploading?: boolean;
}

export const KnowledgeForm = ({ knowledge, onSubmit, isUploading = false }: KnowledgeFormProps) => {
  const [uploadMode, setUploadMode] = useState(isUploading);
  const [file, setFile] = useState<File | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: knowledge?.name || '',
      identifier: knowledge?.identifier || '',
      content: knowledge?.content || '',
    },
  });

  const handleFormSubmit = (values: any) => {
    if (uploadMode && file) {
      onSubmit({ file, name: values.name });
    } else {
      onSubmit(values);
    }
  };

  const handleFileChange = (selectedFile: File) => {
    setFile(selectedFile);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="flex gap-4 mb-4">
        <Button
          type="button"
          variant={uploadMode ? "default" : "outline"}
          onClick={() => setUploadMode(false)}
        >
          Manual Entry
        </Button>
        <Button
          type="button"
          variant={uploadMode ? "outline" : "default"}
          onClick={() => setUploadMode(true)}
        >
          File Upload
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            placeholder="Knowledge name"
            {...register('name', { required: 'Name is required' })}
          />
          {errors.name && (
            <p className="mt-1 text-destructive text-sm">{errors.name.message as string}</p>
          )}
        </div>

        {!uploadMode && (
          <>
            <div>
              <Label htmlFor="identifier">Identifier</Label>
              <Input
                id="identifier"
                placeholder="Unique identifier"
                {...register('identifier', { required: 'Identifier is required' })}
              />
              {errors.identifier && (
                <p className="mt-1 text-destructive text-sm">{errors.identifier.message as string}</p>
              )}
            </div>

            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                placeholder="Enter knowledge content"
                className="min-h-[200px]"
                {...register('content', { required: 'Content is required' })}
              />
              {errors.content && (
                <p className="mt-1 text-destructive text-sm">{errors.content.message as string}</p>
              )}
            </div>
          </>
        )}

        {uploadMode && (
          <div>
            <Label>Upload File</Label>
            <FileUploader onFileSelect={handleFileChange} />
            {!file && (
              <p className="mt-1 text-muted-foreground text-sm">
                Please select a file to upload
              </p>
            )}
          </div>
        )}
      </div>

      <Button type="submit" className="w-full">
        {knowledge ? 'Update Knowledge' : 'Create Knowledge'}
      </Button>
    </form>
  );
}; 