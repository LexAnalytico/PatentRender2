import { readFileSync } from 'fs';
import { join } from 'path';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Function to detect the current menu context from assistant message
function detectMenuContext(assistantMessage: string): string | null {
  const message = assistantMessage.toLowerCase();
  
  if (message.includes('core services overview') || message.includes('select a subtopic')) {
    return 'services';
  }
  if (message.includes('platform navigation') || message.includes('what you need help with')) {
    return 'navigation';
  }
  if (message.includes('technical support') || message.includes('troubleshooting')) {
    return 'support';
  }
  if (message.includes('client feedback') || message.includes('feedback type')) {
    return 'feedback';
  }
  if (message.includes('emergency support')) {
    return 'emergency';
  }
  
  return null;
}

// Enhanced menu-driven pattern matching using knowledge base content
function getResponseFromKnowledgeBase(userMessage: string, knowledgeBase: string, conversationHistory: any[] = []): string {
  const message = userMessage.toLowerCase().trim();
  
  // Determine current context from the last assistant message
  const lastAssistantMessage = conversationHistory
    .slice()
    .reverse()
    .find(msg => msg.role === 'assistant');
  
  const currentContext = lastAssistantMessage ? detectMenuContext(lastAssistantMessage.content) : null;
  
  // Context-aware number responses
  if (/^[1-5]$/.test(message)) {
    if (currentContext === 'services') {
      const serviceMap: { [key: string]: string } = {
        '1': 'Patent Research & Analysis - Response to',
        '2': 'Patent Drafting & Filing - Response to',
        '3': 'IP Portfolio Management - Response to',
        '4': 'Legal Documentation - Response to',
        '5': 'Technical Consulting - Response to'
      };
      return extractKnowledgeBaseSection(knowledgeBase, serviceMap[message]) || getDefaultResearchInfo();
    }
    
    if (currentContext === 'navigation') {
      const navigationMap: { [key: string]: string } = {
        '1': 'Orders & Tracking - Response to',
        '2': 'Service Catalog - Response to',
        '3': 'Document Library - Response to',
        '4': 'Account Management - Response to',
        '5': 'Communication Center - Response to'
      };
      return extractKnowledgeBaseSection(knowledgeBase, navigationMap[message]) || getDefaultOrderInfo();
    }
    
    if (currentContext === 'support') {
      const supportMap: { [key: string]: string } = {
        '1': 'Authentication Issues - Response to',
        '2': 'Performance Problems - Response to',
        '3': 'Payment & Billing - Response to',
        '4': 'Browser Compatibility - Response to',
        '5': 'Advanced Troubleshooting - Response to'
      };
      return extractKnowledgeBaseSection(knowledgeBase, supportMap[message]) || getDefaultAuthSupport();
    }
    
    if (currentContext === 'feedback') {
      const feedbackMap: { [key: string]: string } = {
        '1': 'Service Quality - Response to',
        '2': 'Platform Enhancement - Response to'
      };
      return extractKnowledgeBaseSection(knowledgeBase, feedbackMap[message]) || getDefaultQualityFeedback();
    }
    
    // If no context (main menu), handle main menu numbers
    if (!currentContext) {
      const mainMenuMap: { [key: string]: string } = {
        '1': 'Core Services Overview - Response to',
        '2': 'Platform Navigation - Response to',
        '3': 'Technical Support - Response to',
        '4': 'Client Feedback - Response to',
        '5': 'Emergency Support - Response to'
      };
      return extractKnowledgeBaseSection(knowledgeBase, mainMenuMap[message]) || getDefaultWelcomeMessage();
    }
  }
  
  // Home/Main menu commands
  if (message === 'home' || message === 'menu' || message === 'main') {
    return extractKnowledgeBaseSection(knowledgeBase, 'Welcome Message & Main Menu') || 
           getDefaultWelcomeMessage();
  }
  
  // Word-based main menu selections (keeping for compatibility)
  if (message.includes('core services') || message === 'services') {
    return extractKnowledgeBaseSection(knowledgeBase, 'Core Services Overview - Response to') || 
           getDefaultServicesMenu();
  }
  
  if (message.includes('platform navigation') || message === 'navigation') {
    return extractKnowledgeBaseSection(knowledgeBase, 'Platform Navigation - Response to') || 
           getDefaultNavigationMenu();
  }
  
  if (message.includes('technical support') || message === 'support' || message === 'help') {
    return extractKnowledgeBaseSection(knowledgeBase, 'Technical Support - Response to') || 
           getDefaultSupportMenu();
  }
  
  if (message.includes('client feedback') || message === 'feedback') {
    return extractKnowledgeBaseSection(knowledgeBase, 'Client Feedback - Response to') || 
           getDefaultFeedbackMenu();
  }
  
  if (message.includes('emergency') || message === 'emergency') {
    return extractKnowledgeBaseSection(knowledgeBase, 'Emergency Support - Response to') || 
           getDefaultEmergencySupport();
  }
  
  // Services submenu
  if (message.includes('research') || (message === '1' && knowledgeBase.includes('Patent Research'))) {
    return extractKnowledgeBaseSection(knowledgeBase, 'Patent Research & Analysis - Response to') || 
           getDefaultResearchInfo();
  }
  
  if (message.includes('drafting') || (message === '2' && knowledgeBase.includes('Patent Drafting'))) {
    return extractKnowledgeBaseSection(knowledgeBase, 'Patent Drafting & Filing - Response to') || 
           getDefaultDraftingInfo();
  }
  
  if (message.includes('portfolio') || (message === '3' && knowledgeBase.includes('Portfolio Management'))) {
    return extractKnowledgeBaseSection(knowledgeBase, 'IP Portfolio Management - Response to') || 
           getDefaultPortfolioInfo();
  }
  
  if (message.includes('legal') || (message === '4' && knowledgeBase.includes('Legal Documentation'))) {
    return extractKnowledgeBaseSection(knowledgeBase, 'Legal Documentation - Response to') || 
           getDefaultLegalInfo();
  }
  
  if (message.includes('consulting') || (message === '5' && knowledgeBase.includes('Technical Consulting'))) {
    return extractKnowledgeBaseSection(knowledgeBase, 'Technical Consulting - Response to') || 
           getDefaultConsultingInfo();
  }
  
  // Navigation submenu
  if (message.includes('orders') || (message === '1' && knowledgeBase.includes('Orders & Tracking'))) {
    return extractKnowledgeBaseSection(knowledgeBase, 'Orders & Tracking - Response to') || 
           getDefaultOrderInfo();
  }
  
  if (message.includes('catalog') || (message === '2' && knowledgeBase.includes('Service Catalog'))) {
    return extractKnowledgeBaseSection(knowledgeBase, 'Service Catalog - Response to') || 
           getDefaultCatalogInfo();
  }
  
  if (message.includes('library') || (message === '3' && knowledgeBase.includes('Document Library'))) {
    return extractKnowledgeBaseSection(knowledgeBase, 'Document Library - Response to') || 
           getDefaultLibraryInfo();
  }
  
  if (message.includes('account') || (message === '4' && knowledgeBase.includes('Account Management'))) {
    return extractKnowledgeBaseSection(knowledgeBase, 'Account Management - Response to') || 
           getDefaultAccountInfo();
  }
  
  if (message.includes('communication') || (message === '5' && knowledgeBase.includes('Communication Center'))) {
    return extractKnowledgeBaseSection(knowledgeBase, 'Communication Center - Response to') || 
           getDefaultCommunicationInfo();
  }
  
  // Support submenu
  if (message.includes('auth') || (message === '1' && knowledgeBase.includes('Authentication Issues'))) {
    return extractKnowledgeBaseSection(knowledgeBase, 'Authentication Issues - Response to') || 
           getDefaultAuthSupport();
  }
  
  if (message.includes('performance') || (message === '2' && knowledgeBase.includes('Performance Problems'))) {
    return extractKnowledgeBaseSection(knowledgeBase, 'Performance Problems - Response to') || 
           getDefaultPerformanceSupport();
  }
  
  if (message.includes('billing') || (message === '3' && knowledgeBase.includes('Payment & Billing'))) {
    return extractKnowledgeBaseSection(knowledgeBase, 'Payment & Billing - Response to') || 
           getDefaultBillingSupport();
  }
  
  if (message.includes('browser') || (message === '4' && knowledgeBase.includes('Browser Compatibility'))) {
    return extractKnowledgeBaseSection(knowledgeBase, 'Browser Compatibility - Response to') || 
           getDefaultBrowserSupport();
  }
  
  if (message.includes('advanced') || (message === '5' && knowledgeBase.includes('Advanced Troubleshooting'))) {
    return extractKnowledgeBaseSection(knowledgeBase, 'Advanced Troubleshooting - Response to') || 
           getDefaultAdvancedSupport();
  }
  
  // Feedback submenu
  if (message.includes('quality') || (message === '1' && knowledgeBase.includes('Service Quality'))) {
    return extractKnowledgeBaseSection(knowledgeBase, 'Service Quality - Response to') || 
           getDefaultQualityFeedback();
  }
  
  if (message.includes('platform') || (message === '2' && knowledgeBase.includes('Platform Enhancement'))) {
    return extractKnowledgeBaseSection(knowledgeBase, 'Platform Enhancement - Response to') || 
           getDefaultPlatformFeedback();
  }
  
  // Special commands
  if (message.includes('pricing') || message.includes('price') || message.includes('cost')) {
    return extractKnowledgeBaseSection(knowledgeBase, 'Pricing Information - Response to') || 
           getDefaultPricingInfo();
  }
  
  if (message.includes('invoice') || message.includes('download') || message.includes('pdf')) {
    return extractKnowledgeBaseSection(knowledgeBase, 'Invoice Help - Response to') || 
           getDefaultInvoiceInfo();
  }
  
  // App explanation questions
  if (message.includes('explain the app') || message.includes('what is this app') || 
      message.includes('what does this do') || message.includes('about the app') ||
      message.includes('what is patentrender')) {
    return getAppOverview();
  }
  
  // Default welcome message
  return extractKnowledgeBaseSection(knowledgeBase, 'Welcome Message & Main Menu') || 
         getDefaultWelcomeMessage();
}

