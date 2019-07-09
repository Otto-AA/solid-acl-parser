import { N3Parser, Quad } from 'n3';
declare type Iterable<T = any> = Array<T> | Set<T>;
export declare function iterableEquals(a: Iterable, b: Iterable): boolean;
export declare function arrayEquals(a: Array<any>, b: Array<any>): boolean;
export declare function iterableIncludesIterable(a: Iterable, b: Iterable): boolean;
export declare function arrayIncludesArray(a: Array<any>, b: Array<any>): boolean;
export declare function parseTurtle(parser: N3Parser, turtle: string): Promise<Record<string, Quad[]>>;
export {};
