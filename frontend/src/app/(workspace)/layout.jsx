import Navbar from '@/components/Navbar';

export default function WorkspaceLayout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
}
