
export interface InactivityConfig {

  inactivityTimeout: number;

  onInactive: () => void;

  onActive?: () => void;

  checkInterval?: number;

}

 

class InactivityTracker {

  private lastActivityTime: number;

  private inactivityTimeout: number;

  private onInactive: () => void;

  private onActive?: () => void;

  private checkInterval: number;

  private intervalId: NodeJS.Timeout | null = null;

  private isInactive = false;

  private activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

  private isAudioPlaying = false;

  private isFileUploading = false;

  private audioCheckInterval: NodeJS.Timeout | null = null;

 

  constructor(config: InactivityConfig) {

    this.lastActivityTime = Date.now();

    this.inactivityTimeout = config.inactivityTimeout;

    this.onInactive = config.onInactive;

    this.onActive = config.onActive;

    this.checkInterval = config.checkInterval || 30000;

  }

 

  private handleActivity = (): void => {

    const now = Date.now();

    const wasInactive = this.isInactive;

   

    this.lastActivityTime = now;

    this.isInactive = false;

 

    if (wasInactive && this.onActive) {

      this.onActive();

    }

  };

 

  private checkInactivity = (): void => {

    const now = Date.now();

    const timeSinceLastActivity = now - this.lastActivityTime;

 

    if (this.isAudioPlaying || this.isFileUploading) {

      this.lastActivityTime = now;

      return;

    }

 

    if (timeSinceLastActivity >= this.inactivityTimeout && !this.isInactive) {

      this.isInactive = true;

      this.onInactive();

    }

  };

 

  public start(): void {

    this.lastActivityTime = Date.now();

    this.isInactive = false;

 

    this.activityEvents.forEach(event => {

      window.addEventListener(event, this.handleActivity, { passive: true });

    });

 

    this.intervalId = setInterval(this.checkInactivity, this.checkInterval);

    this.startAudioMonitoring();

  }

 

  public stop(): void {

    this.activityEvents.forEach(event => {

      window.removeEventListener(event, this.handleActivity);

    });

 

    if (this.intervalId) {

      clearInterval(this.intervalId);

      this.intervalId = null;

    }

 

    if (this.audioCheckInterval) {

      clearInterval(this.audioCheckInterval);

      this.audioCheckInterval = null;

    }

  }

 

  public getTimeSinceLastActivity(): number {

    return Date.now() - this.lastActivityTime;

  }

 

  public isUserInactive(): boolean {

    return this.isInactive;

  }

 

  public resetActivity(): void {

    this.lastActivityTime = Date.now();

    this.isInactive = false;

  }

 

  public getLastActivityTime(): number {

    return this.lastActivityTime;

  }

 

  private startAudioMonitoring(): void {

    this.audioCheckInterval = setInterval(() => {

      const audioElements = document.querySelectorAll('audio, video');

      let isPlaying = false;

 

      audioElements.forEach((element) => {

        const mediaElement = element as HTMLMediaElement;

        if (!mediaElement.paused && !mediaElement.ended && mediaElement.currentTime > 0) {

          isPlaying = true;

        }

      });

 

      this.isAudioPlaying = isPlaying;

 

      if (isPlaying) {

        this.lastActivityTime = Date.now();

        if (this.isInactive && this.onActive) {

          this.isInactive = false;

          this.onActive();

        }

      }

    }, 1000);

  }

 

  public setAudioPlaying(isPlaying: boolean): void {

    this.isAudioPlaying = isPlaying;

    if (isPlaying) {

      this.lastActivityTime = Date.now();

    }

  }

 

  public setFileUploading(isUploading: boolean): void {

    this.isFileUploading = isUploading;

    if (isUploading) {

      this.lastActivityTime = Date.now();

    }

  }

 

  public getAudioPlayingState(): boolean {

    return this.isAudioPlaying;

  }

 

  public getFileUploadingState(): boolean {

    return this.isFileUploading;

  }

}

 

export default InactivityTracker;

 

 