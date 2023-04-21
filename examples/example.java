/* 
 * example.java
 * 
 * Copyright (c) 2021 - 2023 DangerDan9631. All rights reserved.
 * Licensed under the MIT License.
 * See https://opensource.org/licenses/MIT for full license information.
 */

package example;

import java.util.List;
import org.jetbrains.annotations.NotNull;

public final class Example {

    /**
     * A class that uses generics.
     */
    public class Foo<T> {
        T other;

        public <U> void foo(U input) {

        }
    }

    /**
     * A test interface of the @{link IInterface} type.
     */
    public interface IInterface {
        /**
         * Gets the is set.
         * 
         * @return the value.
         */
        boolean getIsSet();

        /**
         * Sets the is set.
         * 
         * @param value the value.
         */
        void setIsSet(boolean value);
    }

    /**
     * A test class of the @{link MyClass} type that extends @{link IInterface}.
     *
     * @param initialValue The initial value.
     */
    public static final class MyClass implements Example.IInterface {

        /** A static final value. */
        private static final int ONE_HUNDRED = 100;

        // These are const values.
        private static final int TRUE = 1;
        private static final int FALSE = 0;

        private final Object lock = new Object();
        private int isSet;
        private final Example.IInterface other;
        private final Example.MyEnum myEnum;

        public MyClass(boolean initialValue) {
            this._isSet = Companion.toInt(initialValue);
            this.myEnum = Example.MyEnum.TWO;
        }

        @Override
        public boolean getIsSet() {
            synchronized (lock) {
                return toBool(isSet);
            }
        }

        @Override
        public void setIsSet(boolean value) {
            synchronized (lock) {
                isSet = toInt(value);
            }
        }

        public final boolean getAndSet(boolean newValue) {
            synchronized (lock) {
                final int originalValue = isSet;
                isSet = toInt(newValue);
                return toBool(originalValue);
            }
        }

        @NotNull
        public String toString() {
            return String.format("MyClass %s\t: IInterface", isSet);
        }

        private static boolean toBool(int value) {
            return value != 0;
        }

        private static int toInt(boolean value) {
            return value ? 1 : 0;
        }
    }

    /**
     * Enumerates some values.
     */
    public static enum MyEnum {
        ONE, TWO, THREE, FOUR;
    }
}
