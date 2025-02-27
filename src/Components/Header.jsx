import { useNavigate } from "react-router-dom";
import { auth } from "../utils/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState, Suspense, lazy } from "react";
import { addUser, removeUser } from "../utils/userSlice";
import { BG_URL, LOGO, SUPPORTED_LANGUAGES } from "../utils/constent";
import { toggleGptSearchView } from "../utils/gptSlice";
import { changeLanguage } from "../utils/configSlice";

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((store) => store.user);
  const showGptSearch = useSelector((store) => store.gpt.showGptSearch);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [userImageLoaded, setUserImageLoaded] = useState(false);

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        console.log("User signed out successfully");
      })
      .catch((error) => {
        console.error("Sign out error:", error);
        navigate("/error");
      });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const { uid, email, displayName, photoURL } = user;
        dispatch(addUser({ uid, email, displayName, photoURL }));
        navigate("/browse");
      } else {
        dispatch(removeUser());
        navigate("/");
      }
    });

    return () => unsubscribe();
  }, []);

  const handleGPTSearchClick = () => {
    dispatch(toggleGptSearchView());
  };

  const handleLangaugeChange = (e) => {
    dispatch(changeLanguage(e.target.value));
  };

  return (
    <header className="fixed w-full px-4 sm:px-8 py-2 bg-gradient-to-b from-black to-black z-50 flex flex-col md:flex-row justify-between items-center">
      {/* Logo with Lazy Loading */}
      <div className="w-28 sm:w-36 lg:w-44">
        {!logoLoaded && <div className="w-full h-full bg-gray-800 animate-pulse"></div>}
        <img
          className={`w-full ${logoLoaded ? "opacity-100" : "opacity-0 transition-opacity duration-500"}`}
          src={LOGO}
          alt="Netflix logo"
          onLoad={() => setLogoLoaded(true)}
        />
      </div>

      {/* User Section */}
      {user && (
        <div className="flex justify-end items-center space-x-3">
          {/* User Photo with Lazy Loading */}
          {user.photoURL && (
            <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16">
              {!userImageLoaded && <div className="w-full h-full bg-gray-800 animate-pulse rounded-full"></div>}
              <img
                className={`w-full h-full rounded-full ${userImageLoaded ? "opacity-100" : "opacity-0 transition-opacity duration-500"}`}
                src={user.photoURL}
                alt="User Photo"
                onLoad={() => setUserImageLoaded(true)}
              />
            </div>
          )}

          {/* Language Selection */}
          {showGptSearch && (
            <div className="relative">
              <select
                onChange={handleLangaugeChange}
                className="appearance-none p-2 pr-8 bg-gray-900 text-white border border-gray-700 rounded-lg focus:outline-none focus:border-gray-400"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.identifier} value={lang.identifier}>
                    {lang.name}
                  </option>
                ))}
              </select>
              <svg
                className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-white"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}

          {/* GPT Search Toggle Button */}
          <button
            className="font-bold px-3 py-1 sm:px-4 sm:py-2 lg:px-6 lg:py-3 bg-green-500 border border-green-600 rounded-lg hover:bg-green-700"
            onClick={handleGPTSearchClick}
          >
            {showGptSearch ? "Home" : "GPT Search"}
          </button>

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            className="font-bold px-3 py-1 sm:px-4 sm:py-2 lg:px-6 lg:py-3 bg-yellow-500 border border-yellow-600 rounded-lg hover:bg-yellow-700"
          >
            Sign Out
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
