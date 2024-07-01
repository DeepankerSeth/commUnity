import Image from "next/image";
import { predictions } from "../../pages/predictions"
import Link from "next/link";
import Layout from "./layout";

const predict = predictions();

export default function Page() {
  return (
    <div>
      <Layout>
        {predict}
      </Layout>
    </div>
  );
}
