import React, { useState, useEffect } from "react";
import { FaTimes, FaMicrophone, FaSmile, FaPaperPlane } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { Typewriter } from "react-simple-typewriter";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import EmojiPicker from "emoji-picker-react";

const ChutkiAssistant = ({ onSelect }) => {
  const [open, setOpen] = useState(false);
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const actions = [
    { label: "Convert Images To PDF ", value: "pic-pdf" },
    { label: " Compress Image", value: "resize" },
    { label: "JPG to Text", value: "convert" },
    { label: "Compress Image Black & White", value: "convert" },
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

      setTime(`${greeting}, it’s ${hour12}:${mins}:${secs} ${ampm}`);
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
      else if (lower.includes("compress")) handleAction("compress");
      else if (lower.includes("background")) handleAction("remove-bg");
      else if (lower.includes("text") || lower.includes("ocr")) handleAction("ocr");
      else if (lower.includes("convert")) handleAction("convert");
      resetTranscript();
    }
  }, [isListening, transcript]);

  const handleAction = (value) => {
    const action = actions.find((a) => a.value === value);
    if (action && onSelect) onSelect(value);
  };

  const startListening = () => {
    SpeechRecognition.startListening({ continuous: false });
  };

  const sendNote = () => {
    if (note.trim()) {
      console.log("Sending note:", note);
      setNote("");
    }
  };

  const onEmojiClick = (emojiData) => {
    setNote((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
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
            className="bg-white shadow-xl rounded-2xl w-full max-w-[90vw] sm:w-72 sm:max-w-sm p-4 max-h-[85vh] flex flex-col"
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
                  className="w-full bg-pink-100 hover:bg-pink-200 text-xs sm:text-sm text-gray-800 rounded px-3 py-2 text-left"
                >
                  {action.label}
                </button>
              ))}
            </div>
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
