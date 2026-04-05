import React from "react";
import { MockTestProvider } from "../contexts/MockTestContext";
import MockTestShell from "../components/MockTest/MockTestShell";
import { MathRuntimeProvider } from "../components/Math/MathRuntime";

/**
 * MockShell — full-screen exam layout.
 * No practice Header/Footer/FilterModal/Calculator from the practice shell.
 * MockTestShell already renders its own MockTestHeader and manages its own calculator.
 *
 * Props:
 *  - onExit: callback to go back to landing
 *  - stage: "setup" | "exam" — which phase the mock is in (Issue 008)
 *  - onStageChange: callback(stage) to sync URL when transitioning setup→exam or exam→setup
 */
const MockShell = ({ onExit, stage = "setup", onStageChange }) => (
    <MathRuntimeProvider>
        <MockTestProvider>
            <MockTestShell
                onExit={onExit}
                initialStage={stage}
                onStageChange={onStageChange}
            />
        </MockTestProvider>
    </MathRuntimeProvider>
);

export default MockShell;
