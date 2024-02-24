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
        logger.info("saving ...");
        await activeItem.save();
    }
});

Moralis.Cloud.afterSave("ItemCanceled", async (request) => {
    const confirmed = request.object.get("confirmed");
    const logger = Moralis.Cloud.getLogger();
    logger.info(`Marketplace | Object: ${request.object}`);
    if (confirmed) {
        const ActiveItem = Moralis.Object.extend("ActiveItem");
        const query = new Moralis.Query(ActiveItem);

        query.equalTo("marketplaceAddress", request.object.get("address"));
        query.equalTo("nftAddress", request.object.get("nftAddress"));
        query.equalTo("tokenId", request.object.get("tokenId"));
        logger.info(`Marketplace | Query : ${query}`);
        const canceledItem = await query.first();
        logger.info(`Marketplace | CanceledItem: ${canceledItem}`);
        if (canceledItem) {
            logger.info(
                `Deleting ${request.object.get("tokenId")} at address ${request.object.get(
                    "address"
                )} from ActiveItem table since it was canceled.`
            );
            await canceledItem.destroy();
        } else {
            logger.info(
                `No item found with address: ${request.object.get(
                    "address"
                )} and tokenId: ${request.object.get("tokenId")}`
            );
        }
    }
});

Moralis.Cloud.afterSave("ItemBought", async (request) => {
    const confirmed = request.object.get("confirmed");
    const logger = Moralis.Cloud.getLogger();
    logger.info(`Marketplace | Object: ${request.object}`);

    if (confirmed) {
        const ActiveItem = Moralis.Object.extend("ActiveItem");
        const query = new Moralis.Query(ActiveItem);
        query.equalTo("marketplaceAddress", request.object.get("address"));
        query.equalTo("nftAddress", request.object.get("nftAddress"));
        query.equalTo("tokenId", request.object.get("tokenId"));

        logger.info(`Marketplace | Query: ${query}`);
        const boughtItem = await query.first();

        if (boughtItem) {
            logger.info(`Deleting ${request.object.get("ObjectId")}`);
            await boughtItem.destroy();
            logger.info(
                `Deleting item with tokenId: ${request.object.get(
                    "tokenId"
                )} at address: ${request.object.get(
                    "address"
                )} from ActiveItem table since it was bought.`
            );
        } else {
            logger.info(
                `No item bought with address ${request.object.get(
                    "address"
                )} and tokenId: ${request.object.get("tokenId")} found.`
            );
        }
    }
});
