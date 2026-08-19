import { VocabularyItem, TestConfig, QuestionType, SentenceChallengeData } from '@/types'
import { shuffleArray, generateId } from '@/lib/utils'

export function generateTranslationQuestion(word: VocabularyItem, allWords: VocabularyItem[], difficulty: string) {
  const options = [word.translation || word.word]
  const distractors = allWords
    .filter(w => w.id !== word.id && w.translation)
    .map(w => w.translation as string)
  
  options.push(...shuffleArray(distractors).slice(0, 3))
  
  return {
    type: 'translation',
    questionData: {
      question: `What is the translation of "${word.word}"?`,
      options: shuffleArray(options),
      word: word.word
    },
    correctAnswer: word.translation || word.word
  }
}

export function generateMultipleChoiceQuestion(word: VocabularyItem, allWords: VocabularyItem[], difficulty: string) {
  const options = [word.word]
  const distractors = allWords
    .filter(w => w.id !== word.id)
    .map(w => w.word)
  
  options.push(...shuffleArray(distractors).slice(0, 3))
  
  return {
    type: 'multiple_choice',
    questionData: {
      question: `Which word means "${word.translation}"?`,
      options: shuffleArray(options)
    },
    correctAnswer: word.word
  }
}

export function generateSpellingQuestion(word: VocabularyItem, difficulty: string) {
  return {
    type: 'spelling',
    questionData: {
      question: `Type the word that means: "${word.translation}"`,
      translation: word.translation || '',
      pronunciation: word.pronunciation || undefined
    },
    correctAnswer: word.word
  }
}

export function generateContextQuestion(word: VocabularyItem, allWords: VocabularyItem[], difficulty: string) {
  let sentence = word.exampleSentence
  if (!sentence) {
    const pos = word.partOfSpeech?.toLowerCase() || 'noun'
    if (pos.includes('verb')) sentence = `They need to ${word.word} before making a decision.`
    else if (pos.includes('adj')) sentence = `It was a ${word.word} moment in history.`
    else if (pos.includes('adv')) sentence = `She ${word.word} completed the entire assignment.`
    else sentence = `The ${word.word} was unexpected but welcome.`
  }

  const blankedSentence = sentence.replace(new RegExp(`\\b${word.word}\\b`, 'i'), '_____')
  
  const options = [word.word]
  const distractors = allWords
    .filter(w => w.id !== word.id)
    .map(w => w.word)
  
  options.push(...shuffleArray(distractors).slice(0, 3))

  return {
    type: 'context',
    questionData: {
      question: `Fill in the blank:`,
      sentence: blankedSentence,
      options: shuffleArray(options)
    },
    correctAnswer: word.word
  }
}

export function generateSentenceChallenge(words: VocabularyItem[]): SentenceChallengeData {
  const selectedWords = shuffleArray(words).slice(0, 5)
  const allOtherWords = words.filter(w => !selectedWords.find(sw => sw.id === w.id))
  const extraWord = allOtherWords.length > 0 ? shuffleArray(allOtherWords)[0].word : 'extra'

  const sentences: string[] = []
  const correctMapping: Record<number, string> = {}

  selectedWords.forEach((word, index) => {
    let sentence = word.exampleSentence
    if (!sentence) {
      const pos = word.partOfSpeech?.toLowerCase() || 'noun'
      if (pos.includes('verb')) sentence = `They need to ${word.word} before making a decision.`
      else if (pos.includes('adj')) sentence = `It was a ${word.word} moment in history.`
      else if (pos.includes('adv')) sentence = `She ${word.word} completed the entire assignment.`
      else sentence = `The ${word.word} was unexpected but welcome.`
    }
    const blankedSentence = sentence.replace(new RegExp(`\\b${word.word}\\b`, 'i'), '_____')
    sentences.push(blankedSentence)
    correctMapping[index] = word.word
  })

  const wordBank = shuffleArray([...selectedWords.map(w => w.word), extraWord])

  return {
    sentences,
    wordBank,
    correctMapping,
    extraWord
  }
}

