export async function sendTelegramNotification({
  type,
  subject,
  message,
  userName,
  userEmail,
  telegramUsername,
  contactInfo,
  userId,
}: {
  type: string
  subject: string
  message: string
  userName?: string
  userEmail?: string
  telegramUsername?: string
  contactInfo?: string
  userId?: string | null
}): Promise<{ success: boolean; error?: string }> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID || '5744904641'

  const typeLabels: Record<string, string> = {
    suggestion: '💡 TAKLIF (G\'oya)',
    complaint: '⚠️ SHIKOYAT (Muammo)',
    bug: '🐛 XATOLIK (Bug Report)',
    question: '❓ SAVOL (Yordam)',
    praise: '⭐ MINNATDORCHILIK',
  }

  const typeHeader = typeLabels[type] || '📩 ARIZA / MUROJAAT'
  const time = new Date().toLocaleString('uz-UZ', { 
    timeZone: 'Asia/Tashkent',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })

  // Format Telegram User cleanly
  const rawTg = telegramUsername || contactInfo || ''
  let tgDisplay = ''
  if (rawTg) {
    const cleanTg = rawTg.trim().replace(/^@/, '')
    if (!rawTg.includes(' ') && !rawTg.startsWith('+') && !rawTg.match(/^[0-9]+$/)) {
      tgDisplay = `@${escapeHtml(cleanTg)} — <a href="https://t.me/${cleanTg}">[Profilga yozish]</a>`
    } else {
      tgDisplay = `<code>${escapeHtml(rawTg)}</code>`
    }
  } else {
    tgDisplay = '<i>Ko\'rsatilmagan</i>'
  }

  const formattedText = `
🔔 <b>STUDY WITH HERO — YANGI ARIZA</b>

👤 <b>Yuboruvchi (Ism):</b> ${escapeHtml(userName || 'Anonim')}
💬 <b>Telegram User:</b> ${tgDisplay}
📧 <b>Email:</b> <code>${escapeHtml(userEmail || 'Mavjud emas')}</code>
${userId ? `🆔 <b>Saytdagi ID:</b> <code>${escapeHtml(userId)}</code>\n` : ''}
━━━━━━━━━━━━━━━━━━
📋 <b>Murojaat turi:</b> ${typeHeader}
📌 <b>Mavzu:</b> <b>${escapeHtml(subject)}</b>

💬 <b>Xabar matni:</b>
${escapeHtml(message)}
━━━━━━━━━━━━━━━━━━
🕒 <b>Vaqti:</b> ${time}
🌐 <b>Sayt:</b> Study with HERO (studywithhero.com)
`.trim()

  if (!botToken) {
    console.log('[Telegram Notification Log (Bot token not set)]:\n' + formattedText)
    return { success: false, error: 'Bot token sozlanmagan' }
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: formattedText,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    })

    const data = await res.json()
    if (!data.ok) {
      console.error('Telegram API error:', data)
      return { success: false, error: data.description }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Telegram send error:', error)
    return { success: false, error: error.message }
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
