
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './Components/Layout/Layout';
import Properties from './Components/Properties/Properties';
import Contact from './Components/Contact/Contact';
import PostProperty from './Components/PostProperty/PostProperty';
import Home from './Components/Home/Home';
import Login from './Components/Login/Login';
import Register from './Components/Register/Register';
import UserProfile from './Components/User/UserProfile';
import PropertyDetails from './Components/PropertDetails/PropertyDetails';
function App() {
  return (
    <>
    <BrowserRouter>
      <Routes>
          <Route path="/" element={<Layout/>}>
              <Route index element={<Home/>}/>
              <Route path='/home' element={<Home/>}/>
              <Route path='/properties' element={<Properties/>}/>
              <Route path='/contact' element={<Contact/>}/>
              <Route path='/user-profile' element={<UserProfile/>}/>
              <Route path='/PropertyDetails/:id' element={<PropertyDetails />} />
          </Route>
          <Route path='/postproperty' element={<PostProperty/>}/>
          <Route path='/login' element={<Login/>}/>
          <Route path='/register' element={<Register/>}/>
      </Routes>
    </BrowserRouter>
    </>
  );
}

export default App;
