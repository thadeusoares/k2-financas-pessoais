#!/usr/bin/env node
'use strict';

const assert = require('assert');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/test');
const conn = mongoose.connection;
const Schema = mongoose.Schema;

const TypeOfEntries = Object.freeze({
  //Pessoa Física
  pf01: "PF/Débito",
  pf02: "PF/Dinheiro",
  pf03: "PF/Crédito",
  //Pessoa Jurídica
  pj01: "PJ/Débito",
  pj02: "PJ/Dinheiro",
  pj03: "PJ/Crédito",
  pj04: "PJ/Financiamento",
});

const EntrySchema = new mongoose.Schema({
  description: String,
  typeOfEntry: {
    type: String,
    enum: Object.values(TypeOfEntries),
  },
});


Object.assign(EntrySchema.statics, {
  TypeOfEntries,
});


const Entry = mongoose.model('Entry', EntrySchema);


const test1 = new Entry({ description: 'one' });
const test2 = new Entry({ description: 'two', typeOfEntry: TypeOfEntries.pf01 });

async function run() {
  await conn.dropDatabase();
  await Entry.create([test1, test2]);

  let testOne = await Entry.findOne({ _id: test1._id });
  let testTwo = await Entry.findOne({ _id: test2._id });
  
  //assert.strictEqual(mongoose.version, '5.0.11');
  assert.strictEqual(testOne.description, 'one');
  assert.strictEqual(testTwo.typeOfEntry, TypeOfEntries.pf01 );
  
  return conn.close();
}

run();