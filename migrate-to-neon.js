const { PrismaClient } = require('@prisma/client')
const { Pool } = require('@neondatabase/serverless')

async function migrate() {
  const neonUrl = 'postgresql://neondb_owner:npg_v4PCdAwRT1tH@ep-twilight-flower-b18mq29d.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require'
  const sqliteUrl = 'file:C:/Users/Ishonch/OneDrive/Desktop/Study with Herowither/prisma/dev.db'

  console.log('1. Reading local data from SQLite...')
  const sqlite = new PrismaClient({ datasources: { db: { url: sqliteUrl } } })

  const users = await sqlite.user.findMany()
  const vocabularies = await sqlite.vocabulary.findMany()
  const vocabProgress = await sqlite.vocabularyProgress.findMany()
  const tests = await sqlite.test.findMany({ include: { questions: true } })
  const reviewItems = await sqlite.reviewItem.findMany()
  const settings = await sqlite.userSettings.findMany()
  const feedbacks = await sqlite.feedback.findMany()

  console.log(`Found ${users.length} users, ${vocabularies.length} vocabulary words, ${tests.length} tests.`)

  console.log('2. Connecting to Neon PostgreSQL via @neondatabase/serverless...')
  const pool = new Pool({ connectionString: neonUrl })

  // Insert Users (conflict on email or id)
  for (const u of users) {
    await pool.query(
      `INSERT INTO users (id, name, email, "passwordHash", avatar, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (email) DO UPDATE SET
         name = EXCLUDED.name,
         "passwordHash" = EXCLUDED."passwordHash",
         avatar = EXCLUDED.avatar,
         "updatedAt" = EXCLUDED."updatedAt"`,
      [u.id, u.name, u.email, u.passwordHash, u.avatar, u.createdAt, u.updatedAt]
    )
    console.log(`✅ Synced User & Password: ${u.name} (${u.email})`)
  }

  // Get current user ID in Neon for raxmatullayevavazbek28@gmail.com
  const userRes = await pool.query(`SELECT id FROM users WHERE email = $1`, ['raxmatullayevavazbek28@gmail.com'])
  const neonUserId = userRes.rows[0]?.id
  console.log('Neon User ID:', neonUserId)

  // Insert Vocabulary
  for (const v of vocabularies) {
    const targetUserId = neonUserId || v.userId
    await pool.query(
      `INSERT INTO vocabulary (id, "userId", word, translation, "partOfSpeech", pronunciation, "exampleSentence", synonyms, antonyms, "personalNote", "difficultyLevel", "isLearned", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       ON CONFLICT (id) DO NOTHING`,
      [v.id, targetUserId, v.word, v.translation, v.partOfSpeech, v.pronunciation, v.exampleSentence, v.synonyms, v.antonyms, v.personalNote, v.difficultyLevel, v.isLearned, v.createdAt, v.updatedAt]
    )
  }
  console.log(`✅ Synced ${vocabularies.length} vocabulary items`)

  // Insert Vocabulary Progress
  for (const vp of vocabProgress) {
    const targetUserId = neonUserId || vp.userId
    await pool.query(
      `INSERT INTO vocabulary_progress (id, "vocabularyId", "userId", "correctCount", "wrongCount", accuracy, attempts, "lastReviewed", "confidenceScore", "nextReviewDate", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       ON CONFLICT (id) DO NOTHING`,
      [vp.id, vp.vocabularyId, targetUserId, vp.correctCount, vp.wrongCount, vp.accuracy, vp.attempts, vp.lastReviewed, vp.confidenceScore, vp.nextReviewDate, vp.createdAt, vp.updatedAt]
    )
  }

  // Insert Tests & Questions
  for (const t of tests) {
    const targetUserId = neonUserId || t.userId
    await pool.query(
      `INSERT INTO tests (id, "userId", "totalQuestions", "correctAnswers", accuracy, "timeTaken", difficulty, "questionTypes", status, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (id) DO NOTHING`,
      [t.id, targetUserId, t.totalQuestions, t.correctAnswers, t.accuracy, t.timeTaken, t.difficulty, t.questionTypes, t.status, t.createdAt, t.updatedAt]
    )
    for (const q of t.questions) {
      await pool.query(
        `INSERT INTO test_questions (id, "testId", type, "questionData", "correctAnswer", "userAnswer", "isCorrect", "blockNumber", "orderInBlock", explanation, "createdAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (id) DO NOTHING`,
        [q.id, q.testId, q.type, q.questionData, q.correctAnswer, q.userAnswer, q.isCorrect, q.blockNumber, q.orderInBlock, q.explanation, q.createdAt]
      )
    }
  }
  console.log(`✅ Synced ${tests.length} tests`)

  // Insert Feedbacks
  for (const f of feedbacks) {
    await pool.query(
      `INSERT INTO feedbacks (id, "userId", type, subject, message, "contactInfo", "userEmail", "userName", status, "sentToTg", "createdAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (id) DO NOTHING`,
      [f.id, f.userId, f.type, f.subject, f.message, f.contactInfo, f.userEmail, f.userName, f.status, f.sentToTg, f.createdAt]
    )
  }

  await pool.end()

  console.log('\n======================================================')
  console.log('🎉 SUCCESS! LOCAL USER & PASSWORD FULLY SYNCED TO NEON CLOUD!')
  console.log('======================================================\n')
}

migrate().catch(console.error)
