
import React, { useState } from 'react';

interface TrainingExample {
  user: string;
  ai: string;
}

const AIPromptSettings: React.FC = () => {
  const [basePrompt, setBasePrompt] = useState('');
  const [businessInfo, setBusinessInfo] = useState('');
  const [rules, setRules] = useState('');
  const [trainingExamples, setTrainingExamples] = useState<TrainingExample[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [testInput, setTestInput] = useState('');
  const [testOutput, setTestOutput] = useState('');

  const handleAddExample = () => {
    setTrainingExamples([...trainingExamples, { user: '', ai: '' }]);
  };

  const handleExampleChange = (idx: number, field: 'user' | 'ai', value: string) => {
    const updated = [...trainingExamples];
    updated[idx][field] = value;
    setTrainingExamples(updated);
  };

  const handleDeleteExample = (idx: number) => {
    setTrainingExamples(trainingExamples.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    // TODO: Save to backend
    alert('Saved! (Not yet connected to backend)');
  };

  const handleTestAI = () => {
    // TODO: Call backend to get AI response
    setTestOutput('AI response will appear here. (Not yet connected)');
  };

  const masterPrompt = `
[BASE PROMPT]\n${basePrompt}

[BUSINESS INFORMATION]\n${businessInfo}

[RULES]\n${rules}

[TRAINING EXAMPLES]\n${trainingExamples.map(e => `User: ${e.user}\nAI: ${e.ai}`).join('\n\n')}
`;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">AI Prompt Settings</h1>

      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Base System Prompt</h2>
        <textarea
          className="w-full border rounded p-2 min-h-[80px]"
          placeholder="Edit the base system prompt here..."
          value={basePrompt}
          onChange={e => setBasePrompt(e.target.value)}
        />
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Business Information</h2>
        <textarea
          className="w-full border rounded p-2 min-h-[80px]"
          placeholder="Edit business info (prices, hours, etc.)..."
          value={businessInfo}
          onChange={e => setBusinessInfo(e.target.value)}
        />
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Rules</h2>
        <textarea
          className="w-full border rounded p-2 min-h-[80px]"
          placeholder="Add hard rules for the AI..."
          value={rules}
          onChange={e => setRules(e.target.value)}
        />
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2 flex items-center justify-between">
          <span>Training Examples</span>
          <button
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
            onClick={handleAddExample}
          >
            + Add Example
          </button>
        </h2>
        {trainingExamples.length === 0 && (
          <div className="text-gray-500 mb-2">No examples yet.</div>
        )}
        {trainingExamples.map((ex, idx) => (
          <div key={idx} className="border rounded p-2 mb-2 flex flex-col gap-1 relative">
            <button
              className="absolute top-2 right-2 text-xs text-red-500"
              onClick={() => handleDeleteExample(idx)}
              title="Delete example"
            >
              ✕
            </button>
            <div className="font-semibold">User says:</div>
            <input
              className="w-full border rounded p-1 mb-1"
              placeholder="User message..."
              value={ex.user}
              onChange={e => handleExampleChange(idx, 'user', e.target.value)}
            />
            <div className="font-semibold">AI replies:</div>
            <input
              className="w-full border rounded p-1"
              placeholder="AI reply..."
              value={ex.ai}
              onChange={e => handleExampleChange(idx, 'ai', e.target.value)}
            />
          </div>
        ))}
      </div>

      <div className="mb-8">
        <button
          className="px-4 py-2 bg-gray-200 rounded mr-4"
          onClick={() => setPreviewOpen(!previewOpen)}
        >
          {previewOpen ? 'Hide' : 'Show'} Prompt Preview
        </button>
        {previewOpen && (
          <pre className="bg-gray-100 border rounded p-4 mt-2 whitespace-pre-wrap text-xs">
            {masterPrompt}
          </pre>
        )}
      </div>

      <div className="mb-8 border-t pt-6">
        <h2 className="text-lg font-semibold mb-2">Test AI</h2>
        <div className="flex gap-2 mb-2">
          <input
            className="flex-1 border rounded p-2"
            placeholder="Type a test message..."
            value={testInput}
            onChange={e => setTestInput(e.target.value)}
          />
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={handleTestAI}
          >
            Test
          </button>
        </div>
        {testOutput && (
          <div className="bg-gray-50 border rounded p-3 mt-2">
            <div className="font-semibold mb-1">AI Response:</div>
            <div>{testOutput}</div>
          </div>
        )}
      </div>

      <button
        className="px-6 py-2 bg-green-600 text-white rounded font-bold"
        onClick={handleSave}
      >
        Save Changes
      </button>
    </div>
  );
};

export default AIPromptSettings;
