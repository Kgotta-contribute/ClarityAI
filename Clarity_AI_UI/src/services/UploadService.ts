import { apiConfig } from '../config/api.config';

 

export interface CreateJobResponse {
    jobID: string;
    fileID: { [key: string]: string };
}

export interface UploadOptions {
    redactPHIPII?: boolean;
    liveTranscription?: boolean;
    Keywords?: string[];
    language?: string;
}

export interface AllDataResponse {
    pagination: {};
    records: Data[]
}

export interface Data {
    fileID: string;

    fileName: string;

    sizeBytes: number;

    fileStatus: string;

    userName: string;

    domainID: string;

    businessGroup: string;

    status: string;

    receivedAt: string;

    sourceFileName: string;

}

 

export interface ChatRequest {

    conversationHistory: Array<{ user: string, agent: string }>;

    userQuestion: string;

    files: Array<{ fileId: string, jobId: string }>;

}

 

export interface ChatResponse {

    response?: string;

    answer?: string;

    text?: string;

    message?: string;

    content?: string;

    result?: string;

    is_rate_limited?: boolean;

}

 

export interface FileStatusResponse {

    fileID: string;

    fileName: string;

    status: 'pending' | 'processing' | 'completed' | 'error' | 'Failed';

    progress: {

        stage: string;

        currentChunk: number;

        totalChunks: number;

        percentage: number;

    };

    errorDetails: string | null;

}

 

