##
# example.rb
# 
# Copyright (c) 2023 DangerDan9631. All rights reserved.
# Licensed under the Apache License 2.0 License.
# See https://www.apache.org/licenses/LICENSE-2.0 for full license information.
#

module Example
  # A test interface of the IInterface type.
  module IInterface
    # Gets or sets a value that indicates whether it is set.
    attr_accessor :is_set
  end

  # A test class of the MyClass type that extends IInterface.
  class MyClass
    include IInterface

    # A static readonly value.
    ONE_HUNDRED = 100

    # These are const values.
    True = 1
    False = 0

    attr_reader :other, :my_enum

    # Initializes a new instance of the MyClass class.
    # @param initial_value The initial value.
    def initialize(initial_value)
      @is_set = MyClass.to_int(initial_value)
      @other = nil
      @my_enum = MyEnum::TWO
    end

    # Sets the current value and returns the value that was overwritten.
    # @param new_value The new value.
    # @return The previously stored value.
    def get_and_set(new_value)
      original_value = Thread.exclusive { @is_set = MyClass.to_int(new_value) }
      MyClass.to_bool(original_value)
    end

    # Returns a string representation of the class.
    # @return A string representation of the class.
    def to_s
      "MyClass {#{@is_set}}\t: IInterface"
    end

    # Class method to convert an integer to a boolean value.
    # @param value The integer value to convert.
    # @return The boolean value.
    def self.to_bool(value)
      value != False
    end

    # Class method to convert a boolean value to an integer.
    # @param value The boolean value to convert.
    # @return The integer value.
    def self.to_int(value)
      value ? True : False
    end
  end

  # Enumerates some values.
  module MyEnum
    ONE = 0
    TWO = 1
    THREE = 2
    FOUR = 3
  end

  # Provides extended functionality to the List class.
  module ListExtensions
    refine Array do
      # Pushes a value on to the end of an array.
      # @param obj The object to push onto the array.
      def push(obj)
        self << obj
      end

      # Removes and returns the value at the end of the array.
      # @return The object popped from the array.
      def pop
        raise 'Cannot pop an empty List.' if empty?

        pop = self[-1]
        self.pop

        pop
      end
    end
  end

  using ListExtensions
end
