# WebRTC-Video-call

This project implements a **WebRTC-based video calling application** with a backend powered by **Node.js** and **Socket.io**. It enables users to join rooms and make peer-to-peer video calls with real-time signaling using WebRTC.

## Table of Contents

- Features
- Installation
- Usage
- Backend Code Overview
- Dependencies
- License

## Features

- Real-time video calling using WebRTC.
- Socket.io-powered signaling for call management.
- Join rooms and notify other participants.
- Support for offer/answer negotiation.
- Peer reconnections with renegotiation if needed.

## Installation

Follow the steps below to install and run the backend:
1. **Clone the Repository:**
```bash
git clone https://github.com/azadsingh3/WebRTC-Video-call.git
cd WebRTC-Video-call
```

2. **Install Dependencies:**

```bash
npm install
```

3. **Run the Backend Server:**

```bash
node index.js
```

This will start the server on **port 5000**.

## Usage

1. **Room Joining:** Users join a room with their email address and room ID.

2. **Video Calls:**
- Initiate a call by selecting a user.
- Call signals (offer/answer) are exchanged through Socket.io.
- Support for renegotiation during connection interruptions.

## Backend Code Overview

`index.js` (Backend Logic)

This file contains the signaling logic for WebRTC using Socket.io.

```bash
import { Server } from "socket.io";

const io = new Server(5000, { cors: true });

const emailToSocketIdMap = new Map();
const socketidToEmailMap = new Map();

io.on('connection', (socket) => {
    console.log(`Socket Connected`, socket.id);

    socket.on('room:join', (data) => {
        const { email, room } = data;
        emailToSocketIdMap.set(email, socket.id);
        socketidToEmailMap.set(socket.id, email);
        io.to(room).emit('user:joined', { email, id: socket.id });
        socket.join(room);
        io.to(socket.id).emit('room:join', data);
    });

    socket.on('user:call', ({ to, offer }) => {
        io.to(to).emit('incoming:call', { from: socket.id, offer });
    });

    socket.on('call:accepted', ({ to, ans }) => {
        io.to(to).emit('call:accepted', { from: socket.id, ans });
    });

    socket.on('peer:nego:needed', ({ to, offer }) => {
        console.log('peer:nego:needed', offer);
        io.to(to).emit('peer:nego:needed', { from: socket.id, offer });
    });

    socket.on('peer:nego:done', ({ to, ans }) => {
        console.log('peer:nego:done', ans);
        io.to(to).emit('peer:nego:final', { from: socket.id, ans });
    });
});

```

## Dependencies

Below are the primary dependencies used in this project:

- Node.js: Server environment
- Socket.io v4.7.5: For real-time, bidirectional communication.
See `package-lock.json` for the complete list of installed packages.

## License

This project is licensed under the **ISC License**.