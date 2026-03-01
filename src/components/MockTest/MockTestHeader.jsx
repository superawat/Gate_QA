import React from "react";
import { useMockTest } from "../../contexts/MockTestContext";

const MockTestHeader = () => {
    return (
        <div className="flex w-full flex-col font-sans">
            {/* Top blue gradient header with logo */}
            <header className="flex h-[60px] w-full items-center bg-gradient-to-r from-blue-100 to-[#125B9A] shadow-md px-4">
                <img
                    src="logo.png"
                    alt="GATE 2026 Logo"
                    className="h-10 w-10 bg-white rounded-full p-1"
                />
                <div className="flex-1 text-center font-bold text-[#125B9A]">
                    <h1 className="text-[1.1rem]">GRADUATE APTITUDE TEST IN ENGINEERING (GATE 2026)</h1>
                    <h2 className="text-[0.8rem] text-blue-900 font-semibold tracking-wide mt-0.5">Organizing Institute : INDIAN INSTITUTE OF TECHNOLOGY GUWAHATI</h2>
                </div>
                <div className="w-10"></div> {/* Spacer to center title */}
            </header>

            {/* Subject strip */}
            <div className="flex h-10 w-full items-center justify-between bg-[#3a3b3c] px-4 py-2 font-medium text-[#ffd700]">
                <div className="text-sm shadow-sm md:text-[15px]">
                    AE Aerospace Engineering Mock
                </div>
                <div className="flex gap-4">
                    <button className="flex items-center gap-1.5 text-xs text-white hover:text-blue-100">
                        <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-blue-500 font-bold leading-none text-white italic">i</span>
                        Instructions
                    </button>
                    <button className="flex items-center gap-1 text-xs text-white hover:text-green-200">
                        <span className="flex h-4 w-4 items-center justify-center rounded-[3px] bg-green-500 text-[10px] leading-none text-white">☰</span>
                        Question Paper
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MockTestHeader;
