/* 
 * example.kt
 * 
 * Copyright (c) 2021 DangerDan9631. All rights reserved.
 * Licensed under the MIT License.
 * See https://github.com/Dangerdan9631/Licenses/blob/main/LICENSE-MIT for full license information.
 */

package example;

/**
 * A test interface of the [IInterface] type.
 */
public interface IInterface {
    /**
     * A value that indicates whether it is set.
     */
    var isSet: Boolean
}

/**
 * A test class of the [MyClass] type that extends [IInterface].
 *
 * @param initialValue The initial value.
 */
public class MyClass(initialValue: Boolean) : IInterface {
    private val lock = Any()
    private var _isSet: Int = toInt(initialValue)
    private val other: IInterface? = null
    private val myEnum = MyEnum.TWO

    public override var isSet: Boolean
        get() = synchronized(lock) { toBool(_isSet) }
        set(value) { synchronized(lock) { _isSet = toInt(value) } }

    /**
     * Sets the current value to a [newValue] and returns the value that was
     * overwritten.
     */
    public fun getAndSet(newValue: Boolean): Boolean = synchronized(lock) {
        val originalValue = _isSet
        _isSet = toInt(newValue)
        return toBool(originalValue)
    }

    public override fun toString(): String {
        return "MyClass {$isSet}\t: IInterface"
    }

    companion object {
        /** A readonly companion value. */
        val ONE_HUNDRED: Int = 100;

        // These are const values.
        private const val TRUE: Int = 1;
        private const val FALSE: Int = 0;

        private fun toBool(value: Int) = value != FALSE
        private fun toInt(value: Boolean) = if (value) TRUE else FALSE
    }
}

/**
 * Enumerates some values.
 */
enum class MyEnum {
    ONE,
    TWO,
    THREE,
    FOUR
}

object ListExtensions {
    /**
     * Pushes a [value] of type [T] on to the end of a list.
     */
    public fun <T> MutableList<T>.push(value:T) {
        add(value)
    }

    /**
     * Removes and returns the value of type [T] at the end of a list.
     */
    public fun <T> MutableList<T>.pop(): T {
        if (isEmpty()) {
            throw IndexOutOfBoundsException("Cannot pop an empty list.")
        }

        return removeLast()
    }
}
