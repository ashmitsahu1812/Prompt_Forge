import { NextRequest, NextResponse } from 'next/server';

const HF_TOKEN = process.env.HF_TOKEN;

export async function POST(req: NextRequest) {
  try {
    const { 
      output, 
      rubric = "Accuracy, clarity, and adherence to instructions.",
      model = "meta-llama/Llama-3.2-1B-Instruct" 
    } = await req.json();

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

    const apiUrl = `https://text.pollinations.ai/`;

    const response = await fetch(apiUrl, {
      headers: { "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({ 
        model: "llama",
        messages: [{ role: "system", content: gradingSystemPrompt }],
        jsonMode: true
      }),
    });

    const content = await response.text();
    
    try {
      const gradeResult = JSON.parse(content);
      return NextResponse.json({
        score: gradeResult.score || 0,
        justification: gradeResult.justification || "No justification provided."
      });
    } catch (e) {
      return NextResponse.json({ 
        score: 0, 
        justification: "Failed to parse grader response: " + content 
      });
    }

  } catch (error) {
    console.error('Grading error:', error);
    return NextResponse.json({ error: 'Failed to grade output' }, { status: 500 });
  }
}
