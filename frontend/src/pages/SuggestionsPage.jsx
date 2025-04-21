import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import UserCard from "../components/Template/UserCard";
import LoadUserSkeleton from "../components/skeletons/LoadUserSkeleton"; // Import LoadUserSkeleton
import { useSearchStore } from "../store/useSearchStore";

const SuggestionsPage = () => {
  const { getUsers, users, friends, addFriend, isUsersLoading } =
    useChatStore();
  const { searchTerm, setIsSearchFocused, setSearchTerm } = useSearchStore();

  useEffect(() => {
    getUsers(); // Gọi hàm lấy danh sách người dùng khi component được mount
  }, [getUsers]);

  const filteredUsers = users.filter((user) =>
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isUsersLoading) {
    // Hiển thị skeleton khi đang tải
    return (
      <div className="h-screen bg-base-200">
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
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            <div className="w-full p-5">
              {/* search bar */}
              <div className="flex items-center justify-between mb-5">
                <h1 className="text-2xl font-bold">Danh sách người dùng</h1>
                <div className="relative h-10 w-64 transition-all duration-300 border border-gray-300 rounded-full px-3">
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

              {/* Users field */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <UserCard key={user._id} user={user} />
                  ))
                ) : (
                  <div className="text-center text-gray-500 col-span-full">
                    No matching users found.
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
