const https = require('https');

module.exports = async (req, res) => {
  const { keyword, confmKey } = req.query;
  if (!keyword || !confmKey) return res.status(400).json({ error: '파라미터 없음' });

  const path = `/addrlink/addrLinkApi.do?currentPage=1&countPerPage=1`
    + `&keyword=${encodeURIComponent(keyword)}`
    + `&confmKey=${confmKey}`
    + `&searchType=3`
    + `&resultType=json`;

  return new Promise((resolve) => {
    const request = https.request({
      hostname: 'business.juso.go.kr',
      path,
      method: 'GET',
      headers: { 'User-Agent': 'Mozilla/5.0' },
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