// Function to extract specific sections from the knowledge base
function extractKnowledgeBaseSection(knowledgeBase: string, sectionTitle: string): string | null {
  if (!knowledgeBase) return null;
  
  const sections = knowledgeBase.split('##');
  const targetSection = sections.find(section => {
    const sectionHeader = section.trim().split('\n')[0].toLowerCase();
    return sectionHeader.includes(sectionTitle.toLowerCase());
  });
  
  if (targetSection) {
    // Clean up the section content - remove header and everything after '---'
    const lines = targetSection.trim().split('\n');
    lines.shift(); // Remove the header line
    
    const contentLines = [];
    for (const line of lines) {
      if (line.trim() === '---') break;
      contentLines.push(line);
    }
    
    const content = contentLines.join('\n').trim();
    return content || null;
  }
  
  return null;
}

// Fallback functions for when knowledge base is not available
function getDefaultWelcomeMessage(): string {
  return `Welcome to PatentRender2! 👋  
I'm here to help with our IP services.

Please select a category 👇
1️⃣ **Core Services Overview**  
2️⃣ **Platform Navigation**  
3️⃣ **Technical Support**  
4️⃣ **Client Feedback**  
5️⃣ **Emergency Support**

*Type a number or category name*`;
}

function getDefaultServicesMenu(): string {
  return `🧭 **Core Services Overview**  
Select a subtopic:

1. **Patent Research & Analysis**  
2. **Patent Drafting & Filing**  
3. **IP Portfolio Management**  
4. **Legal Documentation**  
5. **Technical Consulting**

*Type the number or service name*  
🏠 Type "home" to return to main menu`;
}

