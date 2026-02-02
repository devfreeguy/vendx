
const axios = require('axios');

const address = "qq88ze73wuaxey2e06vafcgn48zrmruq8s5r27kz0w"; // The address from user logs
const cleanAddr = address.replace("bitcoincash:", "");

const apis = [
    {
      name: "Blockchain.info (BCH)",
      getAddress: (addr) =>
        `https://api.blockchain.info/bch/multiaddr?active=${addr}`,
    },
    {
      name: "FullStack.cash",
      getAddress: (addr) =>
        `https://api.fullstack.cash/v5/electrumx/transactions/${addr}`,
    },
    {
      name: "Bitcoin.com",
      getAddress: (addr) =>
        `https://rest.bitcoin.com/v2/address/transactions/${addr}`,
    },
];

(async () => {
    console.log("Verifying API responses for address:", cleanAddr);

    for (const api of apis) {
        try {
            console.log(`\n--- Testing ${api.name} ---`);
            const url = api.getAddress(cleanAddr);
            console.log("URL:", url);
            const start = Date.now();
            const res = await axios.get(url, { headers: { "User-Agent": "VendX-Monitor-Test" }, timeout: 5000 });
            const duration = Date.now() - start;
            console.log(`Status: ${res.status} (${duration}ms)`);
            
            const data = res.data;
            
            if (api.name === "Blockchain.info (BCH)") {
                 const txs = data.txs || [];
                 console.log(`Found ${txs.length} txs`);
                 if (txs.length > 0) {
                     const tx = txs[0];
                     console.log("Sample Tx structure keys:", Object.keys(tx));
                     if (tx.out && Array.isArray(tx.out)) {
                         console.log("Outputs found:", tx.out.length);
                         const myOutput = tx.out.find((o) => o.addr === cleanAddr);
                         if (myOutput) {
                             console.log("✅ Found output for address with value:", myOutput.value);
                         } else {
                             console.log("⚠️ No output found for this address in sample tx (might be input?)");
                         }
                     }
                 }
            } else if (api.name === "FullStack.cash") {
                const txs = data.transactions || [];
                console.log(`Found ${txs.length} txs`);
                 if (txs.length > 0) {
                     console.log("Sample Tx structure:", txs[0]);
                 }
            } else if (api.name === "Bitcoin.com") {
                const txs = Array.isArray(data) ? data : data.txs || [];
                console.log(`Found ${txs.length} txs`);
                if (txs.length > 0) {
                     console.log("Sample Tx keys:", Object.keys(txs[0]));
                }
            }

        } catch (e) {
            console.error(`❌ Error with ${api.name}:`, e.message);
        }
    }
})();
