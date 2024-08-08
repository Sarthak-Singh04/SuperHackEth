import UserButton from "@/components/UserButton";
import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-10 bg-card shadow-sm">
      <div className="mx-auto max-w-[105rem] flex  flex-wrap items-center justify-center gap-5 px-5 py-3">
        <Link href="/" className="text-2xl font-bold text-primary flex justify-center items-center gap-2" >
          <Image
            src="/logo.svg"
            alt="OpenPolitica Logo - Empowering Political Transparency"
            width={50}
            height={50}
          />
          OpenPolitica
        </Link>
        <UserButton className="sm:ms-auto" />
      </div>
    </header>
  );
}