import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TroubleshootingGuide from './TroubleshootingGuide';

const VoiceDetective = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [sentiment, setSentiment] = useState(null);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionStats, setSessionStats] = useState({ totalWords: 0, positiveCount: 0, negativeCount: 0 });
  const recognitionRef = useRef(null);

  // Check speech recognition support
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setVoiceSupported(true);
      
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;
        const confidenceScore = event.results[current][0].confidence;
        
        setTranscript(transcriptText);
        setConfidence(confidenceScore || 0.8);
        
        if (event.results[current].isFinal) {
          setIsProcessing(true);
          setTimeout(() => {
            analyzeSpeechSentiment(transcriptText);
            setIsProcessing(false);
          }, 500); // Add small delay for better UX
        }
      };
      
      recognitionRef.current.onend = () => {
        console.log('Speech recognition ended');
        setIsListening(false);
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        let errorMessage = 'Speech recognition error';
        switch(event.error) {
          case 'not-allowed':
            errorMessage = 'Microphone permission denied. Please allow microphone access and try again.';
            break;
          case 'no-speech':
            errorMessage = 'No speech detected. Please try speaking again.';
            break;
          case 'network':
            errorMessage = 'Network error. Please check your connection.';
            break;
          default:
            errorMessage = `Speech recognition error: ${event.error}`;
        }
        alert(errorMessage);
      };
      
      recognitionRef.current.onstart = () => {
        console.log('Speech recognition started');
        setIsListening(true);
      };
    }
  }, []);

  // Enhanced sentiment analysis for speech
  const analyzeSpeechSentiment = (text) => {
    const positiveWords = [
      'love', 'awesome', 'amazing', 'great', 'wonderful', 'fantastic', 'excellent', 'brilliant',
      'happy', 'joy', 'excited', 'fun', 'cool', 'best', 'perfect', 'beautiful', 'good', 'nice',
      'like', 'enjoy', 'favorite', 'super', 'incredible', 'outstanding', 'fabulous', 'delightful'
    ];
    
    const negativeWords = [
      'hate', 'terrible', 'awful', 'horrible', 'bad', 'worst', 'sad', 'angry', 'boring',
      'disgusting', 'stupid', 'annoying', 'ugly', 'scary', 'difficult', 'hard', 'disappointing',
      'frustrating', 'mad', 'upset', 'mean', 'cruel', 'unhappy', 'miserable', 'depressed'
    ];
    
    const negationWords = [
      'not', 'no', 'never', 'nothing', 'nobody', 'nowhere', 'neither', 'nor',
      'barely', 'hardly', 'scarcely', 'seldom', 'rarely', 'without',
      'cannot', 'cant', 'wont', 'dont', 'doesnt', 'didnt', 'isnt', 'arent', 'wasnt', 'werent'
    ];
    
    const words = text.toLowerCase().split(/\s+/);
    let positiveScore = 0;
    let negativeScore = 0;
    let positiveCount = 0;
    let negativeCount = 0;
    
    // Process each word with negation context
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const cleanWord = word.replace(/[^\w]/g, '');
      
      // Check for negation in previous 2 words
      let isNegated = false;
      for (let j = Math.max(0, i - 2); j < i; j++) {
        const prevWord = words[j].replace(/[^\w]/g, '');
        if (negationWords.includes(prevWord)) {
          isNegated = true;
          break;
        }
      }
      
      if (positiveWords.includes(cleanWord)) {
        if (isNegated) {
          negativeScore += 1;
          negativeCount++;
        } else {
          positiveScore += 1;
          positiveCount++;
        }
      } else if (negativeWords.includes(cleanWord)) {
        if (isNegated) {
          positiveScore += 1;
          positiveCount++;
        } else {
          negativeScore += 1;
          negativeCount++;
        }
      }
    }
    
    const score = positiveScore - negativeScore;
    let sentimentResult;
    let emoji;
    let color;
    
    if (score > 1) {
      sentimentResult = 'positive';
      emoji = '😀';
      color = 'text-positive';
    } else if (score < -1) {
      sentimentResult = 'negative';
      emoji = '😢';
      color = 'text-negative';
    } else if (score > 0) {
      sentimentResult = 'slightly positive';
      emoji = '🙂';
      color = 'text-positive';
    } else if (score < 0) {
      sentimentResult = 'slightly negative';
      emoji = '😕';
      color = 'text-negative';
    } else {
      sentimentResult = 'neutral';
      emoji = '😐';
      color = 'text-neutral';
    }
    
    setSentiment({
      type: sentimentResult,
      emoji,
      color,
      score: Math.round(score * 10) / 10,
      positiveCount,
      negativeCount,
      positiveScore: Math.round(positiveScore * 10) / 10,
      negativeScore: Math.round(negativeScore * 10) / 10
    });
    
    // Update session stats
    setSessionStats(prev => ({
      totalWords: prev.totalWords + words.length,
      positiveCount: prev.positiveCount + positiveCount,
      negativeCount: prev.negativeCount + negativeCount
    }));
  };

  // Start listening
  const startListening = () => {
    if (recognitionRef.current && voiceSupported) {
      setTranscript('');
      setSentiment(null);
      setConfidence(0);
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        setIsListening(false);
        alert('Could not start speech recognition. Please try again.');
      }
    }
  };

  // Stop listening
  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
        console.log('Speech recognition stopped manually');
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
    }
    setIsListening(false);
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening]);

  // Clear results
  const clearResults = () => {
    setTranscript('');
    setSentiment(null);
    setConfidence(0);
    setIsProcessing(false);
  };
  
  // Reset session stats
  const resetStats = () => {
    setSessionStats({ totalWords: 0, positiveCount: 0, negativeCount: 0 });
  };

  return (
    <div className="space-y-6">
      <Card className="magical-card hover-bounce shadow-glow border-0">
        <CardHeader className="magic-gradient text-white rounded-t-lg">
          <CardTitle className="font-fredoka text-3xl text-center flex items-center justify-center gap-3">
            <span className="bounce-gentle">🎤</span>
            <span>Voice Detective</span>
            <span className="sparkle">🔊</span>
          </CardTitle>
          <p className="text-center font-inter text-white/90 text-lg">
            Speak your feelings and watch the AI detect emotions in real-time!
          </p>
        </CardHeader>
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            <div className="text-lg font-inter text-muted-foreground">
              Your voice carries emotions - let's discover them together! 🌟
            </div>
            
            {!voiceSupported && (
              <div className="glass-effect border border-yellow-400/50 text-yellow-700 px-6 py-4 rounded-xl">
                <div className="text-2xl mb-2">⚠️</div>
                <div className="font-fredoka">Speech recognition not supported in this browser. Try Chrome or Safari!</div>
              </div>
            )}
            
            {voiceSupported && (
              <div className="space-y-6">
                {/* Microphone Visualization */}
                <div className="relative">
                  <div className={`w-32 h-32 mx-auto rounded-full border-4 flex items-center justify-center text-5xl transition-all duration-500 ${
                    isListening 
                      ? 'border-accent bg-gradient-to-br from-accent/20 to-primary/20 shadow-glow animate-pulse hover-bounce' 
                      : 'border-muted bg-muted/10 hover-lift'
                  }`}>
                    🎤
                  </div>
                  
                  {isListening && (
                    <>
                      <div className="absolute inset-0 rounded-full border-4 border-accent animate-ping opacity-60"></div>
                      <div className="absolute inset-2 rounded-full border-2 border-primary animate-ping opacity-40 animation-delay-300"></div>
                    </>
                  )}
                </div>
                
                {/* Control Buttons */}
                <div className="flex justify-center gap-4">
                  {!isListening ? (
                    <Button
                      onClick={startListening}
                      className="font-fredoka text-lg px-8 py-4 magic-gradient text-white hover-bounce shadow-glow border-0"
                    >
                      <span className="text-2xl mr-3">🎤</span>
                      Start Listening
                    </Button>
                  ) : (
                    <Button
                      onClick={stopListening}
                      variant="outline"
                      className="font-fredoka text-lg px-8 py-4 border-2 border-red-400 text-red-600 hover:bg-red-50 hover-bounce"
                    >
                      <span className="text-2xl mr-3">⏹️</span>
                      Stop Listening
                    </Button>
                  )}
                  
                  {(transcript || sentiment) && (
                    <Button
                      onClick={clearResults}
                      variant="outline"
                      className="font-fredoka text-lg px-6 py-4 border-2 hover-lift"
                    >
                      <span className="text-xl mr-2">🗑️</span>
                      Clear
                    </Button>
                  )}
                </div>
                
                {/* Status */}
                {isListening && (
                  <div className="text-accent font-fredoka text-xl pulse-fun">
                    <span className="text-2xl mr-2">🎧</span>
                    Listening... Speak now!
                  </div>
                )}
                
                {isProcessing && (
                  <div className="text-blue-600 font-fredoka text-xl pulse-fun">
                    <span className="text-2xl mr-2">🧠</span>
                    Processing your speech...
                  </div>
                )}
              </div>
            )}
          </div>
          {/* Transcript Display */}
          {transcript && (
            <Card className="mt-8 magical-card hover-lift border-0">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <h3 className="font-fredoka text-2xl text-center flex items-center justify-center gap-2">
                    <span className="bounce-gentle">📝</span>
                    What you said:
                  </h3>
                  <p className="font-inter text-xl bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl border-2 border-primary/20 shadow-inner">
                    <span className="text-2xl mr-2">💬</span>
                    "{transcript}"
                  </p>
                  {confidence > 0 && (
                    <p className="text-center text-muted-foreground font-fredoka">
                      <span className="text-lg mr-1">🎯</span>
                      Confidence: {Math.round(confidence * 100)}%
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Sentiment Result */}
          {sentiment && (
            <Card className="mt-8 magical-card hover-bounce border-0">
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  <div className="text-8xl bounce-gentle">
                    {sentiment.emoji}
                  </div>
                  
                  <div className={`text-4xl font-fredoka font-bold ${sentiment.color} text-shimmer`}>
                    {sentiment.type.toUpperCase()}!
                  </div>
                  
                  <div className="grid grid-cols-3 gap-6 text-center">
                    <div className="bg-gradient-to-br from-positive-bg to-green-100 p-6 rounded-xl hover-sparkle shadow-lg">
                      <div className="text-4xl font-fredoka text-positive mb-2">
                        {sentiment.positiveCount}
                      </div>
                      <div className="text-sm font-inter text-positive">Happy Words</div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-neutral-bg to-gray-100 p-6 rounded-xl hover-sparkle shadow-lg">
                      <div className="text-4xl font-fredoka text-neutral mb-2">
                        {sentiment.score}
                      </div>
                      <div className="text-sm font-inter text-neutral">Emotion Score</div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-negative-bg to-red-100 p-6 rounded-xl hover-sparkle shadow-lg">
                      <div className="text-4xl font-fredoka text-negative mb-2">
                        {sentiment.negativeCount}
                      </div>
                      <div className="text-sm font-inter text-negative">Sad Words</div>
                    </div>
                  </div>
                  
                  {/* Encouraging Messages */}
                  <div className="mt-6 p-6 rounded-xl glass-effect">
                    {sentiment.type === 'positive' && (
                      <p className="font-fredoka text-positive text-xl">
                        <span className="text-2xl mr-2">🌟</span>
                        Wow! Your words are full of happiness and joy!
                      </p>
                    )}
                    {sentiment.type === 'negative' && (
                      <p className="font-fredoka text-negative text-xl">
                        <span className="text-2xl mr-2">💙</span>
                        I hear some sadness. Want to try saying something happy?
                      </p>
                    )}
                    {sentiment.type === 'neutral' && (
                      <p className="font-fredoka text-neutral text-xl">
                        <span className="text-2xl mr-2">😊</span>
                        Your words are perfectly balanced and calm!
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
      
      {/* Session Statistics */}
      {(sessionStats.totalWords > 0) && (
        <Card className="hover-lift shadow-lg border-2 border-accent/20">
          <CardHeader className="bg-gradient-to-r from-accent/10 to-secondary/10">
            <CardTitle className="font-fredoka text-xl text-center">
              📊 Your Voice Session Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-3xl font-fredoka text-blue-600">{sessionStats.totalWords}</div>
                <div className="text-sm font-inter">Total Words</div>
              </div>
              <div className="bg-positive-bg p-4 rounded-lg">
                <div className="text-3xl font-fredoka text-positive">{sessionStats.positiveCount}</div>
                <div className="text-sm font-inter">Happy Words</div>
              </div>
              <div className="bg-negative-bg p-4 rounded-lg">
                <div className="text-3xl font-fredoka text-negative">{sessionStats.negativeCount}</div>
                <div className="text-sm font-inter">Sad Words</div>
              </div>
            </div>
            <div className="text-center mt-4">
              <Button
                onClick={resetStats}
                variant="outline"
                className="font-fredoka border-2"
              >
                🔄 Reset Stats
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Voice Challenges */}
      <Card className="hover-lift shadow-lg border-2 border-secondary/20">
        <CardHeader className="bg-gradient-to-r from-secondary/10 to-positive/10">
          <CardTitle className="font-fredoka text-2xl text-center">
            🎯 Voice Challenges
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="font-fredoka text-lg text-positive">😃 Happy Challenges</h3>
              <ul className="font-inter text-sm space-y-2">
                <li className="bg-positive-bg p-2 rounded">• Say 3 things you love</li>
                <li className="bg-positive-bg p-2 rounded">• Describe your best day</li>
                <li className="bg-positive-bg p-2 rounded">• Tell a funny joke</li>
                <li className="bg-positive-bg p-2 rounded">• Share a compliment</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-fredoka text-lg text-accent">🎭 Acting Challenges</h3>
              <ul className="font-inter text-sm space-y-2">
                <li className="bg-accent-bg p-2 rounded">• Speak like a robot</li>
                <li className="bg-accent-bg p-2 rounded">• Use only positive words</li>
                <li className="bg-accent-bg p-2 rounded">• Rhyme your feelings</li>
                <li className="bg-accent-bg p-2 rounded">• Whisper vs. shout</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <p className="font-inter text-muted-foreground">
              Try these challenges and see how the AI detects different emotions in your voice!
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Troubleshooting Guide */}
      <TroubleshootingGuide />
    </div>
  );
};

export default VoiceDetective;