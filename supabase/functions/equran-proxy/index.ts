const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const EQURAN_BASE_URL = 'https://equran.id/api';

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

    // Build the correct URL based on endpoint type
    // - Doa uses /api/doa (no version prefix)
    // - Quran uses /api/v2/surat, /api/v2/tafsir
    // - Shalat uses /api/v2/shalat
    let apiUrl: string;
    const isDoa = endpoint.startsWith('doa');

    if (isDoa) {
      // Doa API doesn't use version prefix
      apiUrl = `${EQURAN_BASE_URL}/${endpoint}`;
    } else {
      apiUrl = `${EQURAN_BASE_URL}/${apiVersion}/${endpoint}`;
    }

    console.log('Fetching from eQuran API:', apiUrl);

    // Check if this is a POST request (for shalat endpoints)
    let response: Response;

    if (req.method === 'POST') {
      const body = await req.json();
      console.log('POST body:', JSON.stringify(body));

      response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'User-Agent': 'MyRamadhan/1.0',
        },
        body: JSON.stringify(body),
      });
    } else {
      response = await fetch(apiUrl, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'MyRamadhan/1.0',
        },
      });
    }

    if (!response.ok) {
      console.error('eQuran API error:', response.status, response.statusText);
      return new Response(
        JSON.stringify({
          success: false,
          error: `eQuran API returned ${response.status}: ${response.statusText}`,
          url: apiUrl,
        }),
        {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const data = await response.json();
    console.log('eQuran API success for:', endpoint);

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
