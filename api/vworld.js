const https = require('https');

module.exports = async (req, res) => {
  const { addr, key } = req.query;
  if (!addr || !key) return res.status(400).json({ error: '파라미터 없음' });

  const path = `/ned/data/getLandUseAttr`
    + `?key=${key}`
    + `&domain=sun-flax.vercel.app`
    + `&address=${encodeURIComponent(addr)}`
    + `&format=json`
    + `&numOfRows=1`
    + `&pageNo=1`;

  return new Promise((resolve) => {
    const request = https.request({
      hostname: 'api.vworld.kr',
      path,
      method: 'GET',
      headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://sun-flax.vercel.app' },
      timeout: 8000
    }, (response) => {
      response.setEncoding('utf8');
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => {
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(data);
        resolve();
      });
    });
    request.on('error', e => { res.status(500).json({ error: e.message }); resolve(); });
    request.on('timeout', () => { request.destroy(); res.status(500).json({ error: 'timeout' }); resolve(); });
    request.end();
  });
};