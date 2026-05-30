import { useState, useCallback, useMemo, useEffect } from "react";
import { Question } from "../data/questions";

export interface AnswerState {
  selectedOption: string | null;
  isCorrect: boolean | null;
}

const shuffleArray = <T>(array: T[]): T[] => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

export function useQuiz(initialQuestions: Question[]) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, AnswerState>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [isReviewMode, setIsReviewMode] = useState(false);

  const initQuiz = useCallback(() => {
    // Shuffle options for MCQ (not T/F)
    const processedQuestions = initialQuestions.map((q) => {
      if (q.options.length > 2) {
        return { ...q, options: shuffleArray(q.options) };
      }
      return q;
    });
    setQuestions(processedQuestions);
    setCurrentIndex(0);
    setAnswers({});
    setIsFinished(false);
    setIsReviewMode(false);
  }, [initialQuestions]);

  useEffect(() => {
    initQuiz();
  }, [initQuiz]);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  
  const score = useMemo(() => {
    return Object.values(answers).filter((a) => a.isCorrect).length;
  }, [answers]);

  const handleAnswer = useCallback(
    (option: string) => {
      if (answers[currentIndex]?.selectedOption || isReviewMode) return;

      const isCorrect = option === currentQuestion.answer;
      
      setAnswers((prev) => ({
        ...prev,
        [currentIndex]: { selectedOption: option, isCorrect },
      }));

      // Auto-advance
      setTimeout(() => {
        setAnswers((currentAnswers) => {
          const numAnswered = Object.keys(currentAnswers).length;
          if (numAnswered === totalQuestions) {
            setIsFinished(true);
            return currentAnswers;
          }
          
          // Find next unanswered
          let nextIdx = currentIndex + 1;
          while (currentAnswers[nextIdx] && nextIdx < totalQuestions) {
            nextIdx++;
          }
          if (nextIdx < totalQuestions) {
            setCurrentIndex(nextIdx);
          } else {
            // Find first unanswered from start
            let firstUnanswered = 0;
            while (currentAnswers[firstUnanswered] && firstUnanswered < totalQuestions) {
              firstUnanswered++;
            }
            if (firstUnanswered < totalQuestions) {
              setCurrentIndex(firstUnanswered);
            }
          }
          return currentAnswers;
        });
      }, 800);
    },
    [currentIndex, currentQuestion, totalQuestions, answers, isReviewMode]
  );

  const nextQuestion = useCallback(() => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, totalQuestions]);

  const prevQuestion = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const jumpToQuestion = useCallback((index: number) => {
    if (index >= 0 && index < totalQuestions) {
      setCurrentIndex(index);
    }
  }, [totalQuestions]);

  const startReview = useCallback(() => {
    setIsFinished(false);
    setIsReviewMode(true);
    setCurrentIndex(0);
  }, []);

  const endReview = useCallback(() => {
    setIsFinished(true);
    setIsReviewMode(false);
  }, []);

  return {
    questions,
    currentIndex,
    currentQuestion,
    totalQuestions,
    answers,
    score,
    isFinished,
    isReviewMode,
    handleAnswer,
    nextQuestion,
    prevQuestion,
    jumpToQuestion,
    retry: initQuiz,
    startReview,
    endReview,
  };
}
