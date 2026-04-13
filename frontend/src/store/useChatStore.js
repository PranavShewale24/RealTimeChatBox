import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  unreadMessages: {},
  isUsersLoading: false,
  isMessagesLoading: false,
  activeChatMessageHandler: null,
  notificationMessageHandler: null,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/friends");
      set({ users: res.data.friends || [] });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    const { activeChatMessageHandler } = get();
    if (activeChatMessageHandler) {
      socket.off("newMessage", activeChatMessageHandler);
    }

    const handler = (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
      });
    };

    socket.on("newMessage", handler);
    set({ activeChatMessageHandler: handler });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    const { activeChatMessageHandler } = get();
    if (socket && activeChatMessageHandler) {
      socket.off("newMessage", activeChatMessageHandler);
      set({ activeChatMessageHandler: null });
    }
  },

  initializeMessageNotifications: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket || get().notificationMessageHandler) return;

    const handler = (newMessage) => {
      const { selectedUser, users, unreadMessages } = get();
      const isCurrentChat = selectedUser?._id === newMessage.senderId;
      if (isCurrentChat) return;

      const sender = users.find((user) => user._id === newMessage.senderId);
      const senderName = sender?.fullName || "your friend";

      set({
        unreadMessages: {
          ...unreadMessages,
          [newMessage.senderId]: (unreadMessages[newMessage.senderId] || 0) + 1,
        },
      });

      toast.success(`New message from ${senderName}`);
    };

    socket.on("newMessage", handler);
    set({ notificationMessageHandler: handler });
  },

  cleanupMessageNotifications: () => {
    const socket = useAuthStore.getState().socket;
    const { notificationMessageHandler } = get();
    if (socket && notificationMessageHandler) {
      socket.off("newMessage", notificationMessageHandler);
      set({ notificationMessageHandler: null });
    }
  },

  setSelectedUser: (selectedUser) =>
    set((state) => ({
      selectedUser,
      unreadMessages: selectedUser
        ? {
            ...state.unreadMessages,
            [selectedUser._id]: 0,
          }
        : state.unreadMessages,
    })),
}));