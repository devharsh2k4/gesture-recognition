declare module 'handtrackjs' {
    interface Detection {
      bbox: [number, number, number, number]; // [x, y, width, height]
      label: string;
      score: number;
    }
  
    interface HandTrackOptions {
      flipHorizontal: boolean;
      maxNumBoxes: number;
      iouThreshold: number;
      scoreThreshold: number;
    }
  
    interface HandTrackModel {
      detect(video: HTMLVideoElement): Promise<Detection[]>;
      detectSingle(video: HTMLVideoElement): Promise<Detection | null>;
    }
  
    function load(modelOptions?: Partial<HandTrackOptions>): Promise<HandTrackModel>;
    function startVideo(video: HTMLVideoElement): Promise<boolean>;
  }
  