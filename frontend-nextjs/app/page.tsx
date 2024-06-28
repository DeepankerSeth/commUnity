import Image from "next/image";
import { homepage } from "../components/homepage"

const message = homepage();

export default function Home() {
  return (
    <div>
      {message}
    </div>
  );
}
