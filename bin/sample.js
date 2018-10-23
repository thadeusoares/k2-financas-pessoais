#!/usr/bin/env node
'use strict';

const assert = require('assert');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/test');
const conn = mongoose.connection;
const Schema = mongoose.Schema;

const schema = new Schema({
  error: {
    type: Schema.Types.Mixed,
    required: true,
    unique: false
  }
});

const Test = mongoose.model('test', schema);

const test1 = new Test({ error: 'one' });
const test2 = new Test({ error: { two: 'three' } });
const test3 = new Test({
  error: {
    errors: {
      one: '1',
      two: '2',
      three: ['four', { five: 6 }, [7, 'eight', 9]]
    }
  }
});
async function run() {
  await conn.dropDatabase();
  await Test.create([test1, test2, test3]);

  let testOne = await Test.findOne({ _id: test1._id });
  let testTwo = await Test.findOne({ _id: test2._id });
  let testThree = await Test.findOne({ _id: test3._id });
  
  assert.strictEqual(mongoose.version, '5.0.11');
  assert.strictEqual(testOne.error, 'one');
  assert.deepEqual(testTwo.error, { two: 'three' });
  assert.strictEqual(testThree.error.errors.one, '1');
  assert.strictEqual(testThree.error.errors.two, '2');
  assert.strictEqual(testThree.error.errors.three[0], 'four');
  assert.deepEqual(testThree.error.errors.three[1], { five: 6 });
  assert.deepEqual(testThree.error.errors.three[2], [7, 'eight', 9]);

  return conn.close();
}

run();