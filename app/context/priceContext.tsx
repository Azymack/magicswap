import React, { createContext, useContext } from "react";
import { useUsdcMagicPair } from "~/hooks/usePair";

const Context = createContext<{
  magicUsdPairId: string;
  magicUsd: number;
} | null>(null);

export const usePrice = () => {
  const context = useContext(Context);

  if (!context) {
    throw new Error("Must call `usePrice` within a `PriceProvider` component.");
  }

  return context;
};

export const PriceProvider = ({ children }: { children: React.ReactNode }) => {
  const { id: magicUsdPairId, reserve0, reserve1 } = useUsdcMagicPair();

  const magicUsd = reserve0 > 0 && reserve1 > 0 ? reserve0 / reserve1 : 0;
  return (
    <Context.Provider
      value={{
        magicUsdPairId,
        magicUsd,
      }}
    >
      {children}
    </Context.Provider>
  );
};
