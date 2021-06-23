import { ASTNode, ASTNodeTemplate, NumberNode } from '3h-ast';
import { executeNode } from './executors';

export type ValueNode = ASTNodeTemplate<'value', {
    value: unknown;
}>;
/** dts2md break */
export type SyntaxNode = ASTNode | ValueNode;
/** dts2md break */
export type ScriptContext = Map<string, unknown>;
/** dts2md break */
export type SyntaxHandler = (
    buffer: SyntaxNode[],
    index: number,
    context: ScriptContext,
    source: string,
) => void;
/** dts2md break */
export type FunctionHandler = (
    args: readonly SyntaxNode[],
    referer: SyntaxNode,
    context: ScriptContext,
    source: string,
) => void;
/** dts2md break */
export namespace Utils {
    /** dts2md break */
    /**
     * Parse a number from node.
     */
    export const parseNumber = (
        node: NumberNode,
        source: string,
    ) => {
        let result!: number;
        switch (node.suffix) {
            case 'D':
            case '': {
                result = +node.value;
                break;
            }
            case 'B': {
                result = Number.parseInt(node.value, 2);
                break;
            }
            case 'O': {
                result = Number.parseInt(node.value, 8);
                break;
            }
            case 'H': {
                result = Number.parseInt(node.value, 16);
                break;
            }
            default: {
                Utils.raise(SyntaxError, 'unrecognized number', node, source);
            }
        }
        if (result !== result) { // NaN
            Utils.raise(SyntaxError, 'invalid number', node, source);
        }
        return result;
    };
    /** dts2md break */
    /**
     * Throw a specific error with environment info appended.
     */
    export const raise = (
        constructor: ErrorConstructor,
        message: string,
        referer: SyntaxNode,
        source: string,
    ) => {
        const { line, column } = referer;
        throw new constructor(
            `${message} (Ln ${line}, Col ${column} @${source})`
        );
    };
    /** dts2md break */
    /**
     * A stable in-place sorting function.
     */
    export const sort = <T>(array: T[], compare: (a: T, b: T) => number) => {
        let t;
        for (let i = 0; i < array.length - 1; i++) {
            for (let j = i + 1; j < array.length; j++) {
                if (compare(array[i], array[j]) > 0) {
                    t = array[i];
                    array[i] = array[j];
                    array[j] = t;
                }
            }
        }
    };
    /** dts2md break */
    /**
     * Create a value node.
     */
    export const createValueNode = (
        value: unknown,
        referer: SyntaxNode,
    ): ValueNode => ({
        type: 'value',
        line: referer.line,
        column: referer.column,
        offset: referer.offset,
        value,
    });
    /** dts2md break */
    /**
     * Remove specific element(s) from the array.
     * (Default count: `array.length - start`)
     */
    export const removeElements = (
        array: any[],
        start: number,
        count = array.length - start,
    ) => {
        for (let i = start; i < array.length - count; i++) {
            array[i] = array[i + count];
        }
        array.length -= count;
    };
    /** dts2md break */
    export const replaceBuffer = (
        buffer: SyntaxNode[],
        start: number,
        width: number,
        replacement: SyntaxNode,
    ) => {
        buffer[start] = replacement;
        if (width > 1) {
            removeElements(buffer, start + 1, width - 1);
        }
    };
    /** dts2md break */
    /**
     * Execute and replace the given node of the buffer.
     */
    export const evalBufferNode = (
        buffer: SyntaxNode[],
        index: number,
        referer: SyntaxNode,
        context: ScriptContext,
        source: string,
    ) => {
        if (index < 0 || index >= buffer.length) {
            Utils.raise(SyntaxError, 'invalid operation', referer, source);
        }
        return executeNode(buffer[index], context, source);
    };
    /** dts2md break */
    export const createBinaryOperator = <T, U>(
        typeA: string,
        typeB: string,
        handler: (a: T, b: U) => unknown,
    ): SyntaxHandler => (
        (buffer, i, ctx, src) => {
            const a = Utils.evalBufferNode(buffer, i - 1, buffer[i], ctx, src);
            const b = Utils.evalBufferNode(buffer, i + 1, buffer[i], ctx, src);
            if (typeof a !== typeA) {
                Utils.raise(TypeError, `expect a ${typeA}`, buffer[i - 1], src);
            }
            if (typeof b !== typeB) {
                Utils.raise(TypeError, `expect a ${typeB}`, buffer[i + 1], src);
            }
            const valueNode = Utils.createValueNode(
                handler((a as T), (b as U)),
                buffer[i],
            );
            Utils.replaceBuffer(buffer, i - 1, 3, valueNode);
        }
    );

}
