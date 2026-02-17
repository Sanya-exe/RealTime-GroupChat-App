import { HfInference } from '@huggingface/inference';


const HF_TOKEN = 'process.env.HF_TOKEN';

console.log('=== Hugging Face API Configuration ===');
console.log('✅ Using Hugging Face API');
console.log('Token length:', HF_TOKEN.length);
console.log('======================================');

const hf = new HfInference(HF_TOKEN);

export async function summarizeMessages(messages) {
  try {
    console.log('Requesting Hugging Face AI summary...');
    console.log('Number of messages:', messages.length);

    // Format messages for AI
    const messageText = messages
      .map(m => `${m.sender}: ${m.text}`)
      .join('\n');

    console.log('Sending request to Hugging Face...');

     // Use a better prompt for the AI
    const conversationContext = `Below is a conversation between people in a group chat. Please write a clear, concise summary in 2-3 sentences that captures the main points, topics discussed, and any decisions or action items. Write in plain English.
    
    conversation: ${messageText}

   Summary:`;

    try {
      // Try summarization first
      const response = await hf.summarization({
        model: 'facebook/bart-large-cnn',
        inputs: conversationContext,
        parameters: {
          max_length: 130,
          min_length: 30,
          do_sample: false,
        }
      });

      let summary = response.summary_text;

      // Clean up the summary
      summary = summary
        .replace(/\s+/g, ' ')  // Remove extra spaces
        .replace(/([.!?])\s*([A-Z])/g, '$1 $2')  // Fix punctuation spacing
        .trim();

      console.log('✅ Summary generated successfully');
      console.log('Summary:', summary);
      
      return summary;
    } catch (apiError) {
      console.log('API summarization failed, using custom summary...');
      
      // Custom fallback with better logic
      return generateCustomSummary(messages);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return generateCustomSummary(messages);
  }
}

// Custom summary generator
function generateCustomSummary(messages) {
  const messageCount = messages.length;
  const users = [...new Set(messages.map(m => m.sender))];
  
  // Get all message texts
  const allTexts = messages.map(m => m.text.toLowerCase()).join(' ');
  
  // Remove common words
  const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'who', 'when', 'where', 'why', 'how', 'hey', 'hi', 'hello'];
  
  const words = allTexts
    .replace(/[^\w\s]/g, '')  // Remove punctuation
    .split(/\s+/)
    .filter(w => w.length > 3 && !commonWords.includes(w));
  
  // Count word frequency
  const wordCount = {};
  words.forEach(w => {
    wordCount[w] = (wordCount[w] || 0) + 1;
  });
  
  // Get top 5 most frequent words
  const topWords = Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
  
  // Detect questions
  const questions = messages.filter(m => m.text.includes('?')).length;
  
  // Build summary
  let summary = '';
  
  if (users.length === 1) {
    summary = `${users[0]} sent ${messageCount} messages`;
  } else {
    summary = `Conversation between ${users.join(', ')} with ${messageCount} messages exchanged`;
  }
  
  if (topWords.length > 0) {
    summary += `. Main topics: ${topWords.join(', ')}`;
  }
  
  if (questions > 0) {
    summary += `. ${questions} question${questions > 1 ? 's' : ''} asked`;
  }
  
  summary += '.';
  
  console.log('✅ Custom summary generated:', summary);
  return summary;
}