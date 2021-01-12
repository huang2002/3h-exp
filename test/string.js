// @ts-check
const HX = /** @type {import('..')} */(
    /** @type {unknown} */(require('../dist/hxs.umd.js'))
);

const { evalCode } = HX;

/**
 * @param {import('3h-test').TestContext} ctx
 */
exports.stringTests = ctx => {

    ctx.assertStrictEqual(evalCode('"\nabc\n"'), "\nabc\n");
    ctx.assertStrictEqual(evalCode('""'), "");
    ctx.assertStrictEqual(evalCode("'\n666\n'"), '\n666\n');
    ctx.assertStrictEqual(evalCode("'"), '');
    ctx.assertStrictEqual(evalCode('`\n233\n`'), `\n233\n`);
    ctx.assertStrictEqual(evalCode('``'), ``);
    ctx.assertStrictEqual(evalCode('#word'), 'word');
    ctx.assertStrictEqual(evalCode('# hello'), 'hello');
    ctx.assertStrictEqual(evalCode(`'abc'[0]`), 'a');
    ctx.assertStrictEqual(evalCode(`'abc'[2]`), 'c');
    ctx.assertStrictEqual(evalCode(`'abc'[-2]`), 'b');
    ctx.expectThrow(evalCode, TypeError, [`'abc'['a']`]);
    ctx.expectThrow(evalCode, RangeError, [`'abc'[3]`]);
    ctx.expectThrow(evalCode, RangeError, [`'abc'[-4]`]);

    ctx.assertStrictEqual(evalCode(`String.join(['a', 'b', 'c'])`), 'abc');
    ctx.assertStrictEqual(evalCode(`String.join(['a', 'b', 'c'], ',')`), 'a,b,c');
    ctx.assertStrictEqual(evalCode(`String.join([])`), '');
    ctx.assertStrictEqual(evalCode(`String.join([''])`), '');
    ctx.assertStrictEqual(evalCode(`String.join([], ',')`), '');
    ctx.assertStrictEqual(evalCode(`String.join([''], ',')`), '');
    ctx.expectThrow(evalCode, TypeError, [`String.join('foo', 'bar')`]);
    ctx.expectThrow(evalCode, TypeError, ['String.join([0])']);
    ctx.expectThrow(evalCode, TypeError, [`String.join([''], 1)`]);

    ctx.assertStrictEqual(evalCode(`String.toLowerCase('LowerCase')`), 'lowercase');
    ctx.expectThrow(evalCode, TypeError, ['String.toLowerCase(123)']);

    ctx.assertStrictEqual(evalCode(`String.toUpperCase('UpperCase')`), 'UPPERCASE');
    ctx.expectThrow(evalCode, TypeError, ['String.toUpperCase(456)']);

    ctx.assertShallowEqual(evalCode(`String.slice('012')`), '012');
    ctx.assertShallowEqual(evalCode(`String.slice('012', 0)`), '012');
    ctx.assertShallowEqual(evalCode(`String.slice('012', 1)`), '12');
    ctx.assertShallowEqual(evalCode(`String.slice('012', 2)`), '2');
    ctx.assertShallowEqual(evalCode(`String.slice('012', 3)`), '');
    ctx.assertShallowEqual(evalCode(`String.slice('012', 0, 1)`), '0');
    ctx.assertShallowEqual(evalCode(`String.slice('012', 1, 3)`), '12');
    ctx.assertShallowEqual(evalCode(`String.slice('012', 1, -1)`), '1');
    ctx.assertShallowEqual(evalCode(`String.slice('012', 1, -2)`), '');
    ctx.expectThrow(evalCode, TypeError, [`String.slice(['2', '3', '3'])`]);
    ctx.expectThrow(evalCode, TypeError, [`String.slice('012', '0')`]);
    ctx.expectThrow(evalCode, TypeError, [`String.slice('012', 0, '1')`]);

};
