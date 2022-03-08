import React from "react";
import ukraine from "../../images/ukraine.svg";

const Footer = () => (
  <div className="w-full flex md:justify-center justify-between items-center flex-col p-4 gradient-bg-footer">
    <div className="w-full flex sm:flex-row flex-col justify-center items-center my-4">
      <div className="flex flex-row flex-1 justify-center items-center flex-wrap sm:mt-0 mt-5 w-full">
        <p className="text-white text-sm text-center">Support democracy, stand with</p>
        <img src={ukraine} alt="ukraine" className="pl-2" style={{width: "2rem"}} />
      </div>
    </div>

    <div className="sm:w-[90%] w-full h-[0.25px] bg-gray-400 mt-5 " />

    <div className="sm:w-[90%] w-full flex justify-center items-center mt-3">
      <p className="text-white text-base text-center mx-2">Crypto &copy; {new Date().getFullYear()}</p>
      <span style={{color: "#fff"}} >|</span>
      <p className="text-white text-base text-center mx-2">All rights reserved</p>
    </div>
  </div>
);

export default Footer;