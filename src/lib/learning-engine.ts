import { VocabularyItem, VocabularyProgressData, Difficulty } from '@/types';
import { shuffleArray } from '@/lib/utils';
import prisma from '@/lib/prisma';

export type ExerciseType = 'translation' | 'multiple_choice' | 'sentence_completion' | 'spelling' | 'context' | 'matching';

export interface Exercise {
  id: string;
  type: ExerciseType;
  word: VocabularyItem;
  question: string;
  options?: string[];
  correctAnswer: string;
  matchingPairs?: { word: string; translation: string }[];
  context?: string;
}

export interface ExerciseResult {
  isCorrect: boolean;
  exerciseType: ExerciseType;
  vocabularyId: string;
}

export function selectExerciseType(word: VocabularyItem, progress: VocabularyProgressData | null, difficulty: Difficulty): ExerciseType {
  const confidence = progress?.confidenceScore || 0;
  
  if (confidence < 0.4) {
    const easyTypes: ExerciseType[] = ['translation', 'multiple_choice'];
    return easyTypes[Math.floor(Math.random() * easyTypes.length)];
  } else if (confidence < 0.8) {
    const mediumTypes: ExerciseType[] = ['sentence_completion', 'context', 'matching'];
    return mediumTypes[Math.floor(Math.random() * mediumTypes.length)];
  } else {
    const hardTypes: ExerciseType[] = ['spelling', 'context'];
    return hardTypes[Math.floor(Math.random() * hardTypes.length)];
  }
}

export function generateExercise(word: VocabularyItem, allWords: VocabularyItem[], type: ExerciseType, difficulty: Difficulty): Exercise {
  const otherWords = shuffleArray(allWords.filter(w => w.id !== word.id)).slice(0, 3);
  const translation = word.translation || word.word;
  
  switch (type) {
    case 'translation': {
      const isWordToTranslation = Math.random() > 0.5;
      const options = shuffleArray([
        isWordToTranslation ? translation : word.word,
        ...otherWords.map(w => isWordToTranslation ? (w.translation || w.word) : w.word)
      ]);
      return {
        id: `trans_${word.id}_${Date.now()}`,
        type,
        word,
        question: isWordToTranslation ? word.word : translation,
        options,
        correctAnswer: isWordToTranslation ? translation : word.word,
      };
    }
    case 'multiple_choice': {
      const options = shuffleArray([
        word.word,
        ...otherWords.map(w => w.word)
      ]);
      return {
        id: `mc_${word.id}_${Date.now()}`,
        type,
        word,
        question: `Which word means "${translation}"?`,
        options,
        correctAnswer: word.word,
      };
    }
    case 'sentence_completion': {
      const sentence = word.exampleSentence || `This is an example sentence for ${word.word}.`;
      const regex = new RegExp(`\\b${word.word}\\b`, 'gi');
      const blankedSentence = sentence.replace(regex, '______');
      
      const options = shuffleArray([
        word.word,
        ...otherWords.map(w => w.word)
      ]);
      return {
        id: `sc_${word.id}_${Date.now()}`,
        type,
        word,
        question: blankedSentence,
        options,
        correctAnswer: word.word,
      };
    }
    case 'spelling': {
      return {
        id: `spell_${word.id}_${Date.now()}`,
        type,
        word,
        question: `Spell the English word for "${translation}"`,
        correctAnswer: word.word,
      };
    }
    case 'context': {
      const context = word.exampleSentence || `This is a context sentence for ${word.word}.`;
      const blankedContext = context.replace(new RegExp(`\\b${word.word}\\b`, 'gi'), '______');
      const options = shuffleArray([
        word.word,
        ...otherWords.map(w => w.word)
      ]);
      return {
        id: `ctx_${word.id}_${Date.now()}`,
        type,
        word,
        question: blankedContext,
        options,
        correctAnswer: word.word,
        context: context
      };
    }
    case 'matching': {
      const pairs = [
        { word: word.word, translation: translation },
        ...otherWords.map(w => ({ word: w.word, translation: w.translation || w.word }))
      ];
      return {
        id: `match_${word.id}_${Date.now()}`,
        type,
        word,
        question: 'Match the words with their translations',
        correctAnswer: '',
        matchingPairs: pairs,
      };
    }
    default:
      return {
         id: `def_${word.id}_${Date.now()}`,
         type: 'translation',
         word,
         question: word.word,
         options: [translation, ...otherWords.map(w => w.translation || w.word)],
         correctAnswer: translation
      };
  }
}

export async function getNextWords(userId: string, count: number) {
  const words = await prisma.vocabulary.findMany({
    where: { userId },
    include: { progress: true }
  });
  
  const now = new Date();
  
  const sortedWords = words.sort((a: any, b: any) => {
    const aProgress = a.progress;
    const bProgress = b.progress;
    
    if (!aProgress && !bProgress) return 0;
    if (!aProgress) return -1;
    if (!bProgress) return 1;
    
    const aDue = aProgress.nextReviewDate && aProgress.nextReviewDate <= now;
    const bDue = bProgress.nextReviewDate && bProgress.nextReviewDate <= now;
    
    if (aDue && !bDue) return -1;
    if (!aDue && bDue) return 1;
    
    return (aProgress.confidenceScore || 0) - (bProgress.confidenceScore || 0);
  });
  
  return sortedWords.slice(0, count);
}
