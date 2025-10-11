import Link from "next/link";
import Image from "next/image";
export default function Branding() {
  return (
    <Link href="/" className="flex items-center space-x-2 text-orange-500">
      <Image src="/branding.svg" alt="Branding" className="h-7" width={28} height={28}/>
      <span className="font-bold text-xl md:text-2xl">Gourmet Bytes</span>
    </Link>
  );
}
