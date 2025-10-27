// server.js (CommonJS version, tanpa "type": "module")

const https = require('https');
const fs = require('fs');
const path = require('path');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const CERT_DIR = path.join(process.cwd(), 'certificate');
const httpsOptions = {
  key: fs.readFileSync(path.join(CERT_DIR, 'emkl.key')),
  cert: fs.readFileSync(path.join(CERT_DIR, 'emkl.crt'))
  // ca: fs.readFileSync(path.join(CERT_DIR, 'jakarta_transporindo_com_cert.pem')), // optional chain
};

app.prepare().then(() => {
  https
    .createServer(httpsOptions, (req, res) => {
      handle(req, res);
    })
    .listen(3000, () => {
      console.log('✅ Next.js HTTPS running on https://localhost:3000');
    });
});
