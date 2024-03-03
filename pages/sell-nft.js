import Image from "next/image";
import Head from "next/head";
import { Inter } from "next/font/google";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { Button, Form, useNotification, Widget } from "web3uikit";
import nftAbi from "../constants/BasicNFT.json";
import nftMarketplaceAbi from "../constants/NftMarketPlace.json";
import networkMapping from "../constants/networkMapping.json";

export default function Home() {
    const { chainId, account, isWeb3Enabled } = useMoralis();
    const chainIdString = chainId ? parseInt(chainId).toString() : "31337";
    const marketplaceAddress = networkMapping[chainIdString].NftMarketPlace[0];
    const dispatch = useNotification();
    const { runContractFunction } = useWeb3Contract();
    const [proceeds, setProceeds] = useState("0");

    async function approveAndList(data) {
        console.log("Approving...");
        const nftAddress = data.data[0].inputResult;
        const tokenId = data.data[1].inputResult;
        const price = ethers.parseUnits(data.data[2].inputResult, "ether").toString();

        const approveOptions = {
            abi: nftAbi,
            contractAddress: nftAddress,
            functionName: "approve",
            params: {
                to: marketplaceAddress,
                tokenId: tokenId,
            },
        };

        await runContractFunction({
            params: approveOptions,
            onSuccess: (tx) => handleApproveSuccess(tx, nftAddress, tokenId, price),
            onError: (error) => console.log(error),
        });
    }

    async function handleApproveSuccess(tx, nftAddress, tokenId, price) {
        console.log("Ok! Now time to list");
        await tx.wait();
        const listOptions = {
            abi: nftMarketplaceAbi,
            contractAddress: marketplaceAddress,
            functionName: "listItem",
            params: {
                nftAddress: nftAddress,
                tokenId: tokenId,
                price: price,
            },
        };

        await runContractFunction({
            params: listOptions,
            onSuccess: handleListSuccess,
            onError: (error) => console.log(error),
        });
    }
    async function handleListSuccess() {
        dispatch({
            type: "success",
            message: "NFT Listing",
            title: "NFT Listed",
            position: "topR",
        });
    }

    const handleWithdrawSuccess = async (tx) => {
        tx.wait(1);
        dispatch({
            type: "success",
            message: "Withdrawing proceeds",
            position: "topR",
        });
    };

    async function setupUI() {
        const returnedProceeds = await runContractFunction({
            params: {
                abi: nftMarketplaceAbi,
                contractAddress: marketplaceAddress,
                functionName: "getProceeds",
                params: {
                    seller: account,
                },
                onError: (error) => console.log(error),
            },
        });
        if (returnedProceeds) {
            setProceeds(returnedProceeds.toString());
        }
    }

    useEffect(() => {
        setupUI();
    }, [proceeds, account, isWeb3Enabled, chainId]);


    
    return (
        <div>
            <Form
                onSubmit={approveAndList}
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

            <div style={{ display: "grid", gap: "20px", padding: "40px 20px" }}>
                <section className=" gap-20 ">
                    <Widget info="Available Proceeds to withdraw : ">
                        <div> {ethers.formatEther(proceeds)} ETH </div>
                    </Widget>
                </section>

                <section className="justify-center w-30">
                    <Button
                        disabled={proceeds != "0"? false : true}
                        style={{ height: "90px", width: "100%" }}
                        iconColor="green"
                        size="large"
                        theme="colored"
                        color="green"
                        text="Withdraw"
                        onClick={() => {
                            runContractFunction({
                                params: {
                                    abi: nftMarketplaceAbi,
                                    contractAddress: marketplaceAddress,
                                    functionName: "withdrawProceeds",
                                    params: {},
                                },
                                onError: (error) => console.log(error),
                                onSuccess: handleWithdrawSuccess,
                            });
                        }}
                    />
                </section>
            </div>
        </div>
    );
}
