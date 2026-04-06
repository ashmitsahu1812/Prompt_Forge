// Load token from environment variable: HF_TOKEN=your_token node hf_test_llama.mjs
const token = process.env.HF_TOKEN;
if (!token) { console.error("ERROR: Set the HF_TOKEN environment variable first.\n  e.g. HF_TOKEN=hf_xxx node hf_test_llama.mjs"); process.exit(1); }

async function query() {
  const url = "https://router.huggingface.co/hf-inference/models/meta-llama/Llama-3.2-1B-Instruct";
  try {
    const response = await fetch(url, {
        headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify({inputs: "Tell me a joke about AI."})
    });
    console.log(response.status);
    console.log(await response.text());
  } catch (e) {
    console.log("Error:", e.message);
  }
}
query();
