import Image from "next/image";
import { monitor } from "../../pages/monitor"
import Link from "next/link";
import Layout from "./layout";

const home = monitor();

export default function Page() {
  return (
    <div>
      <Layout>
        {home}
      </Layout>
    </div>
  );
}
