import { readFileSync } from 'fs';
import { join } from 'path';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Simple pattern matching for responses
function getResponseFromKnowledgeBase(userMessage: string, knowledgeBase: string): string {
  const message = userMessage.toLowerCase();
  
  // App explanation questions
  if (message.includes('explain the app') || message.includes('what is this app') || 
      message.includes('what does this do') || message.includes('about the app') ||
      message.includes('what is patentrender')) {
    return `PatentRender2 is a comprehensive Intellectual Property (IP) services platform that offers:

**Patent Services:**
- Patentability Search: Research to determine if an invention is patentable
- Patent Drafting: Professional writing of patent applications  
- Patent Application Filing: Submit applications to patent offices
- First Examination Response (FER): Handle initial patent office responses

**Trademark Services:**
- Trademark Registration: Register trademarks for brand protection
- Trademark Monitoring: Track potential trademark infringements

**Copyright Services:** 
- Copyright Registration: Register creative works for legal protection
- DMCA Services: Handle copyright takedown requests
- Copyright Licensing: Manage licensing agreements

**Design Services:**
- Design Registration: Register industrial designs
- Design Search: Research existing design registrations  
- Design Portfolio: Manage multiple design assets

**Key Features:**
- Dynamic pricing with Standard/Expedited/Rush turnaround options
- Supabase authentication and database
- Razorpay payment integration
- Order tracking and management
- Email notifications
- Admin panel for service management

Is there anything specific about our services you'd like to know more about?`;
  }
  
  // Pricing questions
  if (message.includes('price') || message.includes('cost') || message.includes('pricing') ||
      message.includes('patent services') && (message.includes('price') || message.includes('cost'))) {
    return `We offer patent services with the following options:

**Available Patent Services:**
1. **Patentability Search** - Research existing patents to determine if your invention is patentable
2. **Patent Drafting** - Professional patent application writing and preparation
3. **Patent Application Filing** - Submit your patent applications to patent offices
4. **First Examination Response (FER)** - Handle responses to patent office examination reports

**Please specify which service you need pricing for, and I'll provide detailed pricing information.**

**Turnaround Options Available:**
- **Standard**: Regular processing time
- **Expedited**: Faster processing with additional fees  
- **Rush**: Fastest processing with premium fees

**Pricing varies based on:**
- Service complexity
- Application type (Individual/Startup MSME/Others)
- Number of NICE classes
- Prior use considerations
- Selected turnaround time

For accurate pricing tailored to your specific needs, please use our quote system on the platform. Which specific service are you interested in?`;
  }
  
  // Payment questions
  if (message.includes('payment') || message.includes('pay') || message.includes('checkout')) {
    return `Here's how to make a payment on PatentRender2:

**Step-by-step payment process:**
1. **Login** to your PatentRender2 account
2. **Add service to cart** - Select your desired IP service and configure options
3. **Click "Go to Payments"** button in your cart
4. **Make payment** - You'll be redirected to our secure Razorpay payment gateway
5. **Choose payment method**: Credit/Debit Card, Digital Wallet, or Net Banking

**Payment Security:**
- All payments processed through secure Razorpay gateway
- Multiple payment options available (Card, Wallet, Net Banking)
- Instant payment confirmation via email
- Secure encryption for all transactions

Do you have any specific questions about the payment process?`;
  }
  
  // Order viewing questions
  if (message.includes('see my orders') || message.includes('view orders') || 
      message.includes('where orders') || message.includes('find my orders')) {
    return `To view your orders on PatentRender2:

**How to View Your Orders:**
1. Click on the **user profile icon** in the top navigation
2. Select **"Dashboard"** from the dropdown menu  
3. Click on the **"Orders"** button to see all your orders

**Order Information Available:**
- Order status and progress tracking
- Service details and specifications
- Payment information and receipts
- Delivery timeline and milestones
- Complete order history

Once you're in the Orders section, you can track the progress of all your IP services. Is there anything specific about your orders you need help with?`;
  }
  
  // Printing/downloading questions
  if (message.includes('print') || message.includes('download') || message.includes('invoice') ||
      message.includes('pdf')) {
    return `To print or download your orders and invoices:

**How to Print/Download Orders:**
1. Go to your **Dashboard → Orders** 
2. Find the order you want to print
3. In the **"Download Invoice"** column, click the **"PDF+Form"** button
4. This will generate and download a printable PDF invoice with all order details

**What's included in the PDF:**
- Complete invoice with itemized services
- Payment details and transaction ID
- Order timeline and delivery information
- Professional formatting for records

This gives you a professional document for your records and accounting purposes. Do you need help with anything else regarding your orders?`;
  }
  
  // Default helpful response
  return `Hello! I'm the PatentRender Assistant, here to help you with our IP services platform.

I can help you with:
- **Understanding our services** (patents, trademarks, copyrights, designs)
- **Pricing information** for our various IP services
- **Payment process** and how to complete orders
- **Order management** and tracking
- **Downloading invoices** and documents

What would you like to know about our intellectual property services?

Some common questions I can answer:
• "Please explain the app"
• "Give me prices for patent services"
• "How do I make a payment?"
• "Where can I see my orders?"
• "How do I print my invoice?"`;
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    // Get the last user message
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'user') {
      throw new Error('No user message found');
    }

    // Load knowledge base
    let knowledgeBase = '';
    try {
      const knowledgeBasePath = join(process.cwd(), 'data', 'chatbot-knowledge-base.md');
      knowledgeBase = readFileSync(knowledgeBasePath, 'utf-8');
    } catch (error) {
      console.error('Failed to load knowledge base:', error);
    }

    // Get response based on user message
    const response = getResponseFromKnowledgeBase(lastMessage.content, knowledgeBase);

    // Return as a simple text response (simulate streaming)
    return new Response(response, {
      headers: {
        'Content-Type': 'text/plain',
      },
    });
    
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response('Sorry, I encountered an error. Please try again.', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
}