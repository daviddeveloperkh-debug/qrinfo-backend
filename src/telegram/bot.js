import { sql } from 'drizzle-orm'
import { db } from '../db/index.js'

const WEEKLY_LIST_LIMIT = 50

const escapeHtml = value =>
        String(value ?? '')
                .replaceAll('&', '&amp;')
                .replaceAll('<', '&lt;')
                .replaceAll('>', '&gt;')

const apiCall = async (method, body) => {
        const botToken = process.env.TELEGRAM_BOT_TOKEN
        if (!botToken) return null

        try {
                const res = await fetch(
                        `https://api.telegram.org/bot${botToken}/${method}`,
                        {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(body),
                        },
                )
                return await res.json()
        } catch (error) {
                console.error(`Telegram ${method} xatosi:`, error.message)
                return null
        }
}

const BTN = {
        WEEKLY: '📅 Haftalik',
        MONTHLY: '🗓 Oylik',
        TOTAL: '👥 Jami baza',
}

const replyKeyboard = {
        keyboard: [[{ text: BTN.WEEKLY }, { text: BTN.MONTHLY }], [{ text: BTN.TOTAL }]],
        resize_keyboard: true,
        is_persistent: true,
}

const sendMenu = (chatId, title = "Hisobotni tanlang 👇") =>
        apiCall('sendMessage', {
                chat_id: chatId,
                text: title,
                reply_markup: replyKeyboard,
        })

const studentsTableExists = async () => {
        const result = await db.execute(
                sql`SELECT to_regclass('public.students') AS t`,
        )
        return result.rows?.[0]?.t != null
}

const countSince = async interval => {
        if (!(await studentsTableExists())) return 0
        const result = await db.execute(sql`
                SELECT COUNT(*)::int AS total
                FROM students
                WHERE created_at >= now() - ${sql.raw(`interval '${interval}'`)}
        `)
        return result.rows?.[0]?.total ?? 0
}

const countAll = async () => {
        if (!(await studentsTableExists())) return 0
        const result = await db.execute(sql`SELECT COUNT(*)::int AS total FROM students`)
        return result.rows?.[0]?.total ?? 0
}

const weeklyList = async () => {
        if (!(await studentsTableExists())) return []
        const result = await db.execute(sql`
                SELECT last_name, first_name, certificate_number
                FROM students
                WHERE created_at >= now() - interval '7 days'
                ORDER BY created_at DESC
                LIMIT ${WEEKLY_LIST_LIMIT}
        `)
        return result.rows ?? []
}

const buildWeeklyText = async () => {
        const [count, list] = await Promise.all([countSince('7 days'), weeklyList()])

        let text = `📅 <b>Haftalik (oxirgi 7 kun)</b>\n👥 Qo'shilganlar: <b>${count} ta</b>\n`

        if (list.length > 0) {
                text += '\n'
                list.forEach((row, i) => {
                        const fio = [row.last_name, row.first_name].filter(Boolean).join(' ')
                        text += `${i + 1}. ${escapeHtml(fio)} — №${escapeHtml(row.certificate_number)}\n`
                })
                if (count > WEEKLY_LIST_LIMIT) {
                        text += `\n… va yana ${count - WEEKLY_LIST_LIMIT} ta`
                }
        }
        return text
}

const buildMonthlyText = async () => {
        const count = await countSince('1 month')
        return `🗓 <b>Oylik (oxirgi 30 kun)</b>\n👥 Qo'shilganlar: <b>${count} ta</b>`
}

const buildTotalText = async () => {
        const count = await countAll()
        return `👥 <b>Bazadagi jami talabalar:</b> ${count} ta`
}

const sendReport = async (chatId, kind) => {
        let text
        try {
                if (kind === BTN.WEEKLY) text = await buildWeeklyText()
                else if (kind === BTN.MONTHLY) text = await buildMonthlyText()
                else text = await buildTotalText()
        } catch (error) {
                console.error('Bot hisobot xatosi:', error.message)
                text = '⚠️ Hisobotni olishda xatolik yuz berdi'
        }

        await apiCall('sendMessage', {
                chat_id: chatId,
                text,
                parse_mode: 'HTML',
                reply_markup: replyKeyboard,
        })
}

const handleUpdate = async update => {
        const allowedChatId = process.env.TELEGRAM_CHAT_ID
        const message = update.message
        const chatId = message?.chat?.id

        if (!chatId || String(chatId) !== String(allowedChatId)) return

        const text = (message.text || '').trim()

        if (text === BTN.WEEKLY || text === BTN.MONTHLY || text === BTN.TOTAL) {
                await sendReport(chatId, text)
                return
        }

        await sendMenu(chatId)
}

const pollLoop = async () => {
        let offset = 0
        while (true) {
                const data = await apiCall('getUpdates', { timeout: 30, offset })
                if (data?.ok && Array.isArray(data.result)) {
                        for (const update of data.result) {
                                offset = update.update_id + 1
                                await handleUpdate(update)
                        }
                } else {
                        await new Promise(r => setTimeout(r, 3000))
                }
        }
}

export const initTelegramBot = () => {
        if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
                console.log('ℹ️  Telegram bot o\'chirilgan (token/chat_id yo\'q)')
                return
        }

        const instanceId = process.env.NODE_APP_INSTANCE
        if (instanceId !== undefined && instanceId !== '0') {
                console.log('ℹ️  Telegram bot faqat 1-instance da ishlaydi (cluster mode)')
                return
        }
        pollLoop().catch(err => console.error('Telegram bot to\'xtadi:', err.message))
        console.log('🤖 Telegram bot ishga tushdi (hisobot tugmalari)')
}

export default { initTelegramBot }
