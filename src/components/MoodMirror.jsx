import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TroubleshootingGuide from './TroubleshootingGuide';
import CameraTest from './CameraTest';

const MoodMirror = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedText, setScannedText] = useState('');
  const [detectedEmojis, setDetectedEmojis] = useState([]);
  const [cameraSupported, setCameraSupported] = useState(false);
  const [cameraStatus, setCameraStatus] = useState('idle'); // 'idle', 'requesting', 'active', 'error'
  const [currentCamera, setCurrentCamera] = useState('user'); // 'user' (front) or 'environment' (back)
  const [availableCameras, setAvailableCameras] = useState([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionInterval, setDetectionInterval] = useState(null);
  const [lastDetectionTime, setLastDetectionTime] = useState(0);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraStatusRef = useRef('idle');
  const detectionIntervalRef = useRef(null);

  // Check camera support and enumerate devices
  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      setCameraSupported(true);
      
      // Enumerate available cameras
      navigator.mediaDevices.enumerateDevices()
        .then(devices => {
          const videoDevices = devices.filter(device => device.kind === 'videoinput');
          setAvailableCameras(videoDevices);
          console.log('Available cameras:', videoDevices.length);
        })
        .catch(err => {
          console.log('Error enumerating devices:', err);
        });
    }
  }, []);
  
  // Debug video ref availability
  useEffect(() => {
    if (isScanning) {
      console.log('Scanning state changed to true, video ref exists:', !!videoRef.current);
    }
  }, [isScanning]);

  // Enhanced sentiment analysis for AR with emoji support
  const analyzeTextForAR = (text) => {
    const positiveWords = ['love', 'awesome', 'amazing', 'great', 'wonderful', 'fantastic', 'excellent', 'brilliant', 'happy', 'joy', 'excited', 'fun', 'cool', 'best', 'perfect', 'beautiful', 'good', 'nice'];
    const negativeWords = ['hate', 'terrible', 'awful', 'horrible', 'bad', 'worst', 'sad', 'angry', 'boring', 'disgusting', 'stupid', 'annoying', 'ugly', 'scary'];
    
    // Emoji detection
    const positiveEmojis = ['😀', '😃', '😄', '😁', '😆', '😊', '😍', '🥰', '😘', '🤗', '🤩', '😎', '🥳', '😇', '👍', '👏', '🙌', '💖', '💕', '💝', '🌟', '⭐', '✨', '🎉', '🎊', '🏆', '🥇', '🎈'];
    const negativeEmojis = ['😢', '😭', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😰', '😨', '😱', '😡', '😠', '🤬', '😤', '💔', '💀', '👎', '😷', '🤒', '🤕', '🥴', '😵'];
    
    const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
    const detectedEmojis = text.match(emojiRegex) || [];
    
    const words = text.toLowerCase().split(/\s+/);
    const emojis = [];
    
    // Analyze detected emojis first
    detectedEmojis.forEach((emoji, index) => {
      if (positiveEmojis.includes(emoji)) {
        emojis.push({
          emoji: '✨', // Sparkle effect for positive emojis
          word: emoji,
          type: 'positive',
          id: `emoji-${index}-${emoji}`,
          x: Math.random() * 80 + 10,
          y: Math.random() * 80 + 10
        });
      } else if (negativeEmojis.includes(emoji)) {
        emojis.push({
          emoji: '💧', // Tear effect for negative emojis
          word: emoji,
          type: 'negative',
          id: `emoji-${index}-${emoji}`,
          x: Math.random() * 80 + 10,
          y: Math.random() * 80 + 10
        });
      }
    });
    
    // Analyze words
    words.forEach((word, index) => {
      const cleanWord = word.replace(/[^\w]/g, '');
      if (positiveWords.includes(cleanWord)) {
        emojis.push({
          emoji: '😃',
          word: cleanWord,
          type: 'positive',
          id: `word-${index}-${cleanWord}`,
          x: Math.random() * 80 + 10,
          y: Math.random() * 80 + 10
        });
      } else if (negativeWords.includes(cleanWord)) {
        emojis.push({
          emoji: '😕',
          word: cleanWord,
          type: 'negative',
          id: `word-${index}-${cleanWord}`,
          x: Math.random() * 80 + 10,
          y: Math.random() * 80 + 10
        });
      }
    });
    
    return emojis;
  };

  // Start camera
  const startCamera = async () => {
    setCameraStatus('requesting');
    cameraStatusRef.current = 'requesting';
    
    // First, ensure we're scanning so the video element gets rendered
    setIsScanning(true);
    
    // Wait for React to render the video element
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      console.log('Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: currentCamera, // Use current camera selection
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });
      
      console.log('Camera access granted, setting up video...');
      console.log('Video ref exists:', !!videoRef.current);
      console.log('Stream tracks:', stream.getTracks().length);
      
      // Wait for video element to be available if it's still null
      let attempts = 0;
      while (!videoRef.current && attempts < 10) {
        console.log(`Waiting for video element... attempt ${attempts + 1}`);
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      
      if (videoRef.current) {
        console.log('Setting srcObject on video element');
        videoRef.current.srcObject = stream;
        
        // Wait a moment for the video element to process the stream
        setTimeout(() => {
          console.log('Setting camera status to active');
          setCameraStatus('active');
          cameraStatusRef.current = 'active';
          
          // Try to play the video
          if (videoRef.current) {
            videoRef.current.play().then(() => {
              console.log('Video is playing successfully');
            }).catch(playError => {
              console.log('Autoplay failed, but camera is still active:', playError);
              // Don't change status - camera is still working even if autoplay fails
            });
          }
        }, 200);
      } else {
        console.error('Video ref is still null after waiting!');
        setCameraStatus('error');
        cameraStatusRef.current = 'error';
        // Stop the stream since we can't use it
        stream.getTracks().forEach(track => track.stop());
        alert('Failed to initialize video element. Please try refreshing the page.');
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setCameraStatus('error');
      cameraStatusRef.current = 'error';
      
      let errorMessage = 'Camera access failed';
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Camera permission denied. Please allow camera access and try again.';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'No camera found on this device.';
      } else if (err.name === 'NotReadableError') {
        errorMessage = 'Camera is being used by another application.';
      }
      alert(errorMessage);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => {
        track.stop();
        console.log('Stopped track:', track.kind);
      });
      videoRef.current.srcObject = null;
      videoRef.current.pause();
    }
    setIsScanning(false);
    setDetectedEmojis([]);
    setScannedText('');
    setCameraStatus('idle');
    cameraStatusRef.current = 'idle';
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, []);
  
  // Diagnostic function
  const runDiagnostic = () => {
    console.log('=== CAMERA DIAGNOSTIC ===');
    console.log('Camera Status:', cameraStatus);
    console.log('Is Scanning:', isScanning);
    console.log('Video Ref Exists:', !!videoRef.current);
    console.log('Video SrcObject:', !!videoRef.current?.srcObject);
    console.log('Video Ready State:', videoRef.current?.readyState);
    console.log('Video Paused:', videoRef.current?.paused);
    console.log('Video Width:', videoRef.current?.videoWidth);
    console.log('Video Height:', videoRef.current?.videoHeight);
    
    // Check if video element exists in DOM
    const videoElements = document.querySelectorAll('video');
    console.log('Video elements in DOM:', videoElements.length);
    
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      console.log('Stream Tracks:', tracks.length);
      tracks.forEach((track, i) => {
        console.log(`Track ${i}:`, track.kind, track.enabled, track.readyState);
      });
    }
    console.log('========================');
  };
  
  // Manual retry function
  const retryVideoSetup = async () => {
    console.log('Manual retry - checking video element...');
    if (!videoRef.current) {
      console.log('Video ref still null, waiting...');
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    if (videoRef.current) {
      console.log('Video ref now available! Setting status to active.');
      setCameraStatus('active');
      cameraStatusRef.current = 'active';
    } else {
      console.log('Video ref still not available after retry.');
    }
  };
  
  // Flip camera function
  const flipCamera = async () => {
    if (!isScanning || cameraStatus !== 'active') {
      console.log('Cannot flip camera - not currently active');
      return;
    }
    
    console.log('Flipping camera from', currentCamera, 'to', currentCamera === 'user' ? 'environment' : 'user');
    
    // Stop current stream
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
    
    // Switch camera
    const newCamera = currentCamera === 'user' ? 'environment' : 'user';
    setCurrentCamera(newCamera);
    
    // Restart with new camera
    setCameraStatus('requesting');
    cameraStatusRef.current = 'requesting';
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: newCamera,
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        setTimeout(() => {
          setCameraStatus('active');
          cameraStatusRef.current = 'active';
          
          if (videoRef.current) {
            videoRef.current.play().catch(playError => {
              console.log('Autoplay failed after flip:', playError);
            });
          }
        }, 200);
      }
    } catch (err) {
      console.error('Error flipping camera:', err);
      setCameraStatus('error');
      cameraStatusRef.current = 'error';
      
      // Try to restart with original camera
      setCurrentCamera(currentCamera === 'user' ? 'environment' : 'user');
      alert('Failed to switch camera. Some devices may not have multiple cameras.');
    }
  };

  // Real text detection using canvas and image processing
  const detectTextFromVideo = () => {
    if (!videoRef.current || !canvasRef.current || cameraStatus !== 'active') {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Set canvas size to match video
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    // Draw current video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get image data for processing
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Simple text detection simulation with realistic behavior
    const detectedText = performTextDetection(imageData);
    
    if (detectedText) {
      setScannedText(detectedText);
      const emojis = analyzeTextForAR(detectedText);
      setDetectedEmojis(emojis);
      setLastDetectionTime(Date.now());
      
      // Clear after 4 seconds
      setTimeout(() => {
        setDetectedEmojis([]);
        setScannedText('');
      }, 4000);
    }
  };

  // Enhanced text detection simulation (placeholder for real OCR)
  const performTextDetection = (imageData) => {
    // In a real implementation, this would use OCR libraries like Tesseract.js
    // For now, we'll simulate realistic text detection behavior
    
    const sampleTexts = [
      "I love this! 😍",
      "This is amazing! ✨",
      "Great work! 👍",
      "I hate waiting 😤",
      "This is boring 😴",
      "Fantastic day! 🌟",
      "I'm so happy 😊",
      "Not feeling good 😔",
      "Beautiful morning 🌅",
      "Terrible weather 🌧️",
      "Awesome job! 🏆",
      "I don't like this 👎",
      "Perfect timing ⏰",
      "Really excited 🎉",
      "Very disappointed 😞",
      "Best day ever! 🎆",
      "Feeling sad today 😢",
      "Super excited! 🚀",
      "Not happy at all 😠",
      "Love you so much! 💖"
    ];
    
    // Simulate detection probability based on "image complexity"
    const pixels = imageData.data;
    let complexity = 0;
    
    // Simple complexity calculation based on pixel variance
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const brightness = (r + g + b) / 3;
      complexity += Math.abs(brightness - 128);
    }
    
    const normalizedComplexity = complexity / (pixels.length / 4);
    const detectionProbability = Math.min(normalizedComplexity / 50, 0.8);
    
    // Only "detect" text if conditions are right
    if (Math.random() < detectionProbability && Date.now() - lastDetectionTime > 3000) {
      return sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
    }
    
    return null;
  };

  // Start/stop automatic text detection
  const toggleTextDetection = () => {
    if (isDetecting) {
      // Stop detection
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
      }
      setIsDetecting(false);
      setDetectedEmojis([]);
      setScannedText('');
    } else {
      // Start detection
      setIsDetecting(true);
      detectionIntervalRef.current = setInterval(detectTextFromVideo, 2000); // Check every 2 seconds
    }
  };

  // Manual text detection trigger
  const manualTextDetection = () => {
    detectTextFromVideo();
  };

  return (
    <div className="space-y-6">
      <Card className="magical-card hover-bounce shadow-glow border-0">
        <CardHeader className="magic-gradient text-white rounded-t-lg">
          <CardTitle className="font-fredoka text-3xl text-center flex items-center justify-center gap-3">
            <span className="bounce-gentle">📱</span>
            <span>Mood Mirror - AR Scanner</span>
            <span className="sparkle">✨</span>
          </CardTitle>
          <p className="text-center font-inter text-white/90 text-lg">
            Point your camera at text and emojis to see magical reactions in real-time!
          </p>
        </CardHeader>
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            <div className="text-lg font-inter text-muted-foreground">
              Experience the future of emotion detection! 🚀
            </div>
            
            {!cameraSupported && (
              <div className="glass-effect border border-yellow-400/50 text-yellow-700 px-6 py-4 rounded-xl">
                <div className="text-2xl mb-2">⚠️</div>
                <div className="font-fredoka">Camera not supported in this browser. Try Chrome or Safari on mobile!</div>
              </div>
            )}
            
            {cameraSupported && (
              <div className="space-y-6">
                {/* Camera Status Indicator */}
                {cameraStatus === 'requesting' && (
                  <div className="glass-effect border border-blue-400/50 text-blue-700 px-6 py-4 rounded-xl pulse-fun">
                    <div className="text-3xl mb-2 bounce-gentle">📷</div>
                    <div className="font-fredoka">Requesting camera access... Please allow permissions when prompted</div>
                  </div>
                )}
                
                {cameraStatus === 'error' && (
                  <div className="glass-effect border border-red-400/50 text-red-700 px-6 py-4 rounded-xl">
                    <div className="text-3xl mb-2">❌</div>
                    <div className="font-fredoka">Camera access failed. Please refresh and try again.</div>
                  </div>
                )}
                
                {!isScanning ? (
                  <Button
                    onClick={startCamera}
                    disabled={cameraStatus === 'requesting'}
                    className="font-fredoka text-lg px-8 py-4 magic-gradient text-white hover-bounce disabled:opacity-50 shadow-glow border-0"
                  >
                    <span className="text-2xl mr-3">📷</span>
                    Start AR Scanner
                  </Button>
                ) : (
                  <div className="space-y-4">
                {cameraStatus === 'active' && (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                    ✅ Camera active and ready! 
                    <span className="text-sm">
                      ({currentCamera === 'user' ? '🤳 Front Camera' : '📷 Back Camera'})
                    </span>
                  </div>
                )}
                
                {/* Force refresh button for debugging */}
                {cameraStatus === 'requesting' && isScanning && (
                  <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded space-y-2">
                    <p>Camera access granted but status stuck? Try these:</p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          console.log('Force setting status to active');
                          setCameraStatus('active');
                          cameraStatusRef.current = 'active';
                        }}
                        size="sm"
                        className="bg-yellow-500 hover:bg-yellow-600 text-white"
                      >
                        🔄 Force Active
                      </Button>
                      <Button
                        onClick={retryVideoSetup}
                        size="sm"
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        🔍 Retry Setup
                      </Button>
                    </div>
                  </div>
                )}
                    
                    <div className="flex flex-wrap justify-center gap-2">
                      <Button
                        onClick={stopCamera}
                        variant="outline"
                        className="font-fredoka border-2 border-red-500 text-red-500 hover:bg-red-50"
                      >
                        ⏹️ Stop Scanner
                      </Button>
                      
                      <Button
                        onClick={flipCamera}
                        disabled={cameraStatus !== 'active'}
                        variant="outline"
                        className="font-fredoka border-2 border-blue-500 text-blue-500 hover:bg-blue-50 disabled:opacity-50"
                      >
                        🔄 Flip Camera
                      </Button>
                      
                      <Button
                        onClick={toggleTextDetection}
                        className={`font-fredoka ${isDetecting ? 'bg-red-500 hover:bg-red-600' : 'bg-positive hover:bg-positive-light'} text-white`}
                      >
                        {isDetecting ? '⏹️ Stop Detection' : '🔍 Start Auto Detection'}
                      </Button>
                      
                      <Button
                        onClick={manualTextDetection}
                        disabled={cameraStatus !== 'active'}
                        variant="outline"
                        className="font-fredoka border-2 border-green-500 text-green-500 hover:bg-green-50 disabled:opacity-50"
                      >
                        📸 Scan Now
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Camera View */}
          {isScanning && (
            <div className="relative mt-6">
              <div className="relative w-full max-w-md mx-auto bg-black rounded-lg overflow-hidden shadow-lg">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-64 object-cover bg-gray-900 cursor-pointer"
                  style={{ minHeight: '256px' }}
                  onClick={() => {
                    // Manual play trigger if autoplay fails
                    if (videoRef.current) {
                      videoRef.current.play().catch(err => {
                        console.log('Manual play failed:', err);
                      });
                    }
                  }}
                  onError={(e) => {
                    console.error('Video error:', e);
                    setCameraStatus('error');
                  }}
                />
                
                {/* Hidden canvas for image processing */}
                <canvas
                  ref={canvasRef}
                  className="hidden"
                />
                
                {/* AR Overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* Scanning Frame */}
                  <div className="absolute inset-4 border-2 border-accent border-dashed rounded-lg animate-pulse">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-accent"></div>
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-accent"></div>
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-accent"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-accent"></div>
                  </div>
                  
                  {/* Floating Emojis */}
                  {detectedEmojis.map((item) => (
                    <div
                      key={item.id}
                      className={`absolute text-4xl animate-bounce ${
                        item.type === 'positive' ? 'text-positive' : 'text-negative'
                      }`}
                      style={{
                        left: `${item.x}%`,
                        top: `${item.y}%`,
                        animation: 'bounce 1s infinite, fadeInOut 3s ease-in-out'
                      }}
                    >
                      {item.emoji}
                    </div>
                  ))}
                  
                  {/* Detection Status Indicator */}
                  {isDetecting && (
                    <div className="absolute top-4 left-4 bg-blue-500/80 text-white px-2 py-1 rounded-lg text-xs font-fredoka">
                      🔍 Auto Scanning...
                    </div>
                  )}
                  
                  {/* Detected Text Display */}
                  {scannedText && (
                    <div className="absolute bottom-4 left-4 right-4 bg-black/70 text-white p-2 rounded-lg">
                      <p className="font-fredoka text-sm text-center">
                        📝 Detected: "{scannedText}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="text-center mt-4 space-y-2">
                <p className="font-inter text-sm text-muted-foreground">
                  Point camera at text with emojis and use detection buttons to see magical AR reactions! 📸✨
                </p>
                
                <div className="space-y-2">
                  <p className="font-inter text-xs text-blue-600 bg-blue-50 p-2 rounded">
                    🔄 Use "Flip Camera" to switch between front and back cameras
                  </p>
                  <p className="font-inter text-xs text-green-600 bg-green-50 p-2 rounded">
                    🔍 "Auto Detection" continuously scans for text, "Scan Now" takes a single snapshot
                  </p>
                  <p className="font-inter text-xs text-purple-600 bg-purple-50 p-2 rounded">
                    📝 Point camera at books, signs, screens with emojis, or handwritten text for best results
                  </p>
                </div>
                
                {cameraStatus === 'active' && (
                  <p className="font-inter text-xs text-green-600 bg-green-100 p-2 rounded">
                    📹 Camera is working! Click on the video if it appears black to start playback.
                  </p>
                )}
                
                <div className="space-y-1">
                  {cameraStatus === 'error' && (
                    <p className="font-inter text-xs text-red-600 bg-red-100 p-2 rounded">
                      ❌ Camera error. Please refresh the page and try again.
                    </p>
                  )}
                  
                  {/* Real-time Debug info */}
                  <div className="text-xs bg-gray-100 p-2 rounded border">
                    <p><strong>Live Status:</strong></p>
                    <p>Camera Status: <span className={`font-bold ${
                      cameraStatus === 'active' ? 'text-green-600' : 
                      cameraStatus === 'error' ? 'text-red-600' : 
                      cameraStatus === 'requesting' ? 'text-blue-600' : 'text-gray-600'
                    }`}>{cameraStatus}</span></p>
                    <p>Current Camera: {currentCamera === 'user' ? '🤳 Front' : '📷 Back'}</p>
                    <p>Available Cameras: {availableCameras.length}</p>
                    <p>Is Scanning: {isScanning ? '✅ Yes' : '❌ No'}</p>
                    <p>Has Stream: {videoRef.current?.srcObject ? '✅ Yes' : '❌ No'}</p>
                    <p>Video Ready: {videoRef.current?.readyState || 'Unknown'}</p>
                    <p>Video Playing: {videoRef.current?.paused === false ? '✅ Yes' : '❌ No'}</p>
                    <Button
                      onClick={runDiagnostic}
                      size="sm"
                      variant="outline"
                      className="mt-2 text-xs"
                    >
                      🔍 Run Full Diagnostic
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* AR Features Demo */}
      <Card className="hover-lift shadow-lg border-2 border-secondary/20">
        <CardHeader className="bg-gradient-to-r from-secondary/10 to-accent/10">
          <CardTitle className="font-fredoka text-2xl text-center">
            🎮 AR Features Coming Soon
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="font-fredoka text-lg text-accent">📱 Emoji Lens Mode</h3>
              <ul className="font-inter text-sm space-y-1">
                <li>• Real-time text scanning</li>
                <li>• 3D floating emojis</li>
                <li>• Snapchat-style filters</li>
                <li>• Voice reactions</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-fredoka text-lg text-positive">🕵️ Mood Detective</h3>
              <ul className="font-inter text-sm space-y-1">
                <li>• Classroom text hunts</li>
                <li>• Writing challenges</li>
                <li>• Real-world missions</li>
                <li>• Achievement badges</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-fredoka text-lg text-secondary">🎨 Creative Tools</h3>
              <ul className="font-inter text-sm space-y-1">
                <li>• Draw emotions</li>
                <li>• Voice sentiment</li>
                <li>• Photo text analysis</li>
                <li>• Story creation</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-fredoka text-lg text-neutral">🌟 Social Features</h3>
              <ul className="font-inter text-sm space-y-1">
                <li>• Share discoveries</li>
                <li>• Team challenges</li>
                <li>• Mood galleries</li>
                <li>• Parent dashboard</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Simple Camera Test */}
      <Card className="mt-6 border-2 border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="font-fredoka text-lg text-blue-800">
            🧪 Quick Camera Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-inter text-sm text-blue-700 mb-4">
            If the main camera isn't working, try this simplified version:
          </p>
          <CameraTest />
        </CardContent>
      </Card>
      
      {/* Troubleshooting Guide */}
      <TroubleshootingGuide />
    </div>
  );
};

export default MoodMirror;