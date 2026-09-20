const PAYLOAD_API_URL =
  process.env.PAYLOAD_API_URL ||
  "http://localhost:3001/api";

type PayloadFetchOptions = RequestInit & {
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
};

const DEFAULT_REVALIDATE = 300;

export async function payloadFetch<T>(
  path: string,
  options: PayloadFetchOptions = {},
): Promise<T | null> {
  try {
    const {
      next,
      cache,
      ...requestOptions
    } = options;

    const fetchOptions: RequestInit & {
      next?: {
        revalidate?: number | false;
        tags?: string[];
      };
    } = {
      ...requestOptions,
    };

    if (cache) {
      fetchOptions.cache = cache;
    }

    if (cache !== "no-store") {
      fetchOptions.next = {
        revalidate: DEFAULT_REVALIDATE,
        ...next,
      };
    } else if (next?.tags?.length) {
      fetchOptions.next = {
        tags: next.tags,
      };
    }

    const response = await fetch(
      `${PAYLOAD_API_URL}${path}`,
      fetchOptions,
    );

    if (!response.ok) {
      console.error(
        `[Payload] ${response.status} ${response.statusText} - ${path}`,
      );

      return null;
    }

    return (await response.json()) as T;
  } catch (error) {
    console.error(
      `[Payload] Request failed - ${path}`,
      error,
    );

    return null;
  }
}

export { PAYLOAD_API_URL };