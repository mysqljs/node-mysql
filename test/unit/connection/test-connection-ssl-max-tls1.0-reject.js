var assert     = require('assert');
var common     = require('../../common');
var connection = common.createConnection({
  port : common.fakeServerPort,
  ssl  : {
    ca         : common.getSSLConfig().ca,
    maxVersion : 'TLSv1'
  }
});

var server = common.createFakeServer({
  ssl: {
    minVersion: 'TLSv1.2'
  }
});

server.listen(common.fakeServerPort, function(err) {
  if (err) throw err;

  connection.ping(function(err) {
    var NODE_MAJOR_VERSION = parseInt(process.versions.node.split('.')[0], 10);
    if (NODE_MAJOR_VERSION >= 10) {
      if (!err) assert.fail('Expected to fail due to mismatched TLS versions for Node12+');

      var message = err.message;
      if (NODE_MAJOR_VERSION < 12) {
        assert.equal(/Connection lost: The server closed the connection/.test(message), true);
      } else {
        assert.equal(/error:141E70BF:SSL routines:tls_construct_client_hello:no protocols available:/g.test(message), true);
      }
    }
    connection.destroy();
    server.destroy();
  });
});

server.on('connection', function(incomingConnection) {
  incomingConnection.handshake({
    serverCapabilities1: common.ClientConstants.CLIENT_SSL
  });
});
