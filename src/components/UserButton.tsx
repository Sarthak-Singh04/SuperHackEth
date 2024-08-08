'use client';

import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal
} from "./ui/dropdown-menu";
import { Check, LogOutIcon, Monitor, Moon, Sun, User as UserIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { usePrivy } from '@privy-io/react-auth';
import Link from "next/link";
import UserAvatar from "./UserAvatar"; // Assuming you have a UserAvatar component

interface UserButtonProps {
  className?: string;
}

function UserButton({ className }: UserButtonProps) {
  const { ready, authenticated, user, logout } = usePrivy();
  const { theme, setTheme } = useTheme();

  if (!ready || !authenticated || !user) return null;

  const userDetails = {
    email: user.email?.address?.trim() ?? null,
    wallet: user.wallet?.address ?? null,
    google: user.google?.email?.trim() ?? null,
    apple: user.apple?.email?.trim() ?? null,
    twitter: user.twitter?.username?.trim() ?? null,
  };

  const linkedAccounts = Object.entries(userDetails).filter(([_, value]) => value);

  const username = user.email?.address.split('@')[0];
  const walletShort = userDetails.wallet

  const copyWalletAddress = () => {
    navigator.clipboard.writeText(userDetails.wallet || "");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={cn("flex-none rounded-full", className)}>
          <UserIcon />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>
          <ul className="space-y-2">
            {linkedAccounts.map(([key, value]) => (
              <li key={key} className="flex items-center">
                <span className="font-bold capitalize">{key}:</span> 
                <span className="ml-2" onClick={key === 'wallet' ? copyWalletAddress : undefined}>
                  {key === 'wallet' ? (
                    <span title={userDetails.wallet || ""} >{walletShort}</span>
                  ) : (
                    value
                  )}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4">Logged in as <span className="font-semibold">{username}</span></p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link href={`/${username}`}>
          <DropdownMenuItem>
            <UserIcon className="mr-2 size-4" />
            Profile
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Monitor className="mr-2 size-4" />
            Theme
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                <Monitor className="mr-2 size-4" />
                System default
                {theme === "system" && <Check className="ml-2 size-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="mr-2 size-4" />
                Light
                {theme === "light" && <Check className="ml-2 size-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="mr-2 size-4" />
                Dark
                {theme === "dark" && <Check className="ml-2 size-4" />}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>
          <LogOutIcon className="mr-2 size-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default UserButton;