import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const CameraTest = () => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState('idle');
  const [currentCamera, setCurrentCamera] = useState('user');
  const videoRef = useRef(null);

  const startCamera = async () => {
    setStatus('requesting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: currentCamera }
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
  
  const flipCamera = async () => {
    if (!isActive) return;
    
    // Stop current stream
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
    
    // Switch camera
    const newCamera = currentCamera === 'user' ? 'environment' : 'user';
    setCurrentCamera(newCamera);
    
    // Restart with new camera
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: newCamera }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(err => {
          console.log('Autoplay blocked after flip');
        });
      }
    } catch (err) {
      alert('Failed to switch camera: ' + err.message);
      // Revert camera setting
      setCurrentCamera(currentCamera);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>🧪 Simple Camera Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center space-y-2">
          <p className="text-sm">Status: <strong>{status}</strong></p>
          <p className="text-xs">Camera: {currentCamera === 'user' ? '🤳 Front' : '📷 Back'}</p>
          
          <div className="flex gap-2 justify-center">
            {!isActive ? (
              <Button onClick={startCamera} disabled={status === 'requesting'}>
                Start Camera
              </Button>
            ) : (
              <>
                <Button onClick={stopCamera} variant="outline">
                  Stop Camera
                </Button>
                <Button onClick={flipCamera} variant="outline">
                  🔄 Flip
                </Button>
              </>
            )}
          </div>
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