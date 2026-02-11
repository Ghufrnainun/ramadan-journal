const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const EQURAN_BASE = 'https://equran.id/api';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const endpoint = url.searchParams.get('endpoint');
    const apiVersion = url.searchParams.get('version') || 'v2';

    if (!endpoint) {
      return new Response(
        JSON.stringify({ success: false, error: 'Endpoint parameter is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const isDoa = endpoint.startsWith('doa');
    const apiUrl = isDoa
      ? `${EQURAN_BASE}/${endpoint}`
      : `${EQURAN_BASE}/${apiVersion}/${endpoint}`;

    console.log('Fetching:', apiUrl);

    const isPost = req.method === 'POST';
    const body = isPost ? await req.json() : null;

    const response = await fetch(apiUrl, {
      method: isPost ? 'POST' : 'GET',
      headers: {
        Accept: 'application/json',
        ...(isPost ? { 'Content-Type': 'application/json' } : {}),
        'User-Agent': 'MyRamadhan/1.0',
      },
      body: isPost ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('API error:', response.status, text.slice(0, 200));
      return new Response(
        JSON.stringify({ success: false, error: `API returned ${response.status}`, url: apiUrl }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Non-JSON response:', contentType, text.slice(0, 200));
      return new Response(
        JSON.stringify({ success: false, error: 'Upstream returned non-JSON', url: apiUrl }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const data = await response.json();
    console.log('Success for:', endpoint);

    // Doa API returns array directly, wrap it
    if (isDoa && Array.isArray(data)) {
      return new Response(
        JSON.stringify({ code: 200, message: 'success', data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: msg }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