function getDefaultNavigationMenu(): string {
  return `🧭 **Platform Navigation**  
Select what you need help with:

1. **Orders & Tracking**  
2. **Service Catalog**  
3. **Document Library**  
4. **Account Management**  
5. **Communication Center**

*Type the number or section name*  
🏠 Type "home" to return to main menu`;
}

function getDefaultSupportMenu(): string {
  return `🔧 **Technical Support & Troubleshooting**  
Select your issue type:

1. **Authentication Issues**  
2. **Performance Problems**  
3. **Payment & Billing**  
4. **Browser Compatibility**  
5. **Advanced Troubleshooting**

*Type the number or issue type*  
🏠 Type "home" to return to main menu`;
}

function getDefaultFeedbackMenu(): string {
  return `💬 **Client Feedback & Service Enhancement**  
Select feedback type:

1. **Service Quality**  
2. **Platform Enhancement**  
3. **Technical Issues**  
4. **Feature Requests**

*Type the number or feedback type*  
🏠 Type "home" to return to main menu`;
}

function getDefaultEmergencySupport(): string {
  return `🚨 **Emergency Support**  
Urgent assistance for time-critical matters.

⏰ **Legal deadlines:** Priority support for urgent cases  
🔴 **Priority button:** Red support icon for immediate help  
📞 **Direct contact:** Expedited communication channels  
⚡ **Response time:** Within 1 hour for emergencies  

**Access:** Look for red priority support button  
🏠 Type "home" for main menu`;
}

