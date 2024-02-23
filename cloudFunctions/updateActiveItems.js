//create a new table called "ActiveItem"
// Add items when they are listed on the marketplace
// Remove them when they are bough or canceled

const { default: Moralis } = require("moralis-v1");

//we don't need to import moralis here because we're gonna upload it as a cloud function and our server will automatically injects moralis into our scripts

Moralis.Cloud.afterSave("ItemListed", async (request) => {
    // Every event get triggered twice, once on tx unconfirmed, again on confirmed
    const confirmed = request.object.get("confirmed");
    const logger = Moralis.Cloud.getLogger();

    logger.info("Looking for confirmed Tx");
    if (confirmed) {
        logger.info("Found Item!");
        const ActiveItem = Moralis.Object.extend("ActiveItem");
        const activeItem = new ActiveItem();
        activeItem.set("marketplaceAddress", request.object.get("address"));
        activeItem.set("nftAddress", request.object.get("nftAddress"));
        activeItem.set("price", request.object.get("price"));
        activeItem.set("tokenId", request.object.get("tokenId"));
        activeItem.set("seller", request.object.get("seller"));

        logger.info(
            `Adding  Address: ${request.object.get("address")} Token Id: ${request.object.get(
                "tokenId"
            )} `
        );
        logger.info("saving ...")
        await activeItem.save();
    }
});