export function generateTestQuestions(words: VocabularyItem[], config: TestConfig) {
  const totalQuestions = config.totalQuestions
  const blocksCount = Math.ceil(totalQuestions / 5)
  
  // Determine sentence challenge blocks
  let numSentenceChallengeBlocks = 0
  if ((config.questionTypes === 'mixed' || config.questionTypes === 'sentence_challenge') && words.length >= 6) {
    if (totalQuestions >= 30) numSentenceChallengeBlocks = 2
    else if (totalQuestions >= 20) numSentenceChallengeBlocks = 1
  }
  if (config.questionTypes === 'sentence_challenge' && words.length >= 6) {
    numSentenceChallengeBlocks = blocksCount
  }

  const scBlockIndices: number[] = []
  if (numSentenceChallengeBlocks === 1) {
    scBlockIndices.push(Math.floor(blocksCount / 2))
  } else if (numSentenceChallengeBlocks === 2) {
    scBlockIndices.push(1)
    scBlockIndices.push(blocksCount - 2 >= 3 ? blocksCount - 2 : 3)
  } else if (numSentenceChallengeBlocks > 2) {
    for (let i = 0; i < blocksCount; i++) scBlockIndices.push(i)
  }

  // Calculate number of regular questions needed
  const regularBlockCount = blocksCount - scBlockIndices.length
  const regularQuestionsNeeded = regularBlockCount * 5

  // Determine available question types
  const allTypes: QuestionType[] = ['translation', 'multiple_choice', 'spelling', 'context']
  let availableTypes: QuestionType[]

  if (config.questionTypes === 'mixed') {
    availableTypes = [...allTypes]
  } else if (config.questionTypes === 'sentence_challenge') {
    availableTypes = ['translation'] // fallback for non-SC blocks
  } else {
    availableTypes = [config.questionTypes as QuestionType]
  }

  // Create a pool of words, each word used once before repeating
  // For variety: cycle through words so each word gets a different question type
  const shuffledWords = shuffleArray([...words])
  const wordPool: VocabularyItem[] = []
  while (wordPool.length < regularQuestionsNeeded) {
    wordPool.push(...shuffleArray([...words]))
  }

  // Distribute question types evenly across regular questions
  const typeAssignments: QuestionType[] = []
  for (let i = 0; i < regularQuestionsNeeded; i++) {
    typeAssignments.push(availableTypes[i % availableTypes.length])
  }
  // Shuffle the type assignments so they're not in predictable order
  const shuffledTypeAssignments = shuffleArray(typeAssignments)

  // Track which words have been used to avoid back-to-back repeats
  const usedWordIds = new Set<string>()
  let wordPoolIndex = 0

  const getNextWord = (): VocabularyItem => {
    // Try to find an unused word first
    for (let attempts = 0; attempts < words.length; attempts++) {
      const word = wordPool[wordPoolIndex % wordPool.length]
      wordPoolIndex++
      if (!usedWordIds.has(word.id) || usedWordIds.size >= words.length) {
        // If all words have been used, clear and start fresh
        if (usedWordIds.size >= words.length) {
          usedWordIds.clear()
        }
        usedWordIds.add(word.id)
        return word
      }
    }
    // Fallback: just return the next word
    const word = wordPool[wordPoolIndex % wordPool.length]
    wordPoolIndex++
    return word
  }

  const questions: any[] = []
  let regularQuestionIndex = 0
  
  for (let b = 0; b < blocksCount; b++) {
    const blockNumber = b + 1
    
    if (scBlockIndices.includes(b)) {
      // Sentence Challenge block
      const scData = generateSentenceChallenge(words)
      questions.push({
        id: generateId(),
        testId: '',
        type: 'sentence_challenge',
        questionData: scData as any,
        correctAnswer: JSON.stringify(scData.correctMapping),
        blockNumber,
        orderInBlock: 1
      })
    } else {
      // Regular block — generate 5 varied questions
      for (let i = 0; i < 5; i++) {
        const word = getNextWord()
        const type = shuffledTypeAssignments[regularQuestionIndex] || availableTypes[0]
        regularQuestionIndex++
        
        let qData
        switch (type) {
          case 'translation':
            qData = generateTranslationQuestion(word, words, config.difficulty)
            break
          case 'multiple_choice':
            qData = generateMultipleChoiceQuestion(word, words, config.difficulty)
            break
          case 'spelling':
            qData = generateSpellingQuestion(word, config.difficulty)
            break
          case 'context':
            qData = generateContextQuestion(word, words, config.difficulty)
            break
          default:
            qData = generateTranslationQuestion(word, words, config.difficulty)
        }
        
        questions.push({
          id: generateId(),
          testId: '',
          type: qData.type,
          questionData: qData.questionData,
          correctAnswer: qData.correctAnswer,
          blockNumber,
          orderInBlock: i + 1
        })
      }
    }
  }

  return questions.slice(0, totalQuestions)
}
