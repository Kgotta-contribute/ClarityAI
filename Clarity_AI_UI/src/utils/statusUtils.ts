
export const normalizeFileStatus = (status: string): 'Processing' | 'Completed' | 'Failed' | 'Pending' => {

  const STATUS_MAP: Record<string, 'Processing' | 'Completed' | 'Failed' | 'Pending'> = {

    'completed': 'Completed',

    'processing': 'Processing',

    'failed': 'Failed',

    'pending': 'Pending',

  };

  return STATUS_MAP[status.toLowerCase()] || 'Pending';

};

 

export const getStatusColor = (status: string): string => {

  const STATUS_COLORS: Record<string, string> = {

    'completed': '#4caf50',

    'processing': '#4a90d9',

    'failed': '#f44336',

    'pending': '#666',

    'uploading': '#4a90d9',

    'streaming': '#4a90d9',

    'error': '#f44336',

  };

  return STATUS_COLORS[status.toLowerCase()] || '#666';

};

 

 

 

 

 

 

 