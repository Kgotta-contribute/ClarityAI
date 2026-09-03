
export interface User {

  id: string;

  name: string;

  email: string;

  department: string;

  role: string;

}

 

export interface BusinessGroup {

  id: string;

  name: string;

  description: string;

  icon: string;

  color: string;

}

 

export interface FilterState {

  convoDateValue: string;

  convoStartDateValue: string;

  convoEndDateValue: string;

  isResetDisable: boolean;

}

 

export interface UploadState {

  selectedFiles: File[];

  fileStatuses: { [fileName: string]: unknown };

  currentJobId: string | null;

  uploadStatus: 'idle' | 'uploading' | 'success' | 'error';

  streamStatus: 'idle' | 'streaming' | 'completed' | 'error';

}

 

 

 