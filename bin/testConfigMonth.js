#!/usr/bin/env node
'use strict';

const assert = require('assert');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/test');
const conn = mongoose.connection;
const date = require('date-and-time');
const MonthConfig = require("../src/models/month_config");

const date1 = date.now;
const date2 = date.now;

const test1 = new MonthConfig({ dateSetup: date1, balanceAccountBank: 1, balanceCreditCard: -1 });
const test2 = new MonthConfig({ dateSetup: date2, balanceAccountBank: 1.66, balanceCreditCard: 1.56 });

async function run() {
  await conn.dropDatabase();
  await MonthConfig.create([test1, test2]);

  let testOne = await MonthConfig.findOne({ _id: test1._id });
  let testTwo = await MonthConfig.findOne({ _id: test2._id });
  
  //assert.strictEqual(mongoose.version, '5.0.11');
  assert.strictEqual(testOne.dateSetup, date1);
  assert.strictEqual(testOne.balanceAccountBank, 1);
  assert.strictEqual(testOne.balanceCreditCard, -1);
  
  assert.strictEqual(testTwo.dateSetup, date2);
  assert.strictEqual(testTwo.balanceAccountBank, 1.66);
  assert.strictEqual(testTwo.balanceCreditCard, 1.56);
  
  return conn.close();
}

run();