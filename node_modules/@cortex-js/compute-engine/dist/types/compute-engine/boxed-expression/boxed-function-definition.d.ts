/* 0.28.0 */import type { IComputeEngine, FunctionDefinition, BoxedFunctionDefinition, RuntimeScope } from '../public';
import type { BoxedExpression, CollectionHandlers, CompiledExpression, EvaluateOptions, Sign } from './public';
import { Type, TypeString } from '../../common/type/types';
import { OneOf } from '../../common/one-of';
import { BoxedType } from '../../common/type/boxed-type';
export declare class _BoxedFunctionDefinition implements BoxedFunctionDefinition {
    engine: IComputeEngine;
    scope: RuntimeScope;
    name: string;
    description?: string | string[];
    wikidata?: string;
    threadable: boolean;
    associative: boolean;
    commutative: boolean;
    commutativeOrder: ((a: BoxedExpression, b: BoxedExpression) => number) | undefined;
    idempotent: boolean;
    involution: boolean;
    pure: boolean;
    complexity: number;
    lazy: boolean;
    signature: BoxedType;
    inferredSignature: boolean;
    type?: (ops: ReadonlyArray<BoxedExpression>, options: {
        engine: IComputeEngine;
    }) => BoxedType | Type | TypeString | undefined;
    sgn?: (ops: ReadonlyArray<BoxedExpression>, options: {
        engine: IComputeEngine;
    }) => Sign | undefined;
    eq?: (a: BoxedExpression, b: BoxedExpression) => boolean | undefined;
    neq?: (a: BoxedExpression, b: BoxedExpression) => boolean | undefined;
    even?: (ops: ReadonlyArray<BoxedExpression>, options: {
        engine: IComputeEngine;
    }) => boolean | undefined;
    canonical?: (ops: ReadonlyArray<BoxedExpression>, options: {
        engine: IComputeEngine;
    }) => BoxedExpression | null;
    evaluate?: (ops: ReadonlyArray<BoxedExpression>, options: Partial<EvaluateOptions> & {
        engine: IComputeEngine;
    }) => BoxedExpression | undefined;
    evaluateAsync?: (ops: ReadonlyArray<BoxedExpression>, options?: Partial<EvaluateOptions> & {
        engine?: IComputeEngine;
    }) => Promise<BoxedExpression | undefined>;
    evalDimension?: (ops: ReadonlyArray<BoxedExpression>, options: {
        engine: IComputeEngine;
    }) => BoxedExpression;
    compile?: (expr: BoxedExpression) => CompiledExpression;
    collection?: Partial<CollectionHandlers>;
    constructor(ce: IComputeEngine, name: string, def: FunctionDefinition);
    infer(sig: Type): void;
    update(def: FunctionDefinition): void;
    reset(): void;
}
export declare function makeFunctionDefinition(engine: IComputeEngine, name: string, def: OneOf<[FunctionDefinition | BoxedFunctionDefinition]>): BoxedFunctionDefinition;
export declare function isBoxedFunctionDefinition(x: any): x is BoxedFunctionDefinition;
