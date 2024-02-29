import Image from "next/image";
import { Inter } from "next/font/google";
import Head from "next/head";
import { useMoralisQuery, useMoralis } from "react-moralis";
import NFTBox from "@/components/NFTBox";

const inter = Inter({ subsets: ["latin"] });

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
    const {isWeb3Enabled} = useMoralis()
    const { data: listedNfts, isFetching: fetchingListedNfts } = useMoralisQuery(
        "ActiveItem", //tableName
        //function for the Query
        (query) => query.limit(10).descending("tokenId") // grabing first 10 in descending order of tokenId
    );
    console.log(listedNfts);

    return (
        <>
            <div className="container mx-auto">
                <h1 className="py-4 px-4 font=bold text-2xl"> Recently Listed  </h1>
                <div className="flex flex-wrap">
                    {
                        isWeb3Enabled ? (
                    
                    
                    fetchingListedNfts ? (
                        <div> Loading...</div>
                    ) : (
                        listedNfts.map((nft) => {
                            console.log(nft.attributes);
                            const { price, nftAddress, tokenId, marketplaceAddress, seller } =
                                nft.attributes;
                            return (
                                <div>
                                    <NFTBox price={price} nftAddress={nftAddress} tokenId={tokenId} marketplaceAddress={marketplaceAddress} seller={seller} key={`${nftAddress}${tokenId}`}/>
                                </div>
                            );
                        })
                        )
                    ) :(
                        <div> Web3 currently not enabled</div>
                    )
                    }
                 </div> 
            </div>
        </>
    );
}
