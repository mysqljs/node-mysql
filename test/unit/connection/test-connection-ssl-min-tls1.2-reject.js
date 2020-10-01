var assert     = require('assert');
var common     = require('../../common');
var connection = common.createConnection({
  port : common.fakeServerPort,
  ssl  : {
    ca         : common.getSSLConfig().ca,
    minVersion : 'TLSv1.2'
  }
});

var server = common.createFakeServer({
  ssl: {
    maxVersion: 'TLSv1'
  }
});

server.listen(common.fakeServerPort, function(err) {
  var NODE_MAJOR_VERSION = parseInt(process.versions.node.split('.')[0]);
  if (err) throw err;
  connection.ping(function(err) {
    if (NODE_MAJOR_VERSION >= 10) {
      if (!err) {
        assert.fail('Expected to fail due to mismatched TLS versions for Node10+');
      }
      var message = err.message;
      if (NODE_MAJOR_VERSION < 12) {
        assert.equal(/error:1425F102:SSL routines:ssl_choose_client_version:unsupported protocol:/.test(message), true);
      } else {
        assert.equal(/Connection lost: The server closed the connection/.test(message), true);
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
