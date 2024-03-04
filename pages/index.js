import Image from "next/image";
import { Inter } from "next/font/google";
import Head from "next/head";
import { useMoralisQuery, useMoralis } from "react-moralis";
import NFTBox from "@/components/NFTBox";
import networkMapping from "../constants/networkMapping.json";
const inter = Inter({ subsets: ["latin"] });
import GET_ACTIVE_ITEMS from "@/constants/subgraphQueries";
import { useQuery } from "@apollo/client";

export default function Home() {

    const { isWeb3Enabled, chainId } = useMoralis();
    const chainIdString = chainId ? parseInt(chainId).toString() : "31337";
    const marketplaceAddress = chainId ? networkMapping[chainIdString].NftMarketPlace[0] : null;
    console.log(`nftnftnft :${marketplaceAddress}`);

    const { loading, error, data: listedNfts } = useQuery(GET_ACTIVE_ITEMS);

    return (
        <>
            <div className="ml-20 mr-20 flex flex-col items-center gap-5 justify-center">
                <h1 className="py-4 px-4 font=bold text-2xl"> Recently Listed </h1>
                <div className="flex flex-wrap justify">
                    {isWeb3Enabled ? (
                        loading || !listedNfts ? (
                            <div> Loading...</div>
                        ) : (
                            listedNfts.activeItems.map((nft) => {
                                console.log(nft);
                                const { price, nftAddress, tokenId, seller } = nft;
                                return (
                                    <div className="m-4">
                                        <NFTBox
                                            price={price}
                                            nftAddress={nftAddress}
                                            tokenId={tokenId}
                                            marketplaceAddress={marketplaceAddress}
                                            seller={seller}
                                            key={`${nftAddress}${tokenId}`}
                                        />
                                    </div>
                                );
                            })
                        )
                    ) : (
                        <div> Web3 currently not enabled</div>
                    )}
                </div>
            </div>
        </>
    );
}
