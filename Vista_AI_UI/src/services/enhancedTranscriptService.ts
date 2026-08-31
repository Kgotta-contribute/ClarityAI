
// Enhanced mock transcript service using existing patterns

export interface TranscriptSegment {

  id: string;

  startTime: number;

  endTime: number;

  speaker: string;

  text: string;

  confidence?: number;

  sentiment?: 'positive' | 'negative' | 'neutral';

  keywords?: string[];

}

 

export interface AudioPlayerData {

  url: string;

  duration: number;

  title?: string;

  waveformData?: number[];

  metadata?: {

    bitrate?: number;

    sampleRate?: number;

    channels?: number;

  };

}

 

// Enhanced mock data with sentiment analysis and keywords

const generateEnhancedWaveformData = (duration: number, segments: TranscriptSegment[]): number[] => {

  const samples = Math.floor(duration * 50); // 50 samples per second for smooth visualization

  const waveform: number[] = [];

 

  for (let i = 0; i < samples; i++) {

    const time = (i / samples) * duration;

   

    // Find active segment for this time

    const activeSegment = segments.find(seg => time >= seg.startTime && time <= seg.endTime);

   

    // Base amplitude with realistic audio patterns

    let amplitude = Math.sin(time * Math.PI * 15) * Math.exp(-time * 0.5) *

                   (0.4 + 0.6 * Math.sin(time * Math.PI * 80)) *

                   (Math.random() * 0.4 + 0.6);

   

    // Adjust amplitude based on segment sentiment and speaker activity

    if (activeSegment) {

      switch (activeSegment.sentiment) {

        case 'positive':

          amplitude *= 1.2; // Higher energy for positive segments

          break;

        case 'negative':

          amplitude *= 0.8; // Lower energy for negative segments

          break;

        default:

          amplitude *= 1.0;

      }

     

      // Add speaker-specific patterns

      if (activeSegment.speaker === 'Agent') {

        amplitude *= 1.1; // Agents typically speak more clearly

      }

    } else {

      amplitude *= 0.3; // Silence between segments

    }

   

    waveform.push(Math.abs(amplitude));

  }

 

  return waveform;

};

 

// Enhanced transcript data with sentiment analysis and keywords

const enhancedTranscriptSegments: TranscriptSegment[] = [

  {

    id: '1',

    startTime: 0,

    endTime: 5.2,

    speaker: 'Agent',

    text: 'Good morning! Thank you for calling Elevance Health customer service. My name is Sarah, and I\'ll be delighted to assist you today. May I please have your member ID?',

    confidence: 0.96,

    sentiment: 'positive',

    keywords: ['greeting', 'customer service', 'member ID']

  },

  {

    id: '2',

    startTime: 5.5,

    endTime: 9.8,

    speaker: 'Customer',

    text: 'Hi Sarah, yes, my member ID is EH123456789. I\'m calling because I\'m really frustrated about my recent claim that was denied.',

    confidence: 0.89,

    sentiment: 'negative',

    keywords: ['member ID', 'frustrated', 'claim denied']

  },

  {

    id: '3',

    startTime: 10.0,

    endTime: 16.3,

    speaker: 'Agent',

    text: 'I completely understand your frustration, and I sincerely apologize for any inconvenience this has caused. Let me pull up your account right now and review that claim in detail to see how we can resolve this for you.',

    confidence: 0.97,

    sentiment: 'positive',

    keywords: ['understand', 'apologize', 'resolve', 'review claim']

  },

  {

    id: '4',

    startTime: 16.6,

    endTime: 22.1,

    speaker: 'Customer',

    text: 'Thank you, I appreciate that. It\'s for my visit to Dr. Johnson last Tuesday. The claim shows it was denied because it\'s out of network, but I specifically checked that he was in-network before my appointment.',

    confidence: 0.91,

    sentiment: 'neutral',

    keywords: ['Dr. Johnson', 'out of network', 'in-network', 'appointment']

  },

  {

    id: '5',

    startTime: 22.4,

    endTime: 29.7,

    speaker: 'Agent',

    text: 'I can absolutely see why that would be concerning. Let me check Dr. Johnson\'s current network status and also review when this information might have changed. I\'m seeing here that there was a recent update to our provider network.',

    confidence: 0.94,

    sentiment: 'neutral',

    keywords: ['network status', 'provider network', 'recent update']

  },

  {

    id: '6',

    startTime: 30.0,

    endTime: 35.8,

    speaker: 'Agent',

    text: 'I have some good news for you. Dr. Johnson was indeed in-network at the time of your visit. It appears this claim was processed incorrectly due to a system error during our recent network update.',

    confidence: 0.98,

    sentiment: 'positive',

    keywords: ['good news', 'in-network', 'system error', 'incorrectly processed']

  },

  {

    id: '7',

    startTime: 36.1,

    endTime: 40.5,

    speaker: 'Customer',

    text: 'Oh wow, that\'s such a relief! So you can fix this and reprocess the claim? What do I need to do on my end?',

    confidence: 0.93,

    sentiment: 'positive',

    keywords: ['relief', 'fix', 'reprocess', 'what to do']

  },

  {

    id: '8',

    startTime: 40.8,

    endTime: 48.2,

    speaker: 'Agent',

    text: 'Absolutely! I\'m going to reprocess this claim right now with the correct network information. You don\'t need to do anything on your end. The corrected claim should process within 24-48 hours, and you\'ll receive an updated explanation of benefits.',

    confidence: 0.96,

    sentiment: 'positive',

    keywords: ['reprocess', 'correct network', '24-48 hours', 'explanation of benefits']

  },

  {

    id: '9',

    startTime: 48.5,

    endTime: 53.1,

    speaker: 'Customer',

    text: 'That\'s fantastic, Sarah! You\'ve been incredibly helpful. Is there a reference number I can use to track this correction?',

    confidence: 0.95,

    sentiment: 'positive',

    keywords: ['fantastic', 'incredibly helpful', 'reference number', 'track correction']

  },

  {

    id: '10',

    startTime: 53.4,

    endTime: 59.6,

    speaker: 'Agent',

    text: 'Of course! Your reference number for this claim correction is CC2024-0892. I\'ve also added detailed notes to your account about this issue and resolution. Is there anything else I can help you with today?',

    confidence: 0.97,

    sentiment: 'positive',

    keywords: ['reference number', 'CC2024-0892', 'detailed notes', 'resolution']

  },

  {

    id: '11',

    startTime: 59.9,

    endTime: 63.4,

    speaker: 'Customer',

    text: 'No, that covers everything perfectly. Thank you so much for your excellent service and for resolving this so quickly!',

    confidence: 0.94,

    sentiment: 'positive',

    keywords: ['excellent service', 'resolved quickly', 'thank you']

  },

  {

    id: '12',

    startTime: 63.7,

    endTime: 68.5,

    speaker: 'Agent',

    text: 'You\'re very welcome! I\'m so glad I could help resolve this for you today. Thank you for choosing Elevance Health, and please don\'t hesitate to call if you need anything else. Have a wonderful day!',

    confidence: 0.98,

    sentiment: 'positive',

    keywords: ['very welcome', 'glad to help', 'Elevance Health', 'wonderful day']

  }

];

 

