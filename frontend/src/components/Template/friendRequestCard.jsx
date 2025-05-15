const FriendRequestCard = ({ user, onAccept, onReject }) => {
  return (
    <div className="p-4 border rounded-lg shadow hover:shadow-lg transition flex flex-col items-center bg-white">
      {/* Ảnh đại diện */}
      <img
        src={"/avatar.png"}
        // alt={user.User_name}
        className="w-20 h-20 rounded-full object-cover mb-3"
      />

      {/* Tên người dùng */}
      {/* <h2 className="text-lg font-medium mb-1">{user.User_name}</h2> */}

      {/* Email */}
      <p className="text-sm text-gray-500 mb-3">{user.email}</p>

      {/* Nút Accept / Reject */}
      <div className="flex gap-2">
        <button
          onClick={() => onAccept(user.email)}
          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Accept
        </button>
        <button
          onClick={() => onReject(user.email)}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Reject
        </button>
      </div>
    </div>
  );
};

export default FriendRequestCard;
