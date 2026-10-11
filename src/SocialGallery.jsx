export default function SocialGallery({ items, filters, openMedia }) {
  const reducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches

  const preview = (event) => {
    if (reducedMotion()) return
    event.currentTarget
      .querySelector("video")
      ?.play()
      .catch(() => {})
  }

  const pause = (event) => {
    const card = event.currentTarget
    if (
      (event.type === "mouseleave" && card.contains(document.activeElement)) ||
      (event.type === "blur" && card.matches(":hover"))
    )
      return
    card.querySelector("video")?.pause()
  }

  return (
    <section id="social" className="social-gallery">
      <header className="social-heading">
        <p className="social-eyebrow">Selected posts & motion</p>
        <h2>Social Media</h2>
        <div className="social-filters" aria-label="Filter social media">
          {filters.map((filter) => (
            <button
              key={filter.label}
              type="button"
              aria-pressed={filter.selected}
              onClick={filter.pick}
            >
              {filter.label} <span>({filter.count})</span>
            </button>
          ))}
        </div>
      </header>

      <div className="social-grid">
        {items.map((item, index) => {
          const type =
            item.kind === "video"
              ? "Video"
              : item.kind === "gif"
                ? "Loop"
                : "Post"
          const number = String(index + 1).padStart(2, "0")

          return (
            <button
              key={item.src}
              type="button"
              className="social-card"
              hidden={item.disp === "none"}
              data-social-card="1"
              data-src={item.src}
              data-kind={item.kind}
              aria-label={`Open ${type.toLowerCase()} ${number} in full view`}
              onClick={openMedia}
              onMouseEnter={preview}
              onMouseLeave={pause}
              onFocus={preview}
              onBlur={pause}
            >
              <span className="social-artwork">
                {item.isVideo ? (
                  <video
                    data-preview="1"
                    src={item.src}
                    muted
                    loop
                    playsInline
                    preload="none"
                  />
                ) : item.kind === "gif" ? (
                  <span
                    className="social-loop"
                    ref={item.ref}
                    style={{ backgroundImage: item.bg }}
                  />
                ) : (
                  <img
                    src={item.src}
                    alt={`Social media post ${number}`}
                    loading="lazy"
                  />
                )}
                <span className="social-open" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    {item.kind === "post" ? (
                      <path d="M7 17 17 7M7 7h10v10" />
                    ) : (
                      <path d="m9 5 11 7-11 7Z" />
                    )}
                  </svg>
                </span>
              </span>
              <span className="social-caption">
                <span>({number})</span>
                <span>{type}</span>
              </span>
            </button>
          )
        })}
      </div>

      <footer className="social-footer">
        <span>Click to view · Hover for motion</span>
        <span>03 / 07</span>
      </footer>
    </section>
  )
}
