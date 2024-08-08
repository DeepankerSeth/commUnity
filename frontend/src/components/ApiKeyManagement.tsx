import React, { useState, useEffect } from 'react';
import { getApiKey, revokeApiKey, regenerateApiKey } from '@/lib/disasterAPI';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ApiKeyManagement() {
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    fetchApiKey();
  }, []);

  const fetchApiKey = async () => {
    try {
      const { key } = await getApiKey();
      setApiKey(key);
    } catch (error) {
      console.error('Error fetching API key:', error);
    }
  };

  const handleRevokeKey = async () => {
    try {
      await revokeApiKey();
      setApiKey(null);
    } catch (error) {
      console.error('Error revoking API key:', error);
    }
  };

  const handleRegenerateKey = async () => {
    try {
      const { key } = await regenerateApiKey();
      setApiKey(key);
    } catch (error) {
      console.error('Error regenerating API key:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Key Management</CardTitle>
      </CardHeader>
      <CardContent>
        {apiKey ? (
          <>
            <p className="mb-4">Your API Key: {apiKey}</p>
            <Button onClick={handleRevokeKey} className="mr-2">Revoke Key</Button>
            <Button onClick={handleRegenerateKey}>Regenerate Key</Button>
          </>
        ) : (
          <Button onClick={handleRegenerateKey}>Generate API Key</Button>
        )}
      </CardContent>
    </Card>
  );
}