function getDefaultResearchInfo(): string {
  return `🔍 **Patent Research & Analysis**  
Professional prior art searches and patentability assessments.

✅ **Ideal for:** Inventors, R&D teams, legal counsel  
⏱ **Typical delivery:** 3-5 business days  
📊 **Includes:** Comprehensive reports with expert opinions  
💵 **View pricing** → type "pricing"

**Next ➡️** Type "drafting" for Patent Drafting  
🏠 Type "home" for main menu`;
}

function getDefaultDraftingInfo(): string {
  return `📄 **Patent Drafting & Filing**  
Professional preparation of patent applications with claims and drawings.

✅ **Ideal for:** Inventors, corporations, research teams  
⏱ **Typical delivery:** 7-10 business days  
📋 **Includes:** Complete specifications, claims, prosecution  
💵 **View pricing** → type "pricing"

**Next ➡️** Type "portfolio" for Portfolio Management  
🏠 Type "home" for main menu`;
}

function getDefaultPortfolioInfo(): string {
  return `📁 **IP Portfolio Management**  
Strategic patent portfolio development and maintenance.

✅ **Ideal for:** Corporations, startups, IP-heavy businesses  
⏱ **Typical delivery:** Ongoing management  
🎯 **Includes:** Strategy, renewals, licensing optimization  
💵 **View pricing** → type "pricing"

**Next ➡️** Type "legal" for Legal Documentation  
🏠 Type "home" for main menu`;
}

function getDefaultLegalInfo(): string {
  return `⚖️ **Legal Documentation**  
Contract drafting, licensing agreements, IP transactions.

✅ **Ideal for:** Businesses, licensing deals, IP transfers  
⏱ **Typical delivery:** 5-7 business days  
📝 **Includes:** Contracts, agreements, transaction support  
💵 **View pricing** → type "pricing"

**Next ➡️** Type "consulting" for Technical Consulting  
🏠 Type "home" for main menu`;
}

function getDefaultConsultingInfo(): string {
  return `💡 **Technical Consulting**  
Expert analysis for complex intellectual property matters.

✅ **Ideal for:** Complex IP issues, litigation support  
⏱ **Typical delivery:** 3-5 business days  
🔬 **Includes:** Expert analysis, technical reports  
💵 **View pricing** → type "pricing"

🔙 **Back** → Type "services"  
🏠 Type "home" for main menu`;
}

function getDefaultCatalogInfo(): string {
  return `📚 **Service Catalog**  
Browse available IP services with pricing.

🛍️ **How to browse:** Service selection page  
💰 **View pricing:** Transparent fee structures  
⚡ **Turnaround options:** Standard/Expedited/Rush  
🛒 **Add to cart:** Multiple services before checkout  

📋 **Place orders** → type "orders"  
🏠 Type "home" for main menu`;
}

function getDefaultLibraryInfo(): string {
  return `📁 **Document Library**  
Access your completed IP documentation.

🔐 **Secure access:** Encrypted downloads  
📝 **Version control:** Track document revisions  
🗂️ **Organized filing:** By project and document type  
📄 **Professional formats:** Industry-standard deliverables  

📋 **View orders** → type "orders"  
🏠 Type "home" for main menu`;
}

function getDefaultAccountInfo(): string {
  return `👤 **Account Management**  
Manage your profile and preferences.

⚙️ **Profile settings:** Update personal information  
🔒 **Security:** Password and authentication  
💳 **Billing:** Payment methods and history  
📧 **Notifications:** Email and communication preferences  

💬 **Submit feedback** → type "feedback"  
🏠 Type "home" for main menu`;
}

function getDefaultCommunicationInfo(): string {
  return `💬 **Communication Center**  
Connect with your legal teams.

👨‍💼 **Direct messaging:** Assigned attorneys and experts  
📎 **File sharing:** Secure document exchange  
📅 **Meetings:** Schedule consultation calls  
🚨 **Priority support:** Urgent matter assistance  

📋 **Check orders** → type "orders"  
🏠 Type "home" for main menu`;
}

function getDefaultAuthSupport(): string {
  return `🔐 **Authentication Issues**  
Login and account access problems.

🔄 **Quick fix:** Hard refresh (Ctrl+F5)  
🌐 **Network:** Check internet connection  
🍪 **Cookies:** Enable cookies for our site  
👤 **Username missing:** Try incognito mode  

**Next ➡️** Type "performance" for performance issues  
🏠 Type "home" for main menu`;
}

