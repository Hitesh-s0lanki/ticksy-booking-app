"use client";

import React, { useState } from "react";
import { Send } from "lucide-react";

type Props = {
  onSend: (text: string) => void;
};

const ChatInput: React.FC<Props> = ({ onSend }) => {
  const [text, setText] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text);
    setText("");
  };

  return (
    <form
      onSubmit={submit}
      className="flex items-center border-t px-3 py-2 gap-2 bg-background"
    >
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a message…"
        className="flex-1 px-3 py-2 rounded-lg border bg-white focus:outline-none focus:ring focus:ring-blue-400"
      />
      <button
        type="submit"
        className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
        aria-label="Send message"
      >
        <Send size={18} />
      </button>
    </form>
  );
};

export default ChatInput;
