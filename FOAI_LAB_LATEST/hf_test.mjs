// Load token from environment variable: HF_TOKEN=your_token node hf_test.mjs
const token = process.env.HF_TOKEN;
if (!token) { console.error("ERROR: Set the HF_TOKEN environment variable first.\n  e.g. HF_TOKEN=hf_xxx node hf_test.mjs"); process.exit(1); }

async function query() {
  const urls = [
    "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
    "https://router.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
    "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0"
  ];
  for (const url of urls) {
      console.log(`Trying ${url}`);
      try {
        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
            method: "POST",
            body: JSON.stringify({inputs: "astronaut riding a horse"})
        });
        console.log(response.status);
        if (response.headers.get("content-type")?.includes("json") || response.status !== 200) {
           console.log(await response.text());
        } else {
           console.log("Success, got image blobs.");
           const blob = await response.blob();
           console.log(blob.type);
        }
      } catch (e) {
        console.log("Error:", e.message);
      }
  }
}
query();
