import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";

const navToSuggestions = () => {
  return (
    // <Link to="/suggestions">
    <Link to="/suggestions">
      <StyledWrapper>
        <button className="button">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75"
            />
          </svg>
          <div className="text">Explore</div>
        </button>
      </StyledWrapper>
    </Link>
  );
};

const StyledWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;

  .button {
    background-color: #ffffff00;
    color: #fff;
    width: 8.5em;
    height: 2.9em;
    border: #ffffff 0.2em solid;
    border-radius: 11px;
    text-align: right;
    position: relative;
    transition: all 0.6s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5em;
    cursor: pointer;
  }

  .button:hover {
    background-color: #ffffff;
    color: #000;
  }

  .button svg {
    width: 1.6em;
    margin: 0;
    transition: all 0.6s ease;
  }

  .button:hover svg {
    transform: translateX(5px);
  }

  .text {
    margin: 0;
  }
`;

export default navToSuggestions;
