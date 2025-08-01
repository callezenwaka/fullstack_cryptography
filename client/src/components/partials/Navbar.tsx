import { useState } from "react";
// import logo from "../../assets/images/logo.svg";
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

const Navbar = () => {

  const [isAuthenticated, setIsAuthenticated] = useState(true);

  return (
    <nav className="w-full flex md:justify-between justify-between items-center p-4 navbar-space-between">
      <div className="md:flex-[0.5] flex-initial justify-center items-center text-[#053d22]">
        <ShieldCheckIcon className="w-16 h-16 cursor-pointer logo" />
        {/* <img src={logo} alt="logo" title="Crypto Xchange" className="h-16 w-16 cursor-pointer logo" /> */}
      </div>
      <ul className="text-white md:flex list-none flex-row justify-between items-center flex-initial">
        {!isAuthenticated && (
          <li>
            <button 
              type="button"
              onClick={() => setIsAuthenticated(true)}
              className="bg-[#053d22] py-2 px-7 mx-4 rounded-full cursor-pointer hover:bg-[#224031] text-white text-base font-semibold"
            >
              Login
            </button>
          </li>
        )}
        
        {isAuthenticated && (
          <li>
            <button 
              type="button"
              onClick={() => setIsAuthenticated(false)}
              className="bg-[#053d22] py-2 px-7 mx-4 rounded-full cursor-pointer hover:bg-[#224031] text-white text-base font-semibold"
            >
              Logout
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;