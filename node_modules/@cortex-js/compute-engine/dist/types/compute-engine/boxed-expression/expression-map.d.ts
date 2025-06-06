/* 0.28.0 */import type { BoxedExpression, ExpressionMapInterface } from '../public';
export declare class ExpressionMap<U> implements ExpressionMapInterface<U> {
    readonly _items: Map<BoxedExpression, U>;
    constructor(source?: ExpressionMapInterface<U> | readonly (readonly [BoxedExpression, U])[]);
    has(expr: BoxedExpression): boolean;
    get(expr: BoxedExpression): U | undefined;
    clear(): void;
    set(expr: BoxedExpression, value: U): void;
    delete(expr: BoxedExpression): void;
    [Symbol.iterator](): IterableIterator<[BoxedExpression, U]>;
    entries(): IterableIterator<[BoxedExpression, U]>;
}
