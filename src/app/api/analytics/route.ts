import { NextRequest, NextResponse } from 'next/server';
import { getAllPrompts, DATA_DIR } from '@/lib/data';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || '7d';

    // Calculate date range
    const now = new Date();
    const daysBack = range === '1d' ? 1 : range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));

    // Get all prompts
    const prompts = getAllPrompts();

    // Get all execution logs
    const logsDir = path.join(DATA_DIR, 'results');
    let allLogs: any[] = [];

    if (fs.existsSync(logsDir)) {
      const logFiles = fs.readdirSync(logsDir).filter(file => file.startsWith('log_') && file.endsWith('.json'));
      allLogs = logFiles.map(file => {
        try {
          const content = fs.readFileSync(path.join(logsDir, file), 'utf8');
          return JSON.parse(content);
        } catch (e) {
          return null;
        }
      }).filter(log => log !== null);
    }

    // Filter logs by date range
    const filteredLogs = allLogs.filter(log => {
      if (!log.results || !log.results[0] || !log.results[0].timestamp) return false;
      const logDate = new Date(log.results[0].timestamp);
      return logDate >= startDate;
    });

    // Calculate analytics
    const totalPrompts = prompts.length;
    const totalExecutions = filteredLogs.length;

    // Calculate average score
    const scoredResults = filteredLogs.flatMap(log =>
      log.results.filter((r: any) => r.rating || r.ai_grade)
    );
    const averageScore = scoredResults.length > 0
      ? scoredResults.reduce((sum: number, r: any) => {
        const score = r.ai_grade?.score || r.rating || 0;
        return sum + score;
      }, 0) / scoredResults.length
      : 0;

    // Calculate average latency
    const averageLatency = filteredLogs.length > 0
      ? filteredLogs.reduce((sum, log) => sum + (log.total_latency || 0), 0) / filteredLogs.length
      : 0;

    // Calculate total tokens (estimated)
    const totalTokens = filteredLogs.reduce((sum, log) => {
      return sum + log.results.reduce((logSum: number, result: any) => {
        return logSum + (result.output?.length || 0) * 0.75; // Rough token estimation
      }, 0);
    }, 0);

    // Top performing prompts
    const promptPerformance = new Map();
    filteredLogs.forEach(log => {
      if (!promptPerformance.has(log.prompt_id)) {
        promptPerformance.set(log.prompt_id, {
          scores: [],
          executions: 0,
          title: prompts.find(p => p.prompt_id === log.prompt_id)?.title || 'Unknown'
        });
      }

      const perf = promptPerformance.get(log.prompt_id);
      perf.executions++;

      log.results.forEach((result: any) => {
        if (result.rating || result.ai_grade) {
          perf.scores.push(result.ai_grade?.score || result.rating || 0);
        }
      });
    });

    const topPerformingPrompts = Array.from(promptPerformance.entries())
      .map(([id, data]: [string, any]) => ({
        id,
        title: data.title,
        averageScore: data.scores.length > 0 ? data.scores.reduce((a: number, b: number) => a + b, 0) / data.scores.length : 0,
        executionCount: data.executions
      }))
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, 5);

    // Execution trends (last 7 days)
    const executionTrends = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

      const dayLogs = filteredLogs.filter(log => {
        if (!log.results || !log.results[0] || !log.results[0].timestamp) return false;
        const logDate = new Date(log.results[0].timestamp);
        return logDate >= dayStart && logDate < dayEnd;
      });

      const dayScores = dayLogs.flatMap(log =>
        log.results.filter((r: any) => r.rating || r.ai_grade)
          .map((r: any) => r.ai_grade?.score || r.rating || 0)
      );

      executionTrends.push({
        date: dayStart.toISOString().split('T')[0],
        executions: dayLogs.length,
        averageScore: dayScores.length > 0 ? dayScores.reduce((a, b) => a + b, 0) / dayScores.length : 0
      });
    }

    // Model performance
    const modelPerformance = new Map();
    filteredLogs.forEach(log => {
      if (!modelPerformance.has(log.model)) {
        modelPerformance.set(log.model, {
          executions: 0,
          scores: [],
          latencies: []
        });
      }

      const perf = modelPerformance.get(log.model);
      perf.executions++;
      perf.latencies.push(log.total_latency || 0);

      log.results.forEach((result: any) => {
        if (result.rating || result.ai_grade) {
          perf.scores.push(result.ai_grade?.score || result.rating || 0);
        }
      });
    });

    const modelPerformanceArray = Array.from(modelPerformance.entries())
      .map(([model, data]: [string, any]) => ({
        model,
        executions: data.executions,
        averageScore: data.scores.length > 0 ? data.scores.reduce((a: number, b: number) => a + b, 0) / data.scores.length : 0,
        averageLatency: Math.round(data.latencies.reduce((a: number, b: number) => a + b, 0) / data.latencies.length)
      }))
      .sort((a, b) => b.averageScore - a.averageScore);

    const analytics = {
      totalPrompts,
      totalExecutions,
      averageScore: Math.round(averageScore * 10) / 10,
      totalTokens: Math.round(totalTokens),
      averageLatency: Math.round(averageLatency),
      topPerformingPrompts,
      executionTrends,
      modelPerformance: modelPerformanceArray
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Failed to generate analytics' }, { status: 500 });
  }
}