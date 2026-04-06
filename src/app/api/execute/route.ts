import { NextRequest, NextResponse } from 'next/server';
import { getPrompt, getAllTestSuites, DATA_DIR } from '@/lib/data';
import fs from 'fs';
import path from 'path';

const HF_TOKEN = process.env.HF_TOKEN;
export async function POST(req: NextRequest) {
  try {
    const { 
      prompt_id, 
      version_id, 
      suite_id, 
      model = "meta-llama/Llama-3.2-1B-Instruct" 
    } = await req.json();

    const prompt = getPrompt(prompt_id);
    if (!prompt) return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });

    const version = prompt.versions.find(v => v.version_id === version_id);
    if (!version) return NextResponse.json({ error: 'Version not found' }, { status: 404 });

    const suites = getAllTestSuites();
    const suite = suites.find(s => s.suite_id === suite_id);
    if (!suite) return NextResponse.json({ error: 'Suite not found' }, { status: 404 });

    if (!HF_TOKEN) {
      return NextResponse.json({ error: 'HF_TOKEN not configured in .env' }, { status: 500 });
    }

    const results = [];
    const startTime = Date.now();

    // Use the free Serverless Inference API endpoint
    const hfUrl = `https://api-inference.huggingface.co/v1/chat/completions`;

    for (const input of suite.inputs) {
      let finalPrompt = version.prompt_text;
      
      // Handle Multi-Variable Replacement
      if (typeof input === 'object' && input !== null) {
        Object.entries(input).forEach(([key, value]) => {
          finalPrompt = finalPrompt.replaceAll(`{{${key}}}`, value as string);
        });
      } else {
        // Fallback for legacy string-based inputs
        finalPrompt = finalPrompt.replaceAll('{{input}}', String(input));
      }
      
      try {
        const response = await fetch(hfUrl, {
          headers: { 
            Authorization: `Bearer ${HF_TOKEN}`, 
            "Content-Type": "application/json" 
          },
          method: "POST",
          body: JSON.stringify({ 
            model: model,
            messages: [{ role: "user", content: finalPrompt }],
            max_tokens: 500
          }),
        });

        const data = await response.json();
        
        let outputText = "";
        if (data.choices && data.choices[0] && data.choices[0].message) {
          outputText = data.choices[0].message.content;
        } else {
          outputText = JSON.stringify(data);
        }

        results.push({
          input,
          output: outputText,
          timestamp: new Date().toISOString()
        });
      } catch (e: any) {
        results.push({
          input,
          output: "Error: " + e.message,
          timestamp: new Date().toISOString()
        });
      }
    }

    const executionLog = {
      execution_id: Date.now().toString(),
      prompt_id,
      version_id,
      suite_id,
      model,
      results,
      total_latency: Date.now() - startTime
    };

    // Save to logs
    const logsDir = path.join(DATA_DIR, 'results');
    if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
    
    fs.writeFileSync(
      path.join(logsDir, `log_${executionLog.execution_id}.json`),
      JSON.stringify(executionLog, null, 2)
    );

    return NextResponse.json(executionLog);

  } catch (error) {
    console.error('Execution error:', error);
    return NextResponse.json({ error: 'Failed to execute prompt' }, { status: 500 });
  }
}
