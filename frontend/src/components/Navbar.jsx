import React, { useContext, useState, useEffect } from 'react';
import { assets } from '../assets/assets';
import { NavLink, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Navbar = () => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [alertsCount, setAlertsCount] = useState(0); // State for alerts count
  const { token, setToken, userData } = useContext(AppContext);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'; // Define backend URL

  const logout = () => {
    localStorage.removeItem('token');
    setToken(false);
    navigate('/login');
  };

  // Fetch alerts count from backend
  useEffect(() => {
    const fetchAlertsCount = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/alerts`);

        const alerts = Array.isArray(response.data) ? response.data : (response.data.alerts || []);
        if (Array.isArray(alerts)) {
          setAlertsCount(alerts.length);
          if (alerts.length > 0) {
            toast.info(`You have ${alerts.length} new alert(s).`);
          }
        } else {
          console.error('Expected an array of alerts.');
          setAlertsCount(0);
        }
      } catch (error) {
        console.error('Error fetching alert data:', error.message || error);
        setAlertsCount(0);
      }
    };

    fetchAlertsCount();
  }, [backendUrl]);

  return (
    <div className='flex items-center justify-between text-sm py-4 mb-5 border-b border-b-[#ADADAD]'>
      <img onClick={() => navigate('/')} className='w-44 cursor-pointer' src={assets.logo} alt="Logo" />
      <ul className='md:flex items-start gap-5 font-medium hidden'>
        <NavLink to='/'>
          <li className='py-1'>HOME</li>
        </NavLink>
        <NavLink to='/doctors'>
          <li className='py-1'>ALL HOSPITALS</li>
        </NavLink>
        <NavLink to='/about'>
          <li className='py-1'>ABOUT</li>
        </NavLink>
        <NavLink to='/contact'>
          <li className='py-1'>CONTACT</li>
        </NavLink>
        {/* Alerts link with count */}
        <NavLink to='/alerts' className='relative'>
          <li className='py-1'>ALERTS</li>
          {alertsCount > 0 && (
            <span className='absolute top-0 right-0 bg-red-500 text-white rounded-full px-2 text-xs'>
              {alertsCount}
            </span>
          )}
        </NavLink>
      </ul>

      <div className='flex items-center gap-4'>
        {token && userData ? (
          <div className='flex items-center gap-2 cursor-pointer group relative'>
            <img className='w-8 rounded-full' src={userData.image} alt="User Profile" />
            <img className='w-2.5' src={assets.dropdown_icon} alt="Dropdown" />
            <div className='absolute top-0 right-0 pt-14 text-base font-medium text-gray-600 z-20 hidden group-hover:block'>
              <div className='min-w-48 bg-gray-50 rounded flex flex-col gap-4 p-4'>
                <p onClick={() => navigate('/my-profile')} className='hover:text-black cursor-pointer'>My Profile</p>
                <p onClick={() => navigate('/my-appointments')} className='hover:text-black cursor-pointer'>My Appointments</p>
                <p onClick={logout} className='hover:text-black cursor-pointer'>Logout</p>
              </div>
            </div>
          </div>
        ) : (
          <button onClick={() => navigate('/login')} className='bg-primary text-white px-8 py-3 rounded-full font-light hidden md:block'>
            Create account
          </button>
        )}
        <img onClick={() => setShowMenu(true)} className='w-6 md:hidden' src={assets.menu_icon} alt="Menu" />

        {/* ---- Mobile Menu ---- */}
        <div className={`md:hidden ${showMenu ? 'fixed w-full' : 'h-0 w-0'} right-0 top-0 bottom-0 z-20 overflow-hidden bg-white transition-all`}>
          <div className='flex items-center justify-between px-5 py-6'>
            <img src={assets.logo} className='w-36' alt="Logo" />
            <img onClick={() => setShowMenu(false)} src={assets.cross_icon} className='w-7' alt="Close Menu" />
          </div>
          <ul className='flex flex-col items-center gap-2 mt-5 px-5 text-lg font-medium'>
            <NavLink onClick={() => setShowMenu(false)} to='/'><p className='px-4 py-2 rounded-full'>HOME</p></NavLink>
            <NavLink onClick={() => setShowMenu(false)} to='/doctors'><p className='px-4 py-2 rounded-full'>ALL Hospitals</p></NavLink>
            <NavLink onClick={() => setShowMenu(false)} to='/about'><p className='px-4 py-2 rounded-full'>ABOUT</p></NavLink>
            <NavLink onClick={() => setShowMenu(false)} to='/contact'><p className='px-4 py-2 rounded-full'>CONTACT</p></NavLink>
            <NavLink onClick={() => setShowMenu(false)} to='/alerts'><p className='px-4 py-2 rounded-full'>ALERTS{alertsCount > 0 ? ` (${alertsCount})` : ''}</p></NavLink>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
