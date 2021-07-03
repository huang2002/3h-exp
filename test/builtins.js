// @ts-check
const { evalCode, builtins, HELP_SYMBOL } = require('../dist/hxs.umd.js');

/**
 * @type {import('3h-test').TestCaseCallback}
 */
module.exports = (ctx) => {

    ctx.assertDeepEqual(
        evalCode(`help(help)`),
        builtins.get('help')[HELP_SYMBOL]
    );

    ctx.assertShallowEqual(
        evalCode(`
            dict = {
                #foo: 'bar',
                #baz: true,
            };
            dir(dict)
        `),
        ['foo', 'baz']
    );

    ctx.assertStrictEqual(
        evalCode('number(true)'),
        1
    );

    ctx.assertShallowEqual(
        evalCode('number(number)'),
        NaN
    );

    ctx.assertShallowEqual(
        evalCode('number("201")'),
        201
    );

    ctx.assertShallowEqual(
        evalCode('number([])'),
        NaN
    );

    ctx.assertShallowEqual(
        evalCode('number([0, 1])'),
        NaN
    );

    ctx.assertShallowEqual(
        evalCode('number({})'),
        NaN
    );

    ctx.assertStrictEqual(
        evalCode('string(true)'),
        'true'
    );

    ctx.assertStrictEqual(
        evalCode('string(string)'),
        '<function>'
    );

    ctx.assertStrictEqual(
        evalCode(`string('abc')`),
        "'abc'"
    );

    ctx.assertStrictEqual(
        evalCode(`string('"')`),
        `'"'`
    );

    ctx.assertStrictEqual(
        evalCode(`string("abc")`),
        "'abc'"
    );

    ctx.assertStrictEqual(
        evalCode(`string("isn't")`),
        `"isn't"`
    );

    ctx.assertStrictEqual(
        evalCode(`string('\\'"\`')`),
        `'\\'"\`'`
    );

    ctx.assertStrictEqual(
        evalCode('string([string])'),
        '(size: 1) [<function>]'
    );

    ctx.assertStrictEqual(
        evalCode('string([[string]])'),
        '(size: 1) [<array>]'
    );

    ctx.assertStrictEqual(
        evalCode('string({})'),
        '<dict>'
    );

    ctx.assertStrictEqual(
        evalCode('boolean(0)'),
        false
    );

};
