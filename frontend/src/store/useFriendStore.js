import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useChatStore } from "./useChatStore";

export const useFriendStore = create((set, get) => ({
  suggestions: [],
  incomingRequests: [],
  outgoingRequests: [],
  isSuggestionsLoading: false,
  isRequestsLoading: false,
  selectedExploreUser: null,

  getSuggestions: async () => {
    set({ isSuggestionsLoading: true });
    try {
      const res = await axiosInstance.get("/friends/suggestions");
      set({ suggestions: res.data.suggestions || [] });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch suggestions");
    } finally {
      set({ isSuggestionsLoading: false });
    }
  },

  getFriendRequests: async () => {
    set({ isRequestsLoading: true });
    try {
      const res = await axiosInstance.get("/friends/requests");
      set({
        incomingRequests: res.data.incoming || [],
        outgoingRequests: res.data.outgoing || [],
      });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch requests");
    } finally {
      set({ isRequestsLoading: false });
    }
  },

  sendFriendRequest: async (userId) => {
    try {
      await axiosInstance.post(`/friends/request/${userId}`);
      set({
        suggestions: get().suggestions.filter((user) => user._id !== userId),
      });
      toast.success("Friend request sent");
      await Promise.all([get().getFriendRequests(), get().getSuggestions()]);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to send request");
    }
  },

  acceptFriendRequest: async (userId) => {
    try {
      await axiosInstance.post(`/friends/accept/${userId}`);
      toast.success("Friend request accepted");
      await Promise.all([get().getFriendRequests(), get().getSuggestions()]);
      await useChatStore.getState().getUsers();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to accept request");
    }
  },

  rejectFriendRequest: async (userId) => {
    try {
      await axiosInstance.post(`/friends/reject/${userId}`);
      toast.success("Friend request rejected");
      await Promise.all([get().getFriendRequests(), get().getSuggestions()]);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to reject request");
    }
  },

  setSelectedExploreUser: (user) => set({ selectedExploreUser: user }),
}));
