import Image from "next/image";
import  homepage from "./homepage/page";
import Link from "next/link";
import Layout from "./layout";

const home = homepage();

export default function Page() {
  return (
    <div>
      <Layout>
        {home}
      </Layout>
    </div>
  );
}
