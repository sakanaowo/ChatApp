const LoadUserSkeleton = () => {
  return (
    <div className="p-4 border rounded-lg shadow-lg animate-pulse flex flex-col items-center">
      {/* Ảnh đại diện */}
      <div className="w-20 h-20 bg-gray-300 rounded-full mb-4"></div>
      {/* Tên người dùng */}
      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
      {/* Email hoặc thông tin phụ */}
      <div className="h-3 bg-gray-300 rounded w-1/2"></div>
    </div>
  );
};

export default LoadUserSkeleton;
