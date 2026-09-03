
// Transform API segment data to component format

export interface APISegment {

  speaker: string;

  text: string;

  start: number;

  end: number;

  id?: string;

  type?: string;

}

 

export interface TranscriptInteraction {

  interaction: [number, string, string][]; // [timestamp_ms, speaker, phrase]

  startTime: number;

  recordingIds: string[];

}

 

export const transformSegmentsToInteraction = (

  segments: APISegment[],

  recordingId: string = 'default'

): TranscriptInteraction => {

  const interaction: [number, string, string][] = segments.map((segment) => {

    const timestampMs = segment.start * 1000; // Convert seconds to milliseconds

    return [timestampMs, segment.speaker, segment.text];

  });

 

  return {

    interaction,

    startTime: 0,

    recordingIds: [recordingId]

  };

};

 

 

 

 

 

 

 

 

 

 

 