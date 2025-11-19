"use client";

import Spinner from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { SignInButton, useAuth, UserButton } from "@clerk/nextjs";
import { Menu, User, MapPin, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAiSheet } from "@/modules/ai/hooks/use-ai-sheet";

const Navbar = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const { onOpen } = useAiSheet();

  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: "Movies", path: "/movies" },
    { name: "Events", path: "/events" },
    { name: "Sports", path: "/sports" },
  ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image src={"/logo.png"} alt="logo" height={40} width={90} />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                className={cn(
                  "relative inline-block transition-all hover:text-primary hover-underline-animation text-sm lg:text-base",
                  pathname === item.path && "text-primary link-active"
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
            <div className="hidden lg:flex items-center space-x-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">Mumbai</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="cursor-pointer border border-primary/20 hover:border-primary/40 hover:bg-primary/5 rounded-lg p-2"
              onClick={() => onOpen("")}
            >
              <Sparkles className="w-4 h-4 text-primary" />
            </Button>
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
            <SheetContent side="right" className="w-[280px] sm:w-[300px]">
              <div className="flex flex-col space-y-4 mt-8 px-2">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.path}
                    className={cn(
                      "text-base font-medium py-2 px-3 rounded-md transition-colors",
                      pathname === item.path
                        ? "text-primary bg-primary/10"
                        : "text-gray-700 hover:text-primary hover:bg-primary/5"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                <Button
                  variant="ghost"
                  className="w-full justify-start text-base font-medium text-gray-700 hover:text-primary transition-colors border border-primary/20 hover:border-primary/40 hover:bg-primary/5 rounded-lg p-3 mt-2"
                  onClick={() => {
                    onOpen("");
                    setIsOpen(false);
                  }}
                >
                  <Sparkles className="w-5 h-5 text-primary mr-2" />
                  <span>AI Assistant</span>
                </Button>
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex items-center justify-center space-x-2 text-gray-600 mb-4 px-3">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">Mumbai</span>
                  </div>
                  <div className="px-3">
                    {!isLoaded && (
                      <div className="flex justify-center">
                        <Spinner />
                      </div>
                    )}
                    {isLoaded && !isSignedIn && (
                      <SignInButton mode="modal">
                        <Button className="w-full">
                          <User className="w-4 h-4 mr-2" />
                          Sign In
                        </Button>
                      </SignInButton>
                    )}

                    {isLoaded && isSignedIn && (
                      <div className="flex justify-center">
                        <UserButton />
                      </div>
                    )}
                  </div>
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
