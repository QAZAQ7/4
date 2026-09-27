export async function sendTelegram(chatId: number | string, text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("Telegram bot is not configured.");
  const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: {"content-type":"application/json"},
    body: JSON.stringify({ chat_id: chatId, text })
  });
  if (!r.ok) throw new Error((await r.text()).slice(0,500));
}
