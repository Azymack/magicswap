import * as React from "react";
import { PlusSmIcon, SearchIcon } from "@heroicons/react/solid";
import type { LoaderFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import type { ShouldReloadFunction } from "@remix-run/react";
import { NavLink, Outlet, useLoaderData } from "@remix-run/react";
import type { GetPairsQuery } from "~/graphql/generated";
import { sdk } from "~/utils/api.server";
import { getApr } from "~/utils/price";
import cn from "clsx";

type LoaderData = {
  pairs: GetPairsQuery["pairs"];
};

export const loader: LoaderFunction = async () => {
  const { pairs } = await sdk.getPairs({
    where: { token0: "0x539bde0d7dbd336b79148aa742883198bbf60342" },
  });

  return json<LoaderData>({ pairs });
};

// Changing query params on pools/:poolId/manage route automatically reloads all parent loaders, but we don't have to do that here.
export const unstable_shouldReload: ShouldReloadFunction = () => false;

export default function Pools() {
  const { pairs } = useLoaderData<LoaderData>();
  const [mobileFiltersOpen, setMobileFiltersOpen] = React.useState(false);
  return (
    <div className="my-12 flex flex-1 flex-col">
      <h2 className="text-xl font-medium">Pools</h2>
      <aside>
        <h2 className="sr-only">Pool List</h2>
        <button
          className="inline-flex items-center lg:hidden mt-6"
          onClick={() => setMobileFiltersOpen(true)}
        >
          <span className="text-sm font-medium text-gray-500">Pool List</span>
          <PlusSmIcon
            className="flex-shrink-0 ml-1 h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        </button>
      </aside>
      <div className="lg:mt-6 mt-2 grid flex-1 grid-cols-6 gap-x-4">
        <div className="hidden lg:flex lg:col-span-2 flex-col bg-gray-800 h-[calc(100vh-256px)] rounded-md overflow-hidden">
          <div className="p-6">
            <label htmlFor="liquidity-pools" className="sr-only">
              Liquidity Pool
            </label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <input
                type="text"
                name="liquidity-pools"
                id="liquidity-pools"
                className="block w-full rounded-md border-gray-700 bg-gray-900 pr-10 focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
                placeholder="Search for liquidity pools"
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <SearchIcon
                  className="h-5 w-5 text-gray-700"
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="sticky top-0 z-10 border-b-[0.5px] border-gray-600 px-6 pb-2 text-sm font-medium text-gray-500 flex justify-between">
              <h3>Pools</h3>
              <h3>APR</h3>
            </div>
            <div className="flex-1 overflow-auto">
              <ul>
                {pairs.map((pair) => (
                  <li key={pair.id}>
                    <NavLink
                      to={`/pools/${pair.id}/manage`}
                      prefetch="intent"
                      className="focus:outline-none"
                    >
                      {({ isActive }) => (
                        <div
                          className={cn(
                            "px-6 py-5 flex items-center space-x-3 border-l-2 group",
                            {
                              "border-red-600 text-red-600 bg-red-500/10":
                                isActive,
                              "hover:border-gray-300 border-transparent":
                                !isActive,
                            }
                          )}
                        >
                          <div className="flex justify-between w-full items-center">
                            <div className="flex items-center space-x-4">
                              <div className="flex -space-x-4">
                                <img
                                  src="https://via.placeholder.com/400"
                                  alt="placeholder"
                                  className={cn(
                                    "w-8 h-8 rounded-full ring-1 z-10",
                                    {
                                      "ring-red-400": isActive,
                                      "ring-gray-800": !isActive,
                                    }
                                  )}
                                />
                                <img
                                  src="https://via.placeholder.com/400"
                                  alt="placeholder"
                                  className={cn("w-8 h-8 rounded-full ring-1", {
                                    "ring-red-400": isActive,
                                    "ring-gray-800": !isActive,
                                  })}
                                />
                              </div>
                              <p
                                className={cn("text-sm font-medium", {
                                  "text-red-500": isActive,
                                  "text-gray-400 group-hover:text-gray-200":
                                    !isActive,
                                })}
                              >
                                {pair.name}
                              </p>
                            </div>
                            <p
                              className={cn("font-bold", {
                                "text-red-500": isActive,
                              })}
                            >
                              {getApr(pair.volumeUSD, pair.reserveUSD)}%
                            </p>
                          </div>
                        </div>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="col-span-6 lg:col-span-4 bg-gray-800 rounded-md overflow-hidden">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
