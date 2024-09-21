import React, {useEffect, useCallback, useState} from "react";
import ReactPlayer from 'react-player';
import peer from "../service/peer";
import { useSocket } from "../context/SocketProvider";


const RoomPage = () => {
    const socket = useSocket();
    const [remoteSocketId, setRemoteSocketId] = useState(null);
    const [myStream, setMyStream] = useState();
    const [remoteStream, setRemoteStream] = useState();

    

    const handleUserJoined = useCallback(({email, id}) => {
        console.log(`Email ${email} joined room`);
        setRemoteSocketId(id)
    }, []);

    const handleCallUser = useCallback( async() => {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
        });
        
        const offer =  await peer.getOffer();
        socket.emit("user:call", { to: remoteSocketId, offer});
        setMyStream(stream)
    }, [remoteSocketId, socket]);

    const handleIncomingCall = useCallback(
        async({from, offer}) => {
            setRemoteSocketId(from);
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
        });
        setMyStream(stream)
        console.log(`Incoming Call`, from, offer);
        const ans = await peer.getAnswer(offer);
        socket.emit('call:accepted', { to: from, ans});
    }, [socket]);


    const sendStreams = useCallback(() => {
        const senders = peer.peer.getSenders(); // Get all existing senders
        for (const track of myStream.getTracks()) {
            const trackAlreadyAdded = senders.find(sender => sender.track === track); 
            if (!trackAlreadyAdded) {
                peer.peer.addTrack(track, myStream); // Only add the track if it's not already added
            }
        }
    }, [myStream]);
    
    const handleCallAccepted = useCallback(({from, ans}) => {
       peer.setLocalDescription(ans)
       console.log("Call Accepted");
       sendStreams()
    }, [sendStreams]);

    const handleNegoNeeded = useCallback(async() => {
        const offer = await peer.getOffer();
        socket.emit('peer:nego:needed', {offer, to: remoteSocketId})
    }, [remoteSocketId, socket]);
    
    useEffect(() => {
        peer.peer.addEventListener('negotiationneeded', handleNegoNeeded );
        return() => {
            peer.peer.removeEventListener('negotiationneeded', handleNegoNeeded );
        };

    }, [handleNegoNeeded])

    const handleNegoNeededIncoming = useCallback
    (async({from, offer}) => {
        const ans = await peer.getAnswer(offer);
        socket.emit('peer:nego:done', { to: from, ans});
    }, [socket]);

    const handleNegoNeededFinal = useCallback(async({ ans }) => {
        await peer.setLocalDescription(ans)
    }, [])
     
    useEffect(() => {
        peer.peer.addEventListener('track', async (ev) => {
            const remoteStream = ev.streams;
            console.log('Got Tracks');
            setRemoteStream(remoteStream[0]);
        });

    }, []);


    useEffect(() => {
        socket.on('user:joined', handleUserJoined )
        socket.on('incoming:call', handleIncomingCall )
        socket.on('call:accepted', handleCallAccepted)
        socket.on('peer:nego:needed', handleNegoNeededIncoming)
        socket.on('peer:nego:final', handleNegoNeededFinal)

        return()=> {
        socket.off('user:joined', handleUserJoined)
        socket.off('incoming:call', handleIncomingCall )
        socket.off('call:accepted', handleCallAccepted)
        socket.off('peer:nego:needed', handleNegoNeededIncoming)
        socket.off('peer:nego:final', handleNegoNeededFinal)
       }
    }, [socket, handleUserJoined, handleIncomingCall, handleCallAccepted, handleNegoNeededIncoming, handleNegoNeededFinal]);
   

    return(
        <div>
            <h1>Room Page</h1>
            <h4>{remoteSocketId ? "Connected" : "No one in room"}</h4>
            { myStream && <button onClick={sendStreams}>Send Stream</button>}
            {remoteSocketId && <button onClick={handleCallUser}>Call</button>}
            <div className="video-container">
                {myStream && (
                <div className="video-box">
                   <ReactPlayer playing muted url={myStream} />
                      {remoteStream && (
                   <ReactPlayer className="local-video" playing muted url={remoteStream} />
                    )}
                </div>
                )}
            </div>

            
                   
        </div>
    );
};



export default RoomPage;