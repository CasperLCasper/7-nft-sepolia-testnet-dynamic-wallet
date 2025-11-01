// api/getAllNFTs.js
export default async function handler(req, res) {
  const { account } = req.query;

  if (!account) {
    return res.status(400).json({ error: "Missing account parameter" });
  }

  try {
    // Izmanto Alchemy NFT API
    // Pārliecinies, ka tu izmanto savu Sepolia API atslēgu
    const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY || "YOUR_ALCHEMY_KEY";
    const url = `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}/getNFTs/?owner=${account}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Alchemy API error: ${response.status}`);
    }

    const data = await response.json();

    // Formatē rezultātu vienotā struktūrā frontendam
    const formattedNFTs = (data.ownedNfts || []).map(nft => ({
      contract: {
        address: nft.contract.address || nft.contractAddress,
        symbol: nft.contract.symbol || "NFT",
        name: nft.contract.name || "Unknown NFT"
      },
      id: { tokenId: nft.id?.tokenId || "0" },
      title: nft.title || "Untitled NFT",
      description: nft.description || "",
      media: nft.media || nft.metadata?.image ? [{ gateway: nft.metadata.image }] : [],
      balance: 1
    }));

    return res.status(200).json({
      success: true,
      totalCount: formattedNFTs.length,
      nfts: formattedNFTs
    });
  } catch (error) {
    console.error("getAllNFTs error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch NFTs",
      details: error.message
    });
  }
}
