import Image from "next/image";
import { contact } from "../../pages/contact"
import Link from "next/link";
import Layout from "./contact.layout";

const home = contact();

export default function Page() {
  return (
    <div>
      <Layout>
        {home}
      </Layout>
    </div>
  );
}