// Alternative enhanced transcript with different scenario

const enhancedTranscriptSegments2: TranscriptSegment[] = [

  {

    id: '1',

    startTime: 0,

    endTime: 4.1,

    speaker: 'Agent',

    text: 'Hello, this is Mike from Elevance Health technical support. I understand you\'re having some login issues with your online account?',

    confidence: 0.95,

    sentiment: 'neutral',

    keywords: ['technical support', 'login issues', 'online account']

  },

  {

    id: '2',

    startTime: 4.4,

    endTime: 9.2,

    speaker: 'Customer',

    text: 'Yes, I\'ve been trying to log in for the past hour and it keeps saying my password is wrong. I\'m absolutely certain I\'m using the correct password. This is really frustrating.',

    confidence: 0.87,

    sentiment: 'negative',

    keywords: ['password wrong', 'absolutely certain', 'really frustrating']

  },

  {

    id: '3',

    startTime: 9.5,

    endTime: 15.8,

    speaker: 'Agent',

    text: 'I\'m really sorry you\'re experiencing this frustration. Let me help you get this resolved quickly. Can you please provide me with the email address associated with your account so I can check what might be happening?',

    confidence: 0.93,

    sentiment: 'positive',

    keywords: ['really sorry', 'resolved quickly', 'email address', 'check']

  },

  {

    id: '4',

    startTime: 16.1,

    endTime: 19.7,

    speaker: 'Customer',

    text: 'Sure, it\'s john.smith@email.com. I\'ve been using this account for over two years without any problems.',

    confidence: 0.91,

    sentiment: 'neutral',

    keywords: ['john.smith@email.com', 'two years', 'no problems']

  },

  {

    id: '5',

    startTime: 20.0,

    endTime: 27.3,

    speaker: 'Agent',

    text: 'Thank you for that information. I can see your account, and I notice there\'s a security lockout in place. This happens automatically after several failed login attempts to protect your account from unauthorized access.',

    confidence: 0.96,

    sentiment: 'neutral',

    keywords: ['security lockout', 'failed login attempts', 'protect account', 'unauthorized access']

  },

  {

    id: '6',

    startTime: 27.6,

    endTime: 31.4,

    speaker: 'Customer',

    text: 'Oh, that makes sense. So how do we unlock it? And why didn\'t I get any notification about this?',

    confidence: 0.89,

    sentiment: 'neutral',

    keywords: ['makes sense', 'unlock', 'notification']

  },

  {

    id: '7',

    startTime: 31.7,

    endTime: 38.9,

    speaker: 'Agent',

    text: 'Great question! I can unlock your account right now. As for notifications, they should have been sent to your email. Let me also verify that we have the correct contact information on file for future notifications.',

    confidence: 0.94,

    sentiment: 'positive',

    keywords: ['unlock account', 'notifications', 'correct contact information']

  },

  {

    id: '8',

    startTime: 39.2,

    endTime: 42.8,

    speaker: 'Customer',

    text: 'That would be great. And yes, that email address is still current. I appreciate your help with this.',

    confidence: 0.92,

    sentiment: 'positive',

    keywords: ['email current', 'appreciate help']

  },

  {

    id: '9',

    startTime: 43.1,

    endTime: 48.5,

    speaker: 'Agent',

    text: 'Perfect! I\'ve just unlocked your account. You should be able to log in now. I\'d also recommend updating your password as an extra security measure. Would you like me to guide you through that process?',

    confidence: 0.97,

    sentiment: 'positive',

    keywords: ['unlocked account', 'log in now', 'updating password', 'security measure']

  },

  {

    id: '10',

    startTime: 48.8,

    endTime: 52.1,

    speaker: 'Customer',

    text: 'Yes, that sounds like a good idea. Thank you for being so thorough and helpful, Mike.',

    confidence: 0.94,

    sentiment: 'positive',

    keywords: ['good idea', 'thorough', 'helpful']

  }

];

 

