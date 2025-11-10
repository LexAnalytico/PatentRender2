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
            <p><strong>Knowledge Base Management Guide:</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Content Structure:</strong> Use clear section headers with ## for different question categories</li>
              <li><strong>User Commands:</strong> Include trigger phrases like "Response to 'keyword'" for chatbot recognition</li>
              <li><strong>Interactive Elements:</strong> Reference keyboard shortcuts (Alt+T, Alt+O, Alt+P) and tour features</li>
              <li><strong>Professional Tone:</strong> Maintain legal industry standards with technical accuracy</li>
              <li><strong>Quick Actions:</strong> Include command triggers like "services", "pricing", "guide", "tour"</li>
              <li><strong>Troubleshooting:</strong> Provide step-by-step solutions with specific browser requirements</li>
              <li><strong>Testing:</strong> After saving, test changes by asking the chatbot various questions</li>
              <li><strong>Markdown Support:</strong> Use formatting for emphasis, lists, and code blocks</li>
            </ul>
            
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p><strong>💡 Content Integration Tips:</strong></p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li><strong>Welcome Message:</strong> First section defines initial user greeting and available commands</li>
                <li><strong>Quick Commands:</strong> Users can type "tour", "help", "services", "pricing" for specific responses</li>
                <li><strong>Keyboard Shortcuts:</strong> Alt+T (tour), Alt+O (orders), Alt+P (profile), Alt+H (help)</li>
                <li><strong>Context Awareness:</strong> Chatbot understands user intent and provides relevant section responses</li>
                <li><strong>Professional Standards:</strong> Content reflects legal industry expertise and confidentiality requirements</li>
              </ul>
            </div>
            
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p><strong>🎯 User Interaction Context:</strong></p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li><strong>Platform Integration:</strong> Knowledge base connects with tour system and navigation shortcuts</li>
                <li><strong>Technical Support:</strong> Comprehensive troubleshooting covers browser compatibility and common issues</li>
                <li><strong>Service Guidance:</strong> Professional IP service explanations with pricing and process details</li>
                <li><strong>Emergency Support:</strong> Priority channels for urgent legal deadline situations</li>
                <li><strong>Confidentiality:</strong> Attorney-client privilege protection and security protocols explained</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}