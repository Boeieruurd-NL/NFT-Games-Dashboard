import type { FC } from "react";
import { DarkThemeToggle, Navbar } from "flowbite-react";
import { HiMenu } from "react-icons/hi";

interface ExampleNavbarProps {
  onToggleSidebar: () => void;
}

const ExampleNavbar: FC<ExampleNavbarProps> = function ({ onToggleSidebar }) {
  return (
    <Navbar fluid>
      <div className="w-full p-3 lg:px-5 lg:pl-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={onToggleSidebar} className="lg:hidden text-2xl p-2 mr-2">
              <HiMenu />
            </button>
            <Navbar.Brand href="/">
              <img alt="" src="/images/logo.svg" className="mr-3 h-6 sm:h-8" />
              <span className="self-center whitespace-nowrap text-2xl font-semibold dark:text-white">
               NFT Games Tracker
              </span>
            </Navbar.Brand>
          </div>
          <div className="flex items-center gap-3">
            <DarkThemeToggle />
          </div>
        </div>
      </div>
    </Navbar>
  );
};

export default ExampleNavbar;
