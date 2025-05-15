import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

export const useOtherUserStore = create((set, get) => ({
    users: [],
    friends: [],
    friendRequests: [],
    pendingRequests: [],
    isLoading: false,

    getAllUsers: async () => {
        set({ isLoading: true });
        try {
            const res = await axiosInstance.get("/email/getAllUsers");
            set({ users: res.data });
            console.log(res.data);
        } catch (error) {
            console.error("getAllUsers error:", error);
            toast.error(error?.response?.data?.message || "Lỗi lấy danh sách người dùng");
        } finally {
            set({ isLoading: false });
        }
    },

    getFriendRequests: async () => {
        set({ isLoading: true });
        try {
            const res = await axiosInstance.get("/friend-requests/pending");
            set({ friendRequests: res.data });
        } catch (error) {
            toast.error("Failed to fetch friends:", error?.response?.data?.message);
        } finally {
            set({ isLoading: false });
        }
    },

    sendFriendRequest: async (toEmail) => {
        try {
            await axiosInstance.post("/friend-requests/send", { toEmail });
            toast.success("Friend request sended successfully");
            set((state) => ({
                pendingRequests: [...state.pendingRequests, { Sender_email: toEmail }],
            }));

            get().getFriendRequests();
            get().getAllUsers();
            get().getAllFriends();
            get().getPendingRequests();
        }
        catch (error) {
            toast.error("Failed to add friend: " + error);
        }
    },

    acceptFriendRequest: async (senderEmail) => {
        try {
            await axiosInstance.put("/friend-requests/accept", { senderEmail });
            toast.success("Accepted friend request successfully");

            set((state) => ({
                friendRequests: state.friendRequests.filter(
                    (request) => request.Sender_email !== senderEmail
                ),
            }));

            get().getFriendRequests();
            get().getAllFriends();
            get().getAllUsers();
            get().getPendingRequests();
        }
        catch (error) {
            toast.error("Failed to accept friend request: " + error);
        }
    },

    getAllFriends: async () => {
        set({ isLoading: true });
        try {
            const res = await axiosInstance.get("/friends");
            set({ friends: res.data });
        } catch (error) {
            toast.error("Failed to fetch friends:", error?.response?.data?.message);
        } finally {
            set({ isLoading: false });
        }
    },

    getPendingRequests: async () => {
        set({ isLoading: true });
        try {
            const res = await axiosInstance.get("/friend-requests/sended");
            set({ pendingRequests: res.data });
        } catch (error) {
            toast.error("Failed to fetch pending requests: " + error);
        } finally {
            set({ isLoading: false });
        }
    },
    rejectFriendRequest: async (senderEmail) => {
        try {
            await axiosInstance.put("/friend-requests/reject", { senderEmail });
            toast.success("Rejected friend request successfully");
            set((state) => ({
                friendRequests: state.friendRequests.filter(
                    (request) => request.Sender_email !== senderEmail
                ),
            }));
            get().getFriendRequests();
            get().getAllUsers();
            get().getAllFriends();
            get().getPendingRequests();
        } catch (error) {
            toast.error("Failed to reject friend request: " + error);
        }
    }
}))
