 

export const audioBufferToWav = async (buffer: AudioBuffer): Promise<Blob> => {

  const numberOfChannels = buffer.numberOfChannels;

  const sampleRate = buffer.sampleRate;

  const format = 1;

  const bitDepth = 16;

 

  const bytesPerSample = bitDepth / 8;

  const blockAlign = numberOfChannels * bytesPerSample;

 

  const data: number[] = [];

  for (let i = 0; i < buffer.length; i++) {

    for (let channel = 0; channel < numberOfChannels; channel++) {

      const sample = buffer.getChannelData(channel)[i];

      const int16 = Math.max(-1, Math.min(1, sample)) * 0x7FFF;

      data.push(int16 < 0 ? int16 + 0x10000 : int16);

    }

  }

 

  const dataLength = data.length * bytesPerSample;

  const bufferLength = 44 + dataLength;

  const arrayBuffer = new ArrayBuffer(bufferLength);

  const view = new DataView(arrayBuffer);

 

  const writeString = (offset: number, string: string) => {

    for (let i = 0; i < string.length; i++) {

      view.setUint8(offset + i, string.charCodeAt(i));

    }

  };

 

  writeString(0, 'RIFF');

  view.setUint32(4, 36 + dataLength, true);

  writeString(8, 'WAVE');

  writeString(12, 'fmt ');

  view.setUint32(16, 16, true);

  view.setUint16(20, format, true);

  view.setUint16(22, numberOfChannels, true);

  view.setUint32(24, sampleRate, true);

  view.setUint32(28, sampleRate * blockAlign, true);

  view.setUint16(32, blockAlign, true);

  view.setUint16(34, bitDepth, true);

  writeString(36, 'data');

  view.setUint32(40, dataLength, true);

 

  let offset = 44;

  for (const sample of data) {

    view.setInt16(offset, sample, true);

    offset += 2;

  }

 

  return new Blob([arrayBuffer], { type: 'audio/wav' });

};

 

 