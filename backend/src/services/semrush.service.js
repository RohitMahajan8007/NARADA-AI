import axios from 'axios';

const RPC_URL = 'https://semr2.toolwaly.com/dpa/rpc';

const DEFAULT_HEADERS = {
    'accept': '*/*',
    'accept-language': 'en-US,en;q=0.9',
    'content-type': 'application/json; charset=utf-8',
    'origin': 'https://semr2.toolwaly.com',
    'referer': 'https://semr2.toolwaly.com/analytics/overview/',
    'cookie': 'ref_code=__default__; refer_source=""; lux_uid=177778519553895159',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36'
};

const callRpc = async (method, params = {}, requestId = Date.now().toString()) => {
    const payload = {
        id: Math.floor(Math.random() * 1000),
        jsonrpc: '2.0',
        method,
        params: {
            apiKey: process.env.SEMRUSH_API_KEY || '223c434fd645fefc0e2f79c0a43a55e1',
            userId: parseInt(process.env.SEMRUSH_USER_ID || '29405075'),
            report: 'domain.overview',
            request_id: requestId,
            args: {
                database: 'us',
                ...params
            }
        }
    };

    try {
        const response = await axios.post(RPC_URL, payload, {
            headers: {
                ...DEFAULT_HEADERS,
                'referer': `https://semr2.toolwaly.com/analytics/overview/?searchType=domain&q=${encodeURIComponent(params.searchItem || '')}`
            },
            timeout: 20000
        });
        return response.data;
    } catch (error) {
        console.error(`[Semrush RPC Error] ${method}:`, error.message);
        return { error: error.message };
    }
};

export const fetchSemrushData = async (url) => {
    try {
        const domain = new URL(url).hostname.replace('www.', '');
        const requestId = `req_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        
        // Parallel RPC calls with the methods found in the working curl requests
        const [backlinksRes, organicRes, aiRes, positionsRes] = await Promise.all([
            callRpc('backlinks.Summary', { searchItem: domain, searchType: 'domain' }, requestId),
            callRpc('organic.Summary', { searchItem: domain, searchType: 'domain', dateType: 'daily' }, requestId),
            callRpc('organic.AiSeoSummary', { searchItem: domain, searchType: 'domain', dateType: 'daily' }, requestId),
            callRpc('organic.PositionsOverview', { 
                searchItem: domain, 
                searchType: 'domain', 
                positionsType: 'all',
                dateFormat: 'date',
                dateType: 'daily'
            }, requestId)
        ]);

        const backlinksData = backlinksRes.result || {};
        const organicDataRaw = organicRes.result || [];
        const aiData = aiRes.result || {};
        const positionsData = positionsRes.result || [];
        
        // Calculate Worldwide totals by summing all databases
        const organicData = Array.isArray(organicDataRaw) 
            ? organicDataRaw.reduce((acc, curr) => ({
                traffic: (acc.traffic || 0) + (curr.traffic || curr.organicTraffic || 0),
                keywords: (acc.keywords || 0) + (curr.keywords || curr.organicPositions || curr.positions || 0),
                trafficCost: (acc.trafficCost || 0) + (curr.costs || curr.organicTrafficCost || curr.trafficCost || 0)
            }), { traffic: 0, keywords: 0, trafficCost: 0 })
            : {
                traffic: organicDataRaw.traffic || organicDataRaw.organicTraffic || 0,
                keywords: organicDataRaw.keywords || organicDataRaw.organicPositions || organicDataRaw.positions || 0,
                trafficCost: organicDataRaw.costs || organicDataRaw.organicTrafficCost || organicDataRaw.trafficCost || 0
            };

        // Format AI insights into a readable string for Gemini
        const aiSummary = aiData ? `AI Visibility: ${aiData.ai_visibility}%, Cited Pages: ${aiData.cited_pages}, Mentions: ${aiData.mention_stats?.length || 0}` : "";
        
        // Extract keywords - handle both array and object formats
        const keywordsList = Array.isArray(positionsData) ? positionsData : (positionsData.list || positionsData.positions || backlinksData.anchors || []);

        return {
            authorityScore: backlinksData.ascore || backlinksData.authorityScore || 0,
            backlinks: {
                total: backlinksData.total || backlinksData.backlinks || 0,
                referringDomains: backlinksData.domains || backlinksData.referringDomains || 0,
                follow: backlinksData.follow || 0,
                nofollow: backlinksData.nofollow || 0
            },
            organicData,
            topKeywords: keywordsList.slice(0, 10).map(k => ({
                phrase: k.phrase || k.anchor || "N/A",
                position: k.position || 0,
                volume: k.volume || k.backlinks || 0,
                trafficPercent: k.trafficPercent || 0,
                url: k.url || ""
            })),
            aiSeoSummary: aiSummary
        };
    } catch (error) {
        console.error('[Semrush Service Error]:', error);
        return {
            authorityScore: 0,
            backlinks: { total: 0, referringDomains: 0, follow: 0, nofollow: 0 },
            organicData: { traffic: 0, keywords: 0, trafficCost: 0 },
            topKeywords: []
        };
    }
};
