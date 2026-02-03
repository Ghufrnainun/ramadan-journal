const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// API base URL (docs live under /apidev, but JSON API is served under /api)
const EQURAN_BASE_URLS = ['https://equran.id/api'];

function buildApiUrl(baseUrl: string, endpoint: string, apiVersion: string) {
  const isDoa = endpoint.startsWith('doa');
  // - Doa uses /doa (no version prefix)
  // - Quran uses /v2/surat, /v2/tafsir, ...
  // - Shalat uses /v2/shalat
  return isDoa
    ? `${baseUrl}/${endpoint}`
    : `${baseUrl}/${apiVersion}/${endpoint}`;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const endpoint = url.searchParams.get('endpoint');
    const apiVersion = url.searchParams.get('version') || 'v2';

    if (!endpoint) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Endpoint parameter is required',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const isPost = req.method === 'POST';
    const body = isPost ? await req.json() : null;
    if (body) console.log('POST body:', JSON.stringify(body));

    // Try base URLs in order until one works
    let response: Response | null = null;
    let apiUrlTried: string | null = null;
    let lastErr: unknown = null;

    for (const baseUrl of EQURAN_BASE_URLS) {
      const apiUrl = buildApiUrl(baseUrl, endpoint, apiVersion);
      apiUrlTried = apiUrl;
      console.log('Fetching from eQuran API:', apiUrl);

      try {
        response = await fetch(apiUrl, {
          method: isPost ? 'POST' : 'GET',
          headers: {
            Accept: 'application/json',
            ...(isPost ? { 'Content-Type': 'application/json' } : {}),
            'User-Agent': 'MyRamadhan/1.0',
          },
          body: isPost ? JSON.stringify(body) : undefined,
        });

        // If not found on this base URL, consume body and try the next one.
        if (response.status === 404) {
          console.warn('eQuran API 404, trying next base URL:', apiUrl);
          await response.text(); // Consume body to prevent resource leak
          response = null;
          continue;
        }

        // For any other status (200/4xx/5xx), stop here and handle below.
        break;
      } catch (err) {
        lastErr = err;
        console.error('Fetch failed, trying next base URL:', apiUrl, err);
        response = null;
        continue;
      }
    }

    // If all URLs returned 404, return a proper error
    if (!response) {
      const errorMessage =
        lastErr instanceof Error ? lastErr.message : 'All API endpoints returned 404 or failed';
      return new Response(
        JSON.stringify({
          success: false,
          error: errorMessage,
          url: apiUrlTried,
        }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // Non-OK response handling (4xx/5xx other than 404 which was handled above)


    if (!response.ok) {
      console.error('eQuran API error:', response.status, response.statusText);
      return new Response(
        JSON.stringify({
          success: false,
          error: `eQuran API returned ${response.status}: ${response.statusText}`,
          url: apiUrlTried,
        }),
        {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Non-JSON response from eQuran API:', {
        url: apiUrlTried,
        status: response.status,
        contentType,
        preview: text.slice(0, 200),
      });
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Upstream returned non-JSON response',
          url: apiUrlTried,
          status: response.status,
          contentType,
        }),
        {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const data = await response.json();
    console.log('eQuran API success for:', endpoint);

    const isDoa = endpoint.startsWith('doa');

    // DOA API returns array directly, wrap it to match our format
    // Other APIs return { code, message, data } format
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
    console.error('Error proxying eQuran API:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
