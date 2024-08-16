import { useUser } from '@auth0/nextjs-auth0/client';

function Profile() {
  const { user, error, isLoading } = useUser();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;

  return user ? (
    <div>Hello {user.name}!</div>
  ) : (
    <div>Not authenticated</div>
  );
}
