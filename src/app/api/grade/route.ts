import { NextRequest, NextResponse } from 'next/server';
import { executePlugin, getAllPlugins } from '@/lib/plugins';

const HF_TOKEN = process.env.HF_TOKEN;

export async function POST(req: NextRequest) {
  try {
    const {
      output,
      rubric = "Accuracy, clarity, and adherence to instructions.",
      model = "meta-llama/Llama-3.2-1B-Instruct",
      scoringMethod = "ai", // "ai", "manual", "keyword", "length", or plugin ID
      keywords = [],
      lengthThreshold = { min: 0, max: 1000 },
      manualScore = null
    } = await req.json();

    // Check if it's a plugin-based scoring method
    const plugins = getAllPlugins();
    const plugin = plugins.find(p => p.id === scoringMethod && p.type === 'scorer' && p.enabled);

    if (plugin) {
      try {
        const result = await executePlugin(scoringMethod, output, { rubric, keywords, lengthThreshold });
        return NextResponse.json({
          ...result,
          method: `plugin:${scoringMethod}`
        });
      } catch (error) {
        console.error('Plugin execution error:', error);
        return NextResponse.json({ error: 'Plugin execution failed' }, { status: 500 });
      }
    }

    // Handle different scoring methods
    switch (scoringMethod) {
      case "manual":
        if (manualScore === null) {
          return NextResponse.json({ error: 'Manual score required' }, { status: 400 });
        }
        return NextResponse.json({
          score: manualScore,
          justification: "Manual score provided by user",
          method: "manual"
        });

      case "keyword":
        const keywordScore = calculateKeywordScore(output, keywords);
        return NextResponse.json({
          score: keywordScore.score,
          justification: keywordScore.justification,
          method: "keyword"
        });

      case "length":
        const lengthScore = calculateLengthScore(output, lengthThreshold);
        return NextResponse.json({
          score: lengthScore.score,
          justification: lengthScore.justification,
          method: "length"
        });

      case "ai":
      default:
        // Continue with AI-based scoring
        break;
    }

    const gradingSystemPrompt = `You are a professional AI Output Grader. 
Evaluate the following AI-generated output based on the provided rubric.
Give a numerical score from 1 to 10 and provide concise justifications.

RUBRIC: ${rubric}

OUTPUT TO EVALUATE:
"""
${output}
"""

Return your response in strict JSON format like this:
{
  "score": 8,
  "justification": "The output is clear and follows the rubric but lacks depth in the explanation."
}`;

    const apiUrl = `https://text.pollinations.ai/openai/v1/chat/completions`;

    const response = await fetch(apiUrl, {
      headers: { "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({
        model: "openai",
        messages: [{ role: "system", content: gradingSystemPrompt }],
        jsonMode: true
      }),
    });

    const data = await response.json();

    let content = "";
    if (data.choices && data.choices[0] && data.choices[0].message) {
      content = data.choices[0].message.content;
    } else {
      content = JSON.stringify(data);
    }

    try {
      const gradeResult = JSON.parse(content);
      return NextResponse.json({
        score: gradeResult.score || 0,
        justification: gradeResult.justification || "No justification provided.",
        method: "ai"
      });
    } catch (e) {
      return NextResponse.json({
        score: 0,
        justification: "Failed to parse grader response: " + content,
        method: "ai"
      });
    }

  } catch (error) {
    console.error('Grading error:', error);
    return NextResponse.json({ error: 'Failed to grade output' }, { status: 500 });
  }
}

function calculateKeywordScore(output: string, keywords: string[]) {
  if (!keywords || keywords.length === 0) {
    return { score: 5, justification: "No keywords specified for evaluation" };
  }

  const outputLower = output.toLowerCase();
  const foundKeywords = keywords.filter(keyword =>
    outputLower.includes(keyword.toLowerCase())
  );

  const score = Math.round((foundKeywords.length / keywords.length) * 10);
  const justification = `Found ${foundKeywords.length}/${keywords.length} keywords: ${foundKeywords.join(', ')}`;

  return { score, justification };
}

function calculateLengthScore(output: string, threshold: { min: number, max: number }) {
  const length = output.length;

  if (length < threshold.min) {
    const score = Math.max(1, Math.round((length / threshold.min) * 5));
    return {
      score,
      justification: `Output too short: ${length} chars (min: ${threshold.min})`
    };
  }

  if (length > threshold.max) {
    const score = Math.max(1, Math.round(10 - ((length - threshold.max) / threshold.max) * 5));
    return {
      score: Math.min(10, score),
      justification: `Output too long: ${length} chars (max: ${threshold.max})`
    };
  }

  return {
    score: 10,
    justification: `Perfect length: ${length} chars (within ${threshold.min}-${threshold.max})`
  };
}
