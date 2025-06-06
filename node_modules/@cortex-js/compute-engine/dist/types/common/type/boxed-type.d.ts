/* 0.28.0 */import type { Type, TypeString } from './types';
export declare class BoxedType {
    static unknown: BoxedType;
    type: Type;
    constructor(type: Type | TypeString);
    matches(other: Type | TypeString | BoxedType): boolean;
    is(other: Type | TypeString): boolean;
    get isUnknown(): boolean;
    toString(): string;
    toJSON(): string;
    [Symbol.toPrimitive](hint: string): string | null;
    valueOf(): string;
}
