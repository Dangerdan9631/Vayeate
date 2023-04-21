/*
 * example.ts
 *
 * Copyright (c) 2023 DangerDan9631. All rights reserved.
 * Licensed under the MIT License.
 * See https://github.com/Dangerdan9631/Vayeate/blob/main/LICENSE for full license information.
 */

/**
 * A test interface of the [IInterface] type.
 */
interface IInterface {
    /**
     * A value that indicates whether it is set.
     */
    isSet: boolean;
}

/**
 * A test class of the [MyClass] type that extends [IInterface].
 *
 * @param initialValue The initial value.
 */
class MyClass implements IInterface {
    private _isSet: number;
    private other: IInterface | null = null;
    private myEnum = MyEnum.TWO;

    constructor(initialValue: boolean) {
        this._isSet = this.toInt(initialValue);
    }

    public get isSet(): boolean {
        return this.toBool(this._isSet);
    }

    public set isSet(value: boolean) {
        this._isSet = this.toInt(value);
    }

    /**
     * Sets the current value to a [newValue] and returns the value that was
     * overwritten.
     */
    public getAndSet(newValue: boolean): boolean {
        const originalValue = this._isSet;
        this._isSet = this.toInt(newValue);
        return this.toBool(originalValue);
    }

    public toString(): string {
        return `MyClass ${this.isSet}\t: IInterface`;
    }

    private toBool(value: number): boolean {
        return value !== MyClass.FALSE;
    }

    private toInt(value: boolean): number {
        return value ? MyClass.TRUE : MyClass.FALSE;
    }

    /** A readonly companion value. */
    static readonly ONE_HUNDRED: number = 100;

    // These are const values.
    private static readonly TRUE: number = 1;
    private static readonly FALSE: number = 0;
}

/**
 * Enumerates some values.
 */
enum MyEnum {
    ONE,
    TWO,
    THREE,
    FOUR,
}

/**
 * Pushes a [value] of type [T] on to the end of a list.
 */
interface MutableList<T> {
    push(value: T): void;
    pop(): T;
    length: number;
}

Object.defineProperty(Array.prototype, 'push', {
    value: function <T>(this: MutableList<T>, value: T): void {
        this.push(value);
    },
});

Object.defineProperty(Array.prototype, 'pop', {
    value: function <T>(this: MutableList<T>): T {
        if (this.length === 0) {
            throw new Error('Cannot pop an empty list.');
        }
        return this.pop();
    },
});