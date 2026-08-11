interface Message {
  role: string;
  content: string;
  answerIndex?: number;
}

function Chat({ messages }: { messages: Message[] }) {
  return (
    <div className="flex flex-col w-full max-w-[600px] mx-auto p-4 gap-2">
      {messages.map((msg, i) => (
        <div
          key={i}
          className={`flex ${
            msg.role === "user" ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
              msg.role === "user"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            }`}
          >
            {msg.content}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Chat;
