import Nav from "@/components/Nav";
import { ABOUT } from "@/lib/categories";

export default function AboutPage() {
  return (
    <>
      <Nav activeSlug={ABOUT.slug} />
      <div className="content about">
        <h2>Core Values</h2>
        <ol>
          <li>Embrace all that is slow, rewarding, and sustaining. See: gruel.</li>
          <li>
            Ludditism. In a more nuanced sense, rejection of the
            commercialization and therefore flattening of artistic
            expression and consumption.
          </li>
          <li>
            For intentional listeners, writers, readers, and enjoyers by
            intentional listeners, writers, readers, and enjoyers.
          </li>
          <li>Prioritizing local music, culture, food, connection.</li>
          <li>Having a low-stakes, low-barrier, and fun way to publish writing online.</li>
        </ol>

        <h2>Masthead</h2>
        <div className="masthead">
          <div className="masthead-person">
            <div className="name">Yasmin Hamilton</div>
            <div className="role">editor</div>
            <div className="bio">bio</div>
          </div>
          <div className="masthead-person">
            <div className="name">Michele Bilko</div>
            <div className="role">website builder</div>
            <div className="bio">bio</div>
          </div>
        </div>

        <h2>Subscribe to our monthly newsletter</h2>
        <p>
          Article drops, events, fun times, and more... fill out this{" "}
          <a href="#">form</a>.
        </p>

        <h2>Submissions</h2>
        <p>
          We publish monthly, subject to change. Long-form writing
          (800-1500 words) is prioritized, except for reviews (600-800
          words). However, as a magazine focused on prioritizing the
          practice of writing without hesitation, we encourage you to
          pitch anything you&apos;re passionate about. Pitch an article{" "}
          <a href="#">here</a>. If your article is timely, please email{" "}
          <a href="mailto:yahamilton02@gmail.com">yahamilton02@gmail.com</a>{" "}
          in addition to submitting the form to let us know.
        </p>

        <h2>Get Involved</h2>
        <p>
          Do you want to get involved in the editorial process or have
          other ideas for how to get involved? Apply to be an editor{" "}
          <a href="#">here</a>.
        </p>
      </div>
    </>
  );
}
