'use client';

import React, { useRef, useEffect, useState } from 'react';
import * as handpose from '@tensorflow-models/handpose';
import '@tensorflow/tfjs-backend-webgl'; // For performance optimization

const HandGesture: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gesture, setGesture] = useState<string | null>('No Hand Detected');
  const [isModelLoaded, setIsModelLoaded] = useState(false);

  useEffect(() => {
    const startVideo = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    };

    const loadHandposeModel = async () => {
      const model = await handpose.load();
      setIsModelLoaded(true);
      detectHands(model);
    };

    startVideo();
    loadHandposeModel();
  }, []);

  const detectHands = async (model: handpose.HandPose) => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const drawHand = (predictions: handpose.AnnotatedPrediction[]) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      predictions.forEach((prediction: handpose.AnnotatedPrediction) => {
        const landmarks = prediction.landmarks;
        ctx.strokeStyle = 'lime';
        ctx.lineWidth = 4;

        // Draw landmarks
        for (let i = 0; i < landmarks.length; i++) {
          const [x, y] = landmarks[i];
          ctx.beginPath();
          ctx.arc(x, y, 5, 0, Math.PI * 2);
          ctx.fillStyle = 'lime';
          ctx.fill();
        }
      });
    };

    const recognizeGesture = (landmarks: number[][]) => {
      const thumbTip = landmarks[4];
      const indexTip = landmarks[8];
      const middleTip = landmarks[12];
      const ringTip = landmarks[16];
      const pinkyTip = landmarks[20];

      const thumbDirection = thumbTip[1] < landmarks[3][1] ? 'up' : 'down';
      const indexExtended = indexTip[1] < landmarks[6][1];
      const middleExtended = middleTip[1] < landmarks[10][1];
      const ringExtended = ringTip[1] < landmarks[14][1];
      const pinkyExtended = pinkyTip[1] < landmarks[18][1];

      // Gesture Logic
      if (indexExtended && middleExtended && !ringExtended && !pinkyExtended) {
        return 'Victory';
      }
      if (thumbDirection === 'up' && !indexExtended && !middleExtended) {
        return 'Thumbs Up';
      }
      if (thumbDirection === 'down' && !indexExtended && !middleExtended) {
        return 'Thumbs Down';
      }
      if (!thumbDirection && !indexExtended && !middleExtended) {
        return 'Fist';
      }
      if (indexExtended && middleExtended && ringExtended && pinkyExtended) {
        return 'Open Hand';
      }
      return 'Unknown Gesture';
    };

    const runDetection = async () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const predictions = await model.estimateHands(video);
      if (predictions.length > 0) {
        const landmarks = predictions[0].landmarks;
        const recognizedGesture = recognizeGesture(landmarks);
        setGesture(recognizedGesture);
      } else {
        setGesture('No Hand Detected');
      }
      drawHand(predictions);

      requestAnimationFrame(runDetection);
    };

    runDetection();
  };

  return (
    <div className="relative w-screen h-screen flex items-center justify-center bg-gradient-to-br from-gray-800 via-blue-700 to-gray-900 text-white">
      {/* Video and Canvas Container */}
      <div className="relative w-full h-[85%] bg-black rounded-lg overflow-hidden shadow-2xl border border-gray-700">
        <video
          ref={videoRef}
          className="absolute top-0 left-0 w-full h-full object-cover"
          autoPlay
          muted
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full"
        />
        {/* Status Box */}
        {isModelLoaded ? (
          <div className="absolute bottom-4 left-4 bg-gray-900 bg-opacity-70 text-white px-6 py-3 rounded-lg shadow-md backdrop-blur-md">
            <p className="text-sm font-medium">
              Gesture Status: <span className="font-bold">{gesture}</span>
            </p>
          </div>
        ) : (
          <div className="absolute bottom-4 left-4 bg-gray-900 bg-opacity-70 text-white px-6 py-3 rounded-lg shadow-md backdrop-blur-md">
            <p className="text-sm font-medium">Loading Model...</p>
          </div>
        )}
      </div>
      {/* Overlay Title */}
      <div className="absolute top-6 text-center">
        <h1 className="text-4xl font-extrabold text-white drop-shadow-md">
           Abhishek&apos;s Hand Gesture Recognition
        </h1>
        <p className="text-sm text-gray-300 mt-2">
          Using TensorFlow.js to detect hand gestures in real-time
        </p>
      </div>
      {/* Footer */}
      <div className="absolute bottom-4 right-4 text-gray-400 text-xs">
        Made with ♥ by Abhishek Rajan
      </div>
    </div>
  );
};

export default HandGesture;
