export function JsonLd({ data }: { data: Record<string, unknown> | Array<Record<string, unknown>> }) {
  if (Array.isArray(data)) {
    return (
      <>
        {data.map((entry, index) => (
          <JsonLd key={`${String(entry['@type'] ?? 'schema')}-${index}`} data={entry} />
        ))}
      </>
    )
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  )
}
