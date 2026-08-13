export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
     <nav>
        {/* <Link href="/dashboard" className="mr-4"> */}
          导航
        {/* <Link/> */}
      </nav>
      {children}
    </div>
  );
}