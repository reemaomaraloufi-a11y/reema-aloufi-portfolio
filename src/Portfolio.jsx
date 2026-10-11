import React from "react"
import SocialGallery from "./SocialGallery"

const mobileImageSource = (item) => {
  const match = /url\(["']?([^"')]+)/.exec(item.bg || "")
  return item.src || (match ? match[1] : "")
}

const mobileDescription = (text) =>
  text.replace(/-/g, "\u2011").replace(/\s*—\s*/g, "\u2060—\u2060")

function MobileLivePreview({ site, isClone }) {
  const frameRef = React.useRef(null)
  const [scale, setScale] = React.useState(0.25)

  React.useEffect(() => {
    const frame = frameRef.current
    if (!frame) return undefined
    const updateScale = () => setScale(frame.clientWidth / 1440)
    updateScale()
    const observer = new ResizeObserver(updateScale)
    observer.observe(frame)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="mobile-project-live-preview" ref={frameRef}>
      <iframe
        src={site}
        title={
          isClone
            ? "Obhour Central website preview duplicate"
            : "Live Obhour Central website preview"
        }
        aria-hidden={isClone}
        tabIndex={-1}
        scrolling="no"
        loading="eager"
        allow="autoplay"
        style={{ transform: `scale(${scale})` }}
      />
    </div>
  )
}

function MobileProjectGallery({ items, title }) {
  const [isMobile, setIsMobile] = React.useState(() =>
    typeof window === "undefined"
      ? false
      : window.matchMedia("(max-width: 640px)").matches,
  )
  const [index, setIndex] = React.useState(0)
  const scrollerRef = React.useRef(null)
  const scrollTimer = React.useRef(null)
  const initialScrollFrame = React.useRef(null)
  const count = items.length

  React.useEffect(() => {
    const query = window.matchMedia("(max-width: 640px)")
    const update = () => setIsMobile(query.matches)
    update()
    query.addEventListener("change", update)
    return () => query.removeEventListener("change", update)
  }, [])

  React.useEffect(() => {
    if (!isMobile || !count) return undefined
    initialScrollFrame.current = requestAnimationFrame(() => {
      const scroller = scrollerRef.current
      if (scroller)
        scroller.scrollLeft = count > 1 ? scroller.clientWidth : 0
    })
    return () => {
      cancelAnimationFrame(initialScrollFrame.current)
      clearTimeout(scrollTimer.current)
    }
  }, [isMobile, count])

  if (!isMobile || !count) return null
  const loopingItems =
    count > 1 ? [items[count - 1], ...items, items[0]] : items

  return (
    <div
      className="mobile-project-gallery"
      data-gallery-project={title}
      aria-label={`${title} image gallery`}
    >
      <div
        ref={scrollerRef}
        className="mobile-project-gallery-swipe"
        role="button"
        tabIndex={0}
        aria-label={`Swipe or tap to view the next ${title} image`}
        onClick={() => {
          const scroller = scrollerRef.current
          if (!scroller || count < 2) return
          scroller.scrollTo({
            left: scroller.scrollLeft + scroller.clientWidth,
            behavior: "smooth",
          })
        }}
        onKeyDown={(event) => {
          if (event.key !== "Enter" && event.key !== " ") return
          event.preventDefault()
          const scroller = scrollerRef.current
          if (!scroller || count < 2) return
          scroller.scrollTo({
            left: scroller.scrollLeft + scroller.clientWidth,
            behavior: "smooth",
          })
        }}
        onScroll={(event) => {
          const scroller = event.currentTarget
          clearTimeout(scrollTimer.current)
          scrollTimer.current = setTimeout(() => {
            const width = scroller.clientWidth
            if (!width || count < 2) return
            const page = Math.round(scroller.scrollLeft / width)
            if (page <= 0) {
              scroller.scrollLeft = count * width
              setIndex(count - 1)
            } else if (page >= count + 1) {
              scroller.scrollLeft = width
              setIndex(0)
            } else {
              setIndex(page - 1)
            }
          }, 90)
        }}
      >
        {loopingItems.map((item, itemIndex) => {
          const actualIndex =
            count > 1 ? (itemIndex - 1 + count) % count : itemIndex
          const isClone =
            count > 1 &&
            (itemIndex === 0 || itemIndex === loopingItems.length - 1)
          const isLivePreview = item.site?.includes("obhourcentral.com")
          return (
            <div
              className="mobile-project-gallery-slide"
              key={`${itemIndex}-${mobileImageSource(item)}`}
            >
              {isLivePreview ? (
                <MobileLivePreview site={item.site} isClone={isClone} />
              ) : (
                <img
                  className="mobile-project-gallery-image"
                  src={mobileImageSource(item)}
                  alt={
                    isClone
                      ? ""
                      : `${title}, artwork ${actualIndex + 1} of ${count}`
                  }
                  aria-hidden={isClone}
                  draggable="false"
                  loading="lazy"
                  decoding="async"
                />
              )}
            </div>
          )
        })}
      </div>
      <div className="mobile-gallery-meta">
        <span>Swipe to explore</span>
        <span>
          {String(index + 1).padStart(2, "0")} /{" "}
          {String(count).padStart(2, "0")}
        </span>
      </div>
    </div>
  )
}

function MobileStickerGrid({ stickers, title }) {
  const [active, setActive] = React.useState(null)

  return (
    <div
      className="mobile-sticker-grid"
      data-sticker-project={title}
      aria-label={`${title} illustrations`}
    >
      {stickers.map((sticker, stickerIndex) => (
        <button
          type="button"
          className={active === stickerIndex ? "is-active" : ""}
          aria-label={`Animate ${title} illustration ${stickerIndex + 1}`}
          aria-pressed={active === stickerIndex}
          key={stickerIndex}
          onClick={() =>
            setActive((current) =>
              current === stickerIndex ? null : stickerIndex,
            )
          }
          style={{ backgroundImage: sticker.bg }}
        />
      ))}
    </div>
  )
}

// Adapted from the supplied portfolio export; artwork URLs and design values are unchanged.
export default class Portfolio extends React.Component {
  state = { ai: 0, filter: "all" }
  lbImg = React.createRef()
  media = {
    tall: [
      { kind: "post", bg: "p5-social-media-02" },
      {
        kind: "video",
        src: "assets/video-tashyid.mp4",
      },
      { kind: "post", bg: "social-sama-map" },
      { kind: "gif", bg: "slide-1" },
      { kind: "post", bg: "social-flag" },
      {
        kind: "video",
        src: "assets/video-oc-teaser.mp4",
      },
    ],
    wide: [
      {
        kind: "video",
        src: "assets/video-oc-reveal.mp4",
      },
      {
        kind: "video",
        src: "assets/video-national-day.mp4",
      },
    ],
  }
  rootRef = React.createRef()
  lbRef = React.createRef()
  lbVideo = React.createRef()
  gifRef = React.createRef()
  frames = [1, 2, 3, 4, 5, 6].map((n) => "assets/slide-" + n + ".webp")
  thumbAR = {
    "obhour-posters.jpeg": "16/9",
    "freej-new-box.png": "3/2",
    "p4-digital-speed-01": "960/1200",
    "slide-1": "960/1200",
    "p5-social-media-02": "960/1200",
    "p6-project-6-01": "1200/800",
    "p7-project-7-02": "960/1200",
    "p8-now-or-never-01": "675/1200",
    "og-obhour": "16/10",
  }
  A = (n) =>
    n === "og-obhour"
      ? "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/6e2be11e-9465-4c7a-8c86-cacd3b672882/id-preview-b26c3eb2--17a053b8-6206-41d1-b79c-291f45c1ecee.lovable.app-1780471940273.png"
      : "assets/" + n + (/\.(png|jpe?g)$/.test(n) ? "" : ".webp")
  spots = [
    { x: "13%", y: "4%" },
    { x: "65%", y: "12%" },
    { x: "11%", y: "44%" },
    { x: "67%", y: "50%" },
    { x: "39%", y: "72%" },
    { x: "128%", y: "80%" },
  ]
  data() {
    const A = this.A
    const img = (n, extra) => ({ bg: "url(" + A(n) + ")", ...extra })
    const rots = [-8, 7, -5, 9, -6, 6]
    const sticker = (k, n, ar, l, t, w, hh, fit) => ({
      ...this.spots[k],
      rot: rots[k],
      cw: "25%",
      ar,
      bg:
        "url(" +
        (n.startsWith("shubak-") ? "assets/" + n + ".png" : A(n)) +
        ")",
      l: l + "%",
      t: t + "%",
      w: w + "%",
      hh: hh + "%",
      fit,
    })
    return [
      {
        title: "Obhour Central",
        size: "min(14vw,15vh)",
        cat: "Branding",
        year: "2025",
        tool: "Illustrator & Photoshop",
        desc: "Brand identity for Obhour Central. A modular arch mark paired with a warm, food-led image language, applied across outdoor and print.",
        thumb: "obhour-posters.jpeg",
        items: [
          "obhour-posters.jpeg",
          "obhour-billboard.png",
          "obhour-laptop.png",
        ].map((n) => ({ bg: "url(assets/" + n + ")" })),
        stickers: [],
      },
      {
        title: "Landing Pages",
        size: "min(14vw,15vh)",
        cat: "Web Design",
        year: "2026",
        tool: "Web",
        desc: "Pre-launch landing pages for two Tashyid Urban Development projects in Jeddah and Makkah, each with a registration form to capture early interest.",
        thumb: "og-obhour",
        items: [
          {
            bg: "url(https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/6e2be11e-9465-4c7a-8c86-cacd3b672882/id-preview-b26c3eb2--17a053b8-6206-41d1-b79c-291f45c1ecee.lovable.app-1780471940273.png)",
            site: "https://obhourcentral.com",
          },
          {
            bg: "url(https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/a9f3b1aa-27ba-47ab-bea1-5abc3d4bffc6/id-preview-31c1d860--f52060b5-81ef-4a4a-8548-4cfd0fa58210.lovable.app-1780472174868.png)",
            site: "https://samaalsharaie.com",
          },
        ],
        stickers: [],
      },
      {
        title: "Shubak",
        size: "min(24vw,15vh)",
        cat: "Illustrations & Typography",
        year: "2025",
        tool: "Illustrator",
        desc: "A heritage illustration series rooted in the culture of Al Hejaz, from Sobia and Ta'if roses to the Simsimiyah and the water zeel, reinterpreted with a contemporary visual language for a younger audience.",
        thumb: "p7-project-7-02",
        items: [
          img("p7-project-7-01"),
          img("p7-project-7-02"),
          img("p7-project-7-05"),
          img("p7-project-7-03"),
          img("p7-project-7-04"),
        ],
        stickers: [
          {
            ...sticker(0, "shubak-sobia", "294/324", 0, 0, 100, 100, "contain"),
            x: "75%",
            y: "6%",
            cw: "18%",
          },
          {
            ...sticker(1, "shubak-zeel", "306/294", 0, 0, 100, 100, "contain"),
            x: "87%",
            y: "22%",
            cw: "17%",
          },
          {
            ...sticker(2, "shubak-date", "306/300", 0, 0, 100, 100, "contain"),
            x: "74%",
            y: "39%",
            cw: "17%",
          },
          {
            ...sticker(3, "shubak-rose", "276/270", 0, 0, 100, 100, "contain"),
            x: "88%",
            y: "51%",
            cw: "16%",
          },
          {
            ...sticker(
              4,
              "shubak-simsimiyah",
              "252/288",
              0,
              0,
              100,
              100,
              "contain",
            ),
            x: "77%",
            y: "64%",
            cw: "18%",
          },
        ],
      },
      {
        title: "Digital Speed",
        size: "min(15vw,15vh)",
        cat: "Digital Posters",
        year: "2025",
        tool: "Photoshop",
        desc: "A visual study in motion and data. Pixel-built horses move through a photographic scene, translating instinct into a digital language.",
        thumb: "p4-digital-speed-01",
        items: [
          img("p4-digital-speed-01"),
          img("p4-digital-speed-02"),
          img("p4-digital-speed-03"),
        ],
        stickers: [],
      },
      {
        title: "Freej, What If..?",
        size: "min(11.5vw,15vh)",
        cat: "Packaging & Illustrations",
        year: "2025",
        tool: "Illustrator",
        desc: "A packaging and character concept for a Freej-branded snack experience in Saudi cinemas. Includes the family box design and four lead character illustrations.",
        thumb: "freej-new-box.png",
        items: ["freej-new-box", "freej-popcorn-32", "freej-cups-32"].map(
          (n) => ({ bg: "url(assets/" + n + ".png)" }),
        ),
        stickers: [
          "p3-freej-07",
          "p3-freej-04",
          "p3-freej-06",
          "p3-freej-05",
        ].map((n, k) => ({
          ...sticker(k, n, "116/175", 0, 0, 100, 100, "contain"),
          cw: "18%",
        })),
      },
      {
        title: "Now Or Never",
        size: "min(15vw,15vh)",
        cat: "Campaign Posters & Photo Editing",
        year: "2024",
        tool: "Photoshop",
        desc: "A retro-inspired campaign concept for Converse, built on photo manipulation and nostalgia to drive urgency around a limited-time sale.",
        thumb: "p8-now-or-never-01",
        items: [img("p8-now-or-never-02"), img("p8-now-or-never-01")],
        stickers: [],
      },
    ]
  }
  fitJustify = () => {
    document.querySelectorAll("p[data-just]").forEach((p) => {
      p.style.fontSize = ""
      p.style.textAlign = "justify"
      p.style.maxWidth = "38ch"
      const words = p.textContent.trim().split(/\s+/)
      const m = p.cloneNode(false)
      m.removeAttribute("data-just")
      Object.assign(m.style, {
        position: "absolute",
        visibility: "hidden",
        left: "-9999px",
        top: "0",
        textAlign: "left",
        maxWidth: "none",
        wordSpacing: "normal",
      })
      words.forEach((w, i) => {
        const sp = document.createElement("span")
        sp.textContent = w
        m.appendChild(sp)
        if (i < words.length - 1) m.appendChild(document.createTextNode(" "))
      })
      p.parentNode.appendChild(m)
      const avail = p.parentNode.clientWidth
      const base = parseFloat(getComputedStyle(p).fontSize)
      let best = null
      for (const k of [1, 0.95, 0.9, 0.85]) {
        const fs = base * k
        if (k < 1 && fs < 14) break
        m.style.fontSize = fs + "px"
        m.style.width = "1ch"
        const chPx = m.clientWidth || fs * 0.55
        const space = fs * 0.27
        const hi = Math.min(avail, 46 * chPx),
          lo = hi * 0.78
        for (let px = hi; px >= lo; px -= 2) {
          m.style.width = px + "px"
          const lines = []
          ;[...m.children].forEach((sp) => {
            const r = sp.getBoundingClientRect()
            const L = lines[lines.length - 1]
            if (L && Math.abs(L.top - r.top) < 2) {
              L.right = r.right
              L.n++
            } else
              lines.push({ top: r.top, left: r.left, right: r.right, n: 1 })
          })
          let worst = 0
          lines.slice(0, -1).forEach((L) => {
            const extra =
              L.n > 1 ? (px - (L.right - L.left)) / (L.n - 1) / space : 99
            worst = Math.max(worst, extra)
          })
          const last = lines[lines.length - 1]
          const lastFill = last ? (last.right - last.left) / px : 1
          const score = worst + (lastFill < 0.25 ? 0.3 : 0) + (1 - k) * 2
          if (!best || score < best.score) best = { px, k, worst, score }
        }
      }
      m.remove()
      if (best && best.worst <= 1.2) {
        p.style.maxWidth = best.px + "px"
        if (best.k < 1) p.style.fontSize = base * best.k + "px"
      } else p.style.textAlign = "left"
    })
  }
  componentDidMount() {
    const fj = () => requestAnimationFrame(this.fitJustify)
    ;(document.fonts ? document.fonts.ready : Promise.resolve()).then(fj)
    this.justifyTimer = setTimeout(fj, 600)
    this.onFjResize = () => {
      clearTimeout(this.fjT)
      this.fjT = setTimeout(this.fitJustify, 150)
    }
    window.addEventListener("resize", this.onFjResize)
    this.frames.forEach((s) => {
      const i = new Image()
      i.src = s
    })
    let fi = 0,
      imgs = null
    const build = () => {
      const g = this.gifRef.current
      if (!g) return null
      if (g._imgs) return g._imgs
      g._imgs = this.frames.map((s, i) => {
        const im = document.createElement("img")
        im.src = s
        im.alt = ""
        im.decoding = "sync"
        im.style.cssText =
          "position:absolute;inset:0;width:100%;height:100%;display:block;visibility:" +
          (i ? "hidden" : "visible")
        g.appendChild(im)
        return im
      })
      return g._imgs
    }
    this.timer = setInterval(() => {
      if (
        window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        this.lbRef.current?.style.display === "flex" ||
        !this.gifRef.current
          ?.closest("[data-social-card]")
          ?.matches(":hover, :focus-within")
      )
        return
      imgs = build()
      if (!imgs || !imgs.every((im) => im.complete)) return
      const nx = (fi + 1) % imgs.length
      imgs[nx].style.visibility = "visible"
      imgs[fi].style.visibility = "hidden"
      fi = nx
    }, 550)
    this.setupVideos()
    this.onScroll = () => this.updateStages()
    window.addEventListener("scroll", this.onScroll, { passive: true })
    window.addEventListener("resize", this.onScroll)
    this.revealFrame = requestAnimationFrame(() => {
      this.updateStages()
      this.setupReveal()
    })
  }
  componentDidUpdate() {
    this.updateStages()
  }
  setupVideos() {
    const root = this.rootRef.current
    if (!root) return
    const vids = [...root.querySelectorAll("video[data-preview]")]
    if (this.lbVideo.current) {
      this.lbVideo.current.controls = true
      this.lbVideo.current.playsInline = true
    }
    vids.forEach((v) => {
      v.muted = true
      v.loop = true
      v.playsInline = true
      v.setAttribute("playsinline", "")
      v.addEventListener("loadedmetadata", () => {
        const cap =
          v.closest("figure") && v.closest("figure").querySelector("[data-dur]")
        if (cap && isFinite(v.duration)) {
          const s = Math.round(v.duration)
          cap.textContent =
            Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0")
        }
      })
    })
    this.vio = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting && e.target.dataset.buffering !== "ready") {
            e.target.dataset.buffering = "ready"
            e.target.preload = "auto"
            e.target.load()
          }
          if (
            e.isIntersecting &&
            e.target
              .closest("[data-social-card]")
              ?.matches(":hover, :focus-within") &&
            !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
            this.lbRef.current?.style.display !== "flex"
          ) {
            e.target.play().catch(() => {})
          } else if (!e.isIntersecting) {
            e.target.pause()
          }
        }),
      { threshold: 0.01, rootMargin: "500px 0px" },
    )
    vids.forEach((v) => this.vio.observe(v))
    this.onKey = (e) => {
      if (e.key === "Escape") this.closeVideo()
    }
    window.addEventListener("keydown", this.onKey)
  }
  openMedia = (e) => {
    const src = e.currentTarget.getAttribute("data-src"),
      kind = e.currentTarget.getAttribute("data-kind")
    const lb = this.lbRef.current,
      v = this.lbVideo.current,
      im = this.lbImg.current
    if (!src || !lb || !v || !im) return
    this.mediaTrigger = e.currentTarget
    clearInterval(this.lbGifTimer)
    this.rootRef.current
      ?.querySelectorAll("video[data-preview]")
      .forEach((video) => video.pause())
    if (kind === "video") {
      im.style.display = "none"
      v.style.display = "block"
      v.src = src
      v.muted = false
      v.play().catch(() => {})
    } else {
      v.style.display = "none"
      im.src = src
      im.alt =
        e.currentTarget.getAttribute("aria-label") || "Social media artwork"
      im.style.display = "block"
      if (kind === "gif") {
        let frame = 0
        this.lbGifTimer = setInterval(() => {
          frame = (frame + 1) % this.frames.length
          im.src = this.frames[frame]
        }, 550)
      }
    }
    lb.style.display = "flex"
    lb.querySelector("button")?.focus()
  }
  closeVideo = (e) => {
    if (
      e &&
      (e.target === this.lbVideo.current || e.target === this.lbImg.current)
    )
      return
    const lb = this.lbRef.current,
      v = this.lbVideo.current
    clearInterval(this.lbGifTimer)
    if (v) {
      v.pause()
      v.removeAttribute("src")
      v.load()
    }
    if (lb) lb.style.display = "none"
    const trigger = this.mediaTrigger
    this.mediaTrigger = null
    if (trigger?.isConnected) trigger.focus()
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this.onFjResize)
    this.vio && this.vio.disconnect()
    window.removeEventListener("keydown", this.onKey)
    clearInterval(this.timer)
    clearInterval(this.lbGifTimer)
    window.removeEventListener("scroll", this.onScroll)
    window.removeEventListener("resize", this.onScroll)
    this.io && this.io.disconnect()
    this.io = null
    clearTimeout(this.fjT)
    clearTimeout(this.justifyTimer)
    cancelAnimationFrame(this.revealFrame)
    cancelAnimationFrame(this.revealObserveFrame)
  }
  fitSites() {
    const root = this.rootRef.current
    if (!root || !window.matchMedia("(min-width: 641px)").matches) return
    root.querySelectorAll("[data-site]").forEach((box) => {
      const url = box.getAttribute("data-site")
      if (!url || url.indexOf("http") !== 0) return
      const frame = box.parentElement
      const image = box.getAttribute("data-image")
      const isLivePreview = url.includes("obhourcentral.com")
      let cap = box.querySelector("a")
      if (!cap) {
        cap = document.createElement("a")
        cap.href = url
        cap.target = "_blank"
        cap.rel = "noopener"
        cap.textContent = url.replace("https://", "") + " ↗"
        cap.style.cssText =
          "position:absolute;left:0;right:0;z-index:2;text-align:center;font-family:Inter Tight,sans-serif;font-size:clamp(11px,0.75vw,17px);font-weight:600;letter-spacing:0.01em;text-transform:uppercase;color:#111111;text-underline-offset:3px;pointer-events:auto"
        box.appendChild(cap)
      }
      const width = box.clientWidth
      const height = box.clientHeight
      if (!width || !height || !frame) return
      const captionSpace = 72
      const previewHeight = 900
      const previewWidth = 1440

      if (isLivePreview) {
        frame.style.backgroundImage = "none"
        let iframe = box.querySelector("iframe")
        if (!iframe) {
          iframe = document.createElement("iframe")
          iframe.src = url
          iframe.title = "Obhour Central website preview"
          iframe.loading = "eager"
          iframe.allow = "autoplay"
          iframe.scrolling = "no"
          iframe.setAttribute("scrolling", "no")
          iframe.style.cssText =
            "position:absolute;width:1440px;height:900px;border:0;overflow:hidden;pointer-events:none;transform-origin:0 0;background:#fff"
          box.appendChild(iframe)
        }
        const scale = Math.min(
          width / previewWidth,
          (height - captionSpace) / previewHeight,
        )
        const displayHeight = previewHeight * scale
        const top = Math.max(0, (height - captionSpace - displayHeight) / 2)
        iframe.style.left = (width - previewWidth * scale) / 2 + "px"
        iframe.style.top = top + "px"
        iframe.style.transform = `scale(${scale})`
        cap.style.top = top + displayHeight + 8 + "px"
        return
      }

      box.querySelector("iframe")?.remove()
      if (image) frame.style.backgroundImage = image
      const imageRatio = 16 / 9
      const displayWidth = Math.min(
        width,
        (height - captionSpace) * imageRatio,
      )
      const displayHeight = displayWidth / imageRatio
      const top = Math.max(0, (height - captionSpace - displayHeight) / 2)
      frame.style.setProperty(
        "background-size",
        `${displayWidth}px ${displayHeight}px`,
        "important",
      )
      frame.style.setProperty(
        "background-position",
        `center ${top}px`,
        "important",
      )
      frame.style.backgroundRepeat = "no-repeat"
      cap.style.top = top + displayHeight + 8 + "px"
    })
  }
  ratios = {}
  placeStickers(frame, st) {
    const box = frame.parentElement
    if (box.closest("[data-project]")?.dataset.project === "Shubak") return
    const fw = box.clientWidth,
      fh = box.clientHeight
    if (!fw || !fh) return
    const m = /url\(["']?([^"')]+)/.exec(frame.style.backgroundImage || "")
    const url = m && m[1]
    if (!url) return
    const r = this.ratios[url]
    if (r === undefined) {
      this.ratios[url] = 0
      const im = new Image()
      im.onload = () => {
        this.ratios[url] = im.naturalWidth / im.naturalHeight
        this.updateStages()
      }
      im.src = url
      return
    }
    if (!r) return
    const dispW = Math.min(fw, fh * r)
    const right = (fw + dispW) / 2
    st.forEach((s, k) => {
      const sw = s.offsetWidth
      const left = k % 2 === 0 ? right - sw * 0.35 : right + sw * 0.3
      s.style.left = Math.min(left, fw + sw * 0.2) + "px"
      s.style.top = k * (76 / Math.max(1, st.length - 1)) + "%"
    })
  }
  updateStages() {
    const root = this.rootRef.current
    if (!root) return
    this.fitSites()
    root.querySelectorAll("[data-stage]").forEach((sec) => {
      const frames = [...sec.querySelectorAll("[data-frame]")]
      const n = frames.length
      if (!n) return
      const r = sec.getBoundingClientRect()
      const total = Math.max(1, r.height - window.innerHeight)
      const p = Math.min(0.9999, Math.max(0, -r.top / total))
      const act = Math.floor(p * n)
      frames.forEach((f, i) => {
        f.style.opacity = i === act ? "1" : "0"
        f.style.transform = i === act ? "none" : "scale(0.98)"
        f.style.pointerEvents = i === act ? "auto" : "none"
      })
      const c = sec.querySelector("[data-counter]")
      if (c)
        c.textContent =
          String(act + 1).padStart(2, "0") + " / " + String(n).padStart(2, "0")
      const st = [...sec.querySelectorAll("[data-sticker]")]
      if (st.length) this.placeStickers(frames[act], st)
      st.forEach((s, k) => {
        const on =
          r.top < window.innerHeight * 0.3 && p >= 0.04 + k * (0.86 / st.length)
        if (s._on === on) return
        s._on = on
        const rot = parseFloat(s.getAttribute("data-sticker")) || 0
        if (on) {
          s.style.transition =
            "opacity 200ms ease-out, transform 750ms cubic-bezier(.34,1.7,.56,1), left 600ms cubic-bezier(.2,.7,.2,1)"
          s.style.opacity = "1"
          s.style.transform = "scale(1) rotate(" + rot + "deg)"
        } else {
          s.style.transition =
            "opacity 250ms ease-out, transform 350ms ease-in, left 600ms cubic-bezier(.2,.7,.2,1)"
          s.style.opacity = "0"
          s.style.transform = "scale(0.2) rotate(" + rot * -4 + "deg)"
        }
      })
    })
  }
  setupReveal() {
    const root = this.rootRef.current
    if (
      !root ||
      this.io ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return
    const ease = "cubic-bezier(.2,.7,.2,1)"
    const els = [...root.querySelectorAll("[data-reveal]")]
    els.forEach((el) => {
      const d = [...el.parentElement.children].indexOf(el) * 110
      el.style.opacity = "0"
      el.style.transform = "translateY(30px)"
      el.style.transition =
        "opacity 1s " +
        ease +
        " " +
        d +
        "ms, transform 1.2s " +
        ease +
        " " +
        d +
        "ms"
    })
    const observer = new IntersectionObserver(
      (es) => {
        if (this.io !== observer) return
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.style.opacity = "1"
            e.target.style.transform = "none"
            observer.unobserve(e.target)
          }
        })
      },
      { threshold: 0.2 },
    )
    this.io = observer
    this.revealObserveFrame = requestAnimationFrame(() => {
      if (this.io !== observer) return
      els.forEach((el) => observer.observe(el))
    })
  }
  renderVals() {
    const list = this.data()
    const projects = list.map((p, i) => ({
      ...p,
      id: "project-" + (i + 1),
      num: String(i < 2 ? i + 1 : i + 2).padStart(2, "0"),
      countLabel: String(p.items.length).padStart(2, "0"),
      total: String(list.length + 1).padStart(2, "0"),
      links: p.links || [],
      span: "2",
      height: 100 + Math.max(p.items.length, p.stickers.length) * 70 + "vh",
      items: p.items.map((it, j) => ({
        ref: null,
        site: "",
        ...it,
        op: j === 0 ? 1 : 0,
      })),
    }))
    const ai = this.state.ai,
      flt = this.state.filter
    const show = (k) =>
      flt === "all" || (flt === "posts" ? k === "post" : k !== "post")
    const mk = (it) => ({
      ...it,
      isVideo: it.kind === "video",
      ref: it.kind === "gif" ? this.gifRef : null,
      bg: it.bg ? "url(" + this.A(it.bg) + ")" : "none",
      src: it.src || (it.bg ? this.A(it.bg) : ""),
      tag: it.kind === "video" ? "▶ Play" : "Loop",
      tagDisp: it.kind === "post" ? "none" : "block",
      cursor: it.kind === "gif" ? "default" : "zoom-in",
      disp: show(it.kind) ? "block" : "none",
    })
    const tall = this.media.tall.map(mk),
      wide = this.media.wide.map(mk)
    const all = [...this.media.tall, ...this.media.wide]
    const filters = [
      ["all", "All", all.length],
      ["posts", "Posts", all.filter((m) => m.kind === "post").length],
      ["motion", "Motion", all.filter((m) => m.kind !== "post").length],
    ].map(([k, label, count]) => ({
      label,
      count,
      selected: flt === k,
      bg: flt === k ? "#111111" : "transparent",
      fg: flt === k ? "#F4F3EE" : "#111111",
      pick: () => this.setState({ filter: k }),
    }))
    const wideDisp = wide.some((w) => w.disp !== "none") ? "grid" : "none"
    const tlist = [
      ...projects.slice(0, 2),
      {
        id: "social",
        thumb: "slide-1",
        num: "03",
        title: "Social Media",
        cat: "Posts & Videos",
        year: "",
      },
      ...projects.slice(2),
    ]
    const thumbs = tlist.map((p, i) => ({
      id: p.id,
      num: p.num,
      title: p.title,
      cat: p.cat,
      meta: [p.cat, p.year].filter(Boolean).join(", "),
      ar: this.thumbAR[p.thumb],
      ratio: (() => {
        const [width, height] = this.thumbAR[p.thumb].split("/").map(Number)
        return width / height
      })(),
      selected: i === ai,
      landscape: ["16/9", "16/10", "3/2"].includes(this.thumbAR[p.thumb]),
      bg: "url(" + this.A(p.thumb) + ")",
      enter: () => this.setState({ ai: i }),
      go: () => {
        if (
          window.matchMedia("(max-width: 640px), (hover: none)").matches &&
          i !== this.state.ai
        ) {
          this.setState({ ai: i })
          return
        }
        const el = document.getElementById(p.id)
        if (el)
          window.scrollTo({
            top: el.getBoundingClientRect().top + window.scrollY,
            behavior: "smooth",
          })
      },
      goMobile: () => {
        const targetId = p.id === "social" ? "social" : "mobile-" + p.id
        document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" })
      },
    }))
    const a = tlist[ai]
    return {
      projects,
      thumbs,
      active: {
        num: a.num,
        title: a.title,
        meta: [a.cat, a.year].filter(Boolean).join(", "),
      },
      rootRef: this.rootRef,
      gifRef: this.gifRef,
      lbRef: this.lbRef,
      lbVideo: this.lbVideo,
      lbImg: this.lbImg,
      openMedia: this.openMedia,
      tall,
      wide,
      filters,
      wideDisp,
      closeVideo: this.closeVideo,
    }
  }
  render() {
    const {
      projects,
      thumbs,
      active,
      rootRef,
      gifRef,
      lbRef,
      lbVideo,
      lbImg,
      openMedia,
      tall,
      wide,
      filters,
      wideDisp,
      closeVideo,
    } = this.renderVals()
    const projectSections = projects.map((p, index) => (
      <React.Fragment key={index}>
        <section
          id={p.id}
          data-stage={"1"}
          data-project={p.title}
          className="project-stage"
          style={{ position: "relative", height: p.height }}
        >
          <div
            className="project-sticky"
            style={{
              position: "sticky",
              top: "0",
              height: "100vh",
              minHeight: "600px",
              boxSizing: "border-box",
              overflow: "hidden",
              background: "#F4F3EE",
              padding:
                "clamp(56px,4.6vw,110px) clamp(24px,1.8vw,56px) clamp(20px,1.6vw,40px)",
              display: "grid",
              gridTemplateRows: "auto minmax(0,1fr) auto",
            }}
          >
            <h2
              className="project-title"
              style={{
                position: "relative",
                zIndex: "1",
                margin: "0",
                textAlign: "center",
                fontFamily: "'Anton',sans-serif",
                fontWeight: "400",
                fontSize: "clamp(52px,6vw,88px)",
                lineHeight: "0.92",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}
            >
              {p.title}
            </h2>
            <div
              className="project-body"
              style={{
                display: "grid",
                gridTemplateColumns:
                  "minmax(0,1fr) minmax(0,2.5fr) minmax(0,1fr)",
                columnGap: "clamp(24px,2.6vw,72px)",
                minHeight: "0",
              }}
            >
              <div
                className="project-about"
                style={{
                  alignSelf: "center",
                  display: "flex",
                  flexDirection: "column",
                  gap: "clamp(12px,1vw,24px)",
                }}
              >
                <span
                  style={{
                    fontSize: "clamp(13px,0.9vw,22px)",
                    fontWeight: "600",
                    letterSpacing: "0.01em",
                    textTransform: "uppercase",
                    lineHeight: "1.3",
                  }}
                >
                  (About)
                </span>
                <p
                  lang={"en"}
                  data-just={"1"}
                  style={{
                    margin: "0",
                    maxWidth: "38ch",
                    fontSize: "clamp(16px,1.15vw,28px)",
                    lineHeight: "1.45",
                    fontWeight: "500",
                    textAlign: "justify",
                    textJustify: "inter-word",
                    hyphens: "none",
                    WebkitHyphens: "none",
                    wordBreak: "normal",
                    overflowWrap: "normal",
                    wordSpacing: "-0.02em",
                  }}
                >
                  {p.desc}
                </p>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  {p.links.map((l, index) => (
                    <React.Fragment key={index}>
                      <a
                        href={l.url}
                        target={"_blank"}
                        rel={"noopener"}
                        style={{
                          fontSize: "clamp(13px,0.9vw,22px)",
                          fontWeight: "600",
                          letterSpacing: "0.01em",
                          textTransform: "uppercase",
                          color: "#111111",
                          textUnderlineOffset: "3px",
                        }}
                      >
                        {l.label} ↗
                      </a>
                    </React.Fragment>
                  ))}
                </div>
              </div>
              <div
                className="project-media"
                style={{
                  position: "relative",
                  zIndex: "2",
                  gridColumn: p.span,
                  margin: "calc(-1 * min(1.8vw,2.4vh)) 0 clamp(8px,1vw,24px)",
                  minHeight: "0",
                }}
              >
                {p.items.map((it, index) => (
                  <React.Fragment key={index}>
                    <div
                      data-frame={"1"}
                      className="project-frame"
                      ref={it.ref}
                      role={"img"}
                      aria-label={p.title}
                      style={{
                        position: "absolute",
                        inset: "0",
                        backgroundImage: it.bg,
                        backgroundSize: "contain",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                        opacity: it.op,
                        transition:
                          "opacity 700ms cubic-bezier(.2,.7,.2,1), transform 900ms cubic-bezier(.2,.7,.2,1)",
                      }}
                    >
                      <div
                        data-site={it.site}
                        data-image={it.bg}
                        style={{ position: "absolute", inset: "0" }}
                      ></div>
                    </div>
                  </React.Fragment>
                ))}
                {p.stickers.map((s, index) => (
                  <React.Fragment key={index}>
                    <div
                      data-sticker={s.rot}
                      data-sticker-index={index}
                      className="project-sticker"
                      style={{
                        position: "absolute",
                        left: s.x,
                        top: s.y,
                        width: s.cw,
                        aspectRatio: s.ar,
                        zIndex: "3",
                        opacity: "0",
                        transform: "scale(0.2) rotate(-30deg)",
                        filter: "drop-shadow(0 10px 18px rgba(17,17,17,0.14))",
                        willChange: "transform",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          inset: "0",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            left: s.l,
                            top: s.t,
                            width: s.w,
                            height: s.hh,
                            backgroundImage: s.bg,
                            backgroundSize: s.fit,
                            backgroundPosition: "center",
                            backgroundRepeat: "no-repeat",
                          }}
                        ></div>
                      </div>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto 1fr",
                fontSize: "clamp(13px,0.9vw,22px)",
                fontWeight: "600",
                letterSpacing: "0.01em",
                textTransform: "uppercase",
                lineHeight: "1.3",
                paddingTop: "clamp(12px,1vw,28px)",
              }}
            >
              <span style={{ justifySelf: "start" }}>{p.title}</span>
              <span>(Scroll)</span>
              <span style={{ justifySelf: "end" }}>
                {p.num} / {p.total}
              </span>
            </div>
          </div>
        </section>
      </React.Fragment>
    ))
    const mobileProjectSections = projects.map((p) => (
      <section
        className="mobile-project"
        id={"mobile-" + p.id}
        data-mobile-project={p.title}
        key={"mobile-" + p.id}
      >
        <div className="mobile-project-heading">
          <span>
            {p.num} / {p.total}
          </span>
        </div>
        <h2>{p.title}</h2>
        <div className="mobile-project-about">
          <p>{mobileDescription(p.desc)}</p>
          {p.links.length > 0 && (
            <div className="mobile-project-links">
              {p.links.map((link) => (
                <a href={link.url} target="_blank" rel="noopener" key={link.url}>
                  {link.label} ↗
                </a>
              ))}
            </div>
          )}
        </div>
        <MobileProjectGallery items={p.items} title={p.title} />
        {(p.title === "Shubak" || p.title === "Freej, What If..?") && (
          <MobileStickerGrid stickers={p.stickers} title={p.title} />
        )}
      </section>
    ))
    return (
      <div
        ref={rootRef}
        className="portfolio-root"
        style={{
          background: "#F4F3EE",
          color: "#111111",
          fontFamily: "'Inter Tight',sans-serif",
        }}
      >
        <header
          className="site-header"
          style={{
            position: "fixed",
            top: "0",
            left: "0",
            right: "0",
            zIndex: "50",
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            alignItems: "center",
            padding: "16px clamp(24px,1.8vw,56px)",
            fontFamily: "'Inter Tight',sans-serif",
            fontSize: "clamp(13px,0.9vw,22px)",
            fontWeight: "700",
            letterSpacing: "0.02em",
            textTransform: "uppercase",
            background: "#F4F3EE",
          }}
        >
          <a
            href={"#top"}
            style={{
              color: "#111111",
              textDecoration: "none",
              justifySelf: "start",
            }}
          >
            Reema Aloufi
          </a>
          <span>(PORTFOLIO)</span>
          <nav
            style={{
              justifySelf: "end",
              display: "flex",
              gap: "clamp(20px,1.6vw,44px)",
            }}
          >
            <a
              href={"#work"}
              onClick={(event) => {
                if (!window.matchMedia("(max-width: 640px)").matches) return
                event.preventDefault()
                document
                  .getElementById("work-mobile")
                  ?.scrollIntoView({ behavior: "smooth" })
              }}
              style={{ color: "#111111", textDecoration: "none" }}
            >
              Work
            </a>
            <a
              href={"#contact"}
              style={{ color: "#111111", textDecoration: "none" }}
            >
              Contact
            </a>
          </nav>
        </header>

        <section
          id={"top"}
          style={{
            height: "100vh",
            minHeight: "560px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: "clamp(22px,1.8vw,48px)",
            padding: "64px clamp(24px,1.8vw,56px) 40px",
            boxSizing: "border-box",
            textAlign: "center",
          }}
        >
          <p
            data-reveal={"1"}
            style={{
              maxWidth: "max(620px,44vw)",
              margin: "0",
              fontSize: "clamp(17px,1.3vw,30px)",
              lineHeight: "1.45",
              fontWeight: "500",
              letterSpacing: "-0.005em",
              textWrap: "balance",
            }}
          >
            A graphic designer building brand identities, campaigns, and digital
            experiences for institutions, developments, and national-scale
            brands.
          </p>
          <h1
            data-reveal={"1"}
            style={{
              margin: "0",
              fontFamily: "'Anton',sans-serif",
              fontWeight: "400",
              fontSize: "min(12.5vw,20vh)",
              lineHeight: "0.88",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}
          >
            <span className="hero-title-line">Graphic Design</span>
            <br />
            Portfolio
          </h1>
          <div
            data-reveal={"1"}
            style={{
              display: "flex",
              gap: "clamp(22px,2vw,56px)",
              justifyContent: "center",
              fontSize: "clamp(13px,0.9vw,22px)",
              fontWeight: "600",
              letterSpacing: "0.01em",
              textTransform: "uppercase",
            }}
          >
            <span>(By Reema Aloufi)</span>
            <span>Thinking made visual</span>
            <span>(2026)</span>
          </div>
        </section>

        <section
          id={"work"}
          className="selected-work desktop-selected-work"
          style={{
            height: "100vh",
            minHeight: "560px",
            display: "grid",
            gridTemplateColumns: "minmax(0,1fr)",
            gridTemplateRows: "auto 1fr auto",
            padding: "64px clamp(24px,1.8vw,56px) clamp(24px,1.8vw,56px)",
            boxSizing: "border-box",
          }}
        >
          <div
            className="selected-work-meta"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto 1fr",
              fontSize: "clamp(13px,0.9vw,22px)",
              fontWeight: "600",
              letterSpacing: "0.01em",
              textTransform: "uppercase",
              lineHeight: "1.3",
            }}
          >
            <span>(What you will see)</span>
            <span>Selected work</span>
            <span style={{ justifySelf: "end" }}>07 Projects</span>
          </div>
          <div
            className="selected-work-content"
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: "clamp(22px,2vw,56px)",
              minHeight: "0",
            }}
          >
            <div
              className="selected-work-strip"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "clamp(10px,1vw,28px)",
                height: "min(23vw,50vh)",
                maxWidth: "100%",
              }}
            >
              {thumbs.map((t, index) => (
                <React.Fragment key={index}>
                  <div
                    className="selected-work-thumb"
                    data-selected={t.selected ? "true" : "false"}
                    data-landscape={t.landscape ? "true" : "false"}
                    onMouseEnter={t.enter}
                    onFocus={t.enter}
                    onClick={t.go}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault()
                        t.go()
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    style={{
                      flex: "none",
                      aspectRatio: t.ar,
                      cursor: "pointer",
                      backgroundImage: t.bg,
                      backgroundSize: "cover",
                      backgroundPosition: "center top",
                      transition: "height 550ms cubic-bezier(.2,.7,.2,1)",
                    }}
                  ></div>
                </React.Fragment>
              ))}
            </div>
            <div
              className="selected-work-label"
              style={{
                textAlign: "center",
                fontSize: "clamp(13px,0.9vw,22px)",
                fontWeight: "600",
                letterSpacing: "0.01em",
                lineHeight: "1.4",
                textTransform: "uppercase",
                minHeight: "4.2em",
                minWidth: "340px",
              }}
            >
              <div>({active.num})</div>
              <div style={{ fontWeight: "700" }}>{active.title}</div>
              <div>{active.meta}</div>
            </div>
          </div>
          <div
            className="selected-work-footer"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto 1fr",
              fontSize: "clamp(13px,0.9vw,22px)",
              fontWeight: "600",
              letterSpacing: "0.01em",
              textTransform: "uppercase",
            }}
          >
            <span>Hover to preview</span>
            <span>(Scroll)</span>
            <span style={{ justifySelf: "end" }}>Click to open</span>
          </div>
        </section>

        <section id="work-mobile" className="mobile-selected-work">
          <div className="mobile-work-heading">
            <span>(Selected work)</span>
            <span>07 projects</span>
          </div>
          <h2>Explore the work</h2>
          <div className="mobile-work-carousel">
            {thumbs.map((thumb) => (
              <button
                type="button"
                className="mobile-work-card"
                key={thumb.id}
                onClick={thumb.goMobile}
                style={{
                  "--mobile-thumb-width-vw": `${thumb.ratio * 56}vw`,
                  "--mobile-thumb-width-px": `${thumb.ratio * 240}px`,
                }}
              >
                <span
                  className="mobile-work-image"
                  style={{
                    backgroundImage: thumb.bg,
                    "--mobile-thumb-width-vw": `${thumb.ratio * 56}vw`,
                    "--mobile-thumb-width-px": `${thumb.ratio * 240}px`,
                  }}
                />
                <span
                  className="mobile-work-copy"
                  style={{
                    "--mobile-thumb-width-vw": `${thumb.ratio * 56}vw`,
                    "--mobile-thumb-width-px": `${thumb.ratio * 240}px`,
                  }}
                >
                  <span>({thumb.num})</span>
                  <strong>{thumb.title}</strong>
                </span>
              </button>
            ))}
          </div>
          <div className="mobile-work-swipe">
            <span>Swipe to browse</span>
            <span>Tap to open</span>
          </div>
        </section>

        {projectSections.slice(0, 2)}
        {mobileProjectSections.slice(0, 2)}

        <SocialGallery
          items={[...tall, ...wide]}
          filters={filters}
          openMedia={openMedia}
        />
        {projectSections.slice(2)}
        {mobileProjectSections.slice(2)}
        <div
          ref={lbRef}
          role="dialog"
          aria-modal="true"
          aria-label="Full-size social media artwork"
          onClick={closeVideo}
          style={{
            position: "fixed",
            inset: "0",
            zIndex: "100",
            background: "rgba(17,17,17,0.94)",
            display: "none",
            alignItems: "center",
            justifyContent: "center",
            padding: "clamp(48px,5vw,96px)",
            boxSizing: "border-box",
          }}
        >
          <video
            ref={lbVideo}
            controls={true}
            playsInline={true}
            style={{
              maxWidth: "min(82vw,1100px)",
              maxHeight: "82vh",
              display: "none",
              background: "#000",
            }}
          ></video>
          <img
            ref={lbImg}
            alt={""}
            style={{
              maxWidth: "min(82vw,1100px)",
              maxHeight: "82vh",
              display: "none",
              objectFit: "contain",
            }}
          />
          <button
            type={"button"}
            onClick={closeVideo}
            style={{
              position: "absolute",
              top: "clamp(16px,1.6vw,40px)",
              right: "clamp(16px,1.6vw,40px)",
              background: "none",
              border: "0",
              color: "#F4F3EE",
              cursor: "pointer",
              fontFamily: "'Inter Tight',sans-serif",
              fontSize: "clamp(13px,0.9vw,22px)",
              fontWeight: "600",
              letterSpacing: "0.01em",
              textTransform: "uppercase",
              lineHeight: "1.3",
            }}
          >
            Close ✕
          </button>
        </div>

        <footer
          id={"contact"}
          style={{
            height: "100vh",
            minHeight: "560px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: "clamp(22px,1.8vw,48px)",
            padding: "64px clamp(24px,1.8vw,56px) clamp(24px,1.8vw,56px)",
            boxSizing: "border-box",
            textAlign: "center",
            position: "relative",
          }}
        >
          <h2
            data-reveal={"1"}
            style={{
              margin: "0",
              fontFamily: "'Anton',sans-serif",
              fontWeight: "400",
              fontSize: "min(10vw,22vh)",
              lineHeight: "0.9",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}
          >
            Let's Work Together
          </h2>
          <div
            data-reveal={"1"}
            style={{
              display: "flex",
              gap: "clamp(28px,2.4vw,64px)",
              justifyContent: "center",
              fontSize: "clamp(13px,0.9vw,22px)",
              fontWeight: "600",
              letterSpacing: "0.01em",
              textTransform: "uppercase",
            }}
          >
            <a
              href={"tel:+966555437558"}
              target={"_top"}
              className="desktop-contact-action"
              style={{ color: "#111111" }}
            >
              Phone
            </a>
            <a
              href={"mailto:reemaomaraloufi@gmail.com"}
              target={"_top"}
              className="desktop-contact-action"
              style={{ color: "#111111" }}
            >
              Email
            </a>
            <a
              href={"tel:0555437558"}
              className="mobile-contact-action"
              onClick={(event) => {
                event.preventDefault()
                window.location.href = "tel:0555437558"
              }}
              style={{ color: "#111111" }}
            >
              Phone
            </a>
            <a
              href={"mailto:reemaomaraloufi@gmail.com"}
              className="mobile-contact-action"
              onClick={(event) => {
                event.preventDefault()
                window.location.href = "mailto:reemaomaraloufi@gmail.com"
              }}
              style={{ color: "#111111" }}
            >
              Email
            </a>
            <a
              href={"https://wa.me/966555437558"}
              target={"_blank"}
              rel={"noopener"}
              style={{ color: "#111111" }}
            >
              WhatsApp
            </a>
          </div>
          <div
            style={{
              position: "absolute",
              left: "clamp(24px,1.8vw,56px)",
              right: "clamp(24px,1.8vw,56px)",
              bottom: "20px",
              display: "flex",
              justifyContent: "space-between",
              fontFamily: "'Inter Tight',sans-serif",
              fontWeight: "600",
              fontSize: "clamp(13px,0.9vw,22px)",
              letterSpacing: "0.01em",
              textTransform: "uppercase",
            }}
          >
            <span>Reema Aloufi</span>
            <span>© 2026</span>
          </div>
        </footer>
      </div>
    )
  }
}
