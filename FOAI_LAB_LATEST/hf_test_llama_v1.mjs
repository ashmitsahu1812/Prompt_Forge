const token = "YOUR_HF_TOKEN_HERE";

async function query() {
  const url = "https://router.huggingface.co/hf-inference/v1/chat/completions";
  try {
    const response = await fetch(url, {
        headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify({
            model: "meta-llama/Llama-3.2-1B-Instruct",
            messages: [{role: "user", content: "Tell me a joke about AI"}],
            max_tokens: 50
        })
    });
    console.log(response.status);
    console.log(await response.text());
  } catch (e) {
    console.log("Error:", e.message);
  }
}
query();
