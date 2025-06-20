import { Link, useLocation } from "react-router";
import { useState, useEffect, useRef } from "react";
import useAuthUser from "../hooks/useAuthUser";
import useLogout from "../hooks/useLogout";
import useNotificationCount from "../hooks/useNotificationCount";
import {
  BellIcon,
  LogOutIcon,
  MenuIcon,
  ShipWheelIcon,
  XIcon,
  PencilIcon,
  HomeIcon,
} from "lucide-react";
import ThemeSelector from "./ThemeSelector";

const Navbar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const { logoutMutation } = useLogout();
  const { totalNotifications } = useNotificationCount();
  const [showSidebar, setShowSidebar] = useState(false);
  const sidebarRef = useRef(null);

  const currentPath = location.pathname;

  const handleNavClick = () => {
    setShowSidebar(false);
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setShowSidebar(false);
      }
    };

    if (showSidebar) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSidebar]);

  return (
    <>
      <nav className="bg-base-200 border-b border-base-300 sticky top-0 z-30 h-16 flex items-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex items-center justify-between w-full">
            {/* Left: Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2.5">
                <ShipWheelIcon className="size-9 text-primary" />
                <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
                  Chatty
                </span>
              </Link>
            </div>

            {/* Right: Nav actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="lg:hidden">
                <button
                  className="btn btn-ghost btn-circle"
                  onClick={() => setShowSidebar(!showSidebar)}
                >
                  {showSidebar ? (
                    <XIcon className="h-6 w-6 text-base-content opacity-70" />
                  ) : (
                    <MenuIcon className="h-6 w-6 text-base-content opacity-70" />
                  )}
                </button>
              </div>

              <div className="lg:hidden">
                <ThemeSelector />
              </div>

              <div className="hidden lg:flex items-center gap-2 sm:gap-3">
                <div className="relative">
                  <Link to="/notifications">
                    <button className="btn btn-ghost btn-circle">
                      <BellIcon className="h-6 w-6 text-base-content opacity-70" />
                      {totalNotifications > 0 && (
                        <span className="badge badge-sm badge-primary absolute -top-1 -right-1">
                          {totalNotifications}
                        </span>
                      )}
                    </button>
                  </Link>
                </div>
                <ThemeSelector />
                <Link to="/profile">
                  <div className="avatar cursor-pointer">
                    <div className="w-9 rounded-full">
                      <img
                        src={authUser?.profilePic}
                        alt="User Avatar"
                        rel="noreferrer"
                      />
                    </div>
                  </div>
                </Link>
                <button
                  className="btn btn-ghost btn-circle"
                  onClick={logoutMutation}
                >
                  <LogOutIcon className="h-6 w-6 text-base-content opacity-70" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar Dropdown for Small Screens */}
      {showSidebar && (
        <div
          ref={sidebarRef}
          className="lg:hidden fixed top-16 left-0 w-full z-50 bg-base-200 border-t border-base-300 shadow-md max-h-[calc(100vh-4rem)] overflow-auto"
        >
          <div className="w-full flex flex-col p-4">
            <Link
              to="/"
              onClick={handleNavClick}
              className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
                currentPath === "/" ? "btn-active" : ""
              }`}
            >
              <HomeIcon className="size-5 text-base-content opacity-70" />
              Home
            </Link>
            <Link
              to="/notifications"
              onClick={handleNavClick}
              className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case relative ${
                currentPath === "/notifications" ? "btn-active" : ""
              }`}
            >
              <BellIcon className="size-5 text-base-content opacity-70" />
              Notifications
              {totalNotifications > 0 && (
                <span className="badge badge-sm badge-primary absolute right-3 top-1">
                  {totalNotifications}
                </span>
              )}
            </Link>
            <Link
              to="/editProfile"
              onClick={handleNavClick}
              className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
                currentPath === "/editProfile" ? "btn-active" : ""
              }`}
            >
              <PencilIcon className="size-5 text-base-content opacity-70" />
              Edit Profile
            </Link>
            <Link
              to="/profile"
              onClick={handleNavClick}
              className="flex items-center gap-3 mt-4"
            >
              <div className="avatar">
                <div className="w-10 rounded-full">
                  <img src={authUser?.profilePic} alt="User Avatar" />
                </div>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">{authUser?.fullName}</p>
                <p className="text-xs text-success flex items-center gap-1">
                  <span className="size-2 rounded-full bg-success inline-block" />
                  Online
                </p>
              </div>
              <button
                className="btn btn-ghost btn-circle"
                onClick={logoutMutation}
              >
                <LogOutIcon className="h-6 w-6 text-base-content opacity-70" />
              </button>
            </Link>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
