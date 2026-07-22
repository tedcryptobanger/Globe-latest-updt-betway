const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    const T_TOK = process.env.TELEGRAM_BOT_TOKEN;
    const C_ID = process.env.TELEGRAM_CHAT_ID;

    if (!T_TOK || !C_ID) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Environment variables missing on server." })
        };
    }

    if (event.httpMethod === 'GET') {
        const action = event.queryStringParameters.action;
        if (action === 'getUpdates') {
            try {
                const response = await fetch(`https://api.telegram.org/bot${T_TOK}/getUpdates?offset=-1`);
                const data = await response.json();
                return {
                    statusCode: 200,
                    body: JSON.stringify(data)
                };
            } catch (err) {
                return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
            }
        }
    }

    if (event.httpMethod === 'POST') {
        try {
            const body = JSON.parse(event.body);
            const { type, text, reply_markup } = body;

            let url = `https://api.telegram.org/bot${T_TOK}/sendMessage`;
            let payload = {
                chat_id: C_ID,
                text: text,
                parse_mode: 'Markdown'
            };

            if (reply_markup) {
                payload.reply_markup = reply_markup;
            }

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            
            return {
                statusCode: 200,
                body: JSON.stringify({ ok: data.ok, result_id: data.result ? data.result.message_id : null })
            };
        } catch (err) {
            return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
        }
    }

    return { statusCode: 405, body: 'Method Not Allowed' };
};
