import { Modal, Input, useNotification } from "web3uikit";
import { useState } from "react";
import { useWeb3Contract } from "react-moralis";
import { nftMarketplaceAbi } from "../constants/NftMarketPlace.json";
import { ethers } from "ethers";

export default function UpdateListingModal({
    nftAddress,
    tokenId,
    isVisible,
    marketplaceAddress,
    onClose,
}) {
    const dispatch = useNotification();
    const [priceToUpdateListingWith, setPriceToUpdateListingWith] = useState(0);

    const handleUpdateListingSuccess = () => {
        // await tx.wait(1);
        dispatch({
            type: "success",
            message: "Listing Updated",
            title: "Listing updated - please refresh (and move blocks)",
            position: "topR",
        });
        onClose && onClose();
        setPriceToUpdateListingWith("0");
    };

    const { runContractFunction: updateListing } = useWeb3Contract({
        abi: nftMarketplaceAbi,
        contractAddress: marketplaceAddress,
        functionName: "updateListing",
        params: {
            nftAddress: nftAddress,
            tokenId: tokenId,
            newPrice: ethers.parseEther(priceToUpdateListingWith || "0"),
        },
    });

    return (
        <Modal
            isVisible={isVisible}
            onCancel={onClose}
            onCloseButtonPressed={onClose}
            onOk={() => {
                console.log("HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH");
                updateListing({
                    onError: (error) => console.log(error),
                    onSuccess: handleUpdateListingSuccess(),
                });
            }}
        >
            <Input
                label="Update listing price in L1 Currency (ETH)"
                name="New Listing Price"
                type="number"
                onChange={(event) => {
                    setPriceToUpdateListingWith(event.target.value);
                }}
                onOk={() => {}}
            />
        </Modal>
    );
}