export class EnhancedTranscriptService {

  static async getEnhancedTranscriptData(transcriptId?: string): Promise<{

    audioData: AudioPlayerData;

    transcript: TranscriptSegment[];

  }> {

    // Simulate API delay

    await new Promise(resolve => setTimeout(resolve, 1200));

 

    const transcript = transcriptId === '2' ? enhancedTranscriptSegments2 : enhancedTranscriptSegments;

    const duration = Math.max(...transcript.map(seg => seg.endTime)) + 1;

 

    return {

      audioData: {

        url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // Placeholder

        duration,

        title: transcriptId === '2' ? 'Technical Support - Account Access Issue' : 'Customer Service - Claim Resolution',

        waveformData: generateEnhancedWaveformData(duration, transcript),

        metadata: {

          bitrate: 128,

          sampleRate: 44100,

          channels: 2

        }

      },

      transcript

    };

  }

 

  static async getAvailableEnhancedTranscripts(): Promise<Array<{

    id: string;

    title: string;

    duration: number;

    date: string;

    speakers: string[];

    sentiment: 'positive' | 'negative' | 'mixed';

    category: string;

  }>> {

    await new Promise(resolve => setTimeout(resolve, 600));

 

    return [

      {

        id: '1',

        title: 'Customer Service - Claim Resolution Success',

        duration: 68.5,

        date: '2024-02-16',

        speakers: ['Agent: Sarah', 'Customer'],

        sentiment: 'positive',

        category: 'Claims'

      },

      {

        id: '2',

        title: 'Technical Support - Account Access Resolution',

        duration: 52.1,

        date: '2024-02-15',

        speakers: ['Agent: Mike', 'Customer'],

        sentiment: 'positive',

        category: 'Technical Support'

      },

      {

        id: '3',

        title: 'Benefits Inquiry - Complex Coverage Question',

        duration: 89.3,

        date: '2024-02-14',

        speakers: ['Agent: Lisa', 'Customer'],

        sentiment: 'mixed',

        category: 'Benefits'

      },

      {

        id: '4',

        title: 'Billing Dispute - Escalated Case',

        duration: 156.7,

        date: '2024-02-13',

        speakers: ['Agent: David', 'Customer', 'Supervisor: Jennifer'],

        sentiment: 'negative',

        category: 'Billing'

      },

      {

        id: '5',

        title: 'Provider Network - Specialist Referral',

        duration: 34.2,

        date: '2024-02-12',

        speakers: ['Agent: Amanda', 'Customer'],

        sentiment: 'positive',

        category: 'Provider Network'

      }

    ];

  }

 

  static generateCustomWaveform(duration: number): number[] {

    return generateEnhancedWaveformData(duration, []);

  }

 

  static analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {

    const positiveWords = ['thank', 'great', 'excellent', 'wonderful', 'perfect', 'fantastic', 'appreciate', 'helpful', 'resolved', 'good'];

    const negativeWords = ['frustrated', 'angry', 'terrible', 'awful', 'disappointed', 'upset', 'problem', 'issue', 'denied', 'wrong'];

   

    const words = text.toLowerCase().split(/\s+/);

    let positiveCount = 0;

    let negativeCount = 0;

   

    words.forEach(word => {

      if (positiveWords.some(pw => word.includes(pw))) positiveCount++;

      if (negativeWords.some(nw => word.includes(nw))) negativeCount++;

    });

   

    if (positiveCount > negativeCount) return 'positive';

    if (negativeCount > positiveCount) return 'negative';

    return 'neutral';

  }

 

  static extractKeywords(text: string): string[] {

    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'must', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'this', 'that', 'these', 'those'];

   

    const words = text.toLowerCase()

      .replace(/[^\w\s]/g, '')

      .split(/\s+/)

      .filter(word => word.length > 3 && !commonWords.includes(word));

   

    const wordCount = words.reduce((acc, word) => {

      acc[word] = (acc[word] || 0) + 1;

      return acc;

    }, {} as Record<string, number>);

   

    return Object.entries(wordCount)

      .sort(([,a], [,b]) => b - a)

      .slice(0, 5)

      .map(([word]) => word);

  }

}

 

 