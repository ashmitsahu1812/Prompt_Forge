export default async function handler(req, res) {
  const { path: apiPath } = req.query;
  
  if (!apiPath) {
    return res.status(400).json({ error: "Missing 'path' query parameter" });
  }

  const url = `https://router.huggingface.co${apiPath}`;
  const token = process.env.HF_API_TOKEN || process.env.VITE_HF_API_TOKEN;

  if (!token) {
    return res.status(500).json({ error: "API token not configured on server. Please add HF_API_TOKEN to Vercel." });
  }

  try {
    const fetchOptions = {
      method: req.method,
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    };

    if (req.method === "POST") {
      // If req.body is already an object (auto-parsed by Vercel), stringify it.
      // If it's already a string, pass it through.
      fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }

    const response = await fetch(url, fetchOptions);
    const contentType = response.headers.get("content-type");

    res.status(response.status);
    if (contentType) res.setHeader("Content-Type", contentType);

    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      return res.json(data);
    } else {
      // For images and other binary data
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      return res.send(buffer);
    }
  } catch (error) {
    console.error("Hugging Face Proxy Error:", error);
    return res.status(500).json({ error: "Internal Server Error in Proxy", details: error.message });
  }
}
