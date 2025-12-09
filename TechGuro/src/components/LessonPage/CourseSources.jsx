//CourseSources.jsx
import React from 'react';
import { BookOpen, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const CourseSources = ({ sources }) => {
  if (!sources || sources.length === 0) return null;

  return (
    <motion.div 
      className="mt-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <BookOpen className="w-4 h-4 text-blue-600" />
        <h3 className="text-sm font-bold text-gray-800">Course Sources</h3>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {sources.map((source, index) => (
          <motion.a
            key={index}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-blue-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-all group text-sm"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            whileHover={{ scale: 1.05 }}
          >
            <span className="text-xs">
              {source.type === 'primary' ? '📚' : '📖'}
            </span>
            <span className="font-medium text-gray-700 group-hover:text-blue-600">
              {source.name}
            </span>
            <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-blue-600" />
          </motion.a>
        ))}
      </div>
      
      <p className="mt-3 pt-2 text-[10px] text-gray-400 border-t border-gray-100">
        Content adapted from sources above for TechGuro
      </p>
    </motion.div>
  );
};

export default CourseSources;