const https = require('https');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { prompt } = req.body || {};
  if (!prompt) return res.status(400).json({ error: '프롬프트 없음' });

  const CLAUDE_KEY = process.env.CLAUDE_KEY;
  if (!CLAUDE_KEY) return res.status(500).json({ error: 'API 키 없음' });

  const reqBody = JSON.stringify({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }]
  });

  return new Promise((resolve) => {
    const request = https.request({
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(reqBody)
      },
      timeout: 25000
    }, (response) => {
      response.setEncoding('utf8');
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => {
        try {
          const json = JSON.parse(data);
          const text = json?.content?.[0]?.text || '';
          res.status(200).json({ text });
        } catch(e) {
          res.status(200).json({ text: '', error: data });
        }
        resolve();
      });
    });
    request.on('error', e => { res.status(200).json({ text: '', error: e.message }); resolve(); });
    request.on('timeout', () => { request.destroy(); res.status(200).json({ text: '', error: 'timeout' }); resolve(); });
    request.write(reqBody);
    request.end();
  });
};