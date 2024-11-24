import {useSelector} from "react-redux"
import {RootState} from "../model/common"
import UsersList from "./UsersList"
import Chat from "./Chat"
import React from 'react'
import RoomsList from "./RoomsList";

const MessagesMenu = ({isRoom = false}: { isRoom: boolean }) => {
    useSelector((state: RootState) => state.session.session);
    return (
        <>
            <div style={{display: "flex", flexDirection: "row", alignItems: "center", gap: "20px", margin: "10px"}}>
                <div style={{flex: "1 0 30%"}}>
                    <UsersList/>
                    <RoomsList/>
                </div>
                <div style={{flex: "1 0 70%"}}>
                    {<Chat isRoom={isRoom}/>}
                </div>
            </div>

        </>
    )
}

export default MessagesMenu
