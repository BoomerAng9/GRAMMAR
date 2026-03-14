import { NextRequest, NextResponse } from 'next/server';
import { tliService } from '@/lib/research/tli-service';

/**
 * POST /api/research
 * Handles three actions:
 *   - "analyze"   => Run TLI intent analysis on raw text
 *   - "ingest"    => Add a data source to a notebook
 *   - "query"     => Deep research query across indexed sources
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'analyze': {
        const skills = tliService.analyzeIntent(body.text);
        return NextResponse.json({ skills });
      }

      case 'init': {
        const notebookId = await tliService.initContextPack(body.projectName);
        return NextResponse.json({ notebookId });
      }

      case 'ingest': {
        const sourceId = await tliService.ingestSource(body.notebookId, body.source);
        return NextResponse.json({ sourceId });
      }

      case 'query': {
        const result = await tliService.research(
          body.notebookId, 
          body.query, 
          body.mode || 'precise'
        );
        return NextResponse.json(result);
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: "${action}". Supported: analyze, init, ingest, query` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('[API /research] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/research
 * Health check for the Research API
 */
export async function GET() {
  return NextResponse.json({
    service: 'GRAMMAR Research API',
    version: '1.0.0',
    modules: ['TLI', 'NotebookLM', 'DeepResearch'],
    status: 'operational'
  });
}
