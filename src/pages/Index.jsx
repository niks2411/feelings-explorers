import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import MoodMirror from '@/components/MoodMirror';
import VoiceDetective from '@/components/VoiceDetective';

// Enhanced sentiment analysis logic
const positiveWords = [
  'love', 'awesome', 'amazing', 'great', 'wonderful', 'fantastic', 'excellent', 'brilliant',
  'happy', 'joy', 'excited', 'fun', 'cool', 'best', 'perfect', 'beautiful', 'good', 'nice',
  'like', 'enjoy', 'favorite', 'super', 'incredible', 'outstanding', 'fabulous', 'delightful',
  'smile', 'laugh', 'succeed', 'win', 'celebrate', 'proud', 'cheerful', 'sunny', 'pleased',
  'thrilled', 'elated', 'content', 'satisfied', 'grateful', 'blessed', 'lucky', 'fortunate'
];

const negativeWords = [
  'hate', 'terrible', 'awful', 'horrible', 'bad', 'worst', 'sad', 'angry', 'boring',
  'disgusting', 'stupid', 'annoying', 'ugly', 'scary', 'difficult', 'hard', 'disappointing',
  'frustrating', 'mad', 'upset', 'mean', 'cruel', 'yuck', 'gross', 'nasty', 'evil',
  'cry', 'fail', 'lose', 'broken', 'hurt', 'sick', 'tired', 'worried', 'unhappy',
  'miserable', 'depressed', 'anxious', 'stressed', 'furious', 'devastated', 'heartbroken'
];

// Negation words that flip sentiment
const negationWords = [
  'not', 'no', 'never', 'nothing', 'nobody', 'nowhere', 'neither', 'nor',
  'barely', 'hardly', 'scarcely', 'seldom', 'rarely', 'without', 'lack',
  'cannot', 'cant', 'wont', 'dont', 'doesnt', 'didnt', 'isnt', 'arent', 'wasnt', 'werent'
];

// Intensity modifiers
const intensifiers = {
  'very': 2,
  'extremely': 3,
  'really': 2,
  'super': 2,
  'incredibly': 3,
  'absolutely': 3,
  'totally': 2,
  'completely': 3,
  'quite': 1.5,
  'rather': 1.5,
  'somewhat': 0.5,
  'slightly': 0.3,
  'a bit': 0.3,
  'kind of': 0.5,
  'sort of': 0.5
};

const analyzeSentiment = (text) => {
  const words = text.toLowerCase().split(/\s+/);
  let positiveScore = 0;
  let negativeScore = 0;
  let positiveCount = 0;
  let negativeCount = 0;
  
  const highlightedWords = [];
  
  // Process each word with context
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const cleanWord = word.replace(/[^\w]/g, '');
    
    // Check for negation in the previous 2 words
    let isNegated = false;
    for (let j = Math.max(0, i - 2); j < i; j++) {
      const prevWord = words[j].replace(/[^\w]/g, '');
      if (negationWords.includes(prevWord)) {
        isNegated = true;
        break;
      }
    }
    
    // Check for intensity modifiers in the previous word
    let intensity = 1;
    if (i > 0) {
      const prevWord = words[i - 1].replace(/[^\w]/g, '');
      if (intensifiers[prevWord]) {
        intensity = intensifiers[prevWord];
      }
    }
    
    // Analyze sentiment
    if (positiveWords.includes(cleanWord)) {
      const score = intensity * (isNegated ? -1 : 1);
      if (isNegated) {
        negativeScore += Math.abs(score);
        negativeCount++;
        highlightedWords.push({word: cleanWord, type: 'negative', reason: 'negated positive'});
      } else {
        positiveScore += score;
        positiveCount++;
        highlightedWords.push({word: cleanWord, type: 'positive', intensity});
      }
    } else if (negativeWords.includes(cleanWord)) {
      const score = intensity * (isNegated ? -1 : 1);
      if (isNegated) {
        positiveScore += Math.abs(score);
        positiveCount++;
        highlightedWords.push({word: cleanWord, type: 'positive', reason: 'negated negative'});
      } else {
        negativeScore += score;
        negativeCount++;
        highlightedWords.push({word: cleanWord, type: 'negative', intensity});
      }
    }
    
    // Highlight negation words
    if (negationWords.includes(cleanWord)) {
      highlightedWords.push({word: cleanWord, type: 'negation'});
    }
  }
  
  const score = positiveScore - negativeScore;
  let sentiment;
  let emoji;
  let confidence;
  
  // More nuanced sentiment classification
  if (score > 1) {
    sentiment = 'positive';
    emoji = '😀';
    confidence = Math.min(95, 60 + (score * 10));
  } else if (score < -1) {
    sentiment = 'negative';
    emoji = '😢';
    confidence = Math.min(95, 60 + (Math.abs(score) * 10));
  } else if (score > 0) {
    sentiment = 'slightly positive';
    emoji = '🙂';
    confidence = 55;
  } else if (score < 0) {
    sentiment = 'slightly negative';
    emoji = '😕';
    confidence = 55;
  } else {
    sentiment = 'neutral';
    emoji = '😐';
    confidence = 50;
  }
  
  return {
    sentiment,
    emoji,
    score: Math.round(score * 10) / 10,
    positiveCount,
    negativeCount,
    positiveScore: Math.round(positiveScore * 10) / 10,
    negativeScore: Math.round(negativeScore * 10) / 10,
    confidence: Math.round(confidence),
    highlightedWords
  };
};

