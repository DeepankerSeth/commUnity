import { ManagementClient } from 'auth0';

const management = new ManagementClient({
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_MANAGEMENT_CLIENT_ID,
  clientSecret: process.env.AUTH0_MANAGEMENT_CLIENT_SECRET,
  scope: 'read:users update:users'
});

export async function getUserFromAuth0(auth0Id) {
  try {
    const user = await management.getUser({ id: auth0Id });
    return user;
  } catch (error) {
    console.error('Error fetching user from Auth0:', error);
    return null;
  }
}

export async function getUsersFromAuth0(query) {
  try {
    const users = await management.getUsers(query);
    return users;
  } catch (error) {
    console.error('Error fetching users from Auth0:', error);
    return [];
  }
}

export async function updateUserInAuth0(auth0Id, userData) {
  try {
    const updatedUser = await management.updateUser({ id: auth0Id }, userData);
    return updatedUser;
  } catch (error) {
    console.error('Error updating user in Auth0:', error);
    return null;
  }
}