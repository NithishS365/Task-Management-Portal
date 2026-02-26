import React from 'react';
import { AllRoutes } from './Routes/AllRoutes';
import { ToastContainer } from 'react-toastify';
import Chatbot from './components/Chatbot';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
  return (
    <div className="App bg-gray-100 font-Montserrat">
      <AllRoutes />
      <Chatbot />
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

export default App;