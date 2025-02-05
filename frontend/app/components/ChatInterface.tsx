// "use client";

// import React, { useState, useEffect, FormEvent } from 'react';
// import { Send, User, Bot } from 'lucide-react';

// interface Message {
//   id: number;
//   text: string;
//   sender: 'user' | 'ai';
// }

// const ChatInterface: React.FC = () => {
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [inputMessage, setInputMessage] = useState<string>('');
//   const [isLoading, setIsLoading] = useState<boolean>(false);

//   const handleSendMessage = async (e: FormEvent) => {
//     e.preventDefault();
//     if (!inputMessage.trim() || isLoading) return;

//     const newMessage: Message = {
//       id: Date.now(),
//       text: inputMessage,
//       sender: 'user'
//     };

//     setMessages(prev => [...prev, newMessage]);
//     setInputMessage('');
//     setIsLoading(true);

//     try {
//       const response = await fetch('http://localhost:5000/chat', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ message: inputMessage })
//       });

//       const data = await response.json();
      
//       const aiMessage: Message = {
//         id: Date.now() + 1,
//         text: data.reply,
//         sender: 'ai'
//       };

//       setMessages(prev => [...prev, aiMessage]);
//     } catch (error) {
//       console.error('Chat error:', error);
//       setMessages(prev => [...prev, {
//         id: Date.now() + 2,
//         text: 'Error: Could not send message',
//         sender: 'ai'
//       }]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="flex h-screen bg-gray-100">
//       {/* Sidebar (Optional) */}
//       <div className="w-16 bg-gray-800 flex flex-col items-center py-4">
//         <div className="mb-4">
//           <Bot className="text-white" size={24} />
//         </div>
//         <div>
//           <User className="text-gray-400" size={24} />
//         </div>
//       </div>

//       {/* Main Chat Area */}
//       <div className="flex flex-col flex-1">
//         {/* Chat Header */}
//         <div className="bg-white shadow-md p-4">
//           <h1 className="text-xl font-semibold text-gray-800">AI Chat</h1>
//         </div>

//         {/* Messages Container */}
//         <div className="flex-1 overflow-y-auto p-6 space-y-4">
//           {messages.map((msg) => (
//             <div 
//               key={msg.id}
//               className={`flex items-start space-x-3 ${
//                 msg.sender === 'user' ? 'justify-end' : 'justify-start'
//               }`}
//             >
//               {msg.sender === 'ai' && (
//                 <Bot className="text-gray-500" size={24} />
//               )}
//               <div 
//                 className={`p-3 rounded-lg max-w-[70%] ${
//                   msg.sender === 'user' 
//                     ? 'bg-blue-500 text-white' 
//                     : 'bg-white text-gray-800 shadow-md'
//                 }`}
//               >
//                 {msg.text}
//               </div>
//               {msg.sender === 'user' && (
//                 <User className="text-gray-500" size={24} />
//               )}
//             </div>
//           ))}
//           {isLoading && (
//             <div className="text-center text-gray-500 animate-pulse">
//               AI is typing...
//             </div>
//           )}
//         </div>

//         {/* Message Input */}
//         <div className="bg-white p-4 border-t">
//           <form onSubmit={handleSendMessage} className="flex items-center">
// 						<input
// 							type="text"
// 							value={inputMessage}
// 							onChange={(e) => setInputMessage(e.target.value)}
// 							className="flex-1 p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black" // Added text-white
// 							placeholder="Type your message..."
// 							disabled={isLoading}
// 						/>
//             <button 
//               type="submit"
//               className="bg-blue-500 text-white p-2 rounded-r-lg hover:bg-blue-600 transition"
//               disabled={isLoading}
//             >
//               <Send size={20} />
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ChatInterface;






























"use client";

import React, { useState, useEffect, FormEvent, useRef } from 'react';
import { Send, User, Bot, ChevronDown } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isScrolledUp, setIsScrolledUp] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setIsScrolledUp(false);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    
    setIsScrolledUp(!isNearBottom);
  };

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const newMessage: Message = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user'
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: inputMessage })
      });

      const data = await response.json();
      
      const aiMessage: Message = {
        id: Date.now() + 1,
        text: data.reply,
        sender: 'ai'
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        id: Date.now() + 2,
        text: 'Error: Could not send message',
        sender: 'ai'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar (Optional) */}
      <div className="w-16 bg-gray-800 flex flex-col items-center py-4">
        <div className="mb-4">
          <Bot className="text-white" size={24} />
        </div>
        <div>
          <User className="text-gray-400" size={24} />
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-col flex-1">
        {/* Chat Header */}
        <div className="bg-white shadow-md p-4">
          <h1 className="text-xl font-semibold text-gray-800">AI Chat</h1>
        </div>

        {/* Messages Container */}
        <div 
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-6 space-y-4 relative"
        >
          {messages.map((msg) => (
            <div 
              key={msg.id}
              className={`flex items-start space-x-3 ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'ai' && (
                <Bot className="text-gray-500" size={24} />
              )}
              <div 
                className={`p-3 rounded-lg max-w-[70%] ${
                  msg.sender === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white text-gray-800 shadow-md'
                }`}
              >
                {msg.text}
              </div>
              {msg.sender === 'user' && (
                <User className="text-gray-500" size={24} />
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
          {isLoading && (
            <div className="text-center text-gray-500 animate-pulse">
              AI is typing...
            </div>
          )}
          
          {isScrolledUp && (
            <button 
              onClick={scrollToBottom}
              className="fixed bottom-20 right-4 bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition"
            >
              <ChevronDown size={20} />
            </button>
          )}
        </div>

        {/* Message Input */}
        <div className="bg-white p-4 border-t">
          <form onSubmit={handleSendMessage} className="flex items-center">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white bg-gray-700"
              placeholder="Type your message..."
              disabled={isLoading}
            />
            <button 
              type="submit"
              className="bg-blue-500 text-white p-2 rounded-r-lg hover:bg-blue-600 transition"
              disabled={isLoading}
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;