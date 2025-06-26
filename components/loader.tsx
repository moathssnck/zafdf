import { Loader } from "lucide-react";

// components/Loader.js
export default function LoaderApp() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <Loader className="animate-spin" />
    </div>
  );
}