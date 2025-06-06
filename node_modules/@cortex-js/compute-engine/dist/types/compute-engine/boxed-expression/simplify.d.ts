/* 0.28.0 */import type { BoxedExpression, RuleSteps, SimplifyOptions } from '../public';
type InternalSimplifyOptions = SimplifyOptions & {
    useVariations: boolean;
};
export declare function simplify(expr: BoxedExpression, options?: Partial<InternalSimplifyOptions>, steps?: RuleSteps): RuleSteps;
export {};
