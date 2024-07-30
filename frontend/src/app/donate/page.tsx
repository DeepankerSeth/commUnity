'use client';

import { useState, FormEvent } from 'react';
import Link from "next/link"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import Footer from "@/components/Footer"
import { searchNonprofits, getNonprofitDetails, generateDonateLink } from '@/lib/donationAPI';
import { Nonprofit, NonprofitDetails, DonateLinkRequest } from '@/types/charity';

export default function Donate() {
  const [searchTerm, setSearchTerm] = useState('');
  const [nonprofits, setNonprofits] = useState<Nonprofit[]>([]);
  const [selectedNonprofit, setSelectedNonprofit] = useState<NonprofitDetails | null>(null);
  const [amount, setAmount] = useState('');
  const [donateLink, setDonateLink] = useState('');

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    console.log('Search term:', searchTerm); // Log the search term
    try {
      const results = await searchNonprofits(searchTerm);
      console.log('Search results:', results); // Log the search results
      setNonprofits(results.nonprofits);
    } catch (error) {
      console.error('Error searching nonprofits:', error);
    }
  };

  const handleNonprofitSelect = async (id: string) => {
    try {
      const details = await getNonprofitDetails(id);
      setSelectedNonprofit(details);
    } catch (error) {
      console.error('Error fetching nonprofit details:', error);
    }
  };

  const handleDonate = async () => {
    if (!selectedNonprofit) return;

    const donateData: DonateLinkRequest = {
      identifier: selectedNonprofit.id,
      amount: parseFloat(amount),
    };

    try {
      const result = await generateDonateLink(donateData);
      setDonateLink(result.donateLink);
    } catch (error) {
      console.error('Error generating donate link:', error);
    }
  };

  return (
    <div className="flex flex-col min-h-[100dvh]">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b">
        <Link href="/" className="flex items-center justify-center" prefetch={false}>
          commUnity
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="/monitor" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Monitor
          </Link>
          <Link href="/predictions" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Predictions
          </Link>
          <Link href="/evacuation" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Evacuation
          </Link>
        </nav>
      </header>
      <main className="flex-1 grid gap-12 px-4 md:px-6 py-12 md:py-24">
        <section className="grid gap-6 md:grid-cols-[1fr_1fr] md:gap-12">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Find the Right Charity for You
            </h1>
            <p className="max-w-[600px] text-muted-foreground md:text-xl">
              Tell us your interests, location, and donation amount, and we will recommend the best charities for your needs.
            </p>
            <form onSubmit={handleSearch} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="search">Search Charities</Label>
                <Input
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Enter charity name or keyword"
                />
              </div>
              <Button type="submit">Search</Button>
            </form>
          </div>
          <div className="space-y-4">
            {nonprofits.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Search Results</h2>
                <ul>
                  {nonprofits.map((nonprofit) => (
                    <li key={nonprofit.id} className="mb-2">
                      <Button variant="link" onClick={() => handleNonprofitSelect(nonprofit.id)}>
                        {nonprofit.name}
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {selectedNonprofit && (
              <Card>
                <CardHeader>
                  <CardTitle>{selectedNonprofit.name}</CardTitle>
                  <CardDescription>{selectedNonprofit.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="amount">Donation Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Enter amount"
                      />
                    </div>
                    <Button onClick={handleDonate}>Donate</Button>
                  </div>
                  {donateLink && (
                    <div className="mt-4">
                      <a href={donateLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        Click here to complete your donation
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}