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
      prompt_text,
      suite_id, 
      model = "meta-llama/Llama-3.2-1B-Instruct" 
    } = await req.json();

    const prompt = getPrompt(prompt_id);
    if (!prompt) {
      const { getPromptDataPath } = await import('@/lib/data');
      const path = getPromptDataPath(prompt_id);
      console.error(`[API Execute] Prompt ID ${prompt_id} not found at ${path}`);
      return NextResponse.json({ 
        error: 'Prompt not found', 
        id: prompt_id,
        checked_path: path 
      }, { status: 404 });
    }

    const version = prompt.versions.find(v => v.version_id === version_id);
    if (!version) return NextResponse.json({ error: 'Version not found' }, { status: 404 });

    const suites = getAllTestSuites();
    const suite = suites.find(s => s.suite_id === suite_id);
    if (!suite) return NextResponse.json({ error: 'Suite not found' }, { status: 404 });

    const results = [];
    const startTime = Date.now();

    const apiUrl = `https://text.pollinations.ai/openai/v1/chat/completions`;
    const textToExecute = prompt_text || version.prompt_text;

    for (const input of suite.inputs) {
      let finalPrompt = textToExecute;
      
      // Handle Multi-Variable Replacement
      if (typeof input === 'object' && input !== null) {
        Object.entries(input).forEach(([key, value]) => {
          finalPrompt = finalPrompt.replaceAll(`{{${key}}}`, value as string);
        });
      } else {
        // Only replace {{input}} if it exists, otherwise treat as a system-defined prompt
        if (finalPrompt.includes('{{input}}')) {
          finalPrompt = finalPrompt.replaceAll('{{input}}', String(input));
        } else if (finalPrompt.includes('{{')) {
          // If there are other brackets, only replace the FIRST one if the user is using a legacy flat suite
          finalPrompt = finalPrompt.replace(/\{\{[^}]+\}\}/, String(input));
        } else {
          // If no brackets, append the input to give the LLM context
          finalPrompt = `${finalPrompt}\n\nClient Input: ${String(input)}`;
        }
      }
      
      try {
        // Mapping to recognized Pollinations.ai model names
        const targetModel = model.toLowerCase().includes('mistral') ? 'mistral' : 
                          model.toLowerCase().includes('llama') ? 'llama' : 
                          model.toLowerCase().includes('gemma') ? 'gemma' : 'openai';

        const response = await fetch(apiUrl, {
          headers: { "Content-Type": "application/json" },
          method: "POST",
          body: JSON.stringify({ 
            messages: [{ role: "user", content: finalPrompt }],
            model: targetModel,
            seed: Math.floor(Math.random() * 1000000)
          }),
        });

        let data = await response.json();
        
        // Robust Fallback: If the specific model is not found, retry with 'openai'
        if (data.error && data.error.includes('Model not found')) {
          console.warn(`[Execution] Model ${targetModel} not found, falling back to 'openai'`);
          const fallbackResponse = await fetch(apiUrl, {
            headers: { "Content-Type": "application/json" },
            method: "POST",
            body: JSON.stringify({ 
              messages: [{ role: "user", content: finalPrompt }],
              model: 'openai'
            }),
          });
          data = await fallbackResponse.json();
        }
        
        let outputText = "";
        if (data.choices && data.choices[0] && data.choices[0].message) {
          outputText = data.choices[0].message.content;
        } else {
          outputText = "No clear response generated. Response data: " + JSON.stringify(data);
        }

        results.push({
          input,
          final_prompt: finalPrompt,
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
