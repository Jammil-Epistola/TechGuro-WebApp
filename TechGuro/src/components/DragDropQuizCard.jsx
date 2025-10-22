// DragDropQuizCard.jsx - Fixed touch support
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MousePointer, Check, RefreshCw, Target, Hand } from "lucide-react";

const DragDropQuizCard = ({ question, userAnswer, onAnswerChange }) => {
  const [draggedItem, setDraggedItem] = useState(null);
  const [dropZoneAnswers, setDropZoneAnswers] = useState({});
  const [isResetting, setIsResetting] = useState(false);
  const [touchPosition, setTouchPosition] = useState(null);
  const draggedElementRef = useRef(null);

  // Parse drag items
  const parsedDragItems = (() => {
    try {
      if (Array.isArray(question.drag_items)) {
        return question.drag_items;
      }
      if (typeof question.drag_items === "string") {
        return JSON.parse(question.drag_items);
      }
      return [];
    } catch (error) {
      console.error("Error parsing drag_items:", error);
      return [];
    }
  })();

  // Parse drop zones
  const parsedDropZones = (() => {
    try {
      if (Array.isArray(question.drop_zones)) {
        return question.drop_zones;
      }
      if (typeof question.drop_zones === "string") {
        return JSON.parse(question.drop_zones);
      }
      return [];
    } catch (error) {
      console.error("Error parsing drop_zones:", error);
      return [];
    }
  })();

  // Initialize from userAnswer
  useEffect(() => {
    if (userAnswer) {
      setDropZoneAnswers(userAnswer);
    } else {
      const initialAnswers = {};
      parsedDropZones.forEach(zone => {
        initialAnswers[zone.id] = zone.accepts_multiple ? [] : null;
      });
      setDropZoneAnswers(initialAnswers);
    }
  }, [question]);

  // Check if item is already placed
  const isItemPlaced = (itemText) => {
    return Object.values(dropZoneAnswers).some(answer => {
      if (Array.isArray(answer)) {
        return answer.includes(itemText);
      }
      return answer === itemText;
    });
  };

  // Mouse drag handlers
  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  // Touch event handlers - FIXED VERSION
  const handleTouchStart = (e, item) => {
    // Don't prevent default - let the browser handle touch
    const touch = e.touches[0];
    setDraggedItem(item);
    setTouchPosition({ x: touch.clientX, y: touch.clientY });
    
    // Store reference to dragged element
    draggedElementRef.current = e.currentTarget;
  };

  const handleTouchMove = (e) => {
    if (!draggedItem) return;
    
    // Prevent scrolling while dragging
    e.preventDefault();
    
    const touch = e.touches[0];
    setTouchPosition({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = (e) => {
    if (!draggedItem) return;
    
    // Get the element at the touch position
    const touch = e.changedTouches[0];
    const elementAtPoint = document.elementFromPoint(touch.clientX, touch.clientY);
    
    // Find the drop zone by traversing up the DOM
    let dropZoneElement = elementAtPoint;
    let attempts = 0;
    const maxAttempts = 10;
    
    while (dropZoneElement && !dropZoneElement.dataset.dropZoneId && attempts < maxAttempts) {
      dropZoneElement = dropZoneElement.parentElement;
      attempts++;
    }

    if (dropZoneElement && dropZoneElement.dataset.dropZoneId) {
      const zoneId = dropZoneElement.dataset.dropZoneId;
      handleDropLogic(zoneId);
    }

    // Cleanup
    setDraggedItem(null);
    setTouchPosition(null);
    draggedElementRef.current = null;
  };

  // Unified drop logic for both mouse and touch
  const handleDropLogic = (zoneId) => {
    if (!draggedItem) return;

    const zone = parsedDropZones.find(z => z.id === zoneId);
    if (!zone) return;

    const newAnswers = { ...dropZoneAnswers };

    // Remove item from its current location
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
  };

  // Mouse drop handler
  const handleDrop = (e, zoneId) => {
    e.preventDefault();
    handleDropLogic(zoneId);
    setDraggedItem(null);
  };

  // Reset function
  const handleReset = () => {
    setIsResetting(true);
    const initialAnswers = {};
    parsedDropZones.forEach(zone => {
      initialAnswers[zone.id] = zone.accepts_multiple ? [] : null;
    });
    setDropZoneAnswers(initialAnswers);
    onAnswerChange(initialAnswers);
    
    setTimeout(() => {
      setIsResetting(false);
    }, 300);
  };

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
            <Hand className="w-6 h-6 text-green-600 md:hidden" />
            <MousePointer className="w-6 h-6 text-green-600 hidden md:block" />
          </div>
          <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            <span className="md:hidden">Touch & Drop Challenge</span>
            <span className="hidden md:inline">Drag & Drop Challenge</span>
          </span>
        </div>
        
        <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-[#4C5173] leading-relaxed mb-4">
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
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Draggable Items Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="space-y-4"
        >
          <h3 className="text-base md:text-lg font-semibold text-[#4C5173] mb-4 text-center lg:text-left">
            <span className="md:hidden">Touch these items:</span>
            <span className="hidden md:inline">Drag these items:</span>
          </h3>
          
          <div className="grid grid-cols-1 gap-3">
            {parsedDragItems.map((item, index) => {
              const isPlaced = isItemPlaced(item.text);
              const isDragging = draggedItem?.text === item.text;
              
              return (
                <motion.div
                  key={item.id || index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 + (index * 0.1) }}
                  draggable={!isPlaced}
                  onDragStart={(e) => !isPlaced && handleDragStart(e, item)}
                  onDragEnd={handleDragEnd}
                  onTouchStartCapture={(e) => !isPlaced && handleTouchStart(e, item)}
                  onTouchMoveCapture={handleTouchMove}
                  onTouchEndCapture={handleTouchEnd}
                  className={`p-3 md:p-4 rounded-xl border-2 transition-all duration-300 select-none ${
                    isPlaced
                      ? "bg-gray-100 border-gray-300 text-gray-500 opacity-60 cursor-not-allowed"
                      : "bg-white border-[#4C5173] text-[#4C5173] hover:bg-[#F4EDD9] active:bg-[#F4EDD9] shadow-md cursor-move"
                  } ${isDragging ? "opacity-50 scale-105" : ""}`}
                  style={{
                    touchAction: isPlaced ? 'auto' : 'none'
                  }}
                >
                  <div className="flex items-center gap-2 md:gap-3">
                    <Hand className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 md:hidden" />
                    <MousePointer className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 hidden md:block" />
                    <span className="font-semibold text-sm md:text-base text-center flex-1">
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
          <h3 className="text-base md:text-lg font-semibold text-[#4C5173] mb-4 text-center lg:text-left">
            Drop them here:
          </h3>
          
          <div className="space-y-3 md:space-y-4">
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
                  data-drop-zone-id={zone.id}
                  className={`relative min-h-[80px] md:min-h-[100px] p-4 md:p-6 border-3 border-dashed rounded-xl transition-all duration-300 ${
                    hasItems
                      ? "border-green-400 bg-green-50"
                      : draggedItem
                      ? "border-[#B6C44D] bg-[#F4EDD9] scale-105"
                      : "border-gray-300 bg-gray-50 hover:border-[#4C5173] hover:bg-white active:border-[#4C5173] active:bg-white"
                  }`}
                >
                  {/* Drop Zone Header */}
                  <div className="flex items-center gap-2 mb-3">
                    <Target className={`w-4 h-4 md:w-5 md:h-5 ${hasItems ? 'text-green-600' : 'text-gray-500'}`} />
                    <span className="font-semibold text-sm md:text-base text-[#4C5173]">
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
                              className="inline-block bg-white border border-green-300 text-green-800 px-3 py-2 rounded-lg text-xs md:text-sm font-medium mr-2 mb-2 shadow-sm"
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
                            className="bg-white border border-green-300 text-green-800 px-3 md:px-4 py-2 md:py-3 rounded-lg text-sm md:text-base font-semibold shadow-sm"
                          >
                            {zoneItems}
                          </motion.div>
                        )}
                      </div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-center h-12 md:h-16 text-gray-400"
                      >
                        {draggedItem ? (
                          <motion.span
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                            className="text-[#B6C44D] font-semibold text-sm md:text-base"
                          >
                            Drop here!
                          </motion.span>
                        ) : (
                          <span className="text-xs md:text-sm">
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
                      className="absolute -top-2 -right-2 w-5 h-5 md:w-6 md:h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg"
                    >
                      <Check className="w-3 h-3 md:w-4 md:h-4 text-white" />
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Visual indicator for dragged item on mobile */}
      {draggedItem && touchPosition && (
        <div
          className="fixed pointer-events-none z-50 md:hidden"
          style={{
            left: touchPosition.x - 75,
            top: touchPosition.y - 30,
          }}
        >
          <div className="bg-[#4C5173] text-white px-4 py-3 rounded-xl shadow-2xl border-2 border-[#B6C44D] opacity-80">
            <div className="flex items-center gap-2">
              <Hand className="w-4 h-4" />
              <span className="font-semibold text-sm">{draggedItem.text}</span>
            </div>
          </div>
        </div>
      )}

      {/* Progress Status */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.8 }}
        className="text-center mt-4 md:mt-6"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
          <span className="text-sm text-blue-700">
            {Object.values(dropZoneAnswers).filter(answer => 
              Array.isArray(answer) ? answer.length > 0 : answer !== null
            ).length} / {parsedDropZones.length} zones filled
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DragDropQuizCard;