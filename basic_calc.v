`timescale 1ns / 1ps

module Basic_Calculator(
    input [9:0] sw,        // 10-bit input from switches
    output reg [7:0] LED   // 8-bit output for LEDs (must be 'reg' for always block)
    );
    
    // Internal wires for calculations
    wire [7:0] addition       = sw[7:4] + sw[3:0];
    wire [7:0] subtraction    = sw[7:4] - sw[3:0];
    wire [7:0] multiplication = sw[7:4] * sw[3:0];
    wire [7:0] division       = sw[7:4] / sw[3:0]; 
    
    // Unique Feature: Remainder Detection
    // The '%' operator calculates the "leftover" from division
    wire [7:0] remainder      = sw[7:4] % sw[3:0];

    // Behavioral logic to select the output based on sw[9:8]
    always @(*) begin
        case (sw[9:8])
            2'b00: begin 
                LED = addition;       // Mode 0: Add
            end
            
            2'b01: begin 
                LED = subtraction;    // Mode 1: Sub
            end
            
            2'b10: begin 
                LED = multiplication; // Mode 2: Multi
            end
            
            2'b11: begin 
                LED = division;       // Mode 3: Div
                
                // Unique Feature: Remainder Alert
                // If there is a remainder, turn on the leftmost LED (bit 7)
                // This changes the first Hex digit to an '8' (e.g., 04 becomes 84)
                if (remainder > 0) begin
                    LED[7] = 1'b1; 
                end
            end
            
            default: begin
                LED = 8'b0;           // Safety default
            end
        endcase
    end
    
endmodule