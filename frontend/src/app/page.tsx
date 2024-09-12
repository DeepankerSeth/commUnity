'use client';

import Homepage from "./Homepage/page";
import Layout from "@/components/Layout";
import { Header } from "@/components/Header";

export default function Page() {
  return (
    <Layout>
      <Header />
      <Homepage />
    </Layout>
  );
}