import { Footer } from "flowbite-react";
import type { FC, PropsWithChildren} from "react";
import { useState, useEffect } from "react";
import Navbar from "./navbar";
import Sidebar from "./sidebar";
import { FaDiscord, FaGithub, FaTwitter } from "react-icons/fa";

interface NavbarSidebarLayoutProps {
  isFooter?: boolean;
}

const NavbarSidebarLayout: FC<PropsWithChildren<NavbarSidebarLayoutProps>> = function ({ children, isFooter = true }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);

  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth > 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <>
      <Navbar onToggleSidebar={toggleSidebar} />
      <div className="flex items-start pt-16">
        <Sidebar isSidebarOpen={isSidebarOpen} />
          <MainContent isFooter={isFooter}>{children}</MainContent>
        </div>
      </>
    );
  };

const MainContent: FC<PropsWithChildren<NavbarSidebarLayoutProps>> = function ({
  children,
  isFooter,
}) {
  return (
    <main className="relative h-full w-full overflow-y-auto bg-gray-50 dark:bg-gray-900 lg:ml-48">
      {children}
      {isFooter && (
        <div className="mx-4 mt-4">
          <MainContentFooter />
        </div>
      )}
    </main>
  );
};

const MainContentFooter: FC = function () {
  return (
    <>
    <div className="m-1">
      <Footer container className="mt-6 gap-6">
        <div className="flex w-full flex-col gap-y-6 lg:flex-row lg:justify-between lg:gap-y-0">
          <Footer.LinkGroup>
            <Footer.Link href=" https://nautilus.sh/" className="mr-3 mb-3 lg:mb-0">
              Nautilus Marketplace
            </Footer.Link>
            <Footer.Link href="https://highforge.io/explore" className="mr-3 mb-3 lg:mb-0">
              High Forge
            </Footer.Link>
            <Footer.Link href="https://kibis.is/" className="mr-3">
              Kibisis Wallet
            </Footer.Link>
          </Footer.LinkGroup>
          <Footer.LinkGroup>
            <div className="flex gap-x-1">
              <Footer.Link
                href="https://discord.gg/voi-network-1055863853633785857"
                className="hover:[&>*]:text-black dark:hover:[&>*]:text-gray-300"
              >
                <FaDiscord className="text-lg" />
              </Footer.Link>
              <Footer.Link
                href="https://twitter.com/Voi_Net"
                className="hover:[&>*]:text-black dark:hover:[&>*]:text-gray-300"
              >
                <FaTwitter className="text-lg" />
              </Footer.Link>
              <Footer.Link
                href="https://github.com/VoiNetwork"
                className="hover:[&>*]:text-black dark:hover:[&>*]:text-gray-300"
              >
                <FaGithub className="text-lg" />
              </Footer.Link>
            </div>
          </Footer.LinkGroup>
        </div>
      </Footer>
      </div>
      <p className="my-8 text-center text-sm text-gray-500 dark:text-gray-300">
        &copy; 2024-2025 nft-games.boeieruurd.com
      </p>
    </>
  );
};

export default NavbarSidebarLayout;