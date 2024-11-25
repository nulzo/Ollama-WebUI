import { AgentForm } from './agent-form';

export default function CreateAgent() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="mb-8 text-3xl font-bold">Create New Agent</h1>
      <AgentForm />
    </div>
  );
}
