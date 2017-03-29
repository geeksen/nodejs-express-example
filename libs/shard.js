
'use strict'

let crc = require('crc')
let sprintf = require('sprintfjs')

let Shard = function () { }

Shard.prototype.sByStr = function (req) {
  let iShardCount = req.app.get('cfg').shard.count
  return sprintf('db%03d', crc.crc32(req.session.shard_key_str_for_test) % iShardCount)
}

Shard.prototype.sByNum = function (req) {
  let iShardCount = req.app.get('cfg').shard.count
  return sprintf('db%03d', parseInt(req.session.shard_key_num_for_test) % iShardCount)
}

module.exports = new Shard()
