var assert     = require('assert');
var common     = require('../../common');
var connection = common.createConnection({
  port : common.fakeServerPort,
  ssl  : {
    ca         : common.getSSLConfig().ca,
    minVersion : 'TLSv1'
  }
});

var server = common.createFakeServer({
  ssl: {
    maxVersion: 'TLSv1'
  }
});

server.listen(common.fakeServerPort, function(err) {
  if (err) throw err;

  connection.ping(function(err) {
    assert.ifError(err);
    connection.destroy();
    server.destroy();
  });
});

server.on('connection', function(incomingConnection) {
  incomingConnection.handshake({
    serverCapabilities1: common.ClientConstants.CLIENT_SSL
  });
});
