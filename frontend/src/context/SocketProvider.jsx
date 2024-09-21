import React, {createContext, useMemo, useContext} from "react";
import {io} from 'socket.io-client';


const SocketContext = createContext(null);

//use socket anywhere by useSocket
export const useSocket = () => {
    const socket = useContext(SocketContext);
    return socket;
};

export const SocketProvider = (props) => {
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const socket = useMemo(()=> io('localhost:5000'), []);
    
    return(
        <SocketContext.Provider value= {socket}>
            { props.children}
        </SocketContext.Provider>
    );
};