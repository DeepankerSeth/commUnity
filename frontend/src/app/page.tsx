import Image from "next/image";
import Homepage from "./Homepage/page";
import Link from "next/link";
import Layout from "./layout";

export default function Page() {
  return (
    <div>
      <Layout>
        <Homepage />
      </Layout>
    </div>
  );
}