import Image from "next/image";
import { evacuation } from "../../pages/evacuation"
import Link from "next/link";
import Layout from "./evacuation.layout";

const home = evacuation();

export default function Page() {
  return (
    <div>
      <Layout>
        {home}
      </Layout>
    </div>
  );
}
