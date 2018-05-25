
import test from 'ava';
import { LANG_REG, WIKI_DATA_ID_REG } from './helpers';

test('LANG_REG', t => {
    t.true(LANG_REG.test('ro'))
    t.false(LANG_REG.test('R1'))
})

test('WIKI_DATA_ID_REG', t => {
    t.true(WIKI_DATA_ID_REG.test('Q1'))
    t.true(WIKI_DATA_ID_REG.test('Q12'))
    t.false(WIKI_DATA_ID_REG.test('a18'))
    t.false(WIKI_DATA_ID_REG.test('QQ'))
})
