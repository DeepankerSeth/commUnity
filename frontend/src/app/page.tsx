'use client';

import Homepage from "./Homepage/page";
import Providers from "@/components/Providers";
import Layout from "@/components/Layout";
import Header from "@/components/Header";

export default function Page() {
  return (
    <Providers>
      <Layout>
        <Header />
        <Homepage />
      </Layout>
    </Providers>
  );
}