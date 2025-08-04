'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function RegisterForm() {
  const { register } = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]     = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const result = await register(username, email, password);
      if (result?.requiresEmailConfirmation) {
        setSuccess('✅ Registrierung erfolgreich. Bitte bestätige deine E‑Mail über den Link, den wir dir geschickt haben.');
      } else {
        setSuccess('✅ Registrierung erfolgreich.');
      }
    } catch (err) {
      setError('Registrierung fehlgeschlagen. Vielleicht existiert die E‑Mail schon.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      <Input
        type="text"
        placeholder="Benutzername"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <Input
        type="email"
        placeholder="E‑Mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Input
        type="password"
        placeholder="Passwort"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      {success && <p className="text-green-600 text-sm">{success}</p>}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Wird gesendet…' : 'Registrieren'}
      </Button>
    </form>
  );
}
