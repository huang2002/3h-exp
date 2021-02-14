import { GlobNode, SpanNode, SymbolNode, WordNode } from '3h-ast';
import { Common, EvalContextValue } from '../common';
import { evalAST, evalList } from '../eval';
import { createFunction } from './createFunction';
import { numberHandler } from './numberHandler';
import { InternalValue, Rule, RuleHandler, RuleUtils } from './rule';

export const rules: Rule[] = [{
    /**
     * number
     * <number>
     */
    pattern: [RuleUtils.NUMBER],
    handler: numberHandler,
}, {
    /**
     * word
     * <word>
     */
    pattern: [RuleUtils.WORD],
    handler(parts, context, env) {
        const word = (parts[0] as WordNode).value;
        if (!context.has(word)) {
            Common.raise(ReferenceError, `variable "${word}" is not defined`, env);
        }
        return context.get(word);
    },
}, {
    /**
     * glob
     * <glob>
     */
    pattern: [RuleUtils.GLOB],
    handler(parts) {
        return (parts[0] as GlobNode).value.slice(1, -1);
    },
}, {
    /**
     * assignment(dollar)
     * <value>$<word>
     */
    pattern: [RuleUtils.VALUE, RuleUtils.DOLLAR, RuleUtils.WORD],
    handler(parts, context) {
        context.set(
            (parts[2] as WordNode).value,
            (parts[0] as InternalValue).value as EvalContextValue
        );
        return (parts[0] as InternalValue).value;
    },
}, {
    /**
     * assignment(equal)
     * <word>=(...)
     */
    pattern: [RuleUtils.WORD, RuleUtils.EQUAL, RuleUtils.SPAN_PARATHESIS],
    handler(parts, context, env) {
        context.set(
            (parts[0] as WordNode).value,
            evalAST((parts[2] as SpanNode).body, context, env.fileName)
        );
    },
}, {
    /**
     * dot(index)
     * <value>.<word>
     */
    pattern: [RuleUtils.VALUE, RuleUtils.DOT, RuleUtils.WORD],
    handler(parts, context, env) {
        const object = (parts[0] as InternalValue).value;
        if (!Common.isDict(object)) {
            Common.raise(TypeError, `invalid index access`, env);
        }
        const index = (parts[2] as WordNode).value;
        if (!(index in (object as any))) {
            Common.raise(ReferenceError, `unknown index "${index}"`, env);
        }
        return (object as any)[index];
    },
}, {
    /**
     * invoke(normal)
     * <function>(<args...>)
     */
    pattern: [RuleUtils.VALUE, RuleUtils.SPAN_PARATHESIS],
    handler(parts, context, env) {
        const f = (parts[0] as InternalValue).value;
        if (typeof f !== 'function') {
            Common.raise(TypeError, `invalid function call`, env);
        }
        return (f as RuleHandler)(
            (parts[1] as SpanNode).body,
            context,
            env,
        );
    },
}, {
    /**
     * invoke(callback)
     * <function>{...}
     */
    pattern: [RuleUtils.VALUE, RuleUtils.SPAN_BRACKET],
    handler(parts, context, env) {
        const f = (parts[0] as InternalValue).value;
        if (typeof f !== 'function') {
            Common.raise(TypeError, `invalid function call`, env);
        }
        const block = (parts[1] as SpanNode).body;
        const callback: RuleHandler = (_, ctx) => evalAST(block, ctx, env.fileName);
        return (f as RuleHandler)(
            [{
                type: 'value',
                value: callback,
                offset: parts[0].offset,
                line: parts[0].line,
                column: parts[0].column,
            } as InternalValue],
            context,
            env,
        );
    },
}, {
    /**
     * word(string)
     * #<word>
     */
    pattern: [RuleUtils.HASH, RuleUtils.WORD],
    handler(parts, context, env) {
        return (parts[1] as WordNode).value;
    },
}, {
    /**
     * function(named)
     * @<word>(...){...}
     */
    pattern: [RuleUtils.AT, RuleUtils.WORD, RuleUtils.SPAN_PARATHESIS, RuleUtils.SPAN_BRACKET],
    handler(parts, context, env) {
        const f = createFunction(
            (parts[2] as SpanNode).body,
            (parts[3] as SpanNode).body,
            context,
            env.fileName,
        );
        context.set((parts[1] as WordNode).value, f);
        return f;
    },
}, {
    /**
     * function(anonymous)
     * @(...){...}
     */
    pattern: [RuleUtils.AT, RuleUtils.SPAN_PARATHESIS, RuleUtils.SPAN_BRACKET],
    handler(parts, context, env) {
        return createFunction(
            (parts[1] as SpanNode).body,
            (parts[2] as SpanNode).body,
            context,
            env.fileName,
        );
    },
}, {
    /**
     * negative sign
     * -<number>
     */
    pattern: [RuleUtils.MINUS, RuleUtils.NUMBER],
    handler(parts, context, env) {
        return -(numberHandler([parts[1]], context, env) as number);
    },
}, {
    /**
     * negative sign
     * -<word>
     */
    pattern: [RuleUtils.MINUS, RuleUtils.WORD],
    handler(parts, context, env) {
        const word = (parts[1] as WordNode).value;
        if (!context.has(word)) {
            Common.raise(
                ReferenceError,
                `"${word}" is not defined`,
                env
            );
        }
        const value = context.get(word);
        if (typeof value !== 'number') {
            Common.raise(
                TypeError,
                `"${word}" is not a number`,
                env
            );
        }
        return -value!;
    },
}, {
    /**
     * negative sign
     * -(<..., number>)
     */
    pattern: [RuleUtils.MINUS, RuleUtils.SPAN_PARATHESIS],
    handler(parts, context, env) {
        const number = evalAST((parts[1] as SpanNode).body, context, env.fileName);
        if (typeof number !== 'number') {
            Common.raise(
                TypeError,
                `invalid operator "-"`,
                env
            );
        }
        return -number!;
    },
}, {
    /**
     * positive sign
     * +<number>
     */
    pattern: [RuleUtils.PLUS, RuleUtils.NUMBER],
    handler(parts, context, env) {
        return numberHandler([parts[1]], context, env);
    },
}, {
    /**
     * positive sign
     * +<word>
     */
    pattern: [RuleUtils.PLUS, RuleUtils.WORD],
    handler(parts, context, env) {
        const word = (parts[1] as WordNode).value;
        if (!context.has(word)) {
            Common.raise(
                ReferenceError,
                `"${word}" is not defined`,
                env
            );
        }
        const value = context.get(word);
        if (typeof value !== 'number') {
            Common.raise(
                TypeError,
                `"${word}" is not a number`,
                env
            );
        }
        return value;
    },
}, {
    /**
     * positive sign
     * +(<..., number>)
     */
    pattern: [RuleUtils.PLUS, RuleUtils.SPAN_PARATHESIS],
    handler(parts, context, env) {
        const number = evalAST((parts[1] as SpanNode).body, context, env.fileName);
        if (typeof number !== 'number') {
            Common.raise(
                TypeError,
                `invalid operator "+"`,
                env
            );
        }
        return number;
    },
}, {
    /**
     * parathesis
     * (...)
     */
    pattern: [RuleUtils.SPAN_PARATHESIS],
    handler(parts, context, env) {
        return evalAST((parts[0] as SpanNode).body, context, env.fileName);
    },
}, {
    /**
     * brace(array)
     * [...]
     */
    pattern: [RuleUtils.SPAN_BRACE],
    handler(parts, context, env) {
        const { body } = parts[0] as SpanNode;
        return body.length ? evalList(body, context, env.fileName) : [];
    },
}, {
    /**
     * brace(index)
     * <value>[...]
     */
    pattern: [RuleUtils.VALUE, RuleUtils.SPAN_BRACE],
    handler(parts, context, env) {
        const target = (parts[0] as InternalValue).value;
        const values = evalAST((parts[1] as SpanNode).body, context, env.fileName);
        const index = values as number;
        if (Array.isArray(target) || typeof target === 'string') {
            if (!Number.isFinite(index)) {
                Common.raise(TypeError, `expect a finite number as array/string index`, env);
            }
            const normalizedIndex = index < 0
                ? target.length + index
                : index;
            if (normalizedIndex >= target.length || normalizedIndex < 0) {
                Common.raise(RangeError, `index(${index}) out of range`, env);
            }
            return target[normalizedIndex];
        } else if (Common.isDict(target)) {
            if (typeof index !== 'string') {
                Common.raise(TypeError, `expect a string as dict index`, env);
            }
            if (!(index in (target as any))) {
                Common.raise(RangeError, `unknown dict index "${index}"`, env);
            }
            return (target as any)[index];
        }
        Common.raise(TypeError, `invalid index access`, env);
    },
}, {
    /**
     * brackets(dict)
     * { key: value, ... }
     */
    pattern: [RuleUtils.SPAN_BRACKET],
    handler(parts, context, env) {
        const dict = Object.create(null);
        const body = (parts[0] as SpanNode).body;
        const endIndex = body.length - 1;
        let lastCommaIndex = -1;
        let colonIndex = -1;
        for (let i = 0; i < body.length; i++) {
            if (body[i].type !== 'symbol' && i !== endIndex) {
                continue;
            }
            if ((body[i] as SymbolNode).value === ':' && i !== endIndex) {
                colonIndex = i;
                continue;
            }
            if (
                (body[i] as SymbolNode).value === ','
                || i === endIndex
            ) {
                if (colonIndex <= lastCommaIndex) {
                    Common.raise(SyntaxError, 'expect a key:value pair as dict entry', {
                        line: body[i].line,
                        column: body[i].column,
                        fileName: env.fileName,
                    });
                }
                const key = evalAST(
                    body.slice(lastCommaIndex + 1, colonIndex),
                    context,
                    env.fileName
                );
                const value = evalAST(
                    body.slice(colonIndex + 1, body[i].type === 'symbol' ? i : i + 1),
                    context,
                    env.fileName
                );
                if (typeof key !== 'string') {
                    Common.raise(TypeError, 'expect a string as dict key', {
                        line: body[i].line,
                        column: body[i].column,
                        fileName: env.fileName,
                    });
                }
                dict[key as string] = value;
                lastCommaIndex = i;
            }
        }
        return dict;
    },
}];
