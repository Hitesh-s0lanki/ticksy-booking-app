"use client";

import Spinner from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { SignInButton, useAuth, UserButton } from "@clerk/nextjs";
import { Menu, User, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const Navbar = () => {
  const { isLoaded, isSignedIn } = useAuth();

  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: "Movies", path: "/movies" },
    { name: "Events", path: "/events" },
    { name: "Sports", path: "/sports" },
  ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="px-20">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image src={"/logo.png"} alt="logo" height={40} width={90} />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                className={cn(
                  "relative inline-block transition-all hover:text-primary hover-underline-animation",
                  pathname === item.path && "text-primary link-active"
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">Mumbai</span>
            </div>
            {!isLoaded && <Spinner />}
            {isLoaded && !isSignedIn && (
              <SignInButton mode="modal">
                <Button size="sm" className="text-xs cursor-pointer">
                  <User className="w-4 h-4 mr-1" />
                  Sign In
                </Button>
              </SignInButton>
            )}

            {isLoaded && isSignedIn && <UserButton />}
          </div>

          {/* Mobile Menu Trigger */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="sm">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <div className="flex flex-col space-y-4 mt-8">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.path}
                    className="text-lg font-medium text-gray-700 hover:text-red-600 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="border-t pt-4">
                  <div className="flex items-center space-x-2 text-gray-600 mb-4">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">Mumbai</span>
                  </div>
                  {!isLoaded && <Spinner />}
                  {isLoaded && !isSignedIn && (
                    <SignInButton mode="modal">
                      <Button className="w-full">
                        <User className="w-4 h-4 mr-2" />
                        Sign In
                      </Button>
                    </SignInButton>
                  )}

                  {isLoaded && isSignedIn && <UserButton />}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
