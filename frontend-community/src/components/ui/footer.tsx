import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
    return (
    
    <footer style={{ position: "relative", bottom: 0, width:"100%" }} className="bg-muted py-6 px-6 border-t">
      <div className="container mx-auto max-w-5xl flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          &copy; 2024 commUnity. All rights reserved.
          </p>
        <nav className="flex items-center gap-4">
            <Link href="#" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Privacy
            </Link>
            <Link href="#" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Terms
            </Link>
            <Link href="/contact" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Contact
            </Link>
        </nav>
      </div>
    </footer>
    );
};

const footerStyle: React.CSSProperties = {
    backgroundColor: '#333',
    color: '#fff',
    padding: '20px 0',
  };
  
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-around',
    maxWidth: '1200px',
    margin: '0 auto',
  };
  
  const sectionStyle: React.CSSProperties = {
    flex: '1',
    padding: '0 20px',
  };
  
  const listStyle: React.CSSProperties = {
    listStyle: 'none',
    padding: 0,
  };
  
  const copyrightStyle: React.CSSProperties = {
    textAlign: 'center',
    marginTop: '20px',
  };
  
  export default Footer;