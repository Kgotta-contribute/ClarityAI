
import { Document, Paragraph, TextRun, HeadingLevel, Packer } from 'docx';

import { saveAs } from 'file-saver';

import { SecondsToHHMMSS } from './audioUtils';

 

export interface TranscriptEntry {

  time: number;

  speaker: string;

  phrase: string;

}

 

export interface TranscriptExportOptions {

  header: string;

  interaction: TranscriptEntry[];

  startTime?: number;

}

 

export const downloadTranscriptAsWord = async (options: TranscriptExportOptions): Promise<void> => {

  const { header, interaction, startTime = 0 } = options;

 

  if (!interaction || interaction.length === 0) return;

 

  const lastEntry = interaction[interaction.length - 1];

  const totalDuration = lastEntry

    ? SecondsToHHMMSS(lastEntry.time * 0.001 - startTime * 0.001)

    : 'N/A';

 

  const paragraphs: Paragraph[] = [

    new Paragraph({

      text: header,

      heading: HeadingLevel.HEADING_1,

      spacing: { after: 200 }

    }),

    new Paragraph({

      children: [

        new TextRun({ text: 'Total Duration: ', bold: true }),

        new TextRun(totalDuration)

      ],

      spacing: { after: 100 }

    }),

    new Paragraph({

      children: [

        new TextRun({ text: 'Generated: ', bold: true }),

        new TextRun(new Date().toLocaleString())

      ],

      spacing: { after: 300 }

    })

  ];

 

  interaction.forEach((item) => {

    const adjustedTime = item.time * 0.001 - startTime * 0.001;

    const formattedTime = SecondsToHHMMSS(adjustedTime);

 

    paragraphs.push(

      new Paragraph({

        children: [

          new TextRun({ text: item.speaker, bold: true, color: '4299e1' }),

          new TextRun({ text: ` - ${formattedTime}`, color: '718096', size: 18 })

        ],

        spacing: { after: 50 }

      }),

      new Paragraph({

        text: item.phrase,

        spacing: { after: 200 }

      })

    );

  });

 

  const doc = new Document({

    sections: [{

      properties: {},

      children: paragraphs

    }]

  });

 

  const blob = await Packer.toBlob(doc);

  const fileName = `transcript_${header.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.docx`;

  saveAs(blob, fileName);

};

 

 