import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { LECTURES } from "../data/questions";
import { useQuiz } from "../hooks/useQuiz";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Moon, Sun, Home as HomeIcon, LayoutGrid, RotateCcw, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Quiz() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const lectureId = parseInt(searchParams.get("lecture") || "1", 10);
  
  const lecture = LECTURES.find((l) => l.id === lectureId) || LECTURES[0];
  
  const {
    currentQuestion,
    currentIndex,
    totalQuestions,
    answers,
    score,
    isFinished,
    isReviewMode,
    handleAnswer,
    nextQuestion,
    prevQuestion,
    jumpToQuestion,
    retry,
    startReview,
    endReview,
  } = useQuiz(lecture.questions);

  const [theme, setTheme] = useState<"light" | "dark">(
    () => (localStorage.getItem("theme") as "light" | "dark") || "light"
  );

  const [showGrid, setShowGrid] = useState(false);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  if (!currentQuestion) return null;

  const currentAnswerState = answers[currentIndex];
  const hasAnswered = !!currentAnswerState || isReviewMode;

  const getScoreMessage = () => {
    if (score >= totalQuestions - 5) return "اول دفعهه ياعمممم";
    if (score >= totalQuestions * 0.6) return "شد شويه ياعممم";
    return "انت اخرك تخش كليه البهايمممم";
  };

  if (isFinished) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full text-center"
        >
          <div className="mb-8 relative inline-flex items-center justify-center w-40 h-40 rounded-full border-8 border-primary/20">
            <div className="absolute inset-0 rounded-full border-8 border-primary" 
                 style={{ clipPath: `polygon(0 0, 100% 0, 100% ${score/totalQuestions * 100}%, 0 ${score/totalQuestions * 100}%)` }} />
            <div className="flex flex-col items-center">
              <span className="text-4xl font-bold">{score}</span>
              <span className="text-muted-foreground text-sm">out of {totalQuestions}</span>
            </div>
          </div>
          
          <h2 className="text-3xl font-bold mb-4 tracking-tight" dir="rtl">{getScoreMessage()}</h2>
          <p className="text-muted-foreground mb-8">You completed {lecture.title}: {lecture.topic}</p>

          <div className="flex flex-col gap-3">
            <Button onClick={retry} size="lg" className="w-full text-lg h-14" data-testid="button-retry">
              <RotateCcw className="w-5 h-5 mr-2" /> Retry Quiz
            </Button>
            <Button onClick={startReview} variant="outline" size="lg" className="w-full text-lg h-14" data-testid="button-review">
              <LayoutGrid className="w-5 h-5 mr-2" /> Review Answers
            </Button>
            <Link href="/">
              <Button variant="ghost" className="w-full" data-testid="button-home">
                <HomeIcon className="w-4 h-4 mr-2" /> Back to Home
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b px-4 py-3 flex items-center justify-between bg-card sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="shrink-0">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-bold hidden sm:block">آثــــر | ATHER 🫆</h1>
            <div className="text-xs text-muted-foreground font-medium">{lecture.title}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {isReviewMode && (
            <Button variant="destructive" size="sm" onClick={endReview} data-testid="button-end-review">
              End Review
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => setShowGrid(!showGrid)} data-testid="button-toggle-grid">
            <LayoutGrid className="w-4 h-4 mr-2 hidden sm:block" />
            {currentIndex + 1} / {totalQuestions}
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </Button>
        </div>
      </header>

      <AnimatePresence>
        {showGrid && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b bg-muted/30 overflow-hidden"
          >
            <div className="p-4 max-w-3xl mx-auto flex flex-wrap gap-2 justify-center">
              {Array.from({ length: totalQuestions }).map((_, i) => {
                const ans = answers[i];
                let bgClass = "bg-muted text-muted-foreground hover:bg-muted/80";
                if (ans) {
                  bgClass = ans.isCorrect 
                    ? "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30 border" 
                    : "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30 border";
                }
                const isCurrent = i === currentIndex;
                
                return (
                  <button
                    key={i}
                    onClick={() => {
                      jumpToQuestion(i);
                      setShowGrid(false);
                    }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-transform hover:scale-110 ${bgClass} ${isCurrent ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}
                    data-testid={`grid-circle-${i}`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 max-w-3xl mx-auto w-full p-4 sm:p-6 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col"
          >
            <Card className="mb-8 border-l-4 border-l-primary shadow-sm">
              <div className="p-6 sm:p-8">
                <div className="text-sm font-semibold text-primary mb-3">Question {currentIndex + 1}</div>
                <h2 className="text-xl sm:text-2xl font-medium leading-relaxed">
                  {currentQuestion.question}
                </h2>
              </div>
            </Card>

            <div className="flex flex-col gap-3">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = currentAnswerState?.selectedOption === option;
                const isCorrectOption = option === currentQuestion.answer;
                
                let btnVariant: "default" | "outline" | "secondary" | "ghost" = "outline";
                let btnClass = "h-auto py-4 px-6 justify-start text-left text-base font-normal whitespace-normal";

                if (hasAnswered) {
                  if (isCorrectOption) {
                    btnClass += " bg-green-500/10 border-green-500/50 text-green-800 dark:text-green-300";
                  } else if (isSelected) {
                    btnClass += " bg-red-500/10 border-red-500/50 text-red-800 dark:text-red-300";
                  } else {
                    btnClass += " opacity-50";
                  }
                } else {
                  btnClass += " hover:border-primary hover:bg-primary/5 transition-colors";
                }

                return (
                  <motion.div
                    key={option}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Button
                      variant={btnVariant}
                      className={btnClass}
                      onClick={() => handleAnswer(option)}
                      disabled={hasAnswered && !isReviewMode}
                      data-testid={`button-option-${idx}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30'}`}>
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <span>{option}</span>
                      </div>
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-10 pt-6 border-t flex items-center justify-between">
          <Button
            variant="outline"
            onClick={prevQuestion}
            disabled={currentIndex === 0}
            data-testid="button-prev"
          >
            <ChevronLeft className="w-4 h-4 mr-2" /> Previous
          </Button>
          
          <Button
            onClick={nextQuestion}
            disabled={currentIndex === totalQuestions - 1}
            data-testid="button-next"
          >
            Next <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </main>
    </div>
  );
}
