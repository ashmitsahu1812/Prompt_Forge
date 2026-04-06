import { NextRequest, NextResponse } from 'next/server';

const HF_TOKEN = process.env.HF_TOKEN;

export async function POST(req: NextRequest) {
  try {
    const { 
      output, 
      rubric = "Accuracy, clarity, and adherence to instructions.",
      model = "meta-llama/Llama-3.2-1B-Instruct" 
    } = await req.json();

    if (!HF_TOKEN) {
      return NextResponse.json({ error: 'HF_TOKEN not configured' }, { status: 500 });
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

    // Use the free Serverless Inference API endpoint
    const hfUrl = `https://router.huggingface.co/v1/chat/completions`;

    const response = await fetch(hfUrl, {
      headers: { 
        Authorization: `Bearer ${HF_TOKEN}`, 
        "Content-Type": "application/json" 
      },
      method: "POST",
      body: JSON.stringify({ 
        model: model,
        messages: [{ role: "system", content: gradingSystemPrompt }],
        max_tokens: 300,
        response_format: { type: "json_object" }
      }),
    });

    const data = await response.json();
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      const content = data.choices[0].message.content;
      try {
        const gradeResult = JSON.parse(content);
        return NextResponse.json(gradeResult);
      } catch (e) {
        return NextResponse.json({ 
          score: 0, 
          justification: "Failed to parse grader response: " + content 
        });
      }
    }

    return NextResponse.json({ error: 'Failed to get grading response' }, { status: 500 });

  } catch (error) {
    console.error('Grading error:', error);
    return NextResponse.json({ error: 'Failed to grade output' }, { status: 500 });
  }
}
