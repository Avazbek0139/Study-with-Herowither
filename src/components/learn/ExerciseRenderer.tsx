'use client';

import { Exercise } from '@/lib/learning-engine';
import TranslationExercise from './exercises/TranslationExercise';
import MultipleChoiceExercise from './exercises/MultipleChoiceExercise';
import SentenceCompletionExercise from './exercises/SentenceCompletionExercise';
import SpellingExercise from './exercises/SpellingExercise';
import ContextExercise from './exercises/ContextExercise';
import MatchingExercise from './exercises/MatchingExercise';

interface ExerciseRendererProps {
  exercise: Exercise;
  onAnswer: (isCorrect: boolean) => void;
  onNext: () => void;
}

export default function ExerciseRenderer({ exercise, onAnswer, onNext }: ExerciseRendererProps) {
  switch (exercise.type) {
    case 'translation':
      return <TranslationExercise exercise={exercise} onAnswer={onAnswer} onNext={onNext} />;
    case 'multiple_choice':
      return <MultipleChoiceExercise exercise={exercise} onAnswer={onAnswer} onNext={onNext} />;
    case 'sentence_completion':
      return <SentenceCompletionExercise exercise={exercise} onAnswer={onAnswer} onNext={onNext} />;
    case 'spelling':
      return <SpellingExercise exercise={exercise} onAnswer={onAnswer} onNext={onNext} />;
    case 'context':
      return <ContextExercise exercise={exercise} onAnswer={onAnswer} onNext={onNext} />;
    case 'matching':
      return <MatchingExercise exercise={exercise} onAnswer={onAnswer} onNext={onNext} />;
    default:
      return <div>Unknown exercise type: {exercise.type}</div>;
  }
}