const examples = [
  "I love playing video games!",
  "I hate doing homework.",
  "The weather is okay today.",
  "This pizza is absolutely amazing!",
  "That movie was terrible and boring.",
  "I went to the store yesterday.",
  "My best friend is awesome!",
  "This test is really difficult.",
  "I'm excited for summer vacation!",
  "The book was interesting.",
  "I am not happy today.",
  "I don't like this at all.",
  "This is not bad actually.",
  "I'm not feeling great."
];

const quizQuestions = [
  {
    text: "I absolutely love chocolate ice cream!",
    correct: "positive"
  },
  {
    text: "This homework is really boring and stupid.",
    correct: "negative"
  },
  {
    text: "I walked to school this morning.",
    correct: "neutral"
  }
];

// Mini-game data
const guessEmotionSentences = [
  { text: "I can't wait for my birthday party!", correct: "😀", options: ["😀", "😡", "😐"] },
  { text: "I lost my favorite toy and I'm crying.", correct: "😢", options: ["😀", "😢", "😐"] },
  { text: "The grass is green in summer.", correct: "😐", options: ["😀", "😡", "😐"] },
  { text: "This ice cream tastes amazing!", correct: "😀", options: ["😀", "😡", "😐"] },
  { text: "I hate when people are mean to me.", correct: "😡", options: ["😀", "😡", "😐"] }
];

const fixSentencePrompts = [
  {
    sad: "I hate rainy days.",
    happyOptions: ["I love rainy days!", "I enjoy rainy days.", "Rainy days are cozy!"],
    correct: 0
  },
  {
    sad: "This food is terrible.",
    happyOptions: ["This food is delicious!", "This food is amazing!", "This food is okay."],
    correct: 0
  },
  {
    sad: "School is so boring.",
    happyOptions: ["School is exciting!", "School is fun!", "School is alright."],
    correct: 0
  }
];

