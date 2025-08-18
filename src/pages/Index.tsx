import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

// Simple sentiment analysis logic
const positiveWords = [
  'love', 'awesome', 'amazing', 'great', 'wonderful', 'fantastic', 'excellent', 'brilliant',
  'happy', 'joy', 'excited', 'fun', 'cool', 'best', 'perfect', 'beautiful', 'good', 'nice',
  'like', 'enjoy', 'favorite', 'super', 'incredible', 'outstanding', 'fabulous', 'delightful'
];

const negativeWords = [
  'hate', 'terrible', 'awful', 'horrible', 'bad', 'worst', 'sad', 'angry', 'boring',
  'disgusting', 'stupid', 'annoying', 'ugly', 'scary', 'difficult', 'hard', 'disappointing',
  'frustrating', 'mad', 'upset', 'mean', 'cruel', 'yuck', 'gross', 'nasty', 'evil'
];

const analyzeSentiment = (text: string) => {
  const words = text.toLowerCase().split(/\s+/);
  let positiveCount = 0;
  let negativeCount = 0;
  
  const highlightedWords: Array<{word: string, type: 'positive' | 'negative' | 'neutral'}> = [];
  
  words.forEach(word => {
    const cleanWord = word.replace(/[^\w]/g, '');
    if (positiveWords.includes(cleanWord)) {
      positiveCount++;
      highlightedWords.push({word: cleanWord, type: 'positive'});
    } else if (negativeWords.includes(cleanWord)) {
      negativeCount++;
      highlightedWords.push({word: cleanWord, type: 'negative'});
    }
  });
  
  const score = positiveCount - negativeCount;
  let sentiment: 'positive' | 'negative' | 'neutral';
  let emoji: string;
  
  if (score > 0) {
    sentiment = 'positive';
    emoji = '😀';
  } else if (score < 0) {
    sentiment = 'negative';
    emoji = '😡';
  } else {
    sentiment = 'neutral';
    emoji = '😐';
  }
  
  return {
    sentiment,
    emoji,
    score,
    positiveCount,
    negativeCount,
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
  "The book was interesting."
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

const Index = () => {
  const [inputText, setInputText] = useState('');
  const [showWordHighlight, setShowWordHighlight] = useState(false);
  const [currentSection, setCurrentSection] = useState<'playground' | 'examples' | 'learn' | 'quiz'>('playground');
  const [quizAnswers, setQuizAnswers] = useState<{[key: number]: string}>({});
  const [showQuizResults, setShowQuizResults] = useState(false);

  const analysis = useMemo(() => {
    if (!inputText.trim()) return null;
    return analyzeSentiment(inputText);
  }, [inputText]);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-positive';
      case 'negative': return 'bg-negative';
      default: return 'bg-neutral';
    }
  };

  const getSentimentBarPosition = (score: number) => {
    // Convert score to percentage (clamped between -3 and 3)
    const clampedScore = Math.max(-3, Math.min(3, score));
    return 50 + (clampedScore / 3) * 50; // 0-100%
  };

  const highlightText = (text: string, highlightedWords: Array<{word: string, type: string}>) => {
    if (!showWordHighlight) return text;
    
    let result = text;
    highlightedWords.forEach(({word, type}) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const className = type === 'positive' ? 'word-positive' : 'word-negative';
      result = result.replace(regex, `<span class="${className}">$&</span>`);
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
              { id: 'learn', label: '📚 Learn', emoji: '📚' },
              { id: 'quiz', label: '🧩 Quiz', emoji: '🧩' }
            ].map(section => (
              <Button
                key={section.id}
                onClick={() => setCurrentSection(section.id as any)}
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
            <Card className="hover-lift shadow-lg border-2 border-primary/20">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
                <CardTitle className="font-fredoka text-2xl text-center">
                  🎮 Sentiment Playground
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <Textarea
                  placeholder="Type a sentence here... Try 'I love ice cream!' or 'I hate spinach!'"
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

                    {/* Word Highlight Toggle */}
                    <div className="text-center">
                      <Button
                        onClick={() => setShowWordHighlight(!showWordHighlight)}
                        variant="outline"
                        className="font-fredoka border-2 hover-lift"
                      >
                        {showWordHighlight ? '🙈 Hide' : '🔍 How does it decide?'}
                      </Button>
                    </div>

                    {/* Highlighted Text */}
                    {showWordHighlight && (
                      <Card className="bg-muted/50">
                        <CardContent className="p-4">
                          <div 
                            className="text-lg font-inter leading-relaxed"
                            dangerouslySetInnerHTML={{
                              __html: highlightText(inputText, analysis.highlightedWords)
                            }}
                          />
                          <div className="mt-4 text-sm font-inter space-y-1">
                            <p>✅ <span className="word-positive">Green words</span> = Happy/Positive</p>
                            <p>❌ <span className="word-negative">Red words</span> = Sad/Negative</p>
                            <p>📊 Positive words: {analysis.positiveCount} | Negative words: {analysis.negativeCount}</p>
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
                  Click on any sentence to see how the computer detects its feeling!
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
                        <strong>The Rule:</strong> More happy words = Positive 😀
                      </p>
                      <p className="font-fredoka text-lg">
                        More sad words = Negative 😡
                      </p>
                      <p className="font-fredoka text-lg">
                        Same amount = Neutral 😐
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
            Keep exploring how computers understand human emotions!
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;