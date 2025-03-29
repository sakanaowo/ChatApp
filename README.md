# MERN Stack Project: Real-Time Chat App

Welcome to the **Real-Time Chat App**, a full-stack application built using the MERN (MongoDB, Express.js, React.js, Node.js) stack, featuring real-time communication powered by **Socket.IO**.

## Features

- **User Authentication**: Secure sign-up and login functionality using **JWT** and **Bcrypt.js**.
- **Real-Time Messaging**: Instant, bi-directional communication via **Socket.IO**.
- **Cloud Storage**: Image/file upload support using **Cloudinary**.
- **Responsive UI**: Built with **React** and styled using **TailwindCSS** and **DaisyUI**.
- **State Management**: Utilized **Zustand** for efficient client-side state management.
- **Toast Notifications**: Seamless notifications with **React-Hot-Toast**.
- **Routing**: Manage navigation in the app effectively using **React Router DOM**.
- **Secure APIs**: APIs secured with **CORS** middleware.

## Tech Stack

| **Technology**       | **Description**                               |
| -------------------- | --------------------------------------------- |
| **Frontend**         | React, TailwindCSS, DaisyUI, React Router DOM |
| **Backend**          | Express.js, Socket.IO                         |
| **Database**         | MongoDB, Mongoose                             |
| **Real-Time**        | Socket.IO                                     |
| **State Management** | Zustand                                       |
| **Authentication**   | JSON Web Tokens (JWT), Bcrypt.js              |
| **APIs**             | Axios                                         |
| **Dev Tools**        | Nodemon, Vite                                 |

## Getting Started

### Prerequisites

Ensure you have the following installed on your system:

- Node.js: [Download here](https://nodejs.org/)
- MongoDB: [Download here](https://www.mongodb.com/try/download/community)
- npm (Node Package Manager): Installed with Node.js
- A Cloudinary account for image/file hosting

### Installation

Follow these steps to set up and run the project locally:

1. **Clone this repository:**
  ```bash  
   git clone https://github.com/sakanaowo/ChatApp   cd <repository-folder>   
	```
2. **Set up environment variables:**  
  
   Create a `.env` file in the root directory of the project and configure the following variables:  
  
   ```env  
   MONGO_URI=<your_mongodb_connection_string>  
   JWT_SECRET=<your_jwt_secret>   
   CLOUDINARY_CLOUD_NAME=<your_cloudinary_cloud_name>   
   CLOUDINARY_API_KEY=<your_cloudinary_api_key>   
   CLOUDINARY_API_SECRET=<your_cloudinary_api_secret>   
   ```  
3. **Install dependencies:**

   Navigate to both `backend` and `frontend` directories and install packages:

```bash  
	# Backend Dependencies  
	express==4.21.2  
	mongoose==8.12.1  
	dotenv==16.4.7  
	jsonwebtoken==9.0.2  
	bcryptjs==3.0.2  
	socket.io==4.8.1  
	cookie-parser==1.4.7  
	cors==2.8.5  
	cloudinary==2.6.0  
	nodemon==3.1.9  
	
	# Frontend Dependencies  
	  
	react==19.0.0  
	react-dom==19.0.0  
	axios==1.8.4  
	zustand==5.0.3  
	socket.io-client==4.8.1  
	tailwindcss==4.0.15  
	daisyui==5.0.9  
	react-router-dom==7.4.0  
	react-hot-toast==2.5.2  
	lucide-react==0.483.0  
	@vitejs/plugin-react==4.3.4  
	  
	# Frontend Build Tools  
	  
	vite==6.2.0  
	postcss==8.5.3  
	autoprefixer==10.4.21  
	@tailwindcss/vite==4.0.15  
```  

4. **Run the development server:**

   Use **nodemon** (or **npm start**) for the backend and **vite** for the frontend:
```bash   
   # Start the backend   
   cd backend   
   npm run dev  
   # Start the frontend   
   cd frontend   
   npm run dev   
```  
5. **Access the app:**

   Open your browser and navigate to `http://localhost:5173`.

## Project Structure
```
.
├── backend
│   ├── package.json
│   ├── package-lock.json
│   └── src
│       ├── controllers
│       │   ├── auth.controller.js
│       │   └── message.controller.js
│       ├── index.js
│       ├── lib
│       │   ├── cloudinary.js
│       │   ├── db.js
│       │   ├── socket.js
│       │   └── utils.js
│       ├── middleware
│       │   └── auth.middleware.js
│       ├── models
│       │   ├── message.model.js
│       │   └── user.model.js
│       └── routes
│           ├── auth.route.js
│           └── message.route.js
└── frontend
    ├── eslint.config.js
    ├── index.html
    ├── package.json
    ├── package-lock.json
    ├── public
    │   ├── avatar.png
    │   └── vite.svg
    ├── src
    │   ├── App.jsx
    │   ├── components
    │   │   ├── AuthImagePattern.jsx
    │   │   ├── ChatContainer.jsx
    │   │   ├── ChatHeader.jsx
    │   │   ├── MessageInput.jsx
    │   │   ├── Navbar.jsx
    │   │   ├── NoChatSelected.jsx
    │   │   ├── Sidebar.jsx
    │   │   └── skeletons
    │   │       ├── MessageSkeleton.jsx
    │   │       └── SidebarSkeleton.jsx
    │   ├── constants
    │   │   └── index.js
    │   ├── index.css
    │   ├── lib
    │   │   ├── axios.js
    │   │   └── utils.js
    │   ├── main.jsx
    │   ├── pages
    │   │   ├── HomePage.jsx
    │   │   ├── LoginPage.jsx
    │   │   ├── ProfilePage.jsx
    │   │   ├── SettingsPage.jsx
    │   │   └── SignUpPage.jsx
    │   └── store
    │       ├── useAuthStore.js
    │       ├── useChatStore.js
    │       └── useThemeStore.js
    └── vite.config.js
```

### Client (Frontend)

- Built using **React 19.0.0**.
- TailwindCSS for styling with components from **DaisyUI**.
- Managed Toast notifications using **React-Hot-Toast**.
- Real-time communication with the backend via **Socket.IO Client**.
- State management using **Zustand**.

### Server (Backend)

- REST API built using **Express.js**.
- **Socket.IO** for real-time features.
- Authentication handled using **JWT** and hashed passwords with **Bcrypt.js**.
- MongoDB database handled via **Mongoose**.

## Acknowledgment

Credit to the [As a Programmer](https://www.youtube.com/watch?v=ntKkVrQqBYY) YouTube channel for the project inspiration  
and guidance.

## Contributing

Feel free to fork this repository, make your changes, and submit a pull request. Contributions, issues, and feature requests are welcome!  
