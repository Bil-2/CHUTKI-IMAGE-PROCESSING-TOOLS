import React, { useState, useEffect, useRef, useCallback, lazy, Suspense } from "react";
import { FaTimes, FaMicrophone, FaPaperPlane, FaUpload, FaCopy, FaTrash, FaExpand, FaCompress, FaSpinner } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import config from '../config';

// Lazy load heavy components
const EmojiPicker = lazy(() => import("emoji-picker-react"));

const ChutkiAssistant = React.memo(() => {
  // Consolidated UI state
  const [uiState, setUiState] = useState({
    open: false,
    isExpanded: false,
    isDragOver: false,
    showEmojiPicker: false,
    isTyping: false,
    copiedMessageId: null
  });

  // Chat state
  const [chatState, setChatState] = useState({
    messages: [],
    note: "",
    selectedFile: null
  });

  const [time, setTime] = useState("");
  const [currentIntroIndex, setCurrentIntroIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const timeIntervalRef = useRef(null);
  const introIntervalRef = useRef(null);

  // Welcome message on first load
  useEffect(() => {
    if (chatState.messages.length === 0) {
      const welcomeMessage = {
        id: Date.now(),
        role: 'assistant',
        content: '👋 **Welcome to Chutki AI!**\n\nI\'m your intelligent image processing assistant. I can compress images (2MB, 500KB, 100KB), convert formats (HEIC→JPG, PNG→JPEG), remove backgrounds, create passport photos, extract text (OCR), and create PDFs.\n\n**Just upload your images and tell me what you need!** ',
        timestamp: new Date()
      };
      setChatState(prev => ({ ...prev, messages: [welcomeMessage] }));
    }
  }, [chatState.messages.length]);

  // Optimized drag and drop handlers with useCallback
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setUiState(prev => ({ ...prev, isDragOver: true }));
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setUiState(prev => ({ ...prev, isDragOver: false }));
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setUiState(prev => ({ ...prev, isDragOver: false }));
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const fileNames = Array.from(files).map(f => f.name).join(', ');
      const fileMessage = {
        id: Date.now(),
        role: 'assistant',
        content: `📁 **Files dropped successfully!**\n\n**${files.length} file(s):** ${fileNames}\n\nWhat processing would you like me to perform?`,
        timestamp: new Date()
      };
      setChatState(prev => ({
        ...prev,
        selectedFile: files,
        messages: [...prev.messages, fileMessage]
      }));
    }
  }, []);

  // Optimized copy message function
  const copyMessage = useCallback((content) => {
    navigator.clipboard.writeText(content);
    const copyId = Date.now();
    setUiState(prev => ({ ...prev, copiedMessageId: copyId }));
    setTimeout(() => {
      setUiState(prev => ({ ...prev, copiedMessageId: null }));
    }, 2000);
  }, []);

  // Optimized clear chat function
  const clearChat = useCallback(() => {
    const welcomeMessage = {
      id: Date.now(),
      role: 'assistant',
      content: '🧹 **Chat cleared!** How can I help you with image processing today?',
      timestamp: new Date()
    };
    setChatState(prev => ({ ...prev, messages: [welcomeMessage] }));
  }, []);

  const { transcript, resetTranscript, listening: isListening } = useSpeechRecognition();

  // Optimized time & greeting with proper cleanup
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hrs = now.getHours();
      const mins = now.getMinutes().toString().padStart(2, "0");
      const secs = now.getSeconds().toString().padStart(2, "0");
      const ampm = hrs >= 12 ? "PM" : "AM";
      const hour12 = hrs % 12 || 12;

      let greeting = "";
      if (hrs >= 5 && hrs < 12) greeting = "Good Morning";
      else if (hrs === 12) greeting = "Good Noon";
      else if (hrs > 12 && hrs < 17) greeting = "Good Afternoon";
      else if (hrs >= 17 && hrs < 21) greeting = "Good Evening";
      else greeting = "Good Night";

      setTime(`${greeting}, it's ${hour12}:${mins}:${secs} ${ampm}`);
    };

    updateTime();
    timeIntervalRef.current = setInterval(updateTime, 1000);

    return () => {
      if (timeIntervalRef.current) {
        clearInterval(timeIntervalRef.current);
      }
    };
  }, []);

  // Optimized typewriter effect with smoother performance
  useEffect(() => {
    const introMessages = [
      "Hello! 👋",
      "I'm Chutki Assistant 🌸",
      "How can I help you today ?",
      "ChatGPT Powered Assistant"
    ];

    let animationId;
    let lastTime = 0;
    const typingSpeed = 120; // Natural typing speed
    const deletingSpeed = 80; // Moderate deleting speed
    const pauseDuration = 2100; // Comfortable reading pause

    const animate = (currentTime) => {
      const currentMessage = introMessages[currentIntroIndex];

      if (currentTime - lastTime >= (isDeleting ? deletingSpeed : typingSpeed)) {
        if (isTyping && !isDeleting) {
          // Typing phase
          if (displayedText.length < currentMessage.length) {
            setDisplayedText(prev => currentMessage.slice(0, prev.length + 1));
          } else {
            // Finished typing, start pause
            setIsTyping(false);
            setTimeout(() => setIsDeleting(true), pauseDuration);
          }
        } else if (isDeleting) {
          // Deleting phase
          if (displayedText.length > 0) {
            setDisplayedText(prev => prev.slice(0, -1));
          } else {
            // Finished deleting, move to next
            setIsDeleting(false);
            setIsTyping(true);
            setCurrentIntroIndex(prev => (prev + 1) % introMessages.length);
          }
        }
        lastTime = currentTime;
      }

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [currentIntroIndex, displayedText, isTyping, isDeleting]);

  // Get current displayed text for typewriter effect
  const getCurrentIntroMessage = () => {
    return displayedText;
  };

  const sendChatMessage = useCallback(async (message) => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    setChatState(prev => ({ ...prev, messages: [...prev.messages, userMessage], note: '' }));
    setUiState(prev => ({ ...prev, isTyping: true }));

    try {
      // Include file information if files are selected
      let contextMessage = message;
      if (chatState.selectedFile && chatState.selectedFile.length > 0) {
        const fileInfo = Array.from(chatState.selectedFile).map(f => `${f.name} (${f.type}, ${(f.size / 1024).toFixed(1)}KB)`).join(', ');
        contextMessage += `\n\n[User has uploaded ${chatState.selectedFile.length} files: ${fileInfo}]`;
      }

      const response = await fetch(`${config.API_BASE_URL}/api/chatgpt/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: contextMessage,
          conversationHistory: chatState.messages.slice(-10).map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiMessage = {
          id: Date.now(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date()
        };
        setChatState(prev => ({ ...prev, messages: [...prev.messages, aiMessage] }));
      } else {
        const errorData = await response.json();
        const errorMessage = {
          id: Date.now(),
          role: 'assistant',
          content: `❌ **Error:** ${errorData.error}\n\nPlease check your OpenAI API key configuration.`,
          timestamp: new Date()
        };
        setChatState(prev => ({ ...prev, messages: [...prev.messages, errorMessage] }));
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        id: Date.now(),
        role: 'assistant',
        content: '🔌 **Connection Error**\n\nI\'m having trouble connecting. Please check your internet connection and try again.',
        timestamp: new Date()
      };
      setChatState(prev => ({ ...prev, messages: [...prev.messages, errorMessage] }));
    } finally {
      setUiState(prev => ({ ...prev, isTyping: false }));
    }
  }, [chatState.selectedFile, chatState.messages]);

  // Voice Commands - send to AI chat
  useEffect(() => {
    if (!isListening && transcript) {
      sendChatMessage(transcript);
      resetTranscript();
    }
  }, [isListening, transcript, sendChatMessage, resetTranscript]);

  const handleFileSelect = useCallback((event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const fileNames = Array.from(files).map(f => f.name).join(', ');
      const fileMessage = {
        id: Date.now(),
        role: 'assistant',
        content: `📁 **Files uploaded successfully!**\n\n**${files.length} file(s):** ${fileNames}\n\n🎯 **What would you like me to do?**\n• Compress to specific size\n• Resize dimensions\n• Convert format\n• Extract text (OCR)\n• Remove background\n• Create PDF\n• Generate passport photos\n\nJust tell me your requirements!`,
        timestamp: new Date()
      };
      setChatState(prev => ({
        ...prev,
        selectedFile: files,
        messages: [...prev.messages, fileMessage]
      }));
    }
  }, []);

  // Remove handleAction - everything goes through AI chat now

  // Remove inferActionFromText - AI will handle intent detection

  // Remove inferOptionsFromText - AI will handle parameter extraction

  const handleNoteCommand = useCallback(async () => {
    if (!chatState.note.trim()) return;
    await sendChatMessage(chatState.note.trim());
  }, [chatState.note, sendChatMessage]);

  const toggleListening = useCallback(() => {
    if (SpeechRecognition.browserSupportsSpeechRecognition()) {
      if (isListening) {
        SpeechRecognition.stopListening();
      } else {
        SpeechRecognition.startListening();
      }
    }
  }, [isListening]);

  const sendNote = useCallback(() => {
    if (!chatState.note.trim()) return;
    handleNoteCommand();
    setChatState(prev => ({ ...prev, note: "" }));
  }, [chatState.note, handleNoteCommand]);

  const onEmojiClick = useCallback((emojiData) => {
    setChatState(prev => ({ ...prev, note: prev.note + emojiData.emoji }));
    setUiState(prev => ({ ...prev, showEmojiPicker: false }));
  }, []);

  const clearSelection = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    const clearMessage = {
      id: Date.now(),
      role: 'assistant',
      content: '🗑️ **Files cleared!** Ready for new uploads.',
      timestamp: new Date()
    };
    setChatState(prev => ({
      ...prev,
      selectedFile: null,
      messages: [...prev.messages, clearMessage]
    }));
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages, scrollToBottom]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {uiState.open ? (
          <motion.div
            key="chatbox"
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            className={`bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-2xl rounded-3xl border border-gray-200 dark:border-gray-700 backdrop-blur-sm ${uiState.isExpanded
              ? 'fixed inset-4 w-auto h-auto max-w-none max-h-none'
              : 'w-full max-w-[90vw] sm:w-80 sm:max-w-sm max-h-[70vh]'
              } p-0 flex flex-col overflow-hidden`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {/* Modern Header */}
            <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 p-4 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <span className="text-white text-xl">👱🏼‍♀️</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">CHUTKI AI</h3>
                    <div className="relative h-5 overflow-hidden">
                      {/* Typewriter text with cursor */}
                      <div className="flex items-center">
                        <p className="text-white text-xs font-medium bg-gradient-to-r from-white via-yellow-100 to-white bg-clip-text text-transparent">
                          {getCurrentIntroMessage()}
                        </p>
                        {/* Blinking cursor */}
                        <span className={`ml-0.5 w-0.5 h-3 bg-white inline-block ${isTyping || isDeleting ? 'animate-pulse' : 'animate-ping'
                          }`}></span>
                      </div>

                      {/* Optimized sparkles with reduced animations */}
                      <div className={`absolute -top-1 -right-2 w-1 h-1 bg-yellow-300 rounded-full transition-opacity duration-300 ${!isTyping && !isDeleting && displayedText.length > 0 ? 'opacity-100' : 'opacity-0'
                        }`}></div>

                      {/* Minimal glow effect */}
                      <div className={`absolute inset-0 bg-gradient-to-r from-pink-400/10 via-purple-400/5 to-blue-400/10 rounded-md transition-opacity duration-300 ${displayedText.length > 0 ? 'opacity-100' : 'opacity-0'
                        }`}></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setUiState(prev => ({ ...prev, isExpanded: !prev.isExpanded }))}
                    className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-all"
                    title={uiState.isExpanded ? 'Minimize' : 'Expand'}
                  >
                    {uiState.isExpanded ? <FaCompress size={14} /> : <FaExpand size={14} />}
                  </button>
                  <button
                    onClick={clearChat}
                    className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-all"
                    title="Clear Chat"
                  >
                    <FaTrash size={14} />
                  </button>
                  <button
                    onClick={() => setUiState(prev => ({ ...prev, open: false }))}
                    className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-all"
                  >
                    <FaTimes size={14} />
                  </button>
                </div>
              </div>

              {/* Status indicators */}
              <div className="flex items-center justify-between mt-3 text-white/90 text-xs">
                <div className="flex items-center space-x-4">
                  <span>{time}</span>
                  {chatState.selectedFile && chatState.selectedFile.length > 0 && (
                    <span className="bg-white/20 px-2 py-1 rounded-full">
                      📁 {chatState.selectedFile.length} files
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {uiState.isTyping && (
                    <span className="bg-white/20 px-2 py-1 rounded-full animate-pulse">
                      ✨ Thinking...
                    </span>
                  )}
                </div>
              </div>
            </div>

            {chatState.selectedFile && chatState.selectedFile.length > 0 && (
              <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={clearSelection}
                  className="w-full p-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors text-sm"
                >
                  Clear {chatState.selectedFile.length} file(s)
                </button>
              </div>
            )}

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Drag overlay */}
            {uiState.isDragOver && (
              <div className="absolute inset-0 bg-blue-500/20 backdrop-blur-sm border-2 border-dashed border-blue-400 rounded-3xl flex items-center justify-center z-50">
                <div className="text-center text-blue-600 dark:text-blue-400">
                  <FaUpload size={48} className="mx-auto mb-4 animate-bounce" />
                  <p className="text-xl font-bold mb-2">Drop your images here!</p>
                  <p className="text-sm opacity-80">Multiple files supported</p>
                </div>
              </div>
            )}

            {/* Modern Input Box */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
              <div className="bg-white dark:bg-gray-700 rounded-2xl border border-gray-200 dark:border-gray-600 shadow-sm flex items-end space-x-2 p-2 relative">
                <textarea
                  value={chatState.note}
                  onChange={(e) => setChatState(prev => ({ ...prev, note: e.target.value }))}
                  placeholder="Ask me anything about image processing... "
                  rows={1}
                  className="flex-1 text-sm bg-transparent text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:outline-none max-h-32 py-2 px-2"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendNote();
                    }
                  }}
                  style={{ minHeight: '40px' }}
                />

                {uiState.showEmojiPicker && (
                  <div className="absolute bottom-16 right-0 z-50">
                    <Suspense fallback={<div className="p-4 text-center">Loading...</div>}>
                      <EmojiPicker
                        onEmojiClick={onEmojiClick}
                        theme="auto"
                        height={300}
                        width={280}
                      />
                    </Suspense>
                  </div>
                )}

                <div className="flex items-center justify-center space-x-2">
                  <button
                    className="p-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full transition-colors flex items-center justify-center"
                    onClick={() => fileInputRef.current?.click()}
                    title="Upload files"
                  >
                    <FaUpload size={18} />
                  </button>
                  <button
                    className={`p-2.5 rounded-full transition-colors ${isListening
                      ? 'text-red-500 bg-red-50 dark:bg-red-900/30 animate-pulse'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400'
                      }`}
                    onClick={toggleListening}
                    title={isListening ? 'Stop listening' : 'Start voice input'}
                  >
                    <FaMicrophone size={16} />
                  </button>
                  <button
                    className="p-2.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full hover:from-pink-600 hover:to-purple-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    onClick={sendNote}
                    disabled={!chatState.note.trim() || uiState.isTyping}
                    title="Send message"
                  >
                    <FaPaperPlane size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Enhanced Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatState.messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}>
                  <div className={`group relative max-w-[85%] ${msg.role === 'user'
                    ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-2xl rounded-br-md'
                    : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-2xl rounded-bl-md shadow-sm'
                    } p-4`}>
                    {msg.role === 'assistant' && (
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-7 h-7 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">👱🏼‍♀️</span>
                        </div>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Chutki AI</span>
                      </div>
                    )}
                    <div className="prose prose-sm max-w-none">
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {msg.content.split('**').map((part, i) =>
                          i % 2 === 0 ? part : <strong key={i} className="font-semibold">{part}</strong>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className={`text-xs opacity-70 ${msg.role === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                        }`}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => copyMessage(msg.content)}
                          className={`p-1.5 rounded-full transition-colors flex items-center justify-center ${msg.role === 'user'
                            ? 'hover:bg-white/20 text-white/80'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400'
                            }`}
                          title="Copy message"
                        >
                          <FaCopy size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Enhanced typing indicator */}
              {uiState.isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl rounded-bl-md shadow-sm p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-7 h-7 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
                        <FaSpinner className="text-white text-sm animate-spin" />
                      </div>
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Chutki AI is thinking...</span>
                    </div>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

          </motion.div>
        ) : (
          <motion.button
            key="fab"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setUiState(prev => ({ ...prev, open: true }))}
            className="w-16 h-16 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center group"
          >
            <div className="relative">
              <span className="text-white text-3xl">👱🏼‍♀️</span>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
});

export default ChutkiAssistant;
