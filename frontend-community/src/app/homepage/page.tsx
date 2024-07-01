import Image from "next/image";
import { homepage } from "../../pages/homepage"
import Link from "next/link";
import Layout from "./homepage.layout";

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
