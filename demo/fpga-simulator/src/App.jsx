import React, { useState } from 'react';

export default function App() {
    // State for the 10 switches (sw[0] to sw[9])
    const [switches, setSwitches] = useState(Array(10).fill(false));

    // Pin mapping from constraint.xdc for authentic UI labels
    const switchPins = ["V17", "V16", "W16", "W17", "W15", "V15", "W14", "W13", "V2", "T3"];
    const ledPins = ["U16", "E19", "U19", "V19", "W18", "U15", "U14", "V14"];

    // Helper to toggle a switch
    const toggleSwitch = (index) => {
        const newSwitches = [...switches];
        newSwitches[index] = !newSwitches[index];
        setSwitches(newSwitches);
    };

    // Convert switch states to integer values based on Verilog slicing
    const getBit = (index) => (switches[index] ? 1 : 0);

    // sw[9:8]
    const opCode = (getBit(9) << 1) | getBit(8);
    // sw[7:4]
    const operandA = (getBit(7) << 3) | (getBit(6) << 2) | (getBit(5) << 1) | getBit(4);
    // sw[3:0]
    const operandB = (getBit(3) << 3) | (getBit(2) << 2) | (getBit(1) << 1) | getBit(0);

    // Behavioral Logic mimicking `basic_calc.v`
    let result = 0;
    let opName = "";
    let equationStr = "";

    // Calculate raw Verilog values
    const addition = (operandA + operandB) & 0xFF; // Constrain to 8-bit wire
    const subtraction = (operandA - operandB) & 0xFF; // 8-bit two's complement wrap around
    const multiplication = (operandA * operandB) & 0xFF;
    const division = operandB === 0 ? 0 : Math.floor(operandA / operandB) & 0xFF;
    const remainder = operandB === 0 ? 0 : operandA % operandB;

    switch (opCode) {
        case 0: // 2'b00
            opName = "ADD";
            result = addition;
            equationStr = `${operandA} + ${operandB} = ${result}`;
            break;
        case 1: // 2'b01
            opName = "SUB";
            result = subtraction;
            equationStr = `${operandA} - ${operandB} = ${result}`;
            break;
        case 2: // 2'b10
            opName = "MULT";
            result = multiplication;
            equationStr = `${operandA} * ${operandB} = ${result}`;
            break;
        case 3: // 2'b11
            opName = "DIV";
            result = division;
            if (operandB === 0) {
                equationStr = `${operandA} / ${operandB} = ERR (Div by 0)`;
            } else {
                equationStr = `${operandA} / ${operandB} = ${result} (Rem: ${remainder})`;
                // Unique Feature: Remainder Alert -> LED[7] = 1'b1
                if (remainder > 0) {
                    result = result | 0x80; // Set 8th bit (128)
                }
            }
            break;
        default:
            result = 0;
    }

    // Generate Array of 8 LEDs (true/false) based on the 8-bit result
    const leds = Array(8).fill(false).map((_, i) => (result & (1 << i)) !== 0);

    return (
        <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4 font-sans text-neutral-200">

            {/* The FPGA Board */}
            <div className="bg-emerald-950 border-4 border-black rounded-xl shadow-2xl p-8 max-w-5xl w-full flex flex-col gap-10 relative overflow-hidden">

                {/* Board Details / Silkscreen */}
                <div className="absolute top-4 left-6 text-emerald-500 text-xl font-bold tracking-widest opacity-80">
                    BASYS_CALC_SIM v1.0
                </div>
                <div className="absolute top-12 left-6 text-emerald-500 text-xs font-mono opacity-50">
                    U1 XILINX ARTIX-7
                </div>

                {/* Top Section: LEDs */}
                <div className="mt-12 flex flex-col items-center">
                    <div className="flex gap-4 sm:gap-6 md:gap-8 justify-center w-full">
                        {/* Render LEDs from MSB (7) down to LSB (0) */}
                        {[7, 6, 5, 4, 3, 2, 1, 0].map((i) => (
                            <div key={`led-${i}`} className="flex flex-col items-center gap-2">
                                <div className="text-xs font-mono text-emerald-500 opacity-70 mb-1">{ledPins[i]}</div>

                                {/* LED Bulb */}
                                <div
                                    className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full transition-all duration-150 ${leds[i]
                                            ? 'bg-green-400 shadow-lg shadow-green-400/60 border-2 border-green-200'
                                            : 'bg-emerald-900 border-2 border-emerald-800 opacity-60 shadow-inner'
                                        }`}
                                />

                                <div className="text-sm font-bold mt-1">LED[{i}]</div>
                                <div className="text-xs text-neutral-400 font-mono">2<sup>{i}</sup></div>

                                {/* Visual indicator for the remainder alert */}
                                {i === 7 && opCode === 3 && remainder > 0 && (
                                    <div className="text-[10px] text-red-400 font-bold mt-1 animate-pulse">
                                        REM ALERT
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Middle Section: LCD / Readout Screen */}
                <div className="mx-auto w-full max-w-2xl bg-black border-4 border-neutral-700 rounded-lg p-6 shadow-inner font-mono text-green-400">
                    <div className="flex justify-between items-center border-b border-green-900 pb-2 mb-4">
                        <span className="text-sm text-green-700">DIAGNOSTIC DISPLAY</span>
                        <span className="text-sm bg-green-900 text-green-400 px-2 py-1 rounded">MODE: {opCode.toString(2).padStart(2, '0')}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-lg">
                        <div>
                            <span className="text-green-700">OP_A  : </span>
                            <span className="text-white">{operandA.toString(2).padStart(4, '0')}</span> ({operandA})
                        </div>
                        <div>
                            <span className="text-green-700">OP_B  : </span>
                            <span className="text-white">{operandB.toString(2).padStart(4, '0')}</span> ({operandB})
                        </div>
                        <div>
                            <span className="text-green-700">OPER  : </span>
                            <span className="text-white">{opName}</span>
                        </div>
                        <div className="col-span-2 mt-2 pt-2 border-t border-green-900/50">
                            <span className="text-green-700">MATH  : </span>
                            <span className="text-white text-xl">{equationStr}</span>
                        </div>
                        <div className="col-span-2">
                            <span className="text-green-700">OUTPUT: </span>
                            <span className="text-green-400 font-bold tracking-widest text-xl">{result.toString(2).padStart(8, '0')}</span>
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Switches */}
                <div className="flex flex-col items-center">
                    <div className="flex gap-2 sm:gap-4 md:gap-6 justify-center w-full bg-neutral-800/30 p-6 rounded-xl border border-neutral-700/50">
                        {/* Render Switches from MSB (9) down to LSB (0) */}
                        {[9, 8, 7, 6, 5, 4, 3, 2, 1, 0].map((i) => {
                            // Group colors
                            let groupColor = "border-neutral-500";
                            let labelText = "";
                            if (i >= 8) { groupColor = "border-blue-500"; labelText = "OP"; }
                            else if (i >= 4) { groupColor = "border-purple-500"; labelText = "A"; }
                            else { groupColor = "border-amber-500"; labelText = "B"; }

                            return (
                                <div key={`sw-${i}`} className="flex flex-col items-center gap-2">
                                    <div className="text-[10px] font-mono text-emerald-500 opacity-70 mb-2">{switchPins[i]}</div>

                                    {/* Physical Switch UI */}
                                    <div
                                        onClick={() => toggleSwitch(i)}
                                        className="w-8 h-16 sm:w-10 sm:h-20 bg-neutral-900 rounded border-2 border-neutral-700 relative cursor-pointer shadow-inner flex justify-center p-1"
                                    >
                                        {/* The Toggle Nub */}
                                        <div
                                            className={`w-full h-[45%] rounded shadow-md transition-all duration-200 absolute ${switches[i]
                                                    ? 'top-1 bg-neutral-300'
                                                    : 'bottom-1 bg-neutral-600'
                                                }`}
                                        >
                                            {/* Ridges on the switch */}
                                            <div className="w-full h-full flex flex-col justify-evenly px-1 py-1 opacity-50">
                                                <div className="h-px bg-black w-full"></div>
                                                <div className="h-px bg-black w-full"></div>
                                                <div className="h-px bg-black w-full"></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Labels */}
                                    <div className="text-sm font-bold mt-2">sw[{i}]</div>
                                    <div className={`text-xs font-bold border-b-2 ${groupColor} px-1 pb-1`}>
                                        {labelText}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Legend */}
                    <div className="flex gap-8 mt-6 text-xs font-mono uppercase font-bold opacity-70">
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div> sw[9:8] - Operation</div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-purple-500"></div> sw[7:4] - Operand A</div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500"></div> sw[3:0] - Operand B</div>
                    </div>
                </div>

            </div>
        </div>
    );
}