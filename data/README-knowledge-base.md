# README for Chatbot Knowledge Base

## How to Update the Chatbot Knowledge Base

The chatbot knowledge base is stored in: `/data/chatbot-knowledge-base.md`

### To Update Responses:

1. **Edit the file directly**: Open `/data/chatbot-knowledge-base.md` in your editor
2. **Modify the content**: Update any section you want to change
3. **Restart the development server**: The changes will be loaded on the next API call

### Structure of Knowledge Base:

Each section is designed to handle specific types of user questions:

- **App Overview**: For "explain the app" type questions
- **Patent Services Pricing**: For pricing-related questions  
- **Payment Process**: For payment instructions
- **Order Management**: For viewing orders
- **Invoice and Printing**: For printing/downloading orders

### Adding New Responses:

1. Add a new section with clear heading
2. Include example user questions the section should handle
3. Provide the exact response you want the bot to give
4. Update the system prompt in `/app/api/chat/route.ts` if needed

### Testing Changes:

1. Save your changes to the knowledge base file
2. Ask the chatbot a test question
3. The bot will use the updated knowledge base automatically

### Common User Questions to Handle:

1. "Please explain the app" → App Overview section
2. "Give me prices for patent services" → Patent Services Pricing section  
3. "How do I make a payment" → Payment Process section
4. "Where to see my orders" → Order Management section
5. "How to print my orders" → Invoice and Printing section

The knowledge base is loaded fresh on each API call, so changes take effect immediately without needing to rebuild the application.