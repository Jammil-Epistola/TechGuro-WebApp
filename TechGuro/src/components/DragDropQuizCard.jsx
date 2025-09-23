// DragDropQuizCard.jsx 
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MousePointer, Check, RefreshCw, Target } from "lucide-react";

const DragDropQuizCard = ({ question, userAnswer, onAnswerChange }) => {
  const [draggedItem, setDraggedItem] = useState(null);
  const [dropZoneAnswers, setDropZoneAnswers] = useState({});
  const [isResetting, setIsResetting] = useState(false);

  if (!question) return null;

  const { question_id, drag_items, drop_zones, question_number } = question;

  // Debug logging to see what data we're getting
  console.log('DragDrop Question Data:', {
    question_id,
    drag_items,
    drop_zones,
    drag_items_type: typeof drag_items,
    drop_zones_type: typeof drop_zones
  });

  // Parse drag items and drop zones safely
  const parsedDragItems = Array.isArray(drag_items)
    ? drag_items
    : (() => {
        try {
          const parsed = JSON.parse(drag_items || '[]');
          console.log('Parsed drag_items:', parsed);
          return parsed;
        } catch (error) {
          console.error('Error parsing drag_items:', error);
          return [];
        }
      })();

  const parsedDropZones = Array.isArray(drop_zones)
    ? drop_zones
    : (() => {
        try {
          const parsed = JSON.parse(drop_zones || '[]');
          console.log('Parsed drop_zones:', parsed);
          return parsed;
        } catch (error) {
          console.error('Error parsing drop_zones:', error);
          return [];
        }
      })();

  // Show debug info if no items are found
  if (parsedDragItems.length === 0 || parsedDropZones.length === 0) {
    console.warn('Missing drag/drop data:', {
      dragItems: parsedDragItems,
      dropZones: parsedDropZones,
      originalDragItems: drag_items,
      originalDropZones: drop_zones
    });
  }

  // Initialize drop zone answers from userAnswer or empty state
  useEffect(() => {
    if (userAnswer && typeof userAnswer === 'object') {
      setDropZoneAnswers(userAnswer);
    } else {
      // Initialize empty drop zones
      const initialAnswers = {};
      parsedDropZones.forEach(zone => {
        initialAnswers[zone.id] = zone.accepts_multiple ? [] : null;
      });
      setDropZoneAnswers(initialAnswers);
    }
  }, [userAnswer, parsedDropZones]);

  // Handle drag start
  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
    e.target.style.opacity = '0.5';
  };

  // Handle drag end
  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedItem(null);
  };

  // Handle drag over
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // Handle drop
  const handleDrop = (e, zoneId) => {
    e.preventDefault();
    
    if (!draggedItem) return;

    const zone = parsedDropZones.find(z => z.id === zoneId);
    if (!zone) return;

    const newAnswers = { ...dropZoneAnswers };

    // Remove item from its current location if it exists
    Object.keys(newAnswers).forEach(existingZoneId => {
      if (zone.accepts_multiple && Array.isArray(newAnswers[existingZoneId])) {
        newAnswers[existingZoneId] = newAnswers[existingZoneId].filter(
          item => item !== draggedItem.text
        );
      } else if (newAnswers[existingZoneId] === draggedItem.text) {
        newAnswers[existingZoneId] = null;
      }
    });

    // Add item to new zone
    if (zone.accepts_multiple) {
      if (!Array.isArray(newAnswers[zoneId])) {
        newAnswers[zoneId] = [];
      }
      if (!newAnswers[zoneId].includes(draggedItem.text)) {
        newAnswers[zoneId].push(draggedItem.text);
      }
    } else {
      newAnswers[zoneId] = draggedItem.text;
    }

    setDropZoneAnswers(newAnswers);
    onAnswerChange(newAnswers);
    setDraggedItem(null);
  };

  // Reset all answers
  const handleReset = () => {
    setIsResetting(true);
    const resetAnswers = {};
    parsedDropZones.forEach(zone => {
      resetAnswers[zone.id] = zone.accepts_multiple ? [] : null;
    });
    setDropZoneAnswers(resetAnswers);
    onAnswerChange(resetAnswers);
    
    setTimeout(() => setIsResetting(false), 500);
  };

  // Check if item is currently placed
  const isItemPlaced = (itemText) => {
    return Object.values(dropZoneAnswers).some(answer => {
      if (Array.isArray(answer)) {
        return answer.includes(itemText);
      }
      return answer === itemText;
    });
  };

  // Get completion status
  const getCompletionStatus = () => {
    const totalZones = parsedDropZones.length;
    const filledZones = Object.values(dropZoneAnswers).filter(answer => {
      if (Array.isArray(answer)) return answer.length > 0;
      return answer !== null && answer !== undefined;
    }).length;
    
    return { filled: filledZones, total: totalZones };
  };

  const completionStatus = getCompletionStatus();

  // Show error state if no drag items or drop zones
  if (parsedDragItems.length === 0 || parsedDropZones.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full h-full flex flex-col items-center justify-center"
      >
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-8 max-w-2xl text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <MousePointer className="w-8 h-8 text-yellow-600" />
          </motion.div>
          
          <h3 className="text-xl font-bold text-yellow-800 mb-4">
            Drag & Drop Data Missing
          </h3>
          
          <div className="space-y-3 text-left">
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Question:</p>
              <p className="text-gray-600">{question.question}</p>
            </div>
            
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Debug Info:</p>
              <div className="text-xs text-gray-500 space-y-1">
                <p>Drag Items: {parsedDragItems.length} items found</p>
                <p>Drop Zones: {parsedDropZones.length} zones found</p>
                <p>Raw drag_items: {typeof drag_items} - {JSON.stringify(drag_items)}</p>
                <p>Raw drop_zones: {typeof drop_zones} - {JSON.stringify(drop_zones)}</p>
              </div>
            </div>
          </div>
          
          <p className="text-yellow-700 mt-4">
            Please check the database seeder or API response for this question.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full h-full flex flex-col"
    >
      {/* Question Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="text-center mb-6"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-2 bg-green-100 rounded-full">
            <MousePointer className="w-6 h-6 text-green-600" />
          </div>
          <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Drag & Drop Challenge
          </span>
        </div>
        
        <h2 className="text-xl lg:text-2xl font-bold text-[#4C5173] leading-relaxed mb-4">
          {question.question}
        </h2>

        {/* Reset Button */}
        <div className="flex justify-center">
          <motion.button
            onClick={handleReset}
            disabled={isResetting}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RefreshCw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
            Reset All
          </motion.button>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Draggable Items Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="space-y-4"
        >
          <h3 className="text-lg font-semibold text-[#4C5173] mb-4 text-center lg:text-left">
            Drag these items:
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
            {parsedDragItems.map((item, index) => {
              const isPlaced = isItemPlaced(item.text);
              
              return (
                <motion.div
                  key={item.id || index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 + (index * 0.1) }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item)}
                  onDragEnd={handleDragEnd}
                  className={`p-4 rounded-xl border-2 cursor-move transition-all duration-300 select-none ${
                    isPlaced
                      ? "bg-gray-100 border-gray-300 text-gray-500 opacity-60"
                      : "bg-white border-[#4C5173] text-[#4C5173] hover:bg-[#F4EDD9] hover:scale-105 shadow-md"
                  } ${draggedItem === item ? "rotate-3 scale-110" : ""}`}
                  whileHover={!isPlaced ? { scale: 1.05, rotate: 2 } : {}}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="flex items-center gap-3">
                    <MousePointer className="w-5 h-5 flex-shrink-0" />
                    <span className="font-semibold text-center flex-1">
                      {item.text}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Drop Zones Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="space-y-4"
        >
          <h3 className="text-lg font-semibold text-[#4C5173] mb-4 text-center lg:text-left">
            Drop them here:
          </h3>
          
          <div className="space-y-4">
            {parsedDropZones.map((zone, index) => {
              const zoneItems = dropZoneAnswers[zone.id];
              const hasItems = zone.accepts_multiple 
                ? Array.isArray(zoneItems) && zoneItems.length > 0
                : zoneItems !== null && zoneItems !== undefined;
              
              return (
                <motion.div
                  key={zone.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.6 + (index * 0.1) }}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, zone.id)}
                  className={`relative min-h-[100px] p-6 border-3 border-dashed rounded-xl transition-all duration-300 ${
                    hasItems
                      ? "border-green-400 bg-green-50"
                      : draggedItem
                      ? "border-[#B6C44D] bg-[#F4EDD9] scale-105"
                      : "border-gray-300 bg-gray-50 hover:border-[#4C5173] hover:bg-white"
                  }`}
                >
                  {/* Drop Zone Header */}
                  <div className="flex items-center gap-2 mb-3">
                    <Target className={`w-5 h-5 ${hasItems ? 'text-green-600' : 'text-gray-500'}`} />
                    <span className="font-semibold text-[#4C5173]">
                      {zone.label || `Drop Zone ${index + 1}`}
                    </span>
                    {zone.accepts_multiple && (
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                        Multiple
                      </span>
                    )}
                  </div>

                  {/* Dropped Items */}
                  <AnimatePresence>
                    {hasItems ? (
                      <div className="space-y-2">
                        {zone.accepts_multiple ? (
                          zoneItems.map((itemText, itemIndex) => (
                            <motion.div
                              key={`${itemText}-${itemIndex}`}
                              initial={{ opacity: 0, scale: 0.8, y: -10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.8, y: 10 }}
                              transition={{ duration: 0.3, delay: itemIndex * 0.1 }}
                              className="inline-block bg-white border border-green-300 text-green-800 px-3 py-2 rounded-lg text-sm font-medium mr-2 mb-2 shadow-sm"
                            >
                              {itemText}
                            </motion.div>
                          ))
                        ) : (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white border border-green-300 text-green-800 px-4 py-3 rounded-lg font-semibold shadow-sm"
                          >
                            {zoneItems}
                          </motion.div>
                        )}
                      </div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-center h-16 text-gray-400"
                      >
                        {draggedItem ? (
                          <motion.span
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                            className="text-[#B6C44D] font-semibold"
                          >
                            Drop here!
                          </motion.span>
                        ) : (
                          <span className="text-sm">
                            {zone.accepts_multiple ? "Drop items here" : "Drop one item here"}
                          </span>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Success indicator */}
                  {hasItems && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg"
                    >
                      <Check className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Progress Status */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.8 }}
        className="text-center mt-6"
      >
        <AnimatePresence mode="wait">
          {completionStatus.filled === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-full"
            >
              <div className="w-4 h-4 border-2 border-gray-400 rounded-full animate-pulse" />
              <span className="text-sm font-medium">Start dragging items</span>
            </motion.div>
          ) : completionStatus.filled < completionStatus.total ? (
            <motion.div
              key="partial"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full"
            >
              <div className="relative w-4 h-4">
                <div className="absolute inset-0 border-2 border-blue-300 rounded-full"></div>
                <motion.div
                  className="absolute inset-0 border-2 border-blue-600 rounded-full border-t-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              </div>
              <span className="text-sm font-medium">
                Progress: {completionStatus.filled}/{completionStatus.total} zones filled
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="complete"
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
              >
                <Check className="w-4 h-4" />
              </motion.div>
              <span className="text-sm font-medium">All zones completed!</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Completion percentage */}
        <div className="mt-3 w-full max-w-sm mx-auto">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-[#B6C44D] to-green-500 h-2 rounded-full transition-all duration-500"
              initial={{ width: 0 }}
              animate={{
                width: `${(completionStatus.filled / completionStatus.total) * 100}%`
              }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {Math.round((completionStatus.filled / completionStatus.total) * 100)}% Complete
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DragDropQuizCard;