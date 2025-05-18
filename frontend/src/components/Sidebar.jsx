import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users } from "lucide-react";

import { useSearchStore } from "../store/useSearchStore";
import NavToSuggestions from "./Template/navToSuggestions";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } =
    useChatStore();

  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const { searchTerm, setIsSearchFocused, setSearchTerm } = useSearchStore();

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const filteredUsers = users.filter((user) => {
    const isOnline = onlineUsers.includes(user.email);
    const matchesSearch = user.username
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return (!showOnlineOnly || isOnline) && matchesSearch;
  });

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Contacts</span>
          {/* Search  bar*/}
          <div className="relative h-10 w-10 focus-within:w-64 transition-all duration-300 border border-gray-300 rounded-full px-3">
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
          </div>
        </div>
        {/*Online filter toggle */}
        <div className="mt-3 hidden lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
          </label>
          <span className="text-xs text-zinc-500">
            ({onlineUsers.length - 1} online)
          </span>
        </div>
      </div>

      <div className="overflow-y-auto w-full py-3">
        {filteredUsers.map((user) => (
          <button
            key={user.email}
            onClick={() => {
              setSelectedUser(user);
              setSearchTerm("");
            }}
            className={`
              w-full p-3 flex items-center gap-3
              hover:bg-base-300 transition-colors
              ${
                selectedUser?.email === user.email
                  ? "bg-base-300 ring-1 ring-base-300"
                  : ""
              }
            `}
          >
            <div className="relative mx-auto lg:mx-0">
              <img
                src={user.profilePic || "/avatar.png"}
                alt={user.username}
                className="size-12 object-cover rounded-full"
              />
              {onlineUsers.includes(user.email) && (
                <span
                  className="absolute bottom-0 right-0 size-3 bg-green-500 
                  rounded-full ring-2 ring-zinc-900"
                />
              )}
            </div>

            {/* User info - only visible on larger screens */}
            <div className="hidden lg:block text-left min-w-0">
              <div className="font-medium truncate">{user.username}</div>
              <div className="text-sm text-zinc-400">
                {onlineUsers.includes(user.email) ? "Online" : "Offline"}
              </div>
            </div>
          </button>
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center text-zinc-500 py-4">No online users</div>
        )}
      </div>
      {/* to suggestion button */}
      <NavToSuggestions />
    </aside>
  );
};
export default Sidebar;
