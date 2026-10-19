/**
 * The onboarding strip.
 *
 * Twelve real screens from the app's first-run flow, captured from the
 * running desktop app: the welcome, the three promises, the system
 * check, picking a brain, the model download, the microphone, the
 * voice, the name, the integrations, and the first chat and voice
 * screens. The flow is honest about what it downloads and what it
 * asks for.
 *
 * The strip scrolls itself. The content is printed twice and the
 * track is translated by exactly half its width, so the loop is
 * seamless and there is no jump at the seam. The second copy is
 * `aria-hidden`, so a screen reader hears twelve steps and not
 * twenty-four.
 *
 * The scrollbar is hidden — it is noise on a strip that moves on its
 * own — but the rail is still a real scroll region: a wheel, a
 * trackpad, a touch drag and the keyboard all work, and hovering or
 * focusing pauses the motion so a visitor can take their time.
 */

const steps = [
  { file: "onb-01-welcome-to-xr--", title: "Welcome to XR", body: "The first screen. Nothing is installed yet." },
  { file: "onb-02-three-promises-before-we-begin-", title: "Three promises", body: "What XR will and will not do, before you commit to anything." },
  { file: "onb-03-checking-your-system--", title: "Checking your system", body: "It looks at your hardware and tells you what it found." },
  { file: "onb-04-pick-a-brain--", title: "Pick a brain", body: "Choose the model that will answer for you." },
  { file: "onb-05-downloading-qwen2-5-coder-7b--", title: "Downloading the model", body: "The local model download, shown honestly — with its size." },
  { file: "onb-06-set-your-microphone--", title: "Set your microphone", body: "Only if you want to talk to it. It is optional." },
  { file: "onb-07-choose-a-voice--", title: "Choose a voice", body: "The voice you want back." },
  { file: "onb-08-make-it-yours--", title: "Make it yours", body: "Name it. It is your agent, on your machine." },
  { file: "onb-09-connect-your-world-later--", title: "Connect your world later", body: "Integrations are not a tax on first run." },
  { file: "onb-10-hey-i-m-xr--", title: "Hey, I'm XR", body: "The moment it introduces itself." },
  { file: "onb-11-chat-", title: "Chat", body: "The first conversation." },
  { file: "onb-12-voice-", title: "Voice", body: "Talking to it, in the app." },
];

function Card({ step, index }: { step: (typeof steps)[number]; index: number }) {
  return (
    <li className="w-[240px] shrink-0 sm:w-[268px]">
      <figure className="shot">
        <img
          src={`/screens/${step.file}560.webp`}
          srcSet={`/screens/${step.file}560.webp 560w, /screens/${step.file}1100.webp 1100w`}
          sizes="268px"
          width={1100}
          height={700}
          alt={`Onboarding step ${index + 1}: ${step.title}. ${step.body}`}
          loading="lazy"
          decoding="async"
          className="h-auto w-full"
        />
      </figure>
      <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-accent/80">
        {String(index + 1).padStart(2, "0")}
      </p>
      <h3 className="mt-1 text-sm font-semibold text-primary">{step.title}</h3>
      <p className="mt-1 text-[13px] leading-relaxed text-secondary">{step.body}</p>
    </li>
  );
}

export default function OnboardingStrip() {
  return (
    <section
      id="get-started"
      className="scroll-mt-24 border-t border-[var(--color-line-subtle)] py-20 sm:py-24"
    >
      <div className="shell">
        <div className="max-w-2xl">
          <p className="eyebrow">First run</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-primary sm:text-4xl sm:leading-[1.12]">
            Twelve steps, and it tells you what each one costs you
          </h2>
          <p className="mt-4 text-[15px] leading-[1.7] text-secondary sm:text-base">
            XR&apos;s onboarding is part of the product, not a slideshow. Here is the real
            first-run flow, captured from the running app — including the model download it
            performs and the microphone it asks for.
          </p>
        </div>
      </div>

      <div
        className="marquee-rail mt-12 overflow-x-auto pb-4 [scrollbar-width:none] [-ms-overflow-style:none]"
        role="group"
        aria-label="Onboarding screens — scrolls on its own, and can be scrolled by hand"
        tabIndex={0}
      >
        <ol className="marquee-track gap-4 pl-5 md:pl-8 xl:pl-12">
          {steps.map((step, i) => (
            <Card key={step.file} step={step} index={i} />
          ))}
          {/* The second copy, so the loop is seamless. Hidden from
              assistive technology: the list is twelve steps long, not
              twenty-four. */}
          <div aria-hidden="true" className="flex shrink-0 gap-4">
            {steps.map((step, i) => (
              <Card key={`dup-${step.file}`} step={step} index={i} />
            ))}
          </div>
        </ol>
      </div>
    </section>
  );
}
