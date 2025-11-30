import React from 'react';
import { Lightbulb } from 'lucide-react';

const Insights = ({ insights }) => {
  if (!insights || insights.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-yellow-600" />
        Insights từ AI
      </h3>
      <ul className="space-y-3">
        {insights.map((insight, index) => (
          <li key={index} className="flex items-start gap-3">
            <span className="text-yellow-600 mt-1">💡</span>
            <span className="text-gray-700 flex-1">{insight}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Insights;

