import Image from "next/image";
import { donate } from "../../pages/donate"
import Link from "next/link";
import Layout from "./donate.layout";

const home = donate();

export default function Page() {
  return (
    <div>
      <Layout>
        {home}
      </Layout>
    </div>
  );
}
