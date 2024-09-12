'use client';
import React from 'react';
import Homepage from './homepage/page';
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