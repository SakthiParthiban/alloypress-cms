const PAYLOAD_API_URL =
  process.env.PAYLOAD_API_URL ||
  "http://localhost:3000/api";

type PayloadFetchOptions = RequestInit & {
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
};

export async function payloadFetch<T>(
  path: string,
  options?: PayloadFetchOptions
): Promise<T | null> {
  try {
    const response = await fetch(
      `${PAYLOAD_API_URL}${path}`,
      {
        ...options,
        next: {
          revalidate: 60,
          ...options?.next,
        },
      }
    );

    if (!response.ok) {
      console.error(
        `Payload API error: ${response.status} ${response.statusText} - ${path}`
      );

      return null;
    }

    return response.json();
  } catch (error) {
    console.error(
      `Payload API request failed: ${path}`,
      error
    );

    return null;
  }
}

export { PAYLOAD_API_URL };