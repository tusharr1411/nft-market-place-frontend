import {useState} from "react";
import {useWeb3Contract} from "react-moralis"


export default function NFTBox({price, nftAddress, tokenId, marketplaceAddress, seller}){
    const [imageURI, setImageURI] = useState("");
    // const {runContractFunction: getTokenURI} = useWeb3Contract({
    //     abi: 
    // })

    async function updateUI(){
        // to get image we need tokenURI, 
        //then imageTag from tokenURI

    }

}