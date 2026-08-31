
// Mock transcript service using existing patterns

export interface TranscriptSegment {

  id: string;

  startTime: number;

  endTime: number;

  speaker: string;

  text: string;

  confidence?: number;

}

 

export interface AudioData {

  url: string;

  duration: number;

  waveformData?: number[];

}

 

// Generate mock waveform data

const generateWaveformData = (duration: number, sampleRate: number = 44100): number[] => {

  const samples = Math.floor(duration * sampleRate / 1000); // Reduce sample rate for visualization

  const waveform: number[] = [];

 

  for (let i = 0; i < samples; i++) {

    // Generate realistic audio waveform pattern

    const time = i / samples;

    const amplitude = Math.sin(time * Math.PI * 20) * Math.exp(-time * 2) *

                     (0.5 + 0.5 * Math.sin(time * Math.PI * 100)) *

                     Math.random() * 0.3 + 0.7;

    waveform.push(Math.abs(amplitude));

  }

 

  return waveform;

};

 

// Mock transcript data

const mockTranscriptSegments: TranscriptSegment[] = [

  {

    id: '1',

    startTime: 0,

    endTime: 4.2,

    speaker: 'Agent',

    text: 'Good morning! Thank you for calling Elevance Health customer service. My name is Sarah, and I\'ll be happy to assist you today. May I please have your member ID?',

    confidence: 0.95

  },

  {

    id: '2',

    startTime: 4.5,

    endTime: 8.1,

    speaker: 'Customer',

    text: 'Hi Sarah, yes, my member ID is EH123456789. I\'m calling because I have some questions about my recent claim.',

    confidence: 0.92

  },

  {

    id: '3',

    startTime: 8.3,

    endTime: 12.7,

    speaker: 'Agent',

    text: 'Thank you for providing that information. Let me pull up your account now. I can see your recent claims here. Which specific claim did you have questions about?',

    confidence: 0.97

  },

  {

    id: '4',

    startTime: 13.0,

    endTime: 18.5,

    speaker: 'Customer',

    text: 'It\'s the claim from my doctor visit last Tuesday, Dr. Johnson\'s office. The claim shows as partially covered, but I thought it should be fully covered under my plan.',

    confidence: 0.89

  },

  {

    id: '5',

    startTime: 18.8,

    endTime: 25.2,

    speaker: 'Agent',

    text: 'I understand your concern. Let me review the details of that claim for you. I can see the visit to Dr. Johnson\'s office on the date you mentioned. It looks like the claim was processed according to your plan benefits, but let me explain the breakdown.',

    confidence: 0.94

  },

  {

    id: '6',

    startTime: 25.5,

    endTime: 32.1,

    speaker: 'Agent',

    text: 'Your plan has a $25 copay for specialist visits, and Dr. Johnson is classified as a specialist in our network. The remaining amount after the copay was covered at 80% as per your plan terms.',

    confidence: 0.96

  },

  {

    id: '7',

    startTime: 32.4,

    endTime: 36.8,

    speaker: 'Customer',

    text: 'Oh, I see. I thought Dr. Johnson was considered a primary care physician. Is there a way to verify his classification?',

    confidence: 0.91

  },

  {

    id: '8',

    startTime: 37.0,

    endTime: 43.5,

    speaker: 'Agent',

    text: 'Absolutely! I can help you with that. According to our provider directory, Dr. Johnson is listed as an internal medicine specialist. However, if you believe this is incorrect, we can initiate a provider classification review.',

    confidence: 0.93

  },

  {

    id: '9',

    startTime: 43.8,

    endTime: 48.2,

    speaker: 'Customer',

    text: 'That would be great. How long does the review process typically take, and what information do I need to provide?',

    confidence: 0.88

  },

  {

    id: '10',

    startTime: 48.5,

    endTime: 55.7,

    speaker: 'Agent',

    text: 'The review process usually takes 10-15 business days. I\'ll need to gather some additional information from you and Dr. Johnson\'s office to support the review. Let me start a case for you right now.',

    confidence: 0.95

  },

  {

    id: '11',

    startTime: 56.0,

    endTime: 60.3,

    speaker: 'Customer',

    text: 'Perfect, thank you so much for your help, Sarah. I really appreciate you taking the time to explain everything clearly.',

    confidence: 0.94

  },

  {

    id: '12',

    startTime: 60.6,

    endTime: 67.2,

    speaker: 'Agent',

    text: 'You\'re very welcome! I\'ve created case number CH2024-0156 for your provider classification review. You should receive an email confirmation within the next hour. Is there anything else I can help you with today?',

    confidence: 0.97

  },

  {

    id: '13',

    startTime: 67.5,

    endTime: 70.8,

    speaker: 'Customer',

    text: 'No, that covers everything. Thank you again for your excellent service!',

    confidence: 0.92

  },

  {

    id: '14',

    startTime: 71.0,

    endTime: 75.5,

    speaker: 'Agent',

    text: 'Thank you for calling Elevance Health. Have a wonderful day, and please don\'t hesitate to call if you have any other questions!',

    confidence: 0.96

  }

];

 

