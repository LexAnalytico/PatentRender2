import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

export async function GET() {
  try {
    const knowledgeBasePath = join(process.cwd(), 'data', 'chatbot-knowledge-base.md');
    const content = readFileSync(knowledgeBasePath, 'utf-8');
    
    return NextResponse.json({ 
      success: true, 
      content 
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to read knowledge base' 
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { content } = await req.json();
    
    if (!content) {
      return NextResponse.json({ 
        success: false, 
        error: 'Content is required' 
      }, { status: 400 });
    }

    const knowledgeBasePath = join(process.cwd(), 'data', 'chatbot-knowledge-base.md');
    writeFileSync(knowledgeBasePath, content, 'utf-8');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Knowledge base updated successfully' 
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update knowledge base' 
    }, { status: 500 });
  }
}