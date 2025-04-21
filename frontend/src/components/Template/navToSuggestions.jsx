import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";

const navToSuggestions = () => {
  return (
    // <Link to="/suggestions">
    <Link to="/suggestions">
      <StyledWrapper>
        <button className="boton-elegante">Explore</button>
      </StyledWrapper>
    </Link>
  );
};

const StyledWrapper = styled.div`
  display: flex; /* Đặt flexbox để căn giữa */
  justify-content: center; /* Căn giữa theo chiều ngang */
  align-items: center; /* Căn giữa theo chiều dọc */
  height: 100%; /* Chiều cao để căn giữa toàn bộ */

  .boton-elegante {
    padding: 10px 20px;
    border: 2px solid #e5e7eb; /* Màu viền nhạt */
    background-color: #f3f4f6; /* Màu nền nhạt */
    color: #1f2937; /* Màu chữ đậm */
    font-size: 1rem;
    cursor: pointer;
    border-radius: 25px; /* Bo góc nhẹ */
    transition: all 0.3s ease;
    outline: none;
    position: relative;
    overflow: hidden;
    font-weight: 500;
    text-align: center;
    display: inline-block;
    width: 70%; /* Để nút chiếm toàn bộ chiều rộng */
  }

  .boton-elegante::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(
      circle,
      rgba(16, 185, 129, 0.3) 0%,
      /* Màu xanh nhạt */ rgba(16, 185, 129, 0) 70%
    );
    transform: scale(0);
    transition: transform 0.4s ease;
  }

  .boton-elegante:hover::after {
    transform: scale(4);
  }

  .boton-elegante:hover {
    border-color: #10b981; /* Màu viền xanh khi hover */
    background: #d1fae5; /* Màu nền xanh nhạt khi hover */
    color: #065f46; /* Màu chữ đậm hơn khi hover */
  }
`;

export default navToSuggestions;
