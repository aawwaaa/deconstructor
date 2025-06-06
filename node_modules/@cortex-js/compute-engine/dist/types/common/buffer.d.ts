/* 0.28.0 */export declare class Buffer {
    s: string;
    pos: number;
    constructor(s: string, pos?: number);
    atEnd(): boolean;
    peek(): string;
    consume(): string;
    match(s: string): boolean;
}
