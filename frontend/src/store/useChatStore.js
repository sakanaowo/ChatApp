import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get(`/friends`);
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  // getAllUsers: async () => {
  //   set({ isUsersLoading: true });
  //   try {
  //     const res = await axiosInstance.get("/email/getAllUsers");
  //     set({ users: res.data });
  //     console.log(res.data);
  //   } catch (error) {
  //     console.error("getAllUsers error:", error);
  //     toast.error(error?.response?.data?.message || "Lỗi lấy danh sách người dùng");
  //   } finally {
  //     set({ isUsersLoading: false });
  //   }
  // },

  getMessages: async (Email) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/chat/${Email}`);
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
      const res = await axiosInstance.post(`/messages/send/${selectedUser.email}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      // const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;

      const isMessageSentFromSelectedUser = newMessage.senderEmail === selectedUser.email;
      if (!isMessageSentFromSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
      });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
