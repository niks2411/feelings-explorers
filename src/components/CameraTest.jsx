import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const CameraTest = () => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState('idle');
  const videoRef = useRef(null);

  const startCamera = async () => {
    setStatus('requesting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsActive(true);
        setStatus('active');
        
        // Try to play
        videoRef.current.play().catch(err => {
          console.log('Autoplay blocked, but camera is working');
        });
      }
    } catch (err) {
      setStatus('error');
      alert('Camera access failed: ' + err.message);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
    setStatus('idle');
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>🧪 Simple Camera Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-sm mb-4">Status: <strong>{status}</strong></p>
          
          {!isActive ? (
            <Button onClick={startCamera} disabled={status === 'requesting'}>
              Start Camera
            </Button>
          ) : (
            <Button onClick={stopCamera} variant="outline">
              Stop Camera
            </Button>
          )}
        </div>
        
        {isActive && (
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-48 bg-black rounded"
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.play();
                }
              }}
            />
            <p className="text-xs text-center mt-2 text-gray-600">
              Click video if it appears black
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CameraTest;