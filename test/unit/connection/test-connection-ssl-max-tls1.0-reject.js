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
    var NODE_MAJOR_VERSION = process.versions.node.split('.')[0];
    if (!err && NODE_MAJOR_VERSION >= 10) assert.fail('Expected to fail due to mismatched TLS versions for Node12+');
    connection.destroy();
    server.destroy();
  });
});

server.on('connection', function(incomingConnection) {
  incomingConnection.handshake({
    serverCapabilities1: common.ClientConstants.CLIENT_SSL
  });
});
