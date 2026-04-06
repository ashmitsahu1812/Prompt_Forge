const token = "YOUR_HF_TOKEN_HERE";

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
