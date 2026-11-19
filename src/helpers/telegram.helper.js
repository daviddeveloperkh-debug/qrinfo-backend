const TZ = 'Asia/Tashkent'

const ROLE_NAMES = { 1: 'Admin', 2: 'Super Admin' }

const escapeHtml = value =>
        String(value ?? '')
                .replaceAll('&', '&amp;')
                .replaceAll('<', '&lt;')
                .replaceAll('>', '&gt;')

const formatNow = () =>
        new Date().toLocaleString('uz-UZ', {
                timeZone: TZ,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
        })

export const sendTelegramMessage = async text => {
        const botToken = process.env.TELEGRAM_BOT_TOKEN
        const chatId = process.env.TELEGRAM_CHAT_ID
        if (!botToken || !chatId) return

        try {
                const res = await fetch(
                        `https://api.telegram.org/bot${botToken}/sendMessage`,
                        {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                        chat_id: chatId,
                                        text,
                                        parse_mode: 'HTML',
                                        disable_web_page_preview: true,
                                }),
                        },
                )

                if (!res.ok) {
                        const body = await res.text().catch(() => '')
                        console.error('Telegram xabari yuborilmadi:', res.status, body)
                }
        } catch (error) {
                console.error('Telegram xatosi:', error.message)
        }
}

export const notifyStudentCreated = (student, operator) => {
        const fullName = [student?.lastName, student?.firstName, student?.patronymic]
                .filter(Boolean)
                .join(' ')

        const addedBy = operator
                ? `${ROLE_NAMES[operator.role] ?? 'Admin'} (ID: ${operator.id})`
                : "noma'lum"

        const text =
                `🆕 <b>Yangi talaba qo'shildi</b>\n\n` +
                `👤 <b>F.I.O:</b> ${escapeHtml(fullName)}\n` +
                `🎓 <b>Mutaxassislik:</b> ${escapeHtml(student?.specialty)}\n` +
                `🪪 <b>Pasport:</b> ${escapeHtml(student?.passportNumber)}\n` +
                `📄 <b>Sertifikat №:</b> ${escapeHtml(student?.certificateNumber)}\n` +
                `➕ <b>Qo'shdi:</b> ${escapeHtml(addedBy)}\n` +
                `🕒 <b>Vaqt:</b> ${formatNow()}`

        void sendTelegramMessage(text)
}

export const notifyMonthlyReport = (count, periodLabel) => {
        const text =
                `📊 <b>Oylik hisobot</b>\n\n` +
                `🗓 <b>Davr:</b> ${escapeHtml(periodLabel)}\n` +
                `👥 <b>Qo'shilgan talabalar:</b> ${count} ta`

        void sendTelegramMessage(text)
}

export default {
        sendTelegramMessage,
        notifyStudentCreated,
        notifyMonthlyReport,
}
