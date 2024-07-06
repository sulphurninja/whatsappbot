import Image from "next/image";
import { Inter } from "next/font/google";
import AddNumberForm from "@/components/AddNumberForm";
import RemoveNumberForm from "@/components/RemoveNumberForm";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <div className="mt-12">
      <h1 className="text-center font-bold text-xl">Manage Authorized Phone Numbers</h1>
      <AddNumberForm />
      <RemoveNumberForm />
    </div>
  );
}
