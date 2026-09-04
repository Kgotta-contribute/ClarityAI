
// Mock data for audio files and transcripts

 

export interface AudioFile {

  id: string;

  fileName: string;

  duration: number;

  fileSize: number;

  status: 'Completed' | 'Processing' | 'Failed' | 'Pending';

  jobId: string;

  userName: string;

  userDomain: string;

  businessGroup: string;

  receivedDate: string;

  audioUrl?: string;

  audioStreams?: string[]; // Blob URLs for primary audio streams

  additionalStreams?: string[]; // Blob URLs for additional recordings

  transcript?: TranscriptData;

}

 

export interface TranscriptData {

  interaction: [number, string, string][]; // [timestamp, speaker, phrase]

  startTime: number;

  recordingIds: string[];

  additionalRecordingIds?: string[];

}

 

export const mockAudioFiles: AudioFile[] = [

  {

    id: '1',

    fileName: 'customer_call_001.wav',

    duration: 245,

    fileSize: 12500000,

    status: 'Completed',

    jobId: 'JOB-2024-001',

    userName: 'Sarah Johnson',

    userDomain: 'Customer Service',

    businessGroup: 'Healthcare Support',

    receivedDate: '2024-02-18 09:30:00',

    audioUrl: '/mock-audio/customer_call_001.wav',

    transcript: {

      interaction: [

        [1000, 'agent', 'Thank you for calling Chhavi AI, this is Sarah. How can I help you today?'],

        [6000, 'external', 'Hi Sarah, I\'m calling about my recent claim that was denied. I received a letter but I don\'t understand why it was rejected.'],

        [15000, 'agent', 'I\'d be happy to help you with that. Can you please provide me with your member ID so I can look up your account?'],

        [22000, 'external', 'Sure, it\'s EH123456789.'],

        [28000, 'agent', 'Thank you. I can see your account here. Let me review the claim in question. Can you tell me the date of service?'],

        [38000, 'external', 'It was January 15th, 2024. It was for a specialist consultation with Dr. Martinez.'],

        [46000, 'agent', 'I see the claim here. It looks like it was denied because prior authorization was required for this specialist visit, but it wasn\'t obtained before the appointment.'],

        [58000, 'external', 'But my primary care doctor referred me! I thought that was enough.'],

        [64000, 'agent', 'I understand your confusion. While your primary care doctor can refer you, certain specialists still require prior authorization from our medical review team. Let me see what we can do to help resolve this.'],

        [78000, 'external', 'Okay, what are my options?'],

        [82000, 'agent', 'We can file a retroactive prior authorization request. If approved, we can reprocess your claim. I\'ll start that process for you right now.'],

        [92000, 'external', 'That would be great, thank you so much!'],

        [96000, 'agent', 'You\'re welcome! I\'ve submitted the request. You should hear back within 5-7 business days. Is there anything else I can help you with today?'],

        [108000, 'external', 'No, that covers everything. Thank you for your help, Sarah.'],

        [113000, 'agent', 'You\'re very welcome! Have a great day and thank you for choosing Chhavi AI.']

      ],

      startTime: 0,

      recordingIds: ['REC-001-2024']

    }

  },

  {

    id: '2',

    fileName: 'provider_inquiry_002.wav',

    duration: 180,

    fileSize: 9200000,

    status: 'Completed',

    jobId: 'JOB-2024-002',

    userName: 'Michael Chen',

    userDomain: 'Provider Relations',

    businessGroup: 'Network Management',

    receivedDate: '2024-02-18 10:15:00',

    audioUrl: '/mock-audio/provider_inquiry_002.wav',

    transcript: {

      interaction: [

        [1000, 'agent', 'Good morning, this is Michael from Chhavi AI Provider Relations. How can I assist you today?'],

        [7000, 'external', 'Hi Michael, this is Dr. Smith\'s office. We\'re having trouble with claim submissions through your portal.'],

        [14000, 'agent', 'I\'m sorry to hear about the technical difficulties. Can you describe what specific issues you\'re experiencing?'],

        [22000, 'external', 'When we try to submit claims, we get an error message saying "Invalid provider NPI." But we\'ve been using the same NPI for years.'],

        [32000, 'agent', 'That does sound frustrating. Let me check your provider profile. Can you confirm your NPI number for me?'],

        [40000, 'external', 'Yes, it\'s 1234567890.'],

        [45000, 'agent', 'Thank you. I can see the issue - there was a recent update to our system that requires re-verification of NPI numbers. I can fix this for you right now.'],

        [56000, 'external', 'Oh, that explains it. How long will it take?'],

        [61000, 'agent', 'I\'ve just updated your profile. It should be active within the next 15 minutes. Try submitting a test claim after that.'],

        [70000, 'external', 'Perfect, thank you so much for the quick resolution!'],

        [75000, 'agent', 'You\'re welcome! If you continue to have any issues, please don\'t hesitate to call us back.']

      ],

      startTime: 0,

      recordingIds: ['REC-002-2024']

    }

  },

  {

    id: '3',

    fileName: 'member_benefits_003.wav',

    duration: 320,

    fileSize: 16800000,

    status: 'Processing',

    jobId: 'JOB-2024-003',

    userName: 'Lisa Rodriguez',

    userDomain: 'Member Services',

    businessGroup: 'Customer Care',

    receivedDate: '2024-02-18 11:00:00'

  },

  {

    id: '4',

    fileName: 'urgent_care_004.wav',

    duration: 150,

    fileSize: 7500000,

    status: 'Failed',

    jobId: 'JOB-2024-004',

    userName: 'David Park',

    userDomain: 'Clinical Support',

    businessGroup: 'Medical Review',

    receivedDate: '2024-02-18 11:30:00'

  },

  {

    id: '5',

    fileName: 'pharmacy_inquiry_005.wav',

    duration: 280,

    fileSize: 14200000,

    status: 'Completed',

    jobId: 'JOB-2024-005',

    userName: 'Jennifer Wilson',

    userDomain: 'Pharmacy Services',

    businessGroup: 'Prescription Benefits',

    receivedDate: '2024-02-18 12:00:00',

    audioUrl: '/mock-audio/pharmacy_inquiry_005.wav',

    transcript: {

      interaction: [

        [1000, 'agent', 'Thank you for calling Chhavi AI Pharmacy Services, this is Jennifer. How may I help you?'],

        [8000, 'external', 'Hi, I\'m trying to fill a prescription but the pharmacy says it\'s not covered. Can you help me understand why?'],

        [16000, 'agent', 'I\'d be happy to help you with that. Can you please provide your member ID and the name of the medication?'],

        [24000, 'external', 'My member ID is EH987654321 and the medication is Lipitor 20mg.'],

        [32000, 'agent', 'Thank you. Let me look that up for you. I can see that Lipitor is on our formulary, but it requires a prior authorization for the 20mg strength.'],

        [44000, 'external', 'What does that mean exactly?'],

        [47000, 'agent', 'Prior authorization means your doctor needs to provide medical justification for why you need this specific medication and dosage. There may be preferred alternatives available.'],

        [58000, 'external', 'Are there any alternatives that don\'t require authorization?'],

        [63000, 'agent', 'Yes, we have several preferred statins that are covered without prior auth. Generic atorvastatin is available, or your doctor could prescribe simvastatin.'],

        [74000, 'external', 'Would the generic work the same way?'],

        [78000, 'agent', 'Generic atorvastatin has the same active ingredient as Lipitor, so it should work exactly the same. Your doctor can help you decide what\'s best.'],

        [88000, 'external', 'Okay, I\'ll talk to my doctor about switching to the generic. How do I get that processed?'],

        [95000, 'agent', 'Your doctor can send a new prescription for generic atorvastatin directly to your pharmacy. It should be covered with just your regular copay.'],

        [105000, 'external', 'Great, thank you so much for explaining that!'],

        [109000, 'agent', 'You\'re very welcome! Is there anything else I can help you with regarding your prescription benefits?'],

        [116000, 'external', 'No, that covers it. Thanks again!'],

        [120000, 'agent', 'Have a great day and thank you for calling Chhavi AI.']

      ],

      startTime: 0,

      recordingIds: ['REC-005-2024']

    }

  },

  {

    id: '6',

    fileName: 'claims_appeal_006.wav',

    duration: 420,

    fileSize: 21000000,

    status: 'Pending',

    jobId: 'JOB-2024-006',

    userName: 'Robert Kim',

    userDomain: 'Claims Processing',

    businessGroup: 'Appeals & Grievances',

    receivedDate: '2024-02-18 13:15:00'

  },

  {

    id: '7',

    fileName: '20260310_me_morning_news_brief.wav',

    duration: 729,

    fileSize: 36450000,

    status: 'Completed',

    jobId: 'JOB-2024-007',

    userName: 'News Team',

    userDomain: 'Broadcasting',

    businessGroup: 'Media',

    receivedDate: '2024-03-10 09:00:00',

    audioUrl: '/mock-audio/morning_news_brief.wav',

    transcript: {

      interaction: [

        [0, 'A', 'President Trump took questions from reporters at a press conference on Monday for the first time since the U.S. and Israeli war against Iran.'],

        [7750, 'A', 'The administration took several days to explain what its objectives were in this war,'],

        [13000, 'A', 'and Trump has given conflicting reasons for why he launched the strikes.'],

        [17300, 'A', 'On Monday, he said this.'],

        [19150, 'B', 'We\'re achieving major strides toward completing our military objective.'],

        [25250, 'B', 'And some people could say they\'re pretty well complete.'],

        [33024, 'C', 'That was one of several contradictory statements by the president throughout the day, suggesting the war\'s end was near or not near.'],

        [40824, 'C', 'NPR national political correspondent Mara Eliasson has been listening to it all.'],

        [43974, 'C', 'Mara, good morning.'],

        [44724, 'A', 'Good morning.'],

        [45274, 'C', 'What do you make of the president\'s many words?'],

        [47636, 'D', 'I think that the dominant message was declaring victory.'],

        [52336, 'D', 'And after you declare victory, you tend to look for an off-ramp.'],

        [68886, 'D', 'Here\'s a little sample of that.'],

        [93528, 'C', 'Mara, I just want to note that the president\'s remarks have been moving markets.'],

        [125132, 'D', 'Well, yes, there were some things that were different about yesterday.'],

        [282484, 'C', 'Okay, so we heard from President Trump. What do you hear from the other side in this war?'],

        [287134, 'E', 'Well, the Iranian Revolutionary Guard said that President Trump is trying to put psychological pressure on Iran.'],

        [318864, 'C', 'Now, where you are in Beirut, we know there have been Israeli airstrikes.'],

        [332464, 'E', 'Yeah, so Lebanon and Israel have been at war for decades.'],

        [443337, 'C', 'Now let\'s talk about Iran itself. The U.S. campaign continues there.'],

        [456411, 'F', 'The Israelis are being a little bit coy about that particular point.'],

        [495233, 'D', 'Two Pennsylvania men have been charged with terrorism-related crimes following an attempted attack in New York City.'],

        [519483, 'G', 'Good morning, Steve.'],

        [521377, 'F', 'So Amir Bilal, who\'s 18, and Ibrahim Kayumi, 19, are both from Pennsylvania.'],

        [553641, 'H', 'These were ISIS inspired actions, and it is chilling.'],

        [583581, 'I', 'They could have caused death, destruction, extremely dangerous compound.']

      ],

      startTime: 0,

      recordingIds: ['REC-007-2024']

    }

  }

];

 

export const getMockAudioFile = (id: string): AudioFile | undefined => {

  return mockAudioFiles.find(file => file.id === id);

};

 

export const getMockTranscript = (id: string): TranscriptData | undefined => {

  const file = getMockAudioFile(id);

  return file?.transcript;

};

 

 

 

 

 

 

 

 

 

 

 

 