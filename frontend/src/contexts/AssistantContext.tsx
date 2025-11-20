import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type AssistantTarget = {
  conversationId: string | null;
  customerId: string | null;
};

type AssistantContextValue = AssistantTarget & {
  setAssistantTarget: (target: Partial<AssistantTarget>) => void;
  conversationUpdateToken: number;
  notifyConversationUpdated: () => void;
};

const AssistantContext = createContext<AssistantContextValue | undefined>(
  undefined
);

export const AssistantProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [target, setTarget] = useState<AssistantTarget>({
    conversationId: null,
    customerId: null,
  });
  const [conversationUpdateToken, setConversationUpdateToken] = useState(0);

  const updateTarget = useCallback((next: Partial<AssistantTarget>) => {
    setTarget((prev) => {
      const nextConversationId =
        next.conversationId !== undefined
          ? next.conversationId ?? null
          : prev.conversationId;
      const nextCustomerId =
        next.customerId !== undefined
          ? next.customerId ?? null
          : prev.customerId;

      if (
        prev.conversationId === nextConversationId &&
        prev.customerId === nextCustomerId
      ) {
        return prev;
      }

      return {
        conversationId: nextConversationId,
        customerId: nextCustomerId,
      };
    });
  }, []);

  const notifyConversationUpdated = useCallback(() => {
    setConversationUpdateToken((prev) => prev + 1);
  }, []);

  const value = useMemo(
    () => ({
      conversationId: target.conversationId,
      customerId: target.customerId,
      setAssistantTarget: updateTarget,
      conversationUpdateToken,
      notifyConversationUpdated,
    }),
    [target, updateTarget, conversationUpdateToken, notifyConversationUpdated]
  );

  return (
    <AssistantContext.Provider value={value}>
      {children}
    </AssistantContext.Provider>
  );
};

export const useAssistantContext = () => {
  const context = useContext(AssistantContext);
  if (!context) {
    throw new Error(
      "useAssistantContext must be used within an AssistantProvider"
    );
  }
  return context;
};
