import { SentenceChallengeData } from '@/types'

export function validateSentenceChallenge(challenge: SentenceChallengeData): boolean {
  if (challenge.sentences.length !== 5) return false
  if (challenge.wordBank.length !== 6) return false
  if (Object.keys(challenge.correctMapping).length !== 5) return false
  
  const mappedWords = new Set(Object.values(challenge.correctMapping))
  if (mappedWords.size !== 5) return false
  
  if (mappedWords.has(challenge.extraWord)) return false
  
  return true
}

export function checkSentenceChallengeAnswers(
  challenge: SentenceChallengeData,
  userAnswers: Record<number, string>
) {
  const results = []
  let correctCount = 0
  
  for (let i = 0; i < 5; i++) {
    const correctWord = challenge.correctMapping[i]
    const userWord = userAnswers[i] || ''
    const isCorrect = correctWord === userWord
    
    if (isCorrect) correctCount++
    
    results.push({
      sentenceIndex: i,
      correct: isCorrect,
      correctWord,
      userWord
    })
  }
  
  return {
    results,
    score: correctCount
  }
}
