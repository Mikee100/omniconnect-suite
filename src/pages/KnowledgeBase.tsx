import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KBEntry {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const mockEntries: KBEntry[] = [
  {
    id: '1',
    question: 'What are your business hours?',
    answer: 'We are open Monday to Friday from 9 AM to 6 PM, and Saturday from 10 AM to 4 PM.',
    category: 'General',
  },
  {
    id: '2',
    question: 'How do I cancel my booking?',
    answer: 'You can cancel your booking up to 24 hours before your appointment by contacting us or using our online portal.',
    category: 'Bookings',
  },
  {
    id: '3',
    question: 'What is your refund policy?',
    answer: 'Full refunds are available for cancellations made more than 48 hours in advance. Cancellations within 48 hours are subject to a 50% fee.',
    category: 'Policies',
  },
];

export default function KnowledgeBase() {
  const [entries, setEntries] = useState(mockEntries);
  const [selectedEntry, setSelectedEntry] = useState<KBEntry | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: '',
  });

  const filteredEntries = entries.filter(
    (entry) =>
      entry.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateNew = () => {
    setSelectedEntry(null);
    setIsEditing(true);
    setFormData({ question: '', answer: '', category: '' });
  };

  const handleEdit = (entry: KBEntry) => {
    setSelectedEntry(entry);
    setIsEditing(true);
    setFormData({
      question: entry.question,
      answer: entry.answer,
      category: entry.category,
    });
  };

  const handleSave = () => {
    // TODO: Save via API
    setIsEditing(false);
    setSelectedEntry(null);
    setFormData({ question: '', answer: '', category: '' });
  };

  const handleDelete = (id: string) => {
    // TODO: Delete via API
    setEntries(entries.filter((e) => e.id !== id));
    if (selectedEntry?.id === id) {
      setSelectedEntry(null);
      setIsEditing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Knowledge Base</h1>
          <p className="text-muted-foreground">
            Manage FAQs and information for AI responses
          </p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          New Entry
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Entries List */}
        <Card className="lg:col-span-1 shadow-soft">
          <CardContent className="p-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <ScrollArea className="h-[600px]">
              <div className="space-y-2">
                {filteredEntries.map((entry) => (
                  <div
                    key={entry.id}
                    onClick={() => {
                      setSelectedEntry(entry);
                      setIsEditing(false);
                    }}
                    className={cn(
                      'cursor-pointer rounded-lg border border-border p-3 transition-colors hover:bg-accent',
                      selectedEntry?.id === entry.id && 'bg-accent'
                    )}
                  >
                    <div className="mb-1 flex items-start justify-between">
                      <span className="text-xs font-medium text-primary">
                        {entry.category}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-foreground line-clamp-2">
                      {entry.question}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Entry Details/Editor */}
        <Card className="lg:col-span-2 shadow-soft">
          <CardHeader>
            <CardTitle>
              {isEditing
                ? selectedEntry
                  ? 'Edit Entry'
                  : 'New Entry'
                : 'Entry Details'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!selectedEntry && !isEditing ? (
              <div className="flex h-[500px] items-center justify-center text-muted-foreground">
                Select an entry or create a new one
              </div>
            ) : isEditing ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    placeholder="e.g., General, Bookings, Policies"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="question">Question</Label>
                  <Input
                    id="question"
                    value={formData.question}
                    onChange={(e) =>
                      setFormData({ ...formData, question: e.target.value })
                    }
                    placeholder="Enter the question"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="answer">Answer</Label>
                  <Textarea
                    id="answer"
                    value={formData.answer}
                    onChange={(e) =>
                      setFormData({ ...formData, answer: e.target.value })
                    }
                    placeholder="Enter the answer"
                    rows={10}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSave}>Save</Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({ question: '', answer: '', category: '' });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              selectedEntry && (
                <>
                  <div className="space-y-4">
                    <div>
                      <span className="text-xs font-medium text-primary">
                        {selectedEntry.category}
                      </span>
                      <h3 className="mt-2 text-xl font-semibold text-foreground">
                        {selectedEntry.question}
                      </h3>
                    </div>
                    <div>
                      <Label>Answer</Label>
                      <p className="mt-2 text-muted-foreground">
                        {selectedEntry.answer}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleEdit(selectedEntry)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(selectedEntry.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </>
              )
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
