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
    //--------------------------------------------------------------------------------------------------------------------------

    // emmited events can be accessed by offchain servieces
    // so we will index the events off-chain and then read from our database
    // so we need to setup a server to listen for those events to be fired, and we will add them to a database to query.
    // woah!, but isn't it centralized ?
    // and here comes THE Graph into play
    // moralis is a centralized way and graph is a decenteralized way

    // All our logic is still 100% on chain.
    // Speed & Development time.
    // Its really hard to start a prod blockchain project 100% decetralized
    // They are working on open sourcing their code.
    // Feature richness
    // We can create more features with a centralized back end to start
    // AS more decentralized tools are being created.
    // Local development

    //-----------------------------------------------------------------------------------------
    const { isWeb3Enabled, chainId } = useMoralis();
    const chainIdString = chainId ? parseInt(chainId).toString() : "31337";
    const marketplaceAddress = chainId ? networkMapping[chainIdString].NftMarketPlace[0] : null;
    console.log(`nftnftnft :${marketplaceAddress}`);

    const { loading, error, data: listedNfts } = useQuery(GET_ACTIVE_ITEMS);

    return (
        <>
            <div className="">
                <h1 className="py-4 px-4 font=bold text-2xl"> Recently Listed </h1>
                <div className="flex flex-wrap justify-center">
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
