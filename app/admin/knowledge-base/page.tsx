'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Save, RefreshCw, FileText } from 'lucide-react';

export default function KnowledgeBaseAdmin() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadKnowledgeBase();
  }, []);

  const loadKnowledgeBase = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/knowledge-base');
      const data = await response.json();
      
      if (data.success) {
        setContent(data.content);
        setMessage({ type: 'success', text: 'Knowledge base loaded successfully' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to load knowledge base' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load knowledge base' });
    } finally {
      setLoading(false);
    }
  };

  const saveKnowledgeBase = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/knowledge-base', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: 'Knowledge base updated successfully! Changes will take effect immediately.' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update knowledge base' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update knowledge base' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Chatbot Knowledge Base Editor
          </CardTitle>
          <p className="text-sm text-gray-600">
            Edit the chatbot knowledge base. Changes take effect immediately without requiring a server restart.
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {message && (
            <Alert className={message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
              <AlertDescription className={message.type === 'error' ? 'text-red-800' : 'text-green-800'}>
                {message.text}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex gap-2 mb-4">
            <Button 
              onClick={loadKnowledgeBase} 
              disabled={loading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Loading...' : 'Reload'}
            </Button>
            
            <Button 
              onClick={saveKnowledgeBase} 
              disabled={saving || !content.trim()}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
          
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Loading knowledge base content..."
            className="min-h-[600px] font-mono text-sm"
            disabled={loading}
          />
          
          <div className="text-sm text-gray-500 space-y-2">
            <p><strong>Usage Tips:</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Use clear section headers for different types of questions</li>
              <li>Include example user questions in each section</li>
              <li>Provide exact responses you want the chatbot to give</li>
              <li>Test changes by asking the chatbot questions after saving</li>
              <li>The knowledge base supports Markdown formatting</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}