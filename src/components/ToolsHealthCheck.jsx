import React, { useState, useEffect } from 'react';
import config from '../config.js';

const ToolsHealthCheck = () => {
  const [healthData, setHealthData] = useState(null);
  const [toolsList, setToolsList] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const checkHealth = async () => {
    setLoading(true);
    setError(null);

    try {
      const healthResponse = await fetch(`${config.API_BASE_URL}${config.ENDPOINTS.TOOLS_HEALTH}`);
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        setHealthData(healthData);
      } else {
        throw new Error(`Health check failed: ${healthResponse.status}`);
      }

      const listResponse = await fetch(`${config.API_BASE_URL}${config.ENDPOINTS.TOOLS_LIST}`);
      if (listResponse.ok) {
        const listData = await listResponse.json();
        setToolsList(listData);
      } else {
        throw new Error(`Tools list failed: ${listResponse.status}`);
      }
    } catch (err) {
      setError(err.message);
      console.error('Health check error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Backend Tools Health</h2>
        <button
          onClick={checkHealth}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Checking...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {healthData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-green-800 mb-3">System Status</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`font-semibold ${healthData.status === 'healthy' ? 'text-green-600' : 'text-red-600'}`}>
                  {healthData.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Tools:</span>
                <span className="font-semibold text-blue-600">{healthData.availableTools}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Check:</span>
                <span className="text-sm text-gray-500">
                  {new Date(healthData.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">Module Breakdown</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Editing Tools:</span>
                <span className="font-semibold text-blue-600">{healthData.modules?.editing || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Resize Tools:</span>
                <span className="font-semibold text-blue-600">{healthData.modules?.resize || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Compression:</span>
                <span className="font-semibold text-blue-600">{healthData.modules?.compression || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Conversion:</span>
                <span className="font-semibold text-blue-600">{healthData.modules?.conversion || 0}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {toolsList && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Available Tools ({toolsList.totalCount})</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(toolsList.categories || {}).map(([category, tools]) => (
              <div key={category} className="bg-white rounded p-3 border">
                <h4 className="font-semibold text-sm text-gray-700 mb-2 capitalize">
                  {category} ({tools.length})
                </h4>
                <div className="max-h-32 overflow-y-auto">
                  <ul className="text-xs text-gray-600 space-y-1">
                    {tools.map((tool, index) => (
                      <li key={index} className="truncate" title={tool}>
                        {tool}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 text-sm text-gray-500">
        <p><strong>API Base URL:</strong> {config.API_BASE_URL}</p>
        <p><strong>Environment:</strong> {process.env.NODE_ENV || 'development'}</p>
      </div>
    </div>
  );
};

export default ToolsHealthCheck;
