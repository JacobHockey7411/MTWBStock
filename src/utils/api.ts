import { DEMO_DATA } from '../constants';
import { ALPHA_VANTAGE_API_KEY, OPENAI_API_KEY } from '../constants';
import { FetchedMetrics } from '../types';

export const safeNumber = (v: any): number => {
  const n = Number(v);
  return isFinite(n) ? n : NaN;
};

export async function fetchAlphaVantage(symbol: string, apiKey?: string): Promise<FetchedMetrics> {
  const sym = symbol.toUpperCase();
  const api = apiKey || ALPHA_VANTAGE_API_KEY;

  // 1) OVERVIEW provides P/E, margins, dividendYield, beta, and sometimes debtToEquity
  const overviewUrl = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${encodeURIComponent(
    sym
  )}&apikey=${encodeURIComponent(api)}`;

  const overviewRes = await fetch(overviewUrl);
  const overview = await overviewRes.json();

  if (!overview || Object.keys(overview).length === 0 || overview.Note) {
    throw new Error(
      overview?.Note || "Alpha Vantage rate limit hit or empty response. Try again in a minute."
    );
  }

  // 2) EARNINGS for EPS history to compute 5y CAGR
  const earningsUrl = `https://www.alphavantage.co/query?function=EARNINGS&symbol=${encodeURIComponent(
    sym
  )}&apikey=${encodeURIComponent(api)}`;

  const earningsRes = await fetch(earningsUrl);
  const earnings = await earningsRes.json();

  // Compute 5y EPS CAGR from annualEarnings if we have >= 5 data points
  let epsGrowth5yPct: number | undefined = undefined;
  try {
    const annual = (earnings?.annualEarnings || []).slice(0, 6); // most recent first per API docs
    if (annual.length >= 5) {
      const latest = Number(annual[0]?.reportedEPS);
      const old = Number(annual[4]?.reportedEPS);
      if (isFinite(latest) && isFinite(old) && old > 0) {
        const years = 4; // from t-4 to t
        const cagr = Math.pow(latest / old, 1 / years) - 1;
        epsGrowth5yPct = cagr * 100;
      }
    }
  } catch (e) {
    // ignore, will fall back
  }

  // Map fields; Alpha Vantage strings often need Number()
  const mapped = {
    pe: safeNumber(overview.PERatio),
    epsGrowth5yPct: epsGrowth5yPct ?? safeNumber(overview.EPS),
    debtToEquity: safeNumber(overview.DebtToEquityTTM ?? overview.DebtToEquity),
    profitMarginPct: safeNumber(overview.ProfitMargin) * 100,
    dividendYieldPct: safeNumber(overview.DividendYield) * 100,
    esgScore: NaN, // not provided by AV
    beta: safeNumber(overview.Beta),
  };

  // Provide sane fallbacks where AV may be missing fields
  if (!isFinite(mapped.profitMarginPct)) {
    mapped.profitMarginPct = safeNumber(overview.OperatingMarginTTM) * 100;
  }

  return mapped;
}

export async function fetchMissingDataWithOpenAI(symbol: string, existingData: Partial<FetchedMetrics>): Promise<Partial<FetchedMetrics>> {
  const missingFields = [];
  
  if (!isFinite(existingData.pe || NaN)) missingFields.push('P/E ratio (current trailing twelve months)');
  if (!isFinite(existingData.epsGrowth5yPct || NaN)) missingFields.push('5-year EPS growth rate as percentage');
  if (!isFinite(existingData.debtToEquity || NaN)) missingFields.push('debt-to-equity ratio (total debt / total equity)');
  if (!isFinite(existingData.profitMarginPct || NaN)) missingFields.push('net profit margin as percentage');
  if (!isFinite(existingData.dividendYieldPct || NaN)) missingFields.push('dividend yield as percentage');
  if (!isFinite(existingData.esgScore || NaN)) missingFields.push('ESG score from 0-100 (Environmental, Social, Governance rating)');
  if (!isFinite(existingData.beta || NaN)) missingFields.push('beta coefficient (stock volatility vs market)');
  
  if (missingFields.length === 0) return existingData;
  
  console.log(`Requesting ${missingFields.length} missing metrics from OpenAI for ${symbol}`);
  
  const prompt = `Please provide the most recent financial metrics for ${symbol.toUpperCase()} stock:
${missingFields.map(field => `- ${field}`).join('\n')}

Please respond with ONLY a valid JSON object in this exact format (no additional text):
{
  "pe": number,
  "epsGrowth5yPct": number,
  "debtToEquity": number,
  "profitMarginPct": number,
  "dividendYieldPct": number,
  "esgScore": number,
  "beta": number
}

Use the most recent available data from 2024. If a metric is truly not available or not applicable, use null.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 200,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    console.log('OpenAI response:', content);
    
    const aiData = JSON.parse(content);
    
    // Merge with existing data, only filling in missing values
    const result = { ...existingData };
    
    if (!isFinite(result.pe || NaN) && aiData.pe !== null) result.pe = aiData.pe;
    if (!isFinite(result.epsGrowth5yPct || NaN) && aiData.epsGrowth5yPct !== null) result.epsGrowth5yPct = aiData.epsGrowth5yPct;
    if (!isFinite(result.debtToEquity || NaN) && aiData.debtToEquity !== null) result.debtToEquity = aiData.debtToEquity;
    if (!isFinite(result.profitMarginPct || NaN) && aiData.profitMarginPct !== null) result.profitMarginPct = aiData.profitMarginPct;
    if (!isFinite(result.dividendYieldPct || NaN) && aiData.dividendYieldPct !== null) result.dividendYieldPct = aiData.dividendYieldPct;
    if (!isFinite(result.esgScore || NaN) && aiData.esgScore !== null) result.esgScore = aiData.esgScore;
    if (!isFinite(result.beta || NaN) && aiData.beta !== null) result.beta = aiData.beta;
    
    console.log(`OpenAI filled ${Object.keys(aiData).filter(k => aiData[k] !== null).length} missing metrics`);
    
    return result;
  } catch (error) {
    console.error('Error fetching data from OpenAI:', error);
    return existingData; // Return original data if AI fetch fails
  }
}

export async function fetchDemo(symbol: string): Promise<FetchedMetrics> {
  const upper = symbol.toUpperCase();
  if (DEMO_DATA[upper]) return DEMO_DATA[upper];
  throw new Error("Demo mode: Unknown ticker. Use AAPL, NEE, or JNJ — or toggle Manual Entry Mode.");
}