/*
 * example.js
 * Copyright (c) 2023 DangerDan9631. All rights reserved.
 * Licensed under the MIT License.
 * See https://github.com/Dangerdan9631/Vayeate/blob/main/LICENSE for full license information.
*/
/**
 * A test interface of the [IInterface] type.
 */
class IInterface {
    /*
     * A value that indicates whether it is set.
     */
    constructor() {
        this.isSet = false;
    }
}

/**
 * A test class of the [MyClass] type that extends [IInterface].
 * @param initialValue The initial value.
 */
class MyClass2 {
    constructor(initialValue) {
        this.lock = {};
        this.other = null;
        this.myEnum = MyEnum.TWO;
        this._isSet = this.toInt(initialValue);
    }

    get isSet() {
        return this.toBool(this._isSet);
    }

    set isSet(value) {
        this._isSet = this.toInt(value);
    }

    /**
     * Sets the current value to a [newValue] and returns the value that was
     * overwritten.
     */
    getAndSet(newValue) {
        const originalValue = this._isSet;
        this._isSet = this.toInt(newValue);
        return this.toBool(originalValue);
    }

    toString() {
        return `MyClass ${ this.isSet } \t: IInterface;`
    }

    toBool(value) {
        return value !== MyClass.FALSE;
    }

    toInt(value) {
        return value ? MyClass.TRUE : MyClass.FALSE;
    }
}

/** A readonly companion value. */
MyClass.ONE_HUNDRED = 100;

// These are const values.
MyClass.TRUE = 1;
MyClass.FALSE = 0;

/**

Enumerates some values.
*/
var MyEnum;
(function (MyEnum) {
    MyEnum[MyEnum["ONE"] = 0] = "ONE";
    MyEnum[MyEnum["TWO"] = 1] = "TWO";
    MyEnum[MyEnum["THREE"] = 2] = "THREE";
    MyEnum[MyEnum["FOUR"] = 3] = "FOUR";
})(MyEnum || (MyEnum = {}));
/**

Pushes a [value] of type [T] on to the end of a list.
*/
Object.defineProperty(Array.prototype, 'push', {
    value: function (value) {
        this.push(value);
    },
});
Object.defineProperty(Array.prototype, 'pop', {
    value: function () {
        if (this.length === 0) {
            throw new Error('Cannot pop an empty list.');
        }
        return this.pop();
    },
});