import React, { useEffect, useState } from 'react';
import {
  fetchTotalWhatsAppCustomers,
  fetchTotalInboundWhatsAppMessages,
  fetchTotalOutboundWhatsAppMessages,
  fetchWhatsAppBookingConversionRate,
  fetchPeakChatHours,
  fetchPeakChatDays,
  fetchWhatsAppSentimentAnalytics,
  fetchWhatsAppSentimentTrend,
  fetchWhatsAppSentimentByTopic,
  fetchWhatsAppMostExtremeMessages,
  fetchWhatsAppKeywordTrends,
  fetchWhatsAppAgentAIPerformance,
} from '@/api/analytics';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import { User, MessageCircle, Send, TrendingUp } from 'lucide-react';

const metricCards = [
  {
    label: 'Total WhatsApp Customers',
    icon: User,
    color: 'bg-gradient-to-tr from-green-400 to-green-600',
    key: 'totalCustomers',
  },
  {
    label: 'Inbound Messages',
    icon: MessageCircle,
    color: 'bg-gradient-to-tr from-blue-400 to-blue-600',
    key: 'inboundMessages',
  },
  {
    label: 'Outbound Messages',
    icon: Send,
    color: 'bg-gradient-to-tr from-purple-400 to-purple-600',
    key: 'outboundMessages',
  },
  {
    label: 'Booking Conversion Rate',
    icon: TrendingUp,
    color: 'bg-gradient-to-tr from-yellow-400 to-yellow-600',
    key: 'bookingConversionRate',
    isPercent: true,
  },
];

const WhatsAppTab = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    inboundMessages: 0,
    outboundMessages: 0,
    bookingConversionRate: 0,
    peakHours: [],
    peakDays: [],
  });
  const [sentiment, setSentiment] = useState<any>(null);
  const [sentimentTrend, setSentimentTrend] = useState<any[]>([]);
  const [sentimentByTopic, setSentimentByTopic] = useState<any[]>([]);
  const [extremeMessages, setExtremeMessages] = useState<{ mostPositive: any[]; mostNegative: any[] }>({ mostPositive: [], mostNegative: [] });
  const [keywordTrends, setKeywordTrends] = useState<any[]>([]);
  const [agentAIPerformance, setAgentAIPerformance] = useState<any>(null);
  const sentimentColors = {
    positive: '#22c55e',
    negative: '#ef4444',
    neutral: '#a3a3a3',
  };

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      const [totalCustomers, inboundMessages, outboundMessages, bookingConversionRate, peakHours, peakDays, sentimentData, sentimentTrendData, sentimentByTopicData, extremeMessagesData, keywordTrendsData, agentAIPerformanceData] = await Promise.all([
        fetchTotalWhatsAppCustomers(),
        fetchTotalInboundWhatsAppMessages(),
        fetchTotalOutboundWhatsAppMessages(),
        fetchWhatsAppBookingConversionRate(),
        fetchPeakChatHours(),
        fetchPeakChatDays(),
        fetchWhatsAppSentimentAnalytics(),
        fetchWhatsAppSentimentTrend(),
        fetchWhatsAppSentimentByTopic(),
        fetchWhatsAppMostExtremeMessages(),
        fetchWhatsAppKeywordTrends(),
        fetchWhatsAppAgentAIPerformance(),
      ]);
      setStats({
        totalCustomers,
        inboundMessages,
        outboundMessages,
        bookingConversionRate,
        peakHours,
        peakDays,
      });
      setSentiment(sentimentData);
      setSentimentTrend(sentimentTrendData);
      setSentimentByTopic(sentimentByTopicData);
      setExtremeMessages(extremeMessagesData);
      setKeywordTrends(keywordTrendsData);
      setAgentAIPerformance(agentAIPerformanceData);
      setLoading(false);
    }
    loadStats();
                      {/* Agent/AI Performance Analytics */}
                      <div className="bg-white rounded-xl shadow-md p-6 mt-8">
                        <h3 className="font-semibold mb-4 text-lg">Agent vs AI Performance</h3>
                        {agentAIPerformance ? (
                          <div className="overflow-x-auto">
                            <table className="min-w-full text-sm border">
                              <thead>
                                <tr className="bg-gray-100">
                                  <th className="px-4 py-2 text-left">Metric</th>
                                  <th className="px-4 py-2 text-center">Agent</th>
                                  <th className="px-4 py-2 text-center">AI</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td className="px-4 py-2 font-medium">Messages Handled</td>
                                  <td className="px-4 py-2 text-center">{agentAIPerformance.agent.count}</td>
                                  <td className="px-4 py-2 text-center">{agentAIPerformance.ai.count}</td>
                                </tr>
                                <tr>
                                  <td className="px-4 py-2 font-medium">Positive (%)</td>
                                  <td className="px-4 py-2 text-center text-green-600">{agentAIPerformance.agent.sentiment.positive}</td>
                                  <td className="px-4 py-2 text-center text-green-600">{agentAIPerformance.ai.sentiment.positive}</td>
                                </tr>
                                <tr>
                                  <td className="px-4 py-2 font-medium">Neutral (%)</td>
                                  <td className="px-4 py-2 text-center text-gray-500">{agentAIPerformance.agent.sentiment.neutral}</td>
                                  <td className="px-4 py-2 text-center text-gray-500">{agentAIPerformance.ai.sentiment.neutral}</td>
                                </tr>
                                <tr>
                                  <td className="px-4 py-2 font-medium">Negative (%)</td>
                                  <td className="px-4 py-2 text-center text-red-600">{agentAIPerformance.agent.sentiment.negative}</td>
                                  <td className="px-4 py-2 text-center text-red-600">{agentAIPerformance.ai.sentiment.negative}</td>
                                </tr>
                                <tr>
                                  <td className="px-4 py-2 font-medium">Resolution Rate (%)</td>
                                  <td className="px-4 py-2 text-center">{agentAIPerformance.agent.resolutionRate}</td>
                                  <td className="px-4 py-2 text-center">{agentAIPerformance.ai.resolutionRate}</td>
                                </tr>
                                <tr>
                                  <td className="px-4 py-2 font-medium">Escalation Rate (%)</td>
                                  <td className="px-4 py-2 text-center">{agentAIPerformance.agent.escalationRate}</td>
                                  <td className="px-4 py-2 text-center">{agentAIPerformance.ai.escalationRate}</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-700">No agent/AI performance data available.</div>
                        )}
                      </div>
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-1">WhatsApp Analytics</h2>
        <p className="text-muted-foreground mb-4">
          Track your WhatsApp engagement, conversion, and customer activity in real time.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></span>
        </div>
      ) : (
        <>
                   
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {metricCards.map((card) => {
              const Icon = card.icon;
              const value = card.isPercent
                ? `${(stats[card.key] * 100).toFixed(1)}%`
                : stats[card.key];
              return (
                <div
                  key={card.key}
                  className={`rounded-xl shadow-md p-5 flex items-center gap-4 ${card.color} text-white`}
                >
                  <div className="p-3 bg-white/20 rounded-full">
                    <Icon className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{value}</div>
                    <div className="text-sm opacity-80">{card.label}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-semibold mb-4 text-lg">Peak Chat Hours</h3>
              {stats.peakHours && stats.peakHours.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={stats.peakHours} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" label={{ value: 'Hour', position: 'insideBottom', offset: -5 }} />
                    <YAxis allowDecimals={false} label={{ value: 'Messages', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#22c55e" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-sm text-gray-700">No data</div>
              )}
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-semibold mb-4 text-lg">Peak Chat Days</h3>
              {stats.peakDays && stats.peakDays.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={stats.peakDays} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" label={{ value: 'Day', position: 'insideBottom', offset: -5 }} />
                    <YAxis allowDecimals={false} label={{ value: 'Messages', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-sm text-gray-700">No data</div>
              )}
            </div>
          </div>

           {/* Sentiment Analytics Pie Chart */}
                    <div className="bg-white rounded-xl shadow-md p-6 mt-8">
                      <h3 className="font-semibold mb-4 text-lg">Customer Mood (AI Sentiment)</h3>
                      {sentiment && sentiment.distribution ? (
                        <div className="flex flex-col md:flex-row gap-8">
                          <div className="flex-1 flex flex-col items-center">
                            <ResponsiveContainer width={250} height={250}>
                              <PieChart>
                                <Pie
                                  data={Object.entries(sentiment.distribution).map(([mood, value]) => ({ name: mood, value }))}
                                  dataKey="value"
                                  nameKey="name"
                                  cx="50%"
                                  cy="50%"
                                  outerRadius={80}
                                  label
                                >
                                  {Object.keys(sentiment.distribution).map((mood, idx) => (
                                    <Cell key={mood} fill={sentimentColors[mood]} />
                                  ))}
                                </Pie>
                                <Legend />
                              </PieChart>
                            </ResponsiveContainer>
                            <div className="text-sm text-gray-500 mt-2">Based on last {sentiment.total} messages</div>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold mb-2">Sample Messages</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {['positive', 'neutral', 'negative'].map((mood) => (
                                <div key={mood} className="bg-gray-50 rounded p-3 border">
                                  <div className="font-bold mb-1" style={{ color: sentimentColors[mood] }}>{mood.charAt(0).toUpperCase() + mood.slice(1)}</div>
                                  {sentiment.samples && sentiment.samples[mood] && sentiment.samples[mood].length > 0 ? (
                                    <ul className="text-xs space-y-1">
                                      {sentiment.samples[mood].map((msg: any, idx: number) => (
                                        <li key={idx} className="italic">"{msg.content}"</li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <div className="text-xs text-gray-400">No samples</div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-700">No sentiment data available.</div>
                      )}
                    </div>

                    {/* Sentiment Trend Line Chart */}
                    <div className="bg-white rounded-xl shadow-md p-6 mt-8">
                      <h3 className="font-semibold mb-4 text-lg">Sentiment Trend Over Time</h3>
                      {sentimentTrend && sentimentTrend.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={sentimentTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" label={{ value: 'Date', position: 'insideBottom', offset: -5 }} />
                            <YAxis allowDecimals={false} label={{ value: 'Messages', angle: -90, position: 'insideLeft' }} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="positive" stackId="a" fill={sentimentColors.positive} name="Positive" />
                            <Bar dataKey="neutral" stackId="a" fill={sentimentColors.neutral} name="Neutral" />
                            <Bar dataKey="negative" stackId="a" fill={sentimentColors.negative} name="Negative" />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="text-sm text-gray-700">No sentiment trend data available.</div>
                      )}
                    </div>

                    {/* Sentiment by Topic */}
                    <div className="bg-white rounded-xl shadow-md p-6 mt-8">
                      <h3 className="font-semibold mb-4 text-lg">Sentiment by Topic</h3>
                      {sentimentByTopic && sentimentByTopic.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={sentimentByTopic} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="topic" label={{ value: 'Topic', position: 'insideBottom', offset: -5 }} />
                            <YAxis allowDecimals={false} label={{ value: 'Messages', angle: -90, position: 'insideLeft' }} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="positive" stackId="a" fill={sentimentColors.positive} name="Positive" />
                            <Bar dataKey="neutral" stackId="a" fill={sentimentColors.neutral} name="Neutral" />
                            <Bar dataKey="negative" stackId="a" fill={sentimentColors.negative} name="Negative" />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="text-sm text-gray-700">No sentiment by topic data available.</div>
                      )}
                    </div>

                    {/* Sentiment by Topic/Intent Bar Chart */}
                    <div className="bg-white rounded-xl shadow-md p-6 mt-8">
                      <h3 className="font-semibold mb-4 text-lg">Sentiment by Topic/Intent</h3>
                      {sentimentByTopic && sentimentByTopic.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={sentimentByTopic} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="topic" label={{ value: 'Topic/Intent', position: 'insideBottom', offset: -5 }} />
                            <YAxis allowDecimals={false} label={{ value: 'Messages', angle: -90, position: 'insideLeft' }} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="positive" stackId="a" fill={sentimentColors.positive} name="Positive" />
                            <Bar dataKey="neutral" stackId="a" fill={sentimentColors.neutral} name="Neutral" />
                            <Bar dataKey="negative" stackId="a" fill={sentimentColors.negative} name="Negative" />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="text-sm text-gray-700">No sentiment by topic data available.</div>
                      )}
                    </div>


                    {/* Keyword/Topic Trends */}
                    <div className="bg-white rounded-xl shadow-md p-6 mt-8">
                      <h3 className="font-semibold mb-4 text-lg">Keyword/Topic Trends</h3>
                      {keywordTrends && keywordTrends.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={keywordTrends.slice(0, 20)} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="keyword" label={{ value: 'Keyword', position: 'insideBottom', offset: -5 }} interval={0} angle={-30} textAnchor="end" height={80} />
                            <YAxis allowDecimals={false} label={{ value: 'Count', angle: -90, position: 'insideLeft' }} />
                            <Tooltip />
                            <Bar dataKey="count" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="text-sm text-gray-700">No keyword trend data available.</div>
                      )}
                    </div>
                    {/* Most Positive/Negative Messages */}
                    <div className="bg-white rounded-xl shadow-md p-6 mt-8">
                      <h3 className="font-semibold mb-4 text-lg">Most Positive and Negative Messages</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-green-50 p-4 rounded-lg shadow">
                          <h4 className="font-semibold mb-2 text-green-700">Most Positive Messages</h4>
                          {extremeMessages.mostPositive && extremeMessages.mostPositive.length > 0 ? (
                            <ul className="text-sm space-y-2">
                              {extremeMessages.mostPositive.map((msg: any, idx: number) => (
                                <li key={idx} className="p-3 bg-green-100 rounded border-l-4 border-green-500">
                                  "{msg.content}"
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <div className="text-xs text-gray-400">No data</div>
                          )}
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg shadow">
                          <h4 className="font-semibold mb-2 text-red-700">Most Negative Messages</h4>
                          {extremeMessages.mostNegative && extremeMessages.mostNegative.length > 0 ? (
                            <ul className="text-sm space-y-2">
                              {extremeMessages.mostNegative.map((msg: any, idx: number) => (
                                <li key={idx} className="p-3 bg-red-100 rounded border-l-4 border-red-500">
                                  "{msg.content}"
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <div className="text-xs text-gray-400">No data</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Most Positive/Negative Messages Section */}
                    <div className="bg-white rounded-xl shadow-md p-6 mt-8">
                      <h3 className="font-semibold mb-4 text-lg">Most Positive & Negative Messages</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <h4 className="font-semibold mb-2" style={{ color: sentimentColors.positive }}>Most Positive</h4>
                          {extremeMessages.mostPositive && extremeMessages.mostPositive.length > 0 ? (
                            <ul className="space-y-2">
                              {extremeMessages.mostPositive.map((msg, idx) => (
                                <li key={msg.id} className="bg-green-50 border-l-4 border-green-400 p-3 rounded text-sm">
                                  <span className="block italic">"{msg.content}"</span>
                                  <span className="block text-xs text-gray-500 mt-1">Score: {msg.score} | {new Date(msg.createdAt).toLocaleString()}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <div className="text-xs text-gray-400">No positive messages found.</div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2" style={{ color: sentimentColors.negative }}>Most Negative</h4>
                          {extremeMessages.mostNegative && extremeMessages.mostNegative.length > 0 ? (
                            <ul className="space-y-2">
                              {extremeMessages.mostNegative.map((msg, idx) => (
                                <li key={msg.id} className="bg-red-50 border-l-4 border-red-400 p-3 rounded text-sm">
                                  <span className="block italic">"{msg.content}"</span>
                                  <span className="block text-xs text-gray-500 mt-1">Score: {msg.score} | {new Date(msg.createdAt).toLocaleString()}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <div className="text-xs text-gray-400">No negative messages found.</div>
                          )}
                        </div>
                      </div>
                    </div>
        </>
      )}
    </div>
  );
};

export default WhatsAppTab;