import Navbar from "@/components/Navbar/Navbar";
import SideNav from "@/components/SideNav/SideNav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col ">
      <Navbar />
      <div className="flex">
        <SideNav />
        <div
          className="w-[calc(100%-80px)] p-4 bg-gray-300"
          style={{ background: "#f8f9fa", margin: "60px 0px 0px 80px" }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