function getDefaultPerformanceSupport(): string {
  return `⚡ **Performance Problems**  
Slow loading and platform issues.

🗂️ **Close tabs:** Reduce browser memory usage  
🚫 **Ad blockers:** Disable for our domain  
🔄 **Refresh:** Manual refresh button (blue, below chat)  
📱 **Mobile:** Rotate device, use Chrome/Safari  

**Next ➡️** Type "billing" for payment issues  
🏠 Type "home" for main menu`;
}

function getDefaultBillingSupport(): string {
  return `💳 **Payment & Billing**  
Payment gateway and invoice issues.

🚫 **Popup blockers:** Disable for payment pages  
🍪 **Third-party cookies:** Enable for payment gateway  
📄 **PDF issues:** Enable PDF viewer  
💰 **Billing questions:** Contact support with screenshots  

**Next ➡️** Type "browser" for compatibility issues  
🏠 Type "home" for main menu`;
}

function getDefaultBrowserSupport(): string {
  return `🌐 **Browser Compatibility**  
Supported browsers and settings.

✅ **Recommended:** Chrome 100+, Firefox 98+, Safari 14+  
⚙️ **Enable:** JavaScript, cookies, popups for our domain  
🛡️ **Security:** Whitelist our domain in antivirus  
🔄 **Update:** Use latest browser version  

**Next ➡️** Type "advanced" for advanced help  
🏠 Type "home" for main menu`;
}

function getDefaultAdvancedSupport(): string {
  return `🔧 **Advanced Troubleshooting**  
Complex technical issues.

🗑️ **Clear data:** All browsing data (Ctrl+Shift+Delete)  
🌐 **Network test:** Try different network/mobile hotspot  
📱 **Device test:** Try different device  
📸 **Screenshots:** Send error images to support  

🔙 **Back** → Type "support"  
🏠 Type "home" for main menu`;
}

function getDefaultQualityFeedback(): string {
  return `⭐ **Service Quality Feedback**  
Rate our attorneys and service delivery.

👨‍💼 **Attorney performance:** Communication and expertise  
📅 **Timeline feedback:** Delivery schedules  
🎯 **Technical accuracy:** Analysis quality  
😊 **Overall experience:** Service satisfaction  

**Submit:** Profile → Client Feedback section  
🏠 Type "home" for main menu`;
}

function getDefaultPlatformFeedback(): string {
  return `🎨 **Platform Enhancement Suggestions**  
Help us improve the user experience.

🖥️ **User interface:** Navigation improvements  
🔧 **New features:** Missing functionality  
🔗 **Integrations:** Third-party tool connections  
📱 **Mobile:** App and mobile-specific features  

**Submit:** Profile → Client Feedback section  
🏠 Type "home" for main menu`;
}

function getAppOverview(): string {
  return `🏢 **PatentRender2 Platform**  
Premium intellectual property services.

📋 **Core Services:**  
• Patent Research & Analysis  
• Patent Drafting & Filing  
• IP Portfolio Management  
• Legal Documentation  
• Technical Consulting  

🔧 **Platform Features:**  
• Attorney-managed projects  
• Secure client portal  
• Real-time tracking  
• Professional invoicing  

🧭 **Explore services** → type "services"  
🏠 Type "home" for main menu`;
}

function getDefaultAppOverview(): string {
  return getAppOverview();
}

function getDefaultPricingInfo(): string {
  return `💵 **Pricing Information**  
Transparent fee structures for all services.

📊 **Factors affecting price:**  
• Service complexity  
• Turnaround speed (Standard/Expedited/Rush)  
• Industry specialization  
• Document volume  

💰 **Get quote:** Use platform quote system  
📞 **Custom pricing:** Contact for enterprise rates  

🧭 **View services** → type "services"  
🏠 Type "home" for main menu`;
}

function getDefaultOrderInfo(): string {
  return `📋 **Orders & Tracking**  
View and manage your IP service orders.

🔍 **How to access:** Dashboard → Orders  
📊 **Track progress:** Real-time status updates  
📁 **View documents:** Download completed work  
💬 **Communicate:** Message your assigned team  

💵 **Download invoices** → type "invoices"  
🏠 Type "home" for main menu`;
}

function getDefaultInvoiceInfo(): string {
  return `📄 **Invoice & Download Help**  
Access your professional invoices.

📋 **Steps:**  
1. Go to Dashboard → Orders  
2. Find your order  
3. Click "Download Invoice" → "PDF+Form"  

📝 **Includes:** Itemized services, payment details, professional formatting  
� Type "home" for main menu`;
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

    // Get response based on user message with conversation context
    const response = getResponseFromKnowledgeBase(lastMessage.content, knowledgeBase, messages);

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