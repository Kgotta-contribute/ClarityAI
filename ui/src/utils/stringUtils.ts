
export const formatBusinessGroup = (group: string): string => {

  return group

    .replace(/^clarity_ai_/i, '')

    .replace(/_/g, ' ')

    .replace(/\b\w/g, l => l.toUpperCase());

};

 

export const formatTabKey = (tabTitle: string): string => {

  return tabTitle.toLowerCase().replace(/ /g, '');

};

 

export const formatDownloadFileName = (header: string, extension: string = 'docx'): string => {

  const sanitized = header.replace(/[^a-z0-9]/gi, '_').toLowerCase();

  const date = new Date().toISOString().split('T')[0];

  return `transcript_${sanitized}_${date}.${extension}`;

};

 

export const formatGroupNames = (groups: string[]): string => {

  return groups

    .map(g => g.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()))

    .join(', ');

};

 