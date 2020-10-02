var common = require('../../common');
var assert = require('assert');
var pool   = common.createPool({
  connectionLimit    : 1,
  port               : common.fakeServerPort,
  queueLimit         : 5,
  waitForConnections : true
});

var server = common.createFakeServer();

server.listen(common.fakeServerPort, function (err) {
  assert.ifError(err);

  pool.getConnection(function (err, conn) {
    assert.ifError(err);

    pool.end({
      gracefulExit: true
    }, function (err) {
      assert.ifError(err);
      server.destroy();
    });

    pool.getConnection(function (err) {
      assert.ok(err);
      assert.equal(err.message, 'Pool is closed.');
      assert.equal(err.code, 'POOL_CLOSED');
    });

    conn.release();
  });

  pool.getConnection(function (err, conn) {
    assert.ifError(err);
    conn.release();
  });
});
