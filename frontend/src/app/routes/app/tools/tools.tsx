import { ToolEditor } from '@/features/tools/components/tools-editor';
import { ToolsList } from '@/features/tools/components/tools-list';
import { useParams, useLocation, useNavigate } from 'react-router-dom';

export function ToolsRoute() {
  const { toolId } = useParams<{ toolId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const isNewTool = location.pathname.endsWith('/new');

  // Show the tool editor when editing or creating a new tool
  if (toolId || isNewTool) {
    return <ToolEditor toolId={toolId} onClose={() => navigate('/tools')} />;
  }

  // Show the tools list by default
  return <ToolsList />;
}
