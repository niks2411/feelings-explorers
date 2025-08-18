import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TroubleshootingGuide = () => {
  return (
    <Card className="mt-6 border-2 border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="font-fredoka text-lg text-yellow-800 flex items-center gap-2">
          🛠️ Troubleshooting Guide
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="bg-white p-3 rounded-lg border border-yellow-200">
            <h4 className="font-fredoka font-semibold text-yellow-800 mb-2">📷 Camera Issues:</h4>
            <ul className="font-inter text-sm space-y-1 text-yellow-700">
              <li>• Make sure to click "Allow" when browser asks for camera permission</li>
              <li>• If camera appears black, refresh the page and try again</li>
              <li>• Check if another app is using your camera</li>
              <li>• Try using Chrome or Safari for best compatibility</li>
            </ul>
          </div>
          
          <div className="bg-white p-3 rounded-lg border border-yellow-200">
            <h4 className="font-fredoka font-semibold text-yellow-800 mb-2">🎤 Microphone Issues:</h4>
            <ul className="font-inter text-sm space-y-1 text-yellow-700">
              <li>• Click "Allow" when browser asks for microphone permission</li>
              <li>• Speak clearly and close to your device</li>
              <li>• Check if microphone is muted in system settings</li>
              <li>• Try refreshing the page if voice detection stops working</li>
            </ul>
          </div>
          
          <div className="bg-white p-3 rounded-lg border border-yellow-200">
            <h4 className="font-fredoka font-semibold text-yellow-800 mb-2">🌐 Browser Compatibility:</h4>
            <ul className="font-inter text-sm space-y-1 text-yellow-700">
              <li>• ✅ Chrome (recommended)</li>
              <li>• ✅ Safari (iOS/macOS)</li>
              <li>• ✅ Edge</li>
              <li>• ⚠️ Firefox (limited support)</li>
            </ul>
          </div>
          
          <div className="bg-white p-3 rounded-lg border border-yellow-200">
            <h4 className="font-fredoka font-semibold text-yellow-800 mb-2">📱 Mobile Tips:</h4>
            <ul className="font-inter text-sm space-y-1 text-yellow-700">
              <li>• Use landscape mode for better camera view</li>
              <li>• Ensure good lighting for text detection</li>
              <li>• Hold device steady when scanning</li>
              <li>• Close other apps to free up camera/microphone</li>
            </ul>
          </div>
        </div>
        
        <div className="text-center pt-2">
          <p className="font-inter text-xs text-yellow-600">
            💡 Still having issues? Try refreshing the page or restarting your browser!
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TroubleshootingGuide;