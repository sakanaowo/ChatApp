const UserCard = ({ user, isFriend, onAddFriend }) => {
  return (
    <div className="p-4 border rounded-lg shadow hover:shadow-lg transition flex flex-col items-center">
      {/* Ảnh đại diện */}
      <img
        src={user.profilePic || "/avatar.png"}
        alt={user.fullName}
        className="w-20 h-20 rounded-full object-cover mb-3"
      />
      {/* Tên người dùng */}
      <h2 className="text-lg font-medium mb-2">{user.fullName}</h2>
      {/* Nút kết bạn */}
      <button
        // onClick={() => onAddFriend(user._id)}
        // disabled={isFriend} // Vô hiệu hóa nếu đã là bạn
        className={`px-4 py-2 rounded ${
          isFriend
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-blue-500 text-white hover:bg-blue-600"
        }`}
      >
        {isFriend ? "Đã là bạn" : "Kết bạn"}
      </button>
    </div>
  );
};

export default UserCard;
