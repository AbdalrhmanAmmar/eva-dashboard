import { createContext, useContext, useState, useCallback } from 'react';

type MessagesContextType = {
  messagesCount: number;
  updateMessagesCount: (count: number) => void;
};

const MessagesContext = createContext<MessagesContextType>({
  messagesCount: 0,
  updateMessagesCount: () => {},
});

export const MessagesProvider = ({ children }: { children: React.ReactNode }) => {
  const [messagesCount, setMessagesCount] = useState(0);

  // استخدم useCallback لمنع إعادة إنشاء الدالة
  const updateMessagesCount = useCallback((count: number) => {
    console.log('Updating count to:', count); // لأغراض debugging
    setMessagesCount(count);
  }, []);

  return (
    <MessagesContext.Provider value={{ messagesCount, updateMessagesCount }}>
      {children}
    </MessagesContext.Provider>
  );
};

export const useMessages = () => {
  const context = useContext(MessagesContext);
  if (!context) {
    throw new Error('useMessages must be used within a MessagesProvider');
  }
  return context;
};