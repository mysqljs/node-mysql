var assert     = require('assert');
var common     = require('../../common');
var connection = common.createConnection({
  port : common.fakeServerPort,
  ssl  : {
    ca: common.getSSLConfig().ca,
    minVersion: 'TLSv1.2'
  }
});

var server = common.createFakeServer({
  ssl: {
    maxVersion: 'TLSv1'
  }
});

server.listen(common.fakeServerPort, function(err) {
  const NODE_MAJOR_VERSION = process.versions.node.split('.')[0];
  if (err) throw err;
  connection.ping(function(err) {
    if (!err && NODE_MAJOR_VERSION >= 10) assert.fail("Should have thrown when running Node12")
    connection.destroy();
    server.destroy();
  });
});

server.on('connection', function(incomingConnection) {
  incomingConnection.handshake({
    serverCapabilities1: common.ClientConstants.CLIENT_SSL
  });
});
