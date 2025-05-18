const UserCard = ({ user, isPending, onAddFriend }) => {
  return (
    <div className="p-4 border rounded-lg shadow hover:shadow-lg transition flex flex-col items-center bg-base-100">
      {/* Avatar */}
      <img
        src={user.profilePic || "/avatar.png"}
        alt={user.User_name}
        className="w-20 h-20 rounded-full object-cover mb-3"
      />

      {/* Tên người dùng */}
      <h2 className="text-lg font-medium">{user.User_name}</h2>

      {/* Email */}
      <p className="text-sm text-gray-500 mb-3">{user.email}</p>

      {/* Nút kết bạn // pending */}
      {isPending ? (
        <button
          disabled
          className="px-4 py-2 rounded bg-yellow-300 text-yellow-700 cursor-not-allowed"
        >
          Đang chờ
        </button>
      ) : (
        <button
          onClick={() => onAddFriend(user.email)}
          className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
        >
          Kết bạn
        </button>
      )}
    </div>
  );
};

export default UserCard;
