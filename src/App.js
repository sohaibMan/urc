import './App.css';
import {Login} from "./user/Login";
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Signup from './user/Signup';
import MessagesMenu from './messages/MessagesMenu';
import NavBar from './NavBar';
import { useSelector } from 'react-redux';
import {useEffect} from "react";
import {Client, TokenProvider} from "@pusher/push-notifications-web";

function App() {
  const session = useSelector((state) => state.session.session);

    useEffect(() => {

        const token = sessionStorage.getItem('token');
        const user_id=sessionStorage.getItem('externalId');
        if(!token || !user_id)return;


        const beamsClient = new Client({
            instanceId: process.env.REACT_APP_PUSHER_INSTANCE_ID,
        });

        const beamsTokenProvider = new TokenProvider({
            url: '/api/beams',
            headers: {
                Authentication: "Bearer " + token, // Headers your auth endpoint needs
            },

        });

        beamsClient.start()
            .then(() => beamsClient.addDeviceInterest('global'))
            .then(() => beamsClient.setUserId(user_id, beamsTokenProvider))
            .then(() => {
                beamsClient.getDeviceId().then(deviceId => console.log("Push id : " + deviceId));
            })
            .catch(console.error);
        // Clean up when component is unmounted
        return () => {
            beamsClient.stop().catch(console.error);
        };
    },[]);


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
