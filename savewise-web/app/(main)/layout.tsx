import Navbar from "@/components/Navbar/Navbar";
import SideNav from "@/components/SideNav/SideNav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <Navbar />
      <div className="flex">
        <SideNav />
        <div className="w-[calc(100%-80px)] p-4">{children}</div>
      </div>
    </div>
  );
}
