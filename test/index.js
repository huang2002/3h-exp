// @ts-check
const { test } = require('3h-test');
const { arrayTests } = require('./array.js');
const { builtinsTest } = require('./builtins.js');
const { dictTests } = require('./dict.js');
const { functionTests } = require('./function.js');
const { cliTests } = require('./cliTests.js');
const { ifTests } = require('./if.js');
const { loopTests } = require('./loop.js');
const { mathTests } = require('./math.js');
const { stringTests } = require('./string.js');
const HXS = /** @type {import('..')} */(
    /** @type {unknown} */(require('../dist/hxs.umd.js'))
);

const { evalCode } = HXS;

test(null, {

    help(ctx) {
        ctx.assertStrictEqual(typeof evalCode(`help(print)`), 'string');
        ctx.assertStrictEqual(typeof evalCode(`help(Array.of)`), 'string');
        ctx.assertStrictEqual(typeof evalCode(`help(import('math').sin)`), 'string');
    },

    constants(ctx) {
        ctx.assertStrictEqual(evalCode('true'), true);
        ctx.assertStrictEqual(evalCode('false'), false);
        ctx.assertStrictEqual(evalCode('infinity'), Infinity);
        ctx.assertStrictEqual(evalCode('-infinity'), -Infinity);
        ctx.assert(Object.is(evalCode('NaN'), NaN));
        ctx.assert(Object.is(evalCode('null'), null));
    },

    numbers(ctx) {
        ctx.assert(Object.is(evalCode('0'), 0));
        ctx.assert(Object.is(evalCode('-0'), -0));
        ctx.assertStrictEqual(evalCode('3.1415'), 3.1415);
        ctx.assertStrictEqual(evalCode('-3.14'), -3.14);
        ctx.assertStrictEqual(evalCode('0ABH'), 0xAB);
        ctx.assertStrictEqual(evalCode('0AB.ABH'), 0xAB);
        ctx.assertStrictEqual(evalCode('2020D'), 2020);
        ctx.assertStrictEqual(evalCode('2020.0101D'), 2020.0101);
        ctx.assertStrictEqual(evalCode('123O'), 0o123);
        ctx.assertStrictEqual(evalCode('123.456O'), 0o123);
        ctx.assertStrictEqual(evalCode('1011B'), 0b1011);
        ctx.assertStrictEqual(evalCode('1011.0100B'), 0b1011);
        ctx.expectThrow(evalCode, SyntaxError, ['0GH']);
        ctx.expectThrow(evalCode, SyntaxError, ['0AD']);
        ctx.expectThrow(evalCode, SyntaxError, ['8O']);
        ctx.expectThrow(evalCode, SyntaxError, ['2B']);
    },

    variables(ctx) {

        ctx.assertStrictEqual(
            evalCode(`
                set('x', 666);
                'x' $str;
                set('_', get);
                _(str)
            `),
            666
        );

        ctx.assertStrictEqual(evalCode(`2 $x`), 2);
        ctx.assertStrictEqual(evalCode(`6 $foo $bar; bar`), 6);
        ctx.assertStrictEqual(evalCode(`exist('print')`), true);
        ctx.assertStrictEqual(evalCode(`exist('undefined')`), false);
        ctx.assertStrictEqual(evalCode(`set('a', print); exist('a')`), true);
        ctx.expectThrow(evalCode, ReferenceError, ['undefined']);

    },

    comment(ctx) {
        ctx.assertStrictEqual(
            evalCode(`
                'inline comment';
                "multiline
                comment";
            `),
            undefined
        );
    },

    builtins: builtinsTest,
    string: stringTests,
    dict: dictTests,
    array: arrayTests,

    if: ifTests,
    function: functionTests,
    loop: loopTests,

    math: mathTests,

    cli: cliTests,

});