// Mock audio data

const mockAudioData: AudioData = {

  url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // Placeholder URL

  duration: 75.5,

  waveformData: generateWaveformData(75.5)

};

 

// Alternative mock data sets

const mockTranscriptSegments2: TranscriptSegment[] = [

  {

    id: '1',

    startTime: 0,

    endTime: 3.8,

    speaker: 'Agent',

    text: 'Hello, this is Mike from Elevance Health technical support. How can I assist you today?',

    confidence: 0.96

  },

  {

    id: '2',

    startTime: 4.0,

    endTime: 8.5,

    speaker: 'Customer',

    text: 'Hi Mike, I\'m having trouble accessing my online account. It keeps saying my password is incorrect, but I\'m sure I\'m using the right one.',

    confidence: 0.89

  },

  {

    id: '3',

    startTime: 8.7,

    endTime: 14.2,

    speaker: 'Agent',

    text: 'I\'m sorry to hear you\'re having trouble with your account access. Let me help you resolve this issue. Can you please provide me with the email address associated with your account?',

    confidence: 0.94

  },

  {

    id: '4',

    startTime: 14.5,

    endTime: 18.1,

    speaker: 'Customer',

    text: 'Yes, it\'s john.smith@email.com. I\'ve been using this account for over two years without any issues.',

    confidence: 0.91

  },

  {

    id: '5',

    startTime: 18.3,

    endTime: 25.6,

    speaker: 'Agent',

    text: 'Thank you for that information. I can see your account here, and it appears there may have been a security lockout triggered after multiple failed login attempts. This is a safety feature to protect your account.',

    confidence: 0.97

  }

];

 

export class MockTranscriptService {

  static async getTranscriptData(transcriptId?: string): Promise<{

    audioData: AudioData;

    transcript: TranscriptSegment[];

  }> {

    // Simulate API delay

    await new Promise(resolve => setTimeout(resolve, 1000));

 

    // Return different mock data based on ID

    if (transcriptId === '2') {

      return {

        audioData: {

          ...mockAudioData,

          duration: 25.6,

          waveformData: generateWaveformData(25.6)

        },

        transcript: mockTranscriptSegments2

      };

    }

 

    return {

      audioData: mockAudioData,

      transcript: mockTranscriptSegments

    };

  }

 

  static async getAvailableTranscripts(): Promise<Array<{

    id: string;

    title: string;

    duration: number;

    date: string;

    speakers: string[];

  }>> {

    await new Promise(resolve => setTimeout(resolve, 500));

 

    return [

      {

        id: '1',

        title: 'Customer Service Call - Claim Inquiry',

        duration: 75.5,

        date: '2024-02-15',

        speakers: ['Agent', 'Customer']

      },

      {

        id: '2',

        title: 'Technical Support - Account Access',

        duration: 25.6,

        date: '2024-02-14',

        speakers: ['Agent', 'Customer']

      },

      {

        id: '3',

        title: 'Benefits Explanation Call',

        duration: 45.2,

        date: '2024-02-13',

        speakers: ['Agent', 'Customer']

      }

    ];

  }

 

  static generateMockWaveform(duration: number): number[] {

    return generateWaveformData(duration);

  }

}

 

 

 

 