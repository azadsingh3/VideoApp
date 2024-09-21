import {Routes, Route} from 'react-router-dom';
import './App.css';
import Admin from './pages/admin';
import RoomPage from './pages/room';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path= '/' element={<Admin/>}/>
        <Route path= '/room/:roomId' element={<RoomPage/>}/>
      </Routes>
    </div>
  );
}

export default App;
