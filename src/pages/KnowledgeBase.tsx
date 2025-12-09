import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Edit, Trash2, Search, Loader2, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { knowledgeBaseApi, KBEntry } from '@/api/knowledgeBase';
import { useToast } from '@/components/ui/use-toast';
import { PageHeader } from '@/components/PageHeader';

export default function KnowledgeBase() {
  const [entries, setEntries] = useState<KBEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<KBEntry | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: '',
  });
  const { toast } = useToast();

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const data = await knowledgeBaseApi.getAll({ search: searchTerm });
      setEntries(data.items);
    } catch (error) {
      console.error('Failed to fetch entries', error);
      toast({
        title: 'Error',
        description: 'Failed to load knowledge base entries',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchEntries();
    }, 500);
    return () => clearTimeout(debounce);
  }, [searchTerm]);

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

  const handleSave = async () => {
    if (!formData.question || !formData.answer) {
      toast({
        title: 'Validation Error',
        description: 'Question and Answer are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (selectedEntry) {
        await knowledgeBaseApi.update(selectedEntry.id, formData);
        toast({ title: 'Success', description: 'Entry updated successfully' });
      } else {
        await knowledgeBaseApi.create(formData);
        toast({ title: 'Success', description: 'Entry created successfully' });
      }
      setIsEditing(false);
      setSelectedEntry(null);
      setFormData({ question: '', answer: '', category: '' });
      fetchEntries();
    } catch (error) {
      console.error('Failed to save entry', error);
      toast({
        title: 'Error',
        description: 'Failed to save entry',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    try {
      await knowledgeBaseApi.delete(id);
      toast({ title: 'Success', description: 'Entry deleted successfully' });
      if (selectedEntry?.id === id) {
        setSelectedEntry(null);
        setIsEditing(false);
      }
      fetchEntries();
    } catch (error) {
      console.error('Failed to delete entry', error);
      toast({
        title: 'Error',
        description: 'Failed to delete entry',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader
        title="Knowledge Base"
        description="Manage FAQs and information for AI responses"
        actions={
          <Button onClick={handleCreateNew} className="shadow-md hover:shadow-lg transition-all">
            <Plus className="mr-2 h-4 w-4" />
            New Entry
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Entries List */}
        <Card className="lg:col-span-1 border-border/50 shadow-lg">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Entries
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 border-border/50"
              />
            </div>
            <ScrollArea className="h-[600px]">
              {loading ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : entries.length === 0 ? (
                <div className="text-center p-4 text-muted-foreground text-sm">
                  No entries found.
                </div>
              ) : (
                <div className="space-y-2">
                  {entries.map((entry) => (
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
              )}
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
                      <p className="mt-2 text-muted-foreground whitespace-pre-wrap">
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
