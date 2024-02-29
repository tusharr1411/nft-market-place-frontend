import Image from "next/image";
import { Inter } from "next/font/google";
import Head from "next/head";
import { Form, useNotification } from "web3uikit";
import { ethers } from "ethers";
import nftAbi from "../constants/BasicNFT.json"
import { useMoralis, useWeb3Contract } from "react-moralis";
import { nftMarketplaceAbi } from "../constants/NftMarketPlace.json";
import networkMapping from "../constants/networkMapping.json"



export default function Home() {
    const {chainId} = useMoralis()
    const chainIdString = chainId ? parseInt(chainId).toString(): "31337";
    const marketplaceAddress = networkMapping[chainIdString].NftMarketPlace[0];
    const dispatch = useNotification();

    const {runContractFunction} = useWeb3Contract()


    async function approveAndList(data){
        console.log("Approving...");
        const nftAddress = data.data[0].inputResult;
        const tokenId = data.data[1].inputResult;
        const price = ethers.parseUnits(data.data[2].inputResult, "ether").toString();

        const approveOptions = {
            abi: nftAbi,
            contractAddress :nftAddress,
            functionName: "approve",
            params: {
                to: marketplaceAddress,
                tokenId:tokenId,
            }
        }

        await runContractFunction({
            params: approveOptions,
            onSuccess: handleApproveSuccess(nftAddress, tokenId, price),
            onError: (error)=>console.log(error)
        })

    }

    async function handleApproveSuccess(nftAddress, tokenId, price){
        console.log("Ok! Now time to list")
        const listOptions = {
            abi: nftMarketplaceAbi,
            contractAddress: marketplaceAddress,
            functionName: "listItem",
            params:{
                nftAddress: nftAddress,
                tokenId:tokenId,
                price: price,
            },
        }

        await runContractFunction({
            params: listOptions,
            onSuccess: ()=>handleApproveSuccess(),
            onError: (error)=>console.log(error),
        })

    }
    async function handleListSuccess(){
        dispatch({
            type: "success",
            message: "NFT Listing",
            title: "NFT Listed",
            position: "topR"

        })

    }



    return (
        <div>
            <Form
                onSubmit={
                    approveAndList
                }
                data={[
                    {
                        name: "NFT Address",
                        type: "text",
                        inputWidth: "50%",
                        value: "",
                        key: "nftAddress",
                    },
                    {
                        name: "Token ID",
                        type: "number",
                        inputWidth: "50%",
                        value: "",
                        key: "tokenId",
                    },
                    {
                        name: "Price (in ETH)",
                        type: "number",
                        value: "",
                        key: "price",
                        inputWidth: "50%",
                    },
                ]}
                title="Sell your NFT"
                id="Main Form"
            />

        </div>
    );
}
