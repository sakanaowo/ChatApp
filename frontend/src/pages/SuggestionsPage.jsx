import { useEffect } from "react";
import UserCard from "../components/Template/UserCard";
import FriendRequestCard from "../components/Template/friendRequestCard";
import LoadUserSkeleton from "../components/skeletons/LoadUserSkeleton"; // Import LoadUserSkeleton
import { useSearchStore } from "../store/useSearchStore";
import { useOtherUserStore } from "../store/useOtherUserStore"; // Import useOtherUserStore

const SuggestionsPage = () => {
  const {
    users,
    friends,
    friendRequests,
    pendingRequests,
    getFriendRequests,
    getAllUsers,
    isLoading,
    sendFriendRequest,
    acceptFriendRequest,
    getAllFriends,
    getPendingRequests,
    rejectFriendRequest,
  } = useOtherUserStore();
  const { searchTerm, setIsSearchFocused, setSearchTerm } = useSearchStore();

  useEffect(() => {
    getAllUsers();
    getFriendRequests();
    getAllFriends();
    getPendingRequests();

    const interval = setInterval(() => {
      getAllUsers();
      getFriendRequests();
      getAllFriends();
      getPendingRequests();
    }, 2000);
    return () => {
      clearInterval(interval);
    };
    //
  }, [getAllUsers, getFriendRequests, getAllFriends, getPendingRequests]);

  const otherUsers = users.filter((user) => {
    const isFriend = friends.some((friend) => friend.email === user.Email);
    const isFriendRequest = friendRequests.some(
      (request) => request.Sender_email === user.Email
    );
    return !isFriend && !isFriendRequest;
  });

  console.log("pending", pendingRequests);

  // loading sekeleton
  if (isLoading) {
    // Hiển thị skeleton khi đang tải
    return (
      <div className="min-h-screen bg-base-200">
        <div className="flex items-center justify-center pt-20 px-4">
          <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
            <div className="flex h-full rounded-lg overflow-hidden">
              <div className="w-full p-5">
                <h1 className="text-2xl font-bold mb-5">
                  Loading user list...
                </h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 9 }).map((_, index) => (
                    <LoadUserSkeleton key={index} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-20 px-4">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[90vh] flex flex-col">
          <div className="flex-1 overflow-y-auto p-5 space-y-8">
            {/* Search bar */}
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Tìm kiếm người dùng</h1>
              <div className="relative h-10 w-64 border border-gray-300 rounded-full px-3">
                <span className="absolute left-3 top-1/2 -translate-y-1/2">
                  <img
                    src="https://img.icons8.com/ios/50/FFFFFF/search--v1.png"
                    alt="search"
                    className="w-4 h-4 opacity-70"
                  />
                </span>
                <input
                  type="text"
                  placeholder="Search..."
                  className="absolute inset-0 pl-10 pr-3 h-full w-full bg-transparent outline-none"
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  value={searchTerm}
                />
                {searchTerm && (
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setSearchTerm("")}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Friend Requests */}
            <div>
              <h2 className="text-xl font-semibold mb-3">Lời mời kết bạn</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                {friendRequests.length > 0 ? (
                  friendRequests.map((user) => (
                    <FriendRequestCard
                      key={user.Sender_email}
                      user={{
                        email: user.Sender_email,
                      }}
                      onAccept={() => acceptFriendRequest(user.Sender_email)}
                      onReject={() => rejectFriendRequest(user.Sender_email)}
                    />
                  ))
                ) : (
                  <div className="text-center text-gray-500 col-span-full">
                    Không có lời mời kết bạn.
                  </div>
                )}
              </div>
            </div>

            {/* Other Users */}
            <div>
              <h2 className="text-xl font-semibold mb-3">
                Danh sách người dùng
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                {otherUsers.length > 0 ? (
                  otherUsers.map((user) => (
                    <UserCard
                      key={user.Email}
                      user={{
                        ...user,
                        email: user.Email,
                        User_name: user.User_name,
                      }}
                      isPending={pendingRequests.some(
                        (request) => request.Receiver_email === user.Email
                      )}
                      onAddFriend={() => sendFriendRequest(user.Email)}
                    />
                  ))
                ) : (
                  <div className="text-center text-gray-500 col-span-full">
                    Không tìm thấy người dùng nào phù hợp.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuggestionsPage;
