import React, { useState, useCallback, useMemo } from 'react';
import { fetchAlphaVantage, fetchDemo, fetchMissingDataWithOpenAI } from './utils/api';
import { 
  scorePE, 
  scoreEPSGrowth, 
  scoreD2E, 
  scoreMargin, 
  scoreDividend, 
  scoreESG, 
  scoreBeta 
} from './utils/scoring';

interface StockData {
  ticker: string;
  pe: string;
  epsGrowth: string;
  debtEquity: string;
  profitMargin: string;
  dividendYield: string;
  esgScore: string;
  beta: string;
}

interface Weights {
  pe: number;
  epsGrowth: number;
  debtEquity: number;
  profitMargin: number;
  dividendYield: number;
  esgScore: number;
  beta: number;
}

export default function App() {
  const [mode, setMode] = useState<'manual' | 'demo' | 'api'>('api');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [stockData, setStockData] = useState<StockData>({
    ticker: '',
    pe: '',
    epsGrowth: '',
    debtEquity: '',
    profitMargin: '',
    dividendYield: '',
    esgScore: '',
    beta: ''
  });

  const [weights, setWeights] = useState<Weights>({
    pe: 15,
    epsGrowth: 20,
    debtEquity: 15,
    profitMargin: 10,
    dividendYield: 10,
    esgScore: 20,
    beta: 10
  });

  const updateStockData = useCallback((field: keyof StockData, value: string) => {
    setStockData(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateWeight = useCallback((field: keyof Weights, value: number) => {
    setWeights(prev => ({ ...prev, [field]: value }));
  }, []);

  const fetchStockData = useCallback(async () => {
    if (!stockData.ticker.trim()) {
      setError('Please enter a ticker symbol');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let data;
      
      if (mode === 'demo') {
        data = await fetchDemo(stockData.ticker);
      } else {
        // Fetch from Alpha Vantage
        data = await fetchAlphaVantage(stockData.ticker);
        
        // Automatically fill missing data with OpenAI
        try {
          const enhancedData = await fetchMissingDataWithOpenAI(stockData.ticker, data);
          data = enhancedData;
        } catch (aiError) {
          console.warn('OpenAI enhancement failed, using Alpha Vantage data only:', aiError);
          // Continue with Alpha Vantage data even if OpenAI fails
        }
      }

      setStockData(prev => ({
        ...prev,
        pe: isFinite(data.pe) ? data.pe.toString() : '',
        epsGrowth: isFinite(data.epsGrowth5yPct) ? data.epsGrowth5yPct.toString() : '',
        debtEquity: isFinite(data.debtToEquity) ? data.debtToEquity.toString() : '',
        profitMargin: isFinite(data.profitMarginPct) ? data.profitMarginPct.toString() : '',
        dividendYield: isFinite(data.dividendYieldPct) ? data.dividendYieldPct.toString() : '',
        esgScore: isFinite(data.esgScore) ? data.esgScore.toString() : '',
        beta: isFinite(data.beta) ? data.beta.toString() : ''
      }));

      // Show success message indicating data sources
      const filledFields = Object.values(data).filter(val => isFinite(val)).length;
      if (filledFields > 0) {
        setError(null);
        console.log(`Successfully fetched ${filledFields}/7 metrics from Alpha Vantage + OpenAI`);
      }

    } catch (err: any) {
      setError(err.message || 'Failed to fetch stock data');
    } finally {
      setLoading(false);
    }
  }, [stockData.ticker, mode]);

  const loadDemoData = useCallback((ticker: string) => {
    const demoData = {
      'AAPL': { pe: '30.2', epsGrowth: '18.5', debtEquity: '1.6', profitMargin: '26.1', dividendYield: '0.6', esgScore: '76', beta: '1.12' },
      'MSFT': { pe: '28.5', epsGrowth: '22.3', debtEquity: '0.4', profitMargin: '31.2', dividendYield: '0.7', esgScore: '82', beta: '0.89' },
      'TSLA': { pe: '65.8', epsGrowth: '45.2', debtEquity: '0.2', profitMargin: '8.1', dividendYield: '0.0', esgScore: '68', beta: '2.04' },
      'JNJ': { pe: '17.9', epsGrowth: '5.4', debtEquity: '0.5', profitMargin: '36.7', dividendYield: '3.3', esgScore: '78', beta: '0.6' }
    };
    
    const data = demoData[ticker as keyof typeof demoData];
    if (data) {
      setStockData(prev => ({ ...prev, ticker, ...data }));
    }
  }, []);

  // Calculate scores
  const scores = useMemo(() => {
    const pe = scorePE(parseFloat(stockData.pe));
    const eps = scoreEPSGrowth(parseFloat(stockData.epsGrowth));
    const debt = scoreD2E(parseFloat(stockData.debtEquity));
    const margin = scoreMargin(parseFloat(stockData.profitMargin));
    const dividend = scoreDividend(parseFloat(stockData.dividendYield));
    const esg = scoreESG(parseFloat(stockData.esgScore));
    const beta = scoreBeta(parseFloat(stockData.beta));

    return { pe, eps, debt, margin, dividend, esg, beta };
  }, [stockData]);

  const totalWeight = useMemo(() => {
    return Object.values(weights).reduce((sum, weight) => sum + weight, 0);
  }, [weights]);

  const overallScore = useMemo(() => {
    if (totalWeight === 0) return 0;
    
    const weightedSum = 
      scores.pe * weights.pe +
      scores.eps * weights.epsGrowth +
      scores.debt * weights.debtEquity +
      scores.margin * weights.profitMargin +
      scores.dividend * weights.dividendYield +
      scores.esg * weights.esgScore +
      scores.beta * weights.beta;

    return Math.round(weightedSum / totalWeight);
  }, [scores, weights, totalWeight]);

  const verdict = useMemo(() => {
    if (overallScore >= 80) return { label: 'Strong Buy', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (overallScore >= 65) return { label: 'Moderate Buy', color: 'text-amber-600', bgColor: 'bg-amber-100' };
    return { label: 'Avoid', color: 'text-red-600', bgColor: 'bg-red-100' };
  }, [overallScore]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">MTWB Stock Scorer</h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            ESG-aligned investment analysis for Connor Barwin's Make the World Better strategy. 
            Grow $500k → $1.5M in 10 years with sustainable $10k annual drawdowns.
          </p>
        </div>

        {/* Mode Selection */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="mode"
                  value="api"
                  checked={mode === 'api'}
                  onChange={(e) => setMode(e.target.value as any)}
                  className="text-blue-600"
                />
                <span className="font-medium">Live Data (Alpha Vantage + OpenAI)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="mode"
                  value="demo"
                  checked={mode === 'demo'}
                  onChange={(e) => setMode(e.target.value as any)}
                  className="text-blue-600"
                />
                <span className="font-medium">Demo Mode</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="mode"
                  value="manual"
                  checked={mode === 'manual'}
                  onChange={(e) => setMode(e.target.value as any)}
                  className="text-blue-600"
                />
                <span className="font-medium">Manual Entry</span>
              </label>
            </div>
          </div>
        </div>

        {/* Ticker Input */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Ticker
              </label>
              <input
                type="text"
                value={stockData.ticker}
                onChange={(e) => updateStockData('ticker', e.target.value.toUpperCase())}
                placeholder="e.g., AAPL, MSFT, TSLA"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {mode !== 'manual' && (
              <button
                onClick={fetchStockData}
                disabled={loading || !stockData.ticker}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? 'Fetching...' : mode === 'demo' ? 'Load Demo' : 'Fetch Live Data'}
              </button>
            )}
          </div>

          {mode === 'demo' && (
            <div className="mt-4 flex gap-2">
              <span className="text-sm text-gray-600">Quick load:</span>
              {['AAPL', 'MSFT', 'TSLA', 'JNJ'].map(ticker => (
                <button
                  key={ticker}
                  onClick={() => loadDemoData(ticker)}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  {ticker}
                </button>
              ))}
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700">
              {error}
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Input Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Financial Metrics */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Financial Metrics</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">P/E Ratio</label>
                  <input
                    type="number"
                    value={stockData.pe}
                    onChange={(e) => updateStockData('pe', e.target.value)}
                    placeholder="e.g., 25.4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">EPS Growth 5Y (%)</label>
                  <input
                    type="number"
                    value={stockData.epsGrowth}
                    onChange={(e) => updateStockData('epsGrowth', e.target.value)}
                    placeholder="e.g., 15.2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Debt/Equity Ratio</label>
                  <input
                    type="number"
                    value={stockData.debtEquity}
                    onChange={(e) => updateStockData('debtEquity', e.target.value)}
                    placeholder="e.g., 0.8"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Profit Margin (%)</label>
                  <input
                    type="number"
                    value={stockData.profitMargin}
                    onChange={(e) => updateStockData('profitMargin', e.target.value)}
                    placeholder="e.g., 22.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dividend Yield (%)</label>
                  <input
                    type="number"
                    value={stockData.dividendYield}
                    onChange={(e) => updateStockData('dividendYield', e.target.value)}
                    placeholder="e.g., 2.4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ESG Score (0-100)</label>
                  <input
                    type="number"
                    value={stockData.esgScore}
                    onChange={(e) => updateStockData('esgScore', e.target.value)}
                    placeholder="e.g., 78"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Beta</label>
                  <input
                    type="number"
                    value={stockData.beta}
                    onChange={(e) => updateStockData('beta', e.target.value)}
                    placeholder="e.g., 1.05"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Weights */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Scoring Weights 
                <span className="text-sm font-normal text-gray-600 ml-2">
                  (Total: {totalWeight}/100)
                </span>
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">P/E Weight</label>
                  <input
                    type="number"
                    value={weights.pe}
                    onChange={(e) => updateWeight('pe', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">EPS Growth Weight</label>
                  <input
                    type="number"
                    value={weights.epsGrowth}
                    onChange={(e) => updateWeight('epsGrowth', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Debt/Equity Weight</label>
                  <input
                    type="number"
                    value={weights.debtEquity}
                    onChange={(e) => updateWeight('debtEquity', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Profit Margin Weight</label>
                  <input
                    type="number"
                    value={weights.profitMargin}
                    onChange={(e) => updateWeight('profitMargin', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dividend Yield Weight</label>
                  <input
                    type="number"
                    value={weights.dividendYield}
                    onChange={(e) => updateWeight('dividendYield', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ESG Score Weight</label>
                  <input
                    type="number"
                    value={weights.esgScore}
                    onChange={(e) => updateWeight('esgScore', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Beta Weight</label>
                  <input
                    type="number"
                    value={weights.beta}
                    onChange={(e) => updateWeight('beta', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {/* Overall Score */}
            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Overall Score</h2>
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke={overallScore >= 80 ? "#10b981" : overallScore >= 65 ? "#f59e0b" : "#ef4444"}
                    strokeWidth="8"
                    strokeDasharray={`${(overallScore / 100) * 314} 314`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-gray-800">{overallScore}</span>
                </div>
              </div>
              <div className={`inline-block px-4 py-2 rounded-full ${verdict.bgColor} ${verdict.color} font-semibold`}>
                {verdict.label}
              </div>
            </div>

            {/* Individual Scores */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Individual Scores</h2>
              <div className="space-y-3">
                {[
                  { label: 'P/E Ratio', score: scores.pe, value: stockData.pe },
                  { label: 'EPS Growth', score: scores.eps, value: stockData.epsGrowth },
                  { label: 'Debt/Equity', score: scores.debt, value: stockData.debtEquity },
                  { label: 'Profit Margin', score: scores.margin, value: stockData.profitMargin },
                  { label: 'Dividend Yield', score: scores.dividend, value: stockData.dividendYield },
                  { label: 'ESG Score', score: scores.esg, value: stockData.esgScore },
                  { label: 'Beta', score: scores.beta, value: stockData.beta }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-700">{item.label}</div>
                      <div className="text-xs text-gray-500">{item.value || 'N/A'}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-blue-600"
                          style={{ width: `${Math.min(100, Math.max(0, item.score))}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-700 w-8">
                        {Math.round(item.score)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Analysis Notes */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Analysis Notes</h2>
              <div className="text-sm text-gray-600 space-y-2">
                <p><strong>Ticker:</strong> {stockData.ticker || 'N/A'}</p>
                <p><strong>Overall Score:</strong> {overallScore}/100 - {verdict.label}</p>
                <p><strong>MTWB Alignment:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Growth potential for $500k → $1.5M target</li>
                  <li>Stability for $10k annual drawdowns</li>
                  <li>ESG alignment with sustainability values</li>
                </ul>
                <p className="mt-4 text-xs text-gray-500">
                  This analysis uses Alpha Vantage for financial data and OpenAI for missing metrics like ESG scores.
                  Always verify with multiple sources before making investment decisions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}