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
            Rejection of the commercialization and therefore flattening of artistic expression and consumption. 
          </li>
          <li>
            For intentional listeners, writers, readers, and enjoyers by intentional listeners, writers, readers, and enjoyers.
          </li>
          <li>Prioritizing local music, culture, food, connection, things that have historically fueled us.</li>
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


        <h2>Submissions</h2>
        <p>
          We publish monthly, subject to change. Long-form writing (800-1500 words) is prioritized for essays, but 600-800 words is sufficient for reviews and 300 words is sufficient for show write-ups. However, as a magazine focused on prioritizing the practice of writing without hesitation, we encourage you to pitch anything you&apos;re passionate about even if it does not fall within these margins. 
          Pitch an article{" "}
          <a href="https://docs.google.com/forms/d/e/1FAIpQLSftMTtNJ-BDn3YzHs9hOmUy5CHbG4VTJjSebdOkK1ZGCiNOYA/viewform?usp=sharing&ouid=111911605651743149030">here</a>. 
          If your article is timely, please email {" "}
          <a href="mailto:gruelblog@gmail.com">gruelblog@gmail.com </a> 
           in addition to submitting the form to let us know. 
        </p>

        <h2>Get Involved</h2>
        <p>
          Do you want to get involved in the editorial process or have other ideas for how to get involved? Express interest
          {" "}
          <a href="https://docs.google.com/forms/d/e/1FAIpQLSdeLu8xcHW3n6DeXNKgrESB_SP3yd2OmDg8nV45k9ues4YZLA/viewform?usp=sharing&ouid=111911605651743149030">here</a>.
        </p>
      </div>
    </>
  );
}
