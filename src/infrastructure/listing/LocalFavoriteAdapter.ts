import * as SecureStore from 'expo-secure-store';

const BASE_FAVORITES_KEY = 'cerca_favorites_ids';
const SESSION_KEY = 'user_session_tokens';

async function getFavoritesKey(): Promise<string> {
  try {
    const rawSession = await SecureStore.getItemAsync(SESSION_KEY);
    if (rawSession) {
      const session = JSON.parse(rawSession);
      const userId = session?.user?.id;
      if (userId) {
        return `${BASE_FAVORITES_KEY}_${userId}`;
      }
    }
  } catch (error) {
    console.error('Error fetching user session for favorites isolation:', error);
  }
  return BASE_FAVORITES_KEY;
}

export async function getLocalFavorites(): Promise<string[]> {
  try {
    const key = await getFavoritesKey();
    const val = await SecureStore.getItemAsync(key);
    return val ? JSON.parse(val) : [];
  } catch (error) {
    console.error('Error reading favorites from SecureStore:', error);
    return [];
  }
}

export async function toggleLocalFavorite(id: string): Promise<string[]> {
  try {
    const key = await getFavoritesKey();
    const favorites = await getLocalFavorites();
    let next: string[];
    if (favorites.includes(id)) {
      next = favorites.filter((favId) => favId !== id);
    } else {
      next = [...favorites, id];
    }
    await SecureStore.setItemAsync(key, JSON.stringify(next));
    return next;
  } catch (error) {
    console.error('Error toggling favorite in SecureStore:', error);
    return [];
  }
}