export const UploadService = {
    async createJob(
        fileNames: string[],
        options: UploadOptions = {},
        businessGroup: string = ''
    ): Promise<CreateJobResponse> {
        const response = await fetch(apiConfig.endpoints.createJob, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fileDetails: fileNames,
                businessGroup,
                options,
            }),
        });

        if (!response.ok) {
            throw new Error(`Create job failed: ${response.status} ${response.statusText}`);
        }

        return response.json();
    },

    async uploadFile(jobId: string, fileId: string, file: File): Promise<any> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(apiConfig.endpoints.uploadFile(jobId, fileId), {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
        }

        return response.json();
    },

 

    async sendChatMessage(payload: ChatRequest): Promise<ChatResponse> {

        const response = await fetch(apiConfig.endpoints.chat, {

            method: 'POST',

            headers: {

                'Content-Type': 'application/json',

            },

            body: JSON.stringify(payload),

        });

 

        if (!response.ok) {
            if (response.status === 429) {
                try {
                    const errorData = await response.json();
                    return errorData;
                } catch {
                    return {
                        text: "⏳ **Rate Limit Exceeded**: Please wait a moment before sending another message.",
                        is_rate_limited: true,
                        retry_after: 30
                    } as any;
                }
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

 

        const data = await response.json();

        return data;

    },

 

    async getFileStatusStream(
        jobId: string,
        fileId: string,
        onStatusUpdate: (status: FileStatusResponse | any) => void,
        onError: (error: Error) => void,
        onComplete: () => void
    ): Promise<void> {
        const response = await fetch(apiConfig.endpoints.jobStatus(jobId), {
            method: 'GET',
            headers: {
                'Accept': 'text/event-stream',
            },
        });

        if (!response.ok || !response.body) {
            throw new Error(`Status stream failed: ${response.status} ${response.statusText}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const messages = buffer.split('\n\n');
                buffer = messages.pop() || '';

                for (const message of messages) {
                    const line = message.split('\n').find((item) => item.startsWith('data: '));
                    if (!line) continue;

                    const statusUpdate = JSON.parse(line.substring(6));
                    if (fileId && statusUpdate.files && Array.isArray(statusUpdate.files)) {
                        const selectedFile = statusUpdate.files.find((file: FileStatusResponse) => file.fileID === fileId);
                        if (selectedFile) {
                            onStatusUpdate(selectedFile);
                        }
                    } else {
                        onStatusUpdate(statusUpdate);
                    }

                    const files = statusUpdate.files || [];
                    const allFinished = files.length > 0 && files.every((file: FileStatusResponse) =>
                        ['completed', 'error', 'Failed', 'stopped'].includes(file.status)
                    );
                    if (allFinished) {
                        onComplete();
                        return;
                    }
                }
            }
            onComplete();
        } catch (error) {
            onError(error instanceof Error ? error : new Error('Status stream failed'));
        } finally {
            reader.releaseLock();
        }
    },

    async getFileStatus(jobId: string, fileId?: string): Promise<FileStatusResponse | FileStatusResponse[] | any> {

        const response = await fetch(

            apiConfig.endpoints.jobStatus(jobId),

            {

                method: 'GET',

                headers: {

                    'Accept': 'application/json, text/event-stream'

                }

            }

        );

 

        if (!response.ok) {

            throw new Error('Status check failed');

        }

 

        const contentType = response.headers.get('content-type');

        let statusData;

 

        // Handle SSE response

        if (contentType && contentType.includes('text/event-stream')) {

            const text = await response.text();

 

            // Parse SSE format: "data: {json}\n\n"

            const lines = text.split('\n');

            for (const line of lines) {

                if (line.startsWith('data: ')) {

                    const jsonData = line.substring(6).trim();

                    if (jsonData) {

                        try {

                            statusData = JSON.parse(jsonData);

                            break;

                        } catch (parseError) {

                            console.warn('Failed to parse SSE JSON:', parseError);

                        }

                    }

                }

            }

        } else {

            // Handle regular JSON response

            statusData = await response.json();

        }

 

        if (statusData && statusData.files && Array.isArray(statusData.files)) {

            return statusData; // Return full SSE response structure

        }

 

        if (fileId && Array.isArray(statusData)) {

            const fileStatus = statusData.find(file => file.fileID === fileId);

            if (fileStatus) {

                return fileStatus;

            } else {

                console.warn(`File ${fileId} not found in status array`);

                return statusData; // Return full array if specific file not found

            }

        }

 

        // Return the data as-is (could be array or single object)

        return statusData;

    },

    async downloadTranscript(jobId: string, fileId: string): Promise<Response> {
        return fetch(apiConfig.endpoints.downloadDiarized(jobId, fileId));
    },

    async downloadRawTranscript(jobId: string, fileId: string): Promise<Response> {
        return fetch(apiConfig.endpoints.downloadRaw(jobId, fileId));
    },

    async cancelJob(jobId: string, fileId: string): Promise<any> {
        const response = await fetch(apiConfig.endpoints.cancelJob(jobId, fileId), {
            method: 'POST',
        });

        if (!response.ok) {
            throw new Error(`Cancel failed: ${response.status} ${response.statusText}`);
        }

        return response.json();
    },

    async downloadTranscriptStream(

        jobId: string,

        onChunk: (text: string, progress: { currentChunk: number; totalChunks: number; percentage: number }) => void

    ): Promise<string> {

        const response = await fetch(

            apiConfig.endpoints.jobStatus(jobId),

            { method: 'GET' }

        );

 

        if (!response.ok) {

            throw new Error('Download failed');

        }

 

        const reader = response.body?.getReader();

        const decoder = new TextDecoder();

        let fullText = '';

 

        if (!reader) throw new Error('No response body');

 

        const contentLength = response.headers.get('Content-Length');

        const totalBytes = contentLength ? parseInt(contentLength, 10) : 0;

        let done = false;

        let currentChunk = 0;

        let receivedBytes = 0;

 

        while (!done) {

            const result = await reader.read();

            done = result.done;

            if (result.value) {

                currentChunk++;

                receivedBytes += result.value.length;

                const chunk = decoder.decode(result.value, { stream: true });

                fullText += chunk;

 

                const percentage = totalBytes > 0

                    ? Math.round((receivedBytes / totalBytes) * 100)

                    : 0;

 

                onChunk(fullText, {

                    currentChunk,

                    totalChunks: totalBytes > 0 ? Math.ceil(totalBytes / result.value.length) : currentChunk,

                    percentage

                });

            }

        }

        return fullText;

    },

    async getAllData(): Promise<AllDataResponse> {

        const response = await fetch(apiConfig.endpoints.allData, {

            method: 'GET',

            headers: {

                'Content-Type': 'application/json'

            }

        });

 

        if (!response.ok) {

            console.error(`Failed to fetch all data: ${response.status} ${response.statusText}`);

            throw new Error(`Failed to fetch all data: ${response.status} ${response.statusText}`);

        }

 

        const data = await response.json();

        return data;

    }

}

 

 
