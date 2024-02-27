import { useEffect, useState } from "react";
import { useWeb3Contract, useMoralis } from "react-moralis";
import { nftMarketplaceAbi } from "../constants/NftMarketPlace.json";
import nftAbi from "../constants/BasicNFT.json";
import Image from "next/image";
import { Card } from "web3uikit";
import ethers from "ethers";
import UpdateListingModal from "./UpdateListingModal";

const truncatString = (fullString, stringLength) => {
    if (fullString.length <= stringLength) return fullString;
    const separator = "...";
    const seperatorLength = separator.length;
    const charsToShow = stringLength - seperatorLength;
    const fronChars = Match.ceil(charsToShow / 2);
    const backChars = Math.floor(charsToShow / 2);
    return (
        fullString.substring(0, fronChars) +
        seperator +
        fullString.substring(fullString.length - backChars)
    );
};

export default function NFTBox({ price, nftAddress, tokenId, marketplaceAddress, seller }) {
    const { isWeb3Enabled, account } = useMoralis();
    const [imageURI, setImageURI] = useState("");
    const [tokenName, setTokenName] = useState("");
    const [tokenDescription, setTokenDescription] = useState("");
    const [showModal, setShowModal] = useState(false);
    const hideModal = ()=>setShowModal(false);


    const { runContractFunction: getTokenURI } = useWeb3Contract({
        abi: nftAbi,
        contractAddress: nftAddress,
        functionName: "tokenURI",
        params: {
            tokenId: tokenId,
        },
    });

    const {runContractFunction: buyItem} = useWeb3Contract({
        abi:nftMarketPlace
    })

    async function updateUI() {
        // to get image we need tokenURI,
        //then imageTag from tokenURI
        const tokenURI = await getTokenURI();
        console.log(`Token URI is : ${tokenURI}`);

        if (tokenURI) {
            //IPFS gateway: A server that will return IPFS files from a "normal" URL( centralized)
            const requestURL = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/");
            const tokenURIResponse = await (await fetch(requestURL)).json();
            const imageURI = tokenURIResponse.image;
            const imageURIURL = imageURI.replace("ipfs://", "https://ipfs.io/ipfs/");
            setImageURI(imageURIURL);
            setTokenName(tokenURIResponse.name);
            setTokenDescription(tokenURIResponse.description);

            // other possible ways to render image?
            // 1. we could render the image on our server and just the server
            // 2. for testnets and mainnet we can use moralis server hooks
            // 3. Have the world adopt IPFS
            // 4. Build our own IPFS gateway
        }
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI();
        }
    }, [isWeb3Enabled]);

    const isOwnedByUser = seller === account || seller === undefined;
    const formatedSellerAddress = isOwnedByUser ? "You" : truncatString(seller || "", 15);

    const handleCardClick = () => {
        isOwnedByUser ? setShowModal(true) : console.log("let's buy");
    };
    return (
        <div>
            <div>
                {imageURI ? (
                    <div>
                        <UpdateListingModal
                            isVisible={showModal}
                            tokenId={tokenId}
                            marketplaceAddress={marketplaceAddress}
                            nftAddress={nftAddress}
                            onClose={highModal}
                        />
                        <Card
                            title={tokenName}
                            description={tokenDescription}
                            onClick={handleCardClick}
                        >
                            <div className="p-2">
                                <div className="flex flex-col items-end gap-2">
                                    <div> #{tokenId}</div>
                                    <div className="italic text-sm">
                                        Owned by {formatedSellerAddress}{" "}
                                    </div>
                                    <Image
                                        loader={() => imageURI}
                                        src={imageURI}
                                        height="200"
                                        width="200"
                                    />
                                    <div className="font-bold">
                                        {ethers.formatUnits(price, "ether")} ETH{" "}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                ) : (
                    <div> Loading ...</div>
                )}
            </div>
        </div>
    );
}