const Index = () => {
  const [inputText, setInputText] = useState('');
  const [showWordHighlight, setShowWordHighlight] = useState(false);
  const [currentSection, setCurrentSection] = useState('playground');
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showQuizResults, setShowQuizResults] = useState(false);
  const [userScore, setUserScore] = useState(0);
  const [totalAnalyses, setTotalAnalyses] = useState(0);
  const [streakCount, setStreakCount] = useState(0);
  const [lastAnalysisCorrect, setLastAnalysisCorrect] = useState(null);
  
  // Mini-games state
  const [currentGameType, setCurrentGameType] = useState('guess');
  const [currentGameQuestion, setCurrentGameQuestion] = useState(0);
  const [gameAnswers, setGameAnswers] = useState({});
  const [showGameResults, setShowGameResults] = useState(false);
  const [draggedEmoji, setDraggedEmoji] = useState(null);
  const [dropResult, setDropResult] = useState(null);
  const [gameScore, setGameScore] = useState(0);
  const [gameTimer, setGameTimer] = useState(0);
  const [gameStartTime, setGameStartTime] = useState(null);

  // Game timer effect
  useEffect(() => {
    let interval;
    if (gameStartTime && !showGameResults) {
      interval = setInterval(() => {
        setGameTimer(Math.floor((Date.now() - gameStartTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStartTime, showGameResults]);

  const analysis = useMemo(() => {
    if (!inputText.trim()) return null;
    const result = analyzeSentiment(inputText);
    
    // Update analytics when analysis changes
    if (result && inputText.trim().length > 5) {
      setTotalAnalyses(prev => prev + 1);
    }
    
    return result;
  }, [inputText]);

  const getSentimentColor = (sentiment) => {
    if (sentiment.includes('positive')) return 'bg-positive';
    if (sentiment.includes('negative')) return 'bg-negative';
    return 'bg-neutral';
  };

  const getSentimentBarPosition = (score) => {
    // Convert score to percentage (clamped between -3 and 3)
    const clampedScore = Math.max(-3, Math.min(3, score));
    return 50 + (clampedScore / 3) * 50; // 0-100%
  };

  const highlightText = (text, highlightedWords) => {
    if (!showWordHighlight) return text;
    
    let result = text;
    highlightedWords.forEach(({word, type, reason, intensity}) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      let className = '';
      
      if (type === 'positive') {
        className = 'word-positive';
      } else if (type === 'negative') {
        className = 'word-negative';
      } else if (type === 'negation') {
        className = 'word-negation';
      }
      
      let title = '';
      if (reason) {
        title = ` title="${reason}"`;
      } else if (intensity && intensity !== 1) {
        title = ` title="intensity: ${intensity}x"`;
      }
      
      result = result.replace(regex, `<span class="${className}"${title}>$&</span>`);
    });
    
    return result;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-accent text-white py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-fredoka font-bold mb-2">
            🤖 Feeling Detective
          </h1>
          <p className="text-xl font-inter opacity-90">
            Teach computers to understand emotions in sentences!
          </p>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-wrap gap-2 py-4">
            {[
              { id: 'playground', label: '🎮 Playground', emoji: '🎮' },
              { id: 'examples', label: '💡 Examples', emoji: '💡' },
              { id: 'games', label: '🎯 Mini-Games', emoji: '🎯' },
              { id: 'ar-mirror', label: '📱 AR Mirror', emoji: '📱' },
              { id: 'voice', label: '🎤 Voice Detective', emoji: '🎤' },
              { id: 'learn', label: '📚 Learn', emoji: '📚' },
              { id: 'quiz', label: '🧩 Quiz', emoji: '🧩' }
            ].map(section => (
              <Button
                key={section.id}
                onClick={() => setCurrentSection(section.id)}
                variant={currentSection === section.id ? "default" : "outline"}
                className={`font-fredoka font-medium hover-lift ${
                  currentSection === section.id 
                    ? 'bg-gradient-to-r from-primary to-accent text-white' 
                    : 'border-2 hover:border-primary'
                }`}
              >
                {section.label}
              </Button>
            ))}
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Playground Section */}
        {currentSection === 'playground' && (
          <div className="space-y-6">
            {/* User Progress */}
            {totalAnalyses > 0 && (
              <Card className="hover-lift shadow-lg border-2 border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="text-center">
                      <div className="text-2xl font-fredoka text-blue-600">{totalAnalyses}</div>
                      <div className="text-xs font-inter">Analyses</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-fredoka text-green-600">{userScore}</div>
                      <div className="text-xs font-inter">Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-fredoka text-purple-600">{streakCount}</div>
                      <div className="text-xs font-inter">Streak</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl">
                        {totalAnalyses >= 50 ? '🏆' : totalAnalyses >= 20 ? '🎆' : totalAnalyses >= 10 ? '⭐' : '🌱'}
                      </div>
                      <div className="text-xs font-inter">Level</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            <Card className="hover-lift shadow-lg border-2 border-primary/20">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
                <CardTitle className="font-fredoka text-2xl text-center">
                  🎮 Enhanced Sentiment Playground
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <Textarea
                  placeholder="Try: 'I am not happy' or 'I love ice cream!' to see enhanced sentiment analysis!"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-[120px] text-lg font-inter border-2 border-muted focus:border-primary rounded-lg"
                />
                
                {analysis && (
                  <div className="mt-6 space-y-4">
                    {/* Sentiment Result */}
                    <div className="text-center">
                      <div className={`inline-flex items-center gap-3 px-6 py-4 rounded-2xl text-white font-fredoka text-xl ${getSentimentColor(analysis.sentiment)}`}>
                        <span className="text-3xl">{analysis.emoji}</span>
                        <span className="capitalize font-bold">{analysis.sentiment}</span>
                        <span className="text-sm opacity-80">({analysis.confidence}% confident)</span>
                      </div>
                    </div>

                    {/* Sentiment Bar */}
                    <div className="space-y-2">
                      <p className="text-center font-inter font-medium">Sentiment Strength:</p>
                      <div className="relative h-6 sentiment-bar rounded-full">
                        <div 
                          className="absolute top-1/2 w-4 h-4 bg-white border-2 border-gray-800 rounded-full transform -translate-y-1/2 transition-all duration-500 shadow-lg"
                          style={{ left: `calc(${getSentimentBarPosition(analysis.score)}% - 8px)` }}
                        />
                      </div>
                      <div className="flex justify-between text-sm font-inter">
                        <span>😡 Very Negative</span>
                        <span>😐 Neutral</span>
                        <span>😀 Very Positive</span>
                      </div>
                    </div>

                    {/* Enhanced Analysis Display */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div className="bg-positive-bg p-3 rounded-lg">
                        <div className="text-2xl font-fredoka text-positive">{analysis.positiveScore}</div>
                        <div className="text-sm font-inter">Positive Score</div>
                      </div>
                      <div className="bg-negative-bg p-3 rounded-lg">
                        <div className="text-2xl font-fredoka text-negative">{analysis.negativeScore}</div>
                        <div className="text-sm font-inter">Negative Score</div>
                      </div>
                      <div className="bg-neutral-bg p-3 rounded-lg">
                        <div className="text-2xl font-fredoka text-neutral">{analysis.score}</div>
                        <div className="text-sm font-inter">Final Score</div>
                      </div>
                      <div className="bg-accent-bg p-3 rounded-lg">
                        <div className="text-2xl font-fredoka text-accent">{analysis.confidence}%</div>
                        <div className="text-sm font-inter">Confidence</div>
                      </div>
                    </div>

                    {/* Word Highlight Toggle */}
                    <div className="text-center">
                      <Button
                        onClick={() => setShowWordHighlight(!showWordHighlight)}
                        variant="outline"
                        className="font-fredoka border-2 hover-lift"
                      >
                        {showWordHighlight ? '🙈 Hide Analysis' : '🔍 How does it decide?'}
                      </Button>
                    </div>

                    {/* Highlighted Text */}
                    {showWordHighlight && (
                      <Card className="bg-muted/50">
                        <CardContent className="p-4">
                          <div 
                            className="text-lg font-inter leading-relaxed mb-4"
                            dangerouslySetInnerHTML={{
                              __html: highlightText(inputText, analysis.highlightedWords)
                            }}
                          />
                          <div className="text-sm font-inter space-y-1">
                            <p>✅ <span className="word-positive">Green words</span> = Happy/Positive</p>
                            <p>❌ <span className="word-negative">Red words</span> = Sad/Negative</p>
                            <p>🔄 <span className="word-negation">Purple words</span> = Negation (flips meaning)</p>
                            <p>📊 Analysis: {analysis.positiveCount} positive, {analysis.negativeCount} negative words detected</p>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Examples Section */}
        {currentSection === 'examples' && (
          <div className="space-y-6">
            <Card className="hover-lift shadow-lg border-2 border-accent/20">
              <CardHeader className="bg-gradient-to-r from-accent/10 to-primary/10">
                <CardTitle className="font-fredoka text-2xl text-center">
                  💡 Try These Examples
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-center font-inter mb-6">
                  Click on any sentence to see how the enhanced AI detects emotions and negations!
                </p>
                <div className="grid gap-3 md:grid-cols-2">
                  {examples.map((example, index) => (
                    <Button
                      key={index}
                      onClick={() => {
                        setInputText(example);
                        setCurrentSection('playground');
                      }}
                      variant="outline"
                      className="h-auto p-4 text-left font-inter hover-lift border-2 hover:border-accent"
                    >
                      {example}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Mini-Games Section */}
        {currentSection === 'games' && (
          <div className="space-y-6">
            <Card className="hover-lift shadow-lg border-2 border-accent/20">
              <CardHeader className="bg-gradient-to-r from-accent/10 to-secondary/10">
                <CardTitle className="font-fredoka text-2xl text-center">
                  🎯 Emotion Mini-Games
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {/* Game Type Selector */}
                <div className="flex justify-center gap-4 mb-6">
                  <Button
                    onClick={() => {
                      setCurrentGameType('guess');
                      setCurrentGameQuestion(0);
                      setGameAnswers({});
                      setShowGameResults(false);
                      setDropResult(null);
                      setGameScore(0);
                      setGameTimer(0);
                      setGameStartTime(Date.now());
                    }}
                    variant={currentGameType === 'guess' ? "default" : "outline"}
                    className={`font-fredoka ${
                      currentGameType === 'guess' 
                        ? 'bg-gradient-to-r from-accent to-primary text-white' 
                        : 'border-2 hover:border-accent'
                    }`}
                  >
                    🎲 Guess the Emotion
                  </Button>
                  <Button
                    onClick={() => {
                      setCurrentGameType('fix');
                      setCurrentGameQuestion(0);
                      setGameAnswers({});
                      setShowGameResults(false);
                      setDropResult(null);
                      setGameScore(0);
                      setGameTimer(0);
                      setGameStartTime(Date.now());
                    }}
                    variant={currentGameType === 'fix' ? "default" : "outline"}
                    className={`font-fredoka ${
                      currentGameType === 'fix' 
                        ? 'bg-gradient-to-r from-accent to-primary text-white' 
                        : 'border-2 hover:border-accent'
                    }`}
                  >
                    🔧 Fix the Sentence
                  </Button>
                </div>

                {/* Game Status Bar */}
                {gameStartTime && !showGameResults && (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border-2 border-blue-200">
                    <div className="flex justify-between items-center">
                      <div className="text-center">
                        <div className="text-lg font-fredoka text-blue-600">⏱️ {gameTimer}s</div>
                        <div className="text-xs font-inter">Time</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-fredoka text-green-600">🏆 {gameScore}</div>
                        <div className="text-xs font-inter">Score</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-fredoka text-purple-600">📊 {currentGameQuestion + 1}/{currentGameType === 'guess' ? guessEmotionSentences.length : fixSentencePrompts.length}</div>
                        <div className="text-xs font-inter">Progress</div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Guess the Emotion Game */}
                {currentGameType === 'guess' && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <p className="font-inter text-lg mb-4">
                        Read the sentence and drag the right emoji to the box!
                      </p>
                    </div>

                    <Card className="border-2 border-dashed border-primary/30">
                      <CardContent className="p-6">
                        <div className="text-center space-y-6">
                          <p className="text-xl font-inter bg-muted/50 p-4 rounded-lg">
                            "{guessEmotionSentences[currentGameQuestion]?.text}"
                          </p>
                          
                          {/* Drop Zone */}
                          <div
                            className={`w-24 h-24 mx-auto border-4 border-dashed rounded-2xl flex items-center justify-center text-4xl transition-all duration-300 ${
                              dropResult ? 
                                (dropResult.correct ? 'border-positive bg-positive-bg' : 'border-negative bg-negative-bg') :
                                'border-accent/50 bg-accent/5 hover:border-accent hover:bg-accent/10'
                            }`}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                              e.preventDefault();
                              const emoji = e.dataTransfer.getData('text/plain');
                              const correct = emoji === guessEmotionSentences[currentGameQuestion]?.correct;
                              setDropResult({ correct, emoji });
                              
                              // Update score
                              if (correct) {
                                const timeBonus = Math.max(0, 10 - Math.floor(gameTimer / 5));
                                setGameScore(prev => prev + 10 + timeBonus);
                              }
                              
                              setTimeout(() => {
                                if (currentGameQuestion < guessEmotionSentences.length - 1) {
                                  setCurrentGameQuestion(prev => prev + 1);
                                  setDropResult(null);
                                } else {
                                  setShowGameResults(true);
                                }
                              }, 1500);
                            }}
                          >
                            {dropResult ? dropResult.emoji : '📦'}
                          </div>

                          {dropResult && (
                            <div className={`font-fredoka text-lg ${dropResult.correct ? 'text-positive' : 'text-negative'}`}>
                              {dropResult.correct ? '🎉 Perfect! Great job!' : '💪 Try again! The answer was ' + guessEmotionSentences[currentGameQuestion]?.correct}
                            </div>
                          )}

                          {/* Draggable Emojis */}
                          <div className="flex justify-center gap-4">
                            {guessEmotionSentences[currentGameQuestion]?.options.map((emoji, index) => (
                              <div
                                key={index}
                                draggable
                                onDragStart={(e) => e.dataTransfer.setData('text/plain', emoji)}
                                className="w-16 h-16 bg-white border-2 border-accent/30 rounded-xl flex items-center justify-center text-3xl cursor-grab hover:border-accent hover:scale-110 transition-all duration-200 hover-lift"
                              >
                                {emoji}
                              </div>
                            ))}
                          </div>

                          <div className="text-sm font-inter text-muted-foreground">
                            Question {currentGameQuestion + 1} of {guessEmotionSentences.length}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {showGameResults && (
                      <Card className="bg-positive-bg border-positive/30">
                        <CardContent className="p-4 text-center">
                          <div className="text-4xl mb-2">
                            {gameScore >= 80 ? '🏆' : gameScore >= 60 ? '🎆' : gameScore >= 40 ? '⭐' : '🎉'}
                          </div>
                          <p className="font-fredoka text-xl text-positive">
                            {gameScore >= 80 ? 'Perfect! You\'re an emotion expert!' : 
                             gameScore >= 60 ? 'Great job! You\'re getting good at this!' :
                             gameScore >= 40 ? 'Good work! Keep practicing!' :
                             'Nice try! Practice makes perfect!'}
                          </p>
                          <div className="mt-4 space-y-2">
                            <p className="font-inter text-lg">Final Score: <strong>{gameScore} points</strong></p>
                            <p className="font-inter text-sm">Time: {gameTimer} seconds</p>
                            <p className="font-inter text-sm">
                              {gameScore >= 80 ? 'Lightning fast!' :
                               gameTimer <= 30 ? 'Quick thinking!' :
                               gameTimer <= 60 ? 'Good pace!' : 'Take your time!'}
                            </p>
                          </div>
                          <Button
                            onClick={() => {
                              setCurrentGameQuestion(0);
                              setShowGameResults(false);
                              setDropResult(null);
                              setGameScore(0);
                              setGameTimer(0);
                              setGameStartTime(Date.now());
                            }}
                            className="mt-4 font-fredoka bg-positive hover:bg-positive-light text-white"
                          >
                            🔄 Play Again
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

                {/* Fix the Sentence Game */}
                {currentGameType === 'fix' && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <p className="font-inter text-lg mb-4">
                        Turn the sad sentence into a happy one!
                      </p>
                    </div>

                    <Card className="border-2 border-dashed border-secondary/30">
                      <CardContent className="p-6">
                        <div className="space-y-6">
                          <div className="text-center">
                            <p className="text-lg font-inter mb-2">😢 Sad Sentence:</p>
                            <p className="text-xl font-fredoka bg-negative-bg p-4 rounded-lg text-negative">
                              "{fixSentencePrompts[currentGameQuestion]?.sad}"
                            </p>
                          </div>

                          <div className="text-center">
                            <p className="text-lg font-inter mb-4">😀 Pick the happy version:</p>
                            <div className="space-y-3">
                              {fixSentencePrompts[currentGameQuestion]?.happyOptions.map((option, index) => (
                                <Button
                                  key={index}
                                  onClick={() => {
                                    setGameAnswers({...gameAnswers, [currentGameQuestion]: index.toString()});
                                    
                                    // Update score
                                    if (index === fixSentencePrompts[currentGameQuestion]?.correct) {
                                      const timeBonus = Math.max(0, 15 - Math.floor(gameTimer / 3));
                                      setGameScore(prev => prev + 15 + timeBonus);
                                    }
                                    
                                    setTimeout(() => {
                                      if (currentGameQuestion < fixSentencePrompts.length - 1) {
                                        setCurrentGameQuestion(prev => prev + 1);
                                      } else {
                                        setShowGameResults(true);
                                      }
                                    }, 1000);
                                  }}
                                  variant="outline"
                                  className={`w-full p-4 font-inter hover-lift border-2 ${
                                    gameAnswers[currentGameQuestion] === index.toString()
                                      ? (index === fixSentencePrompts[currentGameQuestion]?.correct ? 'border-positive bg-positive-bg text-positive' : 'border-negative bg-negative-bg text-negative')
                                      : 'hover:border-positive'
                                  }`}
                                  disabled={gameAnswers[currentGameQuestion] !== undefined}
                                >
                                  {option}
                                  {gameAnswers[currentGameQuestion] === index.toString() && (
                                    <span className="ml-2">
                                      {index === fixSentencePrompts[currentGameQuestion]?.correct ? '✅' : '❌'}
                                    </span>
                                  )}
                                </Button>
                              ))}
                            </div>
                          </div>

                          <div className="text-center text-sm font-inter text-muted-foreground">
                            Question {currentGameQuestion + 1} of {fixSentencePrompts.length}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {showGameResults && (
                      <Card className="bg-positive-bg border-positive/30">
                        <CardContent className="p-4 text-center">
                          <div className="text-4xl mb-2">
                            {gameScore >= 60 ? '🏆' : gameScore >= 40 ? '🎆' : gameScore >= 20 ? '⭐' : '🎉'}
                          </div>
                          <p className="font-fredoka text-xl text-positive">
                            {gameScore >= 60 ? 'Outstanding! You\'re a happiness expert!' : 
                             gameScore >= 40 ? 'Excellent! You know how to spread joy!' :
                             gameScore >= 20 ? 'Great job! Keep spreading positivity!' :
                             'Good effort! Practice turning frowns upside down!'}
                          </p>
                          <div className="mt-4 space-y-2">
                            <p className="font-inter text-lg">Final Score: <strong>{gameScore} points</strong></p>
                            <p className="font-inter text-sm">
                              Correct: {Object.entries(gameAnswers).filter(([key, answer]) => 
                                parseInt(answer) === fixSentencePrompts[parseInt(key)]?.correct
                              ).length} / {fixSentencePrompts.length}
                            </p>
                            <p className="font-inter text-sm">Time: {gameTimer} seconds</p>
                          </div>
                          <Button
                            onClick={() => {
                              setCurrentGameQuestion(0);
                              setShowGameResults(false);
                              setGameAnswers({});
                              setGameScore(0);
                              setGameTimer(0);
                              setGameStartTime(Date.now());
                            }}
                            className="mt-4 font-fredoka bg-positive hover:bg-positive-light text-white"
                          >
                            🔄 Play Again
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* AR Mirror Section */}
        {currentSection === 'ar-mirror' && (
          <MoodMirror />
        )}

        {/* Voice Detective Section */}
        {currentSection === 'voice' && (
          <VoiceDetective />
        )}

        {/* Learn Section */}
        {currentSection === 'learn' && (
          <div className="space-y-6">
            <Card className="hover-lift shadow-lg border-2 border-positive/20">
              <CardHeader className="bg-gradient-to-r from-positive/10 to-neutral/10">
                <CardTitle className="font-fredoka text-2xl text-center">
                  📚 How Does It Work?
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="text-center">
                  <p className="text-lg font-inter leading-relaxed">
                    Computers count <span className="word-positive">happy words</span> and <span className="word-negative">sad words</span> to guess the feeling in a sentence!
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="bg-positive-bg border-positive/30">
                    <CardHeader>
                      <CardTitle className="font-fredoka text-lg text-positive flex items-center gap-2">
                        😀 Happy Words
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {positiveWords.slice(0, 12).map(word => (
                          <span key={word} className="word-positive text-sm">
                            {word}
                          </span>
                        ))}
                        <span className="text-positive font-medium">...and more!</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-negative-bg border-negative/30">
                    <CardHeader>
                      <CardTitle className="font-fredoka text-lg text-negative flex items-center gap-2">
                        😡 Sad Words
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {negativeWords.slice(0, 12).map(word => (
                          <span key={word} className="word-negative text-sm">
                            {word}
                          </span>
                        ))}
                        <span className="text-negative font-medium">...and more!</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-neutral-bg border-neutral/30">
                  <CardContent className="p-4">
                    <div className="text-center space-y-2">
                      <div className="text-2xl">🤖</div>
                      <p className="font-fredoka text-lg">
                        <strong>Enhanced Rules:</strong>
                      </p>
                      <p className="font-fredoka text-lg">
                        More happy words = Positive 😀
                      </p>
                      <p className="font-fredoka text-lg">
                        More sad words = Negative 😡
                      </p>
                      <p className="font-fredoka text-lg">
                        <span className="word-negation">NOT</span> flips the meaning!
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quiz Section */}
        {currentSection === 'quiz' && (
          <div className="space-y-6">
            <Card className="hover-lift shadow-lg border-2 border-secondary/20">
              <CardHeader className="bg-gradient-to-r from-secondary/10 to-accent/10">
                <CardTitle className="font-fredoka text-2xl text-center">
                  🧩 Feeling Quiz
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-center font-inter mb-6">
                  Can you guess the feeling in these sentences?
                </p>
                
                <div className="space-y-6">
                  {quizQuestions.map((question, index) => (
                    <Card key={index} className="border-2">
                      <CardContent className="p-4">
                        <p className="font-inter text-lg mb-4">
                          <strong>Question {index + 1}:</strong> "{question.text}"
                        </p>
                        
                        <div className="flex flex-wrap gap-2">
                          {['positive', 'negative', 'neutral'].map(option => (
                            <Button
                              key={option}
                              onClick={() => setQuizAnswers({...quizAnswers, [index]: option})}
                              variant={quizAnswers[index] === option ? "default" : "outline"}
                              className={`font-fredoka ${
                                quizAnswers[index] === option 
                                  ? getSentimentColor(option) + ' text-white' 
                                  : 'border-2'
                              }`}
                            >
                              {option === 'positive' && '😀 Positive'}
                              {option === 'negative' && '😡 Negative'}
                              {option === 'neutral' && '😐 Neutral'}
                            </Button>
                          ))}
                        </div>
                        
                        {showQuizResults && (
                          <div className="mt-3">
                            {quizAnswers[index] === question.correct ? (
                              <p className="text-positive font-fredoka">✅ Correct! Great job!</p>
                            ) : (
                              <p className="text-negative font-fredoka">
                                ❌ Not quite. The answer is {question.correct}!
                              </p>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="text-center mt-6">
                  <Button
                    onClick={() => setShowQuizResults(!showQuizResults)}
                    className="font-fredoka bg-gradient-to-r from-secondary to-accent text-white hover-lift"
                    disabled={Object.keys(quizAnswers).length < quizQuestions.length}
                  >
                    {showQuizResults ? '🙈 Hide Results' : '🎯 Check Answers'}
                  </Button>
                </div>

                {showQuizResults && (
                  <div className="text-center mt-4">
                    <p className="font-fredoka text-lg">
                      Your Score: {quizQuestions.filter((q, i) => quizAnswers[i] === q.correct).length} / {quizQuestions.length}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-muted py-8 px-4 mt-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-4xl mb-2">🤖💭</div>
          <p className="font-inter text-muted-foreground">
            Now with enhanced negation detection! Try "I am not happy" to see it in action.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;