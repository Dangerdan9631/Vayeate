// -----------------------------------------------------------------------------
//  <copyright file="Example.cs" company="DangerDan9631">
//      Copyright (c) 2021 - 2023 DangerDan9631. All rights reserved.
//      Licensed under the MIT License.
//      See https://opensource.org/licenses/MIT for full license information.
//  </copyright>
// -----------------------------------------------------------------------------

namespace Example {
    using System;
    using System.Collections.Generic;
    using System.Threading;

    // View the example.sln solution through the solution explorer to see this
    // file with semantic highlighting. View it through the explorer view to
    // see it without semantic highlighting.

    /// <summary>
    /// A test interface of the <see cref="IInterface"/> type.
    /// </summary>
    public interface IInterface {
        /// Gets or sets a value that indicates whether it is set.
        bool IsSet { get; set; }
    }

    /// <summary>
    /// A test class of the <see cref="MyClass"/> type that extends <see cref="IInterface"/>.
    /// </summary>
    public class MyClass : IInterface {

        /// <summary>
        /// A static readonly value.
        /// </summary>
        public static readonly int ONE_HUNDRED = 100;

        // These are const values.
        private const int True = 1;
        private const int False = 0;

        private int isSet;
        private readonly IInterface other;
        private readonly MyEnum myEnum = MyEnum.TWO;

        /// <summary>
        /// Initializes a new instance of the <see cref="MyClass"/> class.
        /// </summary>
        /// <param name="initialValue">The initial value.</param>
        public MyClass(bool initialValue) {
            this.isSet = MyClass.ToInt(initialValue);
            this.other = null;
        }

        ///<inheritdoc/>
        public bool IsSet {
            get { return MyClass.ToBool(isSet); }
            set { isSet = MyClass.ToInt(value); }
        }

        /// <summary>
        /// Sets the current value and returns the value that was overwritten.
        /// </summary>
        /// <param name="newValue">The new value.</param>
        /// <returns>The previously stored value.</returns>
        public bool GetAndSet(bool newValue) {
            int originalValue = Interlocked.Exchange(
                ref isSet,
                MyClass.ToInt(newValue)
            );
            return MyClass.ToBool(originalValue);
        }

        ///<inheritdoc/>
        public override string ToString() {
            return $"MyClass {{{isSet}}}\t: IInterface";
        }

        private static bool ToBool(int value) {
            return value != MyClass.False;
        }

        private static int ToInt(bool value) {
            return value ? MyClass.True : MyClass.False;
        }
    }

    /// <summary>
    /// Enumerates some values.
    /// </summary>
    public enum MyEnum {
        ONE,
        TWO,
        THREE,
        FOUR
    }

    /// <summary>
    /// Provides extended functionality to the List class.
    /// </summary>
    public static class ListExtensions {
        /// <summary>
        /// Pushes a value on to the end of a list.
        /// </summary>
        /// <typeparam name="T">The type stored in the list.</typeparam>
        /// <param name="list">The list to push onto.</param>
        /// <param name="obj">The object to push onto the list.</param>
        public static void Push<T>(this IList<T> list, T obj)
        {
            list.Add(obj);
        }

        /// <summary>
        /// Removes and returns the value at the end of the list.
        /// </summary>
        /// <typeparam name="T">The type stored in the list.</typeparam>
        /// <param name="list">The list to pop an object from.</param>
        /// <returns>The object popped from the list.</returns>
        public static T Pop<T>(this IList<T> list)
        {
            if (list.Count == 0)
            {
                throw new IndexOutOfRangeException("Cannot pop an empty List.");
            }

            T pop = list[list.Count - 1];
            list.RemoveAt(list.Count - 1);

            return pop;
        }
    }
}
