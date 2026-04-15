import { NextRequest, NextResponse } from 'next/server';
import { getPrompt, getAllTestSuites, saveExecutionLog } from '@/lib/data';

// POST /api/v1/execute - Execute a prompt with advanced options
export async function POST(req: NextRequest) {
  try {
    const {
      prompt_id,
      version_id,
      suite_id,
      inputs, // Direct inputs instead of suite
      model = "mistralai/Mistral-7B-Instruct-v0.3",
      options = {}
    } = await req.json();

    // Validate required fields
    if (!prompt_id || !version_id) {
      return NextResponse.json(
        {
          error: 'Validation error',
          message: 'Missing required fields: prompt_id, version_id',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    const prompt = getPrompt(prompt_id);
    if (!prompt) {
      return NextResponse.json(
        {
          error: 'Not found',
          message: 'Prompt not found',
          timestamp: new Date().toISOString()
        },
        { status: 404 }
      );
    }

    const version = prompt.versions.find(v => v.version_id === version_id);
    if (!version) {
      return NextResponse.json(
        {
          error: 'Not found',
          message: 'Version not found',
          timestamp: new Date().toISOString()
        },
        { status: 404 }
      );
    }

    // Get inputs from suite or direct inputs
    let testInputs = inputs || [];
    if (suite_id && !inputs) {
      const suites = getAllTestSuites();
      const suite = suites.find(s => s.suite_id === suite_id);
      if (!suite) {
        return NextResponse.json(
          {
            error: 'Not found',
            message: 'Test suite not found',
            timestamp: new Date().toISOString()
          },
          { status: 404 }
        );
      }
      testInputs = suite.inputs;
    }

    if (testInputs.length === 0) {
      return NextResponse.json(
        {
          error: 'Validation error',
          message: 'No inputs provided. Use either suite_id or inputs array',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    const results = [];
    const startTime = Date.now();
    const apiUrl = `https://text.pollinations.ai/openai/v1/chat/completions`;

    for (const input of testInputs) {
      let finalPrompt = version.prompt_text;

      // Handle Multi-Variable Replacement
      if (typeof input === 'object' && input !== null) {
        Object.entries(input).forEach(([key, value]) => {
          finalPrompt = finalPrompt.replaceAll(`{{${key}}}`, value as string);
        });
      } else {
        finalPrompt = finalPrompt.replaceAll('{{input}}', String(input));
      }

      try {
        const response = await fetch(apiUrl, {
          headers: { "Content-Type": "application/json" },
          method: "POST",
          body: JSON.stringify({
            messages: [{ role: "user", content: finalPrompt }],
            model: "openai",
            ...options // Allow custom model options
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
          timestamp: new Date().toISOString(),
          model_response: data // Include full model response for debugging
        });
      } catch (e: any) {
        results.push({
          input,
          output: "Error: " + e.message,
          timestamp: new Date().toISOString(),
          error: true
        });
      }
    }

    const executionLog = {
      execution_id: Date.now().toString(),
      prompt_id,
      version_id,
      suite_id: suite_id || null,
      model,
      options,
      results,
      total_latency: Date.now() - startTime,
      created_at: new Date().toISOString()
    };

    // Save execution log
    saveExecutionLog(executionLog);

    return NextResponse.json({
      data: executionLog,
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1'
      }
    });

  } catch (error) {
    console.error('Execution error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to execute prompt',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}