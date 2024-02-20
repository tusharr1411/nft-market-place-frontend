import Image from "next/image";
import { Inter } from "next/font/google";
import Head from "next/head";

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




    return (
        <div>

            Hi
        </div>
    );
}
