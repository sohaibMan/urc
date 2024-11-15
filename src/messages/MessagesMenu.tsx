import { useSelector } from "react-redux"
import { RootState } from "../model/common"
import UsersList from "./UsersList"
import Chat from "./Chat"
import React from 'react'

const MessagesMenu = () => {
    useSelector((state: RootState) =>state.session.session);
    return (
    <>
      <div style={{display : "flex" , flexDirection: "column", alignItems: "center"}}>
        <UsersList/>
        <Chat/>
      </div>
      
    </>
  )
}

export default MessagesMenu
