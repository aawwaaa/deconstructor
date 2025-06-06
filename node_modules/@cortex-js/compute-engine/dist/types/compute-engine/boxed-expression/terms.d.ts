/* 0.28.0 */import type { BoxedExpression, IComputeEngine } from '../public';
export declare class Terms {
    private engine;
    private terms;
    constructor(ce: IComputeEngine, terms: ReadonlyArray<BoxedExpression>);
    private add;
    private find;
    N(): BoxedExpression;
    asExpression(): BoxedExpression;
}
