const https = require('https');

module.exports = async (req, res) => {
  const { addr, key } = req.query;
  if (!addr || !key) return res.status(400).json({ error: '파라미터 없음' });

  const path = `/req/data?service=data&request=GetFeature&data=LP_PA_CBND_BUBUN`
    + `&key=${key}`
    + `&geometry=false&attribute=true&page=1&size=1`
    + `&query=${encodeURIComponent(addr)}`
    + `&format=json`;

  return new Promise((resolve) => {
    const request = https.request({
      hostname: 'api.vworld.kr',
      path,
      method: 'GET',
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 8000
    }, (response) => {
      response.setEncoding('utf8');
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => {
        try {
          res.setHeader('Content-Type', 'application/json');
          res.status(200).send(data);
        } catch(e) {
          res.status(500).json({ error: e.message });
        }
        resolve();
      });
    });
    request.on('error', e => { res.status(500).json({ error: e.message }); resolve(); });
    request.on('timeout', () => { request.destroy(); res.status(500).json({ error: 'timeout' }); resolve(); });
    request.end();
  });
};
