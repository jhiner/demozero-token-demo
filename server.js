const dotenv = require('dotenv');
const debug = require('debug')('nodejs-regular-webapp2:server');
const https = require('https');
const fs = require('fs');
dotenv.config();

const env = require('./lib/env');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const init = async () => {
  await env.bootstrapProcess();
  const app = require('./app');

  const port = normalizePort(process.env.PORT || '4000');
  app.set('port', port);

  console.log('>>> Using env:');
  console.log(env.getEnv());

  const server = https.createServer(
    {
      key: fs.readFileSync('server.key'),
      cert: fs.readFileSync('server.cert'),
    },
    app
  );

  server.listen(port);

  server.on('error', (error) => {
    if (error.syscall !== 'listen') {
      throw error;
    }

    const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

    switch (error.code) {
      case 'EACCES':
        console.error(bind + ' requires elevated privileges');
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(bind + ' is already in use');
        process.exit(1);
        break;
      default:
        throw error;
    }
  });

  server.on('listening', () => {
    const addr = server.address();
    const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
    debug('Listening on ' + bind);
    console.log('Listening on ' + bind);
  });
};

const normalizePort = (portValue) => {
  const port = parseInt(portValue, 10);

  if (isNaN(port)) {
    return portValue;
  }

  if (port >= 0) {
    return port;
  }

  return false;
};

init();
