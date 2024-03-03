import { useEffect, useState } from "react";
import { useWeb3Contract, useMoralis } from "react-moralis";
import nftMarketplaceAbi from "../constants/NftMarketPlace.json";
import nftAbi from "../constants/BasicNFT.json";
import Image from "next/image";
import { Card, useNotification } from "web3uikit";
import { ethers } from "ethers";
import UpdateListingModal from "./UpdateListingModal";




const truncatString = (fullString, stringLength) => {
    if (fullString.length <= stringLength) return fullString;
    const separator = "...";
    const separatorLength = separator.length;
    const charsToShow = stringLength - separatorLength;
    const fronChars = Math.ceil(charsToShow / 2);
    const backChars = Math.floor(charsToShow / 2);
    return (fullString.substring(0, fronChars) + separator + fullString.substring(fullString.length - backChars));
};




export default function NFTBox({ price, nftAddress, tokenId, marketplaceAddress, seller }) {
    const { isWeb3Enabled, account } = useMoralis();
    const [imageURI, setImageURI] = useState("");
    const [tokenName, setTokenName] = useState("");
    const [tokenDescription, setTokenDescription] = useState("");
    const [showModal, setShowModal] = useState(false);
    const hideModal = () => setShowModal(false);
    const dispatch = useNotification();

    const { runContractFunction: getTokenURI } = useWeb3Contract({
        abi: nftAbi,
        contractAddress: nftAddress,
        functionName: "tokenURI",
        params: {
            tokenId: tokenId,
        },
    });

    const { runContractFunction: buyItem } = useWeb3Contract({
        abi: nftMarketplaceAbi,
        contractAddress: marketplaceAddress,
        functionName: "buyItem",
        msgValue: price,
        params: {
            nftAddress: nftAddress,
            tokenId: tokenId,
        },
    });

    async function updateUI() {
        const tokenURI = await getTokenURI();
        console.log(`Token URI is : ${tokenURI}`);

        if (tokenURI) {
            const requestURL = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/");
            const tokenURIResponse = await (await fetch(requestURL)).json();
            const imageURI = tokenURIResponse.image;
            const imageURIURL = imageURI.replace("ipfs://", "https://ipfs.io/ipfs/");
            setImageURI(imageURIURL);
            setTokenName(tokenURIResponse.name);
            setTokenDescription(tokenURIResponse.description);
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
        isOwnedByUser
            ? setShowModal(true)
            : buyItem({
                  onError: (error) => console.log(error),
                  onSuccess: () => handleBuyItemSuccess(),
              });
    };

    const handleBuyItemSuccess = () => {
        dispatch({
            type: "success",
            message: "Item Bought !",
            title: "Item Bought",
            position: "topR",
        });
    };

    return (
        <div>
            <div>
                {imageURI
                ? (<div>
                        <UpdateListingModal onClose={hideModal} isVisible={showModal} tokenId={tokenId} marketplaceAddress={marketplaceAddress} nftAddress={nftAddress}/>
                        <Card title={tokenName} description={tokenDescription} onClick={handleCardClick} >
                            <div className="p-2">
                                <div className="flex flex-col items-end gap-5">
                                    <div> #{tokenId}</div>
                                    <div className="italic text-sm">Owned by {formatedSellerAddress}{" "}</div>
                                    <Image loader={() => imageURI} src={imageURI} height="200" width="200"/>
                                    <div className="font-bold"> {ethers.formatEther(price)} ETH{" "} </div>
                                </div>
                            </div>
                        </Card>
                    </div>)
                : (<div> Loading ...</div>)
                }
            </div>
        </div>
    );
}
