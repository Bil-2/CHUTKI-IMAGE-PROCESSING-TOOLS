import React, { useState, useEffect, useRef } from "react";
import { FaTimes, FaMicrophone, FaSmile, FaPaperPlane, FaUpload } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { Typewriter } from "react-simple-typewriter";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import EmojiPicker from "emoji-picker-react";

const ChutkiAssistant = ({ onSelect }) => {
  const [open, setOpen] = useState(false);
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);
  const [pendingAction, setPendingAction] = useState(null);
  const [pendingOptions, setPendingOptions] = useState(null);

  const actions = [
    {
      label: "Convert Images To PDF",
      value: "image-to-pdf",
      description: "Convert multiple images to a single PDF",
      endpoint: "/api/tools/image-to-pdf",
      multiple: true
    },
    {
      label: "Compress Image",
      value: "compress-image",
      description: "Compress image to reduce file size",
      endpoint: "/api/compress-image",
      multiple: false
    },
    {
      label: "JPG to Text (OCR)",
      value: "ocr",
      description: "Extract text from images using OCR",
      endpoint: "/api/tools/ocr",
      multiple: false
    },
    {
      label: "Remove Background",
      value: "remove-background",
      description: "Remove background from images",
      endpoint: "/api/remove-background",
      multiple: false
    },
    {
      label: "Describe Image (AI)",
      value: "ai-caption",
      description: "Generate a caption using AI",
      endpoint: "/api/ai/caption",
      multiple: false
    },
  ];

  const { transcript, resetTranscript, listening: isListening } = useSpeechRecognition();

  // Time & Greeting
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
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Voice Commands
  useEffect(() => {
    if (!isListening && transcript) {
      const lower = transcript.toLowerCase();
      if (lower.includes("resize")) handleAction("resize");
      else if (lower.includes("compress")) handleAction("compress-image");
      else if (lower.includes("background")) handleAction("remove-background");
      else if (lower.includes("text") || lower.includes("ocr")) handleAction("ocr");
      else if (lower.includes("convert") || lower.includes("pdf")) handleAction("image-to-pdf");
      resetTranscript();
    }
  }, [isListening, transcript]);

  const handleFileSelect = (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files);
      // If the user clicked an action first, auto-run it after files are chosen
      if (pendingAction) {
        const action = actions.find((a) => a.value === pendingAction);
        if (action) {
          // Small delay to ensure state updates settle
          setTimeout(() => {
            processAction(action, pendingOptions || {});
          }, 0);
        }
        setPendingAction(null);
        setPendingOptions(null);
      }
    }
  };

  const handleAction = async (value, options = {}) => {
    const action = actions.find((a) => a.value === value);
    if (!action) return;

    // If no file is selected, trigger file selection
    if (!selectedFile) {
      setPendingAction(value);
      setPendingOptions(options || {});
      fileInputRef.current?.click();
      return;
    }

    await processAction(action, options);
  };

  const inferActionFromText = (text) => {
    const t = text.toLowerCase();
    if (/(remove\s*bg|remove\s*background|background\s*remove)/.test(t)) return "remove-background";
    if (/(ocr|text|extract\s*text|read\s*text)/.test(t)) return "ocr";
    if (/(pdf|to\s*pdf|make\s*pdf|convert\s*pdf)/.test(t)) return "image-to-pdf";
    if (/(describe|caption|alt\s*text|what\s*is\s*in\s*this)/.test(t)) return "ai-caption";
    if (/(compress|reduce|smaller|kb|size)/.test(t)) return "compress-image";
    return null;
  };

  const inferOptionsFromText = (text) => {
    const options = {};
    const t = text.toLowerCase();
    // max size in kb, e.g., 100kb or 150 kb
    const kbMatch = t.match(/(\d{2,4})\s*kb/);
    if (kbMatch) {
      options.maxSize = Number(kbMatch[1]);
    }
    // quality 0-100
    const qualityMatch = t.match(/quality\s*(\d{1,3})/);
    if (qualityMatch) {
      options.quality = Math.min(100, Math.max(1, Number(qualityMatch[1])));
    }
    // format
    if (/\b(webp)\b/.test(t)) options.format = 'webp';
    else if (/\b(png)\b/.test(t)) options.format = 'png';
    else if (/\b(jpe?g)\b/.test(t)) options.format = 'jpg';
    // language for OCR
    const langMatch = t.match(/lang\s*:\s*([a-z]{3,5})/);
    if (langMatch) {
      options.lang = langMatch[1];
    }
    // prompt for AI caption
    const promptMatch = text.match(/(?:prompt|say|describe)[:\-]?\s*(.+)$/i);
    if (promptMatch) {
      options.prompt = promptMatch[1].trim();
    }
    return options;
  };

  const handleNoteCommand = async () => {
    if (!note.trim()) return;
    const trimmed = note.trim();
    const actionValue = inferActionFromText(trimmed);
    if (!actionValue) {
      setResult("I couldn't understand. Try: 'make pdf', 'compress', 'remove background', or 'extract text'.");
      return;
    }
    const options = inferOptionsFromText(trimmed);
    await handleAction(actionValue, options);
  };

  const processAction = async (action, options = {}) => {
    if (!selectedFile || selectedFile.length === 0) {
      // Instead of alert, trigger file selection
      setPendingAction(action.value);
      setPendingOptions(options || {});
      fileInputRef.current?.click();
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();

      if (action.multiple) {
        // For multiple files (like image-to-pdf)
        Array.from(selectedFile).forEach((file, index) => {
          formData.append(`images`, file);
        });
      } else {
        // For single file
        formData.append('image', selectedFile[0]);
      }

      // Add additional parameters based on action
      if (action.value === 'compress-image') {
        const quality = options.quality ?? 80;
        const maxSize = options.maxSize ?? 100;
        const format = options.format ?? 'jpg';
        formData.append('quality', String(quality));
        formData.append('maxSize', String(maxSize));
        formData.append('format', String(format));
      } else if (action.value === 'ocr') {
        formData.append('lang', options.lang || 'eng');
      } else if (action.value === 'ai-caption') {
        if (options.prompt) formData.append('prompt', options.prompt);
      }

      const response = await fetch(action.endpoint, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        if (action.value === 'ocr' || action.value === 'ai-caption') {
          // JSON result
          const data = await response.json();
          setResult(data.text || data.caption || '');
        } else {
          // Other actions return files for download
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `chutki-${action.value}.${action.value === 'image-to-pdf' ? 'pdf' : 'jpg'}`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          setResult("File downloaded successfully!");
        }
      } else {
        const error = await response.json();
        setResult(`Error: ${error.error || 'Failed to process'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setResult(`Error: ${error.message || 'Failed to process'}`);
    } finally {
      setLoading(false);
    }
  };

  const startListening = () => {
    SpeechRecognition.startListening({ continuous: false });
  };

  const sendNote = () => {
    if (!note.trim()) return;
    handleNoteCommand();
    setNote("");
  };

  const onEmojiClick = (emojiData) => {
    setNote((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {open ? (
          <motion.div
            key="chatbox"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            className="bg-white shadow-xl rounded-2xl w-full max-w-[90vw] sm:w-80 sm:max-w-sm p-4 max-h-[85vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-pink-500 text-xl">👱🏼‍♀️</span>
                <p className="font-bold text-pink-600">CHUTKI</p>
              </div>
              <button onClick={() => setOpen(false)} className="p-1">
                <FaTimes />
              </button>
            </div>

            {/* Greeting */}
            <div className="text-xs sm:text-sm text-gray-600 mb-1 font-medium">{time}</div>
            <p className="text-xs sm:text-sm text-gray-600 mb-2">
              <Typewriter
                words={[
                  "Hi! I'm Chutki 😊",
                  "Your AI Assistant",
                  "May I help you?",
                ]}
                loop
                cursor
                typeSpeed={50}
                deleteSpeed={30}
                delaySpeed={900}
              />
            </p>

            {/* Hidden file input for actions requiring images */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Input Box */}
            <div className="mt-2 w-full flex-shrink-0">
              <div className="bg-gray-800 rounded-full px-3 sm:px-4 py-1 sm:py-2 shadow-lg flex items-center space-x-2 relative">
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Write something..."
                  rows={1}
                  className="flex-1 text-xs sm:text-sm bg-transparent text-white placeholder-gray-400 resize-none focus:outline-none min-h-[2rem] pt-1"
                />

                {showEmojiPicker && (
                  <div className="absolute bottom-14 sm:bottom-12 right-0 z-50">
                    <EmojiPicker
                      onEmojiClick={onEmojiClick}
                      theme="dark"
                      height={300}
                      width={250}
                    />
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <button
                    className="text-gray-400 hover:text-white"
                    onClick={() => setShowEmojiPicker((prev) => !prev)}
                  >
                    <FaSmile size={16} />
                  </button>
                  <button
                    className={isListening ? "text-pink-500 animate-pulse" : "text-gray-400"}
                    onClick={startListening}
                  >
                    <FaMicrophone size={16} />
                  </button>
                  <button
                    className="text-pink-400 hover:text-white"
                    onClick={sendNote}
                  >
                    <FaPaperPlane size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-3 space-y-2 overflow-y-auto flex-1">
              {actions.map((action) => (
                <button
                  key={action.value}
                  onClick={() => handleAction(action.value)}
                  disabled={loading}
                  className={`w-full text-left p-3 rounded-lg transition-all ${loading
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-pink-100 hover:bg-pink-200 text-gray-800 hover:shadow-md'
                    }`}
                >
                  <div className="font-medium text-sm">{action.label}</div>
                  <div className="text-xs text-gray-600 mt-1">{action.description}</div>
                </button>
              ))}
            </div>

            {/* Loading and Result */}
            {loading && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-blue-800">Processing...</span>
                </div>
              </div>
            )}

            {result && !loading && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-sm text-green-800">
                  {result.length > 100 ? result.substring(0, 100) + '...' : result}
                </div>
                <button
                  onClick={() => setResult(null)}
                  className="text-xs text-green-600 hover:text-green-800 mt-1"
                >
                  Clear result
                </button>
              </div>
            )}
          </motion.div>
        ) : (
          // Floating Button
          <motion.button
            key="button"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(true)}
            className="bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500
                       text-white p-3 sm:p-4 rounded-full shadow-lg text-xl sm:text-3xl
                       transition-transform duration-300 ease-out hover:scale-105"
            style={{
              boxShadow: "0 4px 15px rgba(236, 72, 153, 0.6)",
            }}
          >
            👱🏼‍♀️
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChutkiAssistant;
