export type ThreadAuthor = "artist" | "booking";

export type ThreadMessage = {
  author: ThreadAuthor;
  body: string;
  createdAt: string;
};

type ParsedThread = {
  initialMessage: string | null;
  messages: ThreadMessage[];
};

const THREAD_MARKER = "\n\n---BOOKING_THREAD_V1---\n";

function sanitizeBody(value: string) {
  return value.trim();
}

function toValidDate(value: string | undefined) {
  if (!value) return new Date().toISOString();
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return new Date().toISOString();
  return date.toISOString();
}

function sanitizeMessages(values: unknown): ThreadMessage[] {
  if (!Array.isArray(values)) return [];

  return values
    .filter((item) => typeof item === "object" && item !== null)
    .map((item) => {
      const author = (item as { author?: string }).author;
      const body = (item as { body?: string }).body;
      const createdAt = (item as { createdAt?: string }).createdAt;

      if ((author !== "artist" && author !== "booking") || typeof body !== "string") {
        return null;
      }

      const trimmedBody = sanitizeBody(body);
      if (!trimmedBody) {
        return null;
      }

      return {
        author,
        body: trimmedBody,
        createdAt: toValidDate(createdAt),
      } as ThreadMessage;
    })
    .filter((item): item is ThreadMessage => Boolean(item));
}

export function parseCandidatureThread(rawMessage: string | null | undefined): ParsedThread {
  if (!rawMessage) {
    return { initialMessage: null, messages: [] };
  }

  const markerIndex = rawMessage.indexOf(THREAD_MARKER);
  if (markerIndex === -1) {
    const initial = rawMessage.trim();
    return {
      initialMessage: initial || null,
      messages: initial
        ? [
            {
              author: "artist",
              body: initial,
              createdAt: new Date().toISOString(),
            },
          ]
        : [],
    };
  }

  const initialMessage = rawMessage.slice(0, markerIndex).trim() || null;
  const rawJson = rawMessage.slice(markerIndex + THREAD_MARKER.length).trim();

  try {
    const parsed = JSON.parse(rawJson) as unknown;
    const messages = sanitizeMessages(parsed);
    return { initialMessage, messages };
  } catch {
    return {
      initialMessage: rawMessage.trim() || null,
      messages: rawMessage.trim()
        ? [
            {
              author: "artist",
              body: rawMessage.trim(),
              createdAt: new Date().toISOString(),
            },
          ]
        : [],
    };
  }
}

export function encodeInitialThread(initialMessage: string | null | undefined) {
  const initial = initialMessage?.trim() || "";
  if (!initial) {
    return null;
  }

  const messages: ThreadMessage[] = [
    {
      author: "artist",
      body: initial,
      createdAt: new Date().toISOString(),
    },
  ];

  return `${initial}${THREAD_MARKER}${JSON.stringify(messages)}`;
}

export function appendThreadMessage(
  rawMessage: string | null | undefined,
  author: ThreadAuthor,
  body: string
) {
  const trimmedBody = sanitizeBody(body);
  if (!trimmedBody) {
    return rawMessage || null;
  }

  const parsed = parseCandidatureThread(rawMessage);
  const nextMessages = [
    ...parsed.messages,
    {
      author,
      body: trimmedBody,
      createdAt: new Date().toISOString(),
    },
  ];

  const initial = parsed.initialMessage || "";
  return `${initial}${THREAD_MARKER}${JSON.stringify(nextMessages)}`;
}
