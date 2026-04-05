import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const MathRuntimeContext = createContext({ mathModule: null });

const MATHJAX_CONFIG = {
  tex: {
    inlineMath: [
      ["$", "$"],
      ["\\(", "\\)"],
    ],
    processEscapes: true,
  },
  svg: {
    fontCache: "global",
    linebreaks: { automatic: true },
  },
};

let cachedMathModule = null;
let mathModulePromise = null;

function ensureMathJaxConfig() {
  if (typeof window === "undefined") {
    return;
  }

  window.MathJax = {
    ...(window.MathJax || {}),
    ...MATHJAX_CONFIG,
    tex: {
      ...(window.MathJax?.tex || {}),
      ...MATHJAX_CONFIG.tex,
    },
    svg: {
      ...(window.MathJax?.svg || {}),
      ...MATHJAX_CONFIG.svg,
    },
  };
}

async function loadMathModule() {
  if (cachedMathModule) {
    return cachedMathModule;
  }

  if (!mathModulePromise) {
    ensureMathJaxConfig();
    mathModulePromise = import("better-react-mathjax").then((module) => {
      cachedMathModule = module;
      return module;
    });
  }

  return mathModulePromise;
}

export function MathRuntimeProvider({ children }) {
  const [mathModule, setMathModule] = useState(() => cachedMathModule);

  useEffect(() => {
    let isActive = true;

    if (!mathModule) {
      void loadMathModule().then((module) => {
        if (isActive) {
          setMathModule(module);
        }
      }).catch(() => {
        if (isActive) {
          setMathModule(null);
        }
      });
    }

    return () => {
      isActive = false;
    };
  }, [mathModule]);

  const value = useMemo(() => ({ mathModule }), [mathModule]);

  if (mathModule?.MathJaxContext) {
    const { MathJaxContext } = mathModule;
    return (
      <MathRuntimeContext.Provider value={value}>
        <MathJaxContext config={MATHJAX_CONFIG}>
          {children}
        </MathJaxContext>
      </MathRuntimeContext.Provider>
    );
  }

  return (
    <MathRuntimeContext.Provider value={value}>
      {children}
    </MathRuntimeContext.Provider>
  );
}

export function MathContent({
  as: FallbackTag = "div",
  children,
  className,
  dynamic = true,
  ...rest
}) {
  const { mathModule } = useContext(MathRuntimeContext);

  if (mathModule?.MathJax) {
    const { MathJax } = mathModule;
    return (
      <MathJax dynamic={dynamic} className={className} {...rest}>
        {children}
      </MathJax>
    );
  }

  return (
    <FallbackTag className={className} {...rest}>
      {children}
    </FallbackTag>
  );
}
