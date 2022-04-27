import { GetSwapsQuery } from "~/graphql/exchange.generated";
import { Swap } from "~/types";
import { exchangeSdk } from "./api.server";
import { getTimeAgo } from "./date.server";

type RawSwap = GetSwapsQuery["swaps"][0];

const normalizeSwap = ({
  id,
  timestamp,
  amount0In: rawAmount0In,
  amount1In: rawAmount1In,
  amount0Out: rawAmount0Out,
  amount1Out: rawAmount1Out,
  amountUSD,
}: RawSwap): Swap => {
  const amount0In = parseFloat(rawAmount0In);
  const amount1In = parseFloat(rawAmount1In);
  const amount0Out = parseFloat(rawAmount0Out);
  const amount1Out = parseFloat(rawAmount1Out);
  return {
    id,
    date: timestamp,
    formattedDate: getTimeAgo(timestamp),
    isAmount0In: amount0In > 0,
    isAmount0Out: amount0Out > 0,
    inAmount: amount0In || amount1In,
    outAmount: amount0Out || amount1Out,
    amountUsd: parseFloat(amountUSD),
  };
};

export const getSwaps = async (pairId: string): Promise<Swap[]> => {
  const { swaps } = await exchangeSdk.getSwaps({
    where: {
      pair: pairId,
    },
  });

  return swaps.map(normalizeSwap);
};