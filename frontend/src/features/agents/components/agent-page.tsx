import { AgentForm } from './agent-form';

export default function CreateAgent() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-8 font-bold text-3xl">Create New Agent</h1>
      <AgentForm agent={null} onSubmit={() => {}} />
    </div>
  );
}
