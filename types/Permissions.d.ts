export declare type permissionString = 'http://www.w3.org/ns/auth/acl#Read' | 'http://www.w3.org/ns/auth/acl#Write' | 'http://www.w3.org/ns/auth/acl#Append' | 'http://www.w3.org/ns/auth/acl#Control';
export declare type PermissionsCastable = Permissions | permissionString | permissionString[] | undefined;
/**
 * @alias module:Permissions
 * @example
 * const { READ, WRITE, APPEND, CONTROL } = Permissions
 * // Create a new permissions instance with READ and WRITE permission
 * const permissions = new Permissions(READ, WRITE)
 * permissions.add(APPEND)
 * permissions.has(READ, WRITE, APPEND) // true
 * permissions.delete(APPEND)
 * permissions.has(APPEND) // false
 *
 * // It has an inbuilt iterator which allows a for-each loop and using the spread syntax
 * for (const perm of permissions) {
 *   console.log(perm)
 * }
 * [...perm].forEach(perm => console.log(perm))
 */
declare class Permissions {
    readonly permissions: Set<permissionString>;
    constructor(...permissions: permissionString[]);
    add(...permissions: permissionString[]): this;
    has(...permissions: permissionString[]): boolean;
    delete(...permissions: permissionString[]): this;
    equals(other: Permissions): boolean;
    includes(other: Permissions): boolean;
    clone(): Permissions;
    /**
     * @description Return true when no permissions are stored
     * @returns {boolean}
     */
    isEmpty(): boolean;
    _assertValidPermissions(...permissions: permissionString[]): void;
    /**
     * @description Make a permissions instance iterable
     * @returns {IterableIterator<permissionString>}
     */
    [Symbol.iterator](): IterableIterator<permissionString>;
    static from(): Permissions;
    static from(firstVal: PermissionsCastable): Permissions;
    static from(firstVal: PermissionsCastable, ...val: permissionString[]): Permissions;
    /**
     * @description Return all common permissions
     */
    static common(first: Permissions, second: Permissions): Permissions;
    /**
     * @description Return all permissions which are in at least one of [first, second]
     */
    static merge(first: Permissions, second: Permissions): Permissions;
    /**
     * @description Return all permissions from the first which aren't in the second
     */
    static subtract(first: Permissions, second: Permissions): Permissions;
    static readonly READ: permissionString;
    static readonly WRITE: permissionString;
    static readonly APPEND: permissionString;
    static readonly CONTROL: permissionString;
    static readonly ALL: Permissions;
}
export default Permissions;
