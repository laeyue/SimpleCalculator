# SimpleCalculator

A basic calculator implemented in Verilog. This module takes 10-bit switch inputs to perform basic arithmetic operations (addition, subtraction, multiplication, and division) and outputs the result to 8 LEDs.

## Features

- **Addition**: Adds two 4-bit numbers.
- **Subtraction**: Subtracts a 4-bit number from another.
- **Multiplication**: Multiplies two 4-bit numbers.
- **Division**: Divides a 4-bit number by another.
- **Remainder Alert**: During division, if there is a remainder, the leftmost LED (LED[7]) is turned on as an alert.

## Input / Output

- **Input (`sw[9:0]`)**: 
  - `sw[9:8]`: Operation selector (Mode)
    - `00`: Addition
    - `01`: Subtraction
    - `10`: Multiplication
    - `11`: Division
  - `sw[7:4]`: Operand 1
  - `sw[3:0]`: Operand 2
- **Output (`LED[7:0]`)**: 8-bit result of the calculation.

## Files

- `basic_calc.v`: The main Verilog module for the calculator logic.
- `constraint.xdc`: XDC constraints file for board mapping.
