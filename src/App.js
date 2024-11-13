import './App.css';
import {Login} from "./user/Login";
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Signup from './user/Signup';
import MessagesMenu from './messages/MessagesMenu';
import NavBar from './NavBar';
import { useSelector } from 'react-redux';

function App() {
  const session = useSelector((state) => state.session.session);

  return (
      <Router>
        <Routes>
          <Route path='/login' element={session.token ? <Navigate to="/messages" /> : <><NavBar/><Login/></>} />
          <Route path='/' element={<Navigate to="/login"/>}/>
          <Route path='/signup'  element={session.token ? <Navigate to="/messages" /> : <><NavBar/><Signup/></>}/>
          <Route path='/messages' element={session.token ? <><NavBar /><MessagesMenu /></> : <Navigate to="/login" />}/>
          <Route path="/messages/user/:id" element={session.token ? <><NavBar /><MessagesMenu /></> : <Navigate to="/login" />}/>
        </Routes>
      </Router>
  );
}

export default App;
