import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import UserCard from "../components/Template/UserCard";
import LoadUserSkeleton from "../components/skeletons/LoadUserSkeleton"; // Import LoadUserSkeleton

const SuggestionsPage = () => {
  const { getUsers, users, friends, addFriend, isUsersLoading } =
    useChatStore(); // Lấy dữ liệu từ useChatStore

  useEffect(() => {
    getUsers(); // Gọi hàm lấy danh sách người dùng khi component được mount
  }, [getUsers]);

  if (isUsersLoading) {
    // Hiển thị skeleton khi đang tải
    return (
      <div className="h-screen bg-base-200">
        <div className="flex items-center justify-center pt-20 px-4">
          <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
            <div className="flex h-full rounded-lg overflow-hidden">
              <div className="w-full p-5">
                <h1 className="text-2xl font-bold mb-5">
                  Đang tải danh sách người dùng...
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
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            <div className="w-full p-5">
              <h1 className="text-2xl font-bold mb-5">Danh sách người dùng</h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                {users.map((user) => (
                  <UserCard
                    key={user._id}
                    user={user}
                    // isFriend={friends.some((friend) => friend._id === user._id)} // Kiểm tra nếu đã là bạn
                    // onAddFriend={(userId) => addFriend(userId)} // Hàm xử lý khi click "Kết bạn"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuggestionsPage;
