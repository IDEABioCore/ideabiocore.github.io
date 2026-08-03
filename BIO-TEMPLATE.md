# Team bio template

Use this to collect bios for the **Meet our Team** page. Bios are optional — a member
without one simply shows their photo, name and role, with no "Read more" link.

## Still missing a bio

Mr Nhat Huynh · Sally Yukiko

---

## Message to send

> **Subject: Your bio for the new IDEA Bio website**
>
> Hi [name],
>
> We're rebuilding the IDEA Bio website and each team member gets a short bio behind a
> "Read more" link on the Team page. Yours is still missing — could you send me a few
> paragraphs?
>
> **What to write:** 100–220 words, in third person (as if someone else were introducing
> you), 1–3 short paragraphs. Australian spelling (*optimisation*, *characterise*,
> *specialising*). No dot points, no CV lists — it should read as prose.
>
> A structure that works well:
>
> 1. **Opening line** — your name, your role at IDEA Bio, and what you do here in one
>    sentence. Start with your full name, then use your first name after that.
> 2. **Background** — degrees, where you studied, who you worked with, previous roles.
>    Only what's relevant; no full publication list.
> 3. **Focus** — the specific problems or techniques you work on, and any projects or
>    collaborations you're happy to have named publicly.
> 4. **Optional closing** — what you care about or enjoy about the work.
>
> Please also confirm:
>
> - The **name** you want shown (including title — Dr / Mr / Ms — if you use one)
> - Your **role title** as you'd like it to appear
> - Whether your current **headshot** is fine, or you'd like to send a new one
>   (portrait orientation, cropped roughly 4:5, at least 800 × 1000 px)
>
> Anything you send may go on a public website, so please leave out anything commercially
> sensitive or unpublished.
>
> Thanks!
> [your name]

---

## Examples to include with the ask

**Short (one paragraph, ~95 words) — Dr Neha Lal:**

> Neha is a Fermentation Scientist at IDEA Bio, where she develops precision fermentation
> processes for recombinant protein production using engineered yeast strains. She holds a
> Bachelor of Engineering (Honours) in Chemical and Biological Engineering and a PhD in
> Engineering, where her research focused on bioprocess engineering. Her work focuses on
> fermentation process development and optimisation, including process scale-up. Neha is
> passionate about sustainable biomanufacturing and enjoys collaborating across academia
> and industry to develop innovative bioprocesses.

**Longer (two paragraphs, ~120 words) — Ms Yu Sun:**

> Yu Sun is a Senior Fermentation Scientist at IDEA Bio with over six years of experience
> in industrial biotechnology, specialising in microbial fermentation, bioprocess
> development, and process scale-up. She has worked across research, process development,
> quality systems, and GMP manufacturing, helping clients transform innovative ideas into
> robust and scalable bioprocesses.
>
> Her expertise spans fermentation process design and optimisation, microbial strain
> cultivation, media development, bioreactor operation, and downstream process support.
> Yu has hands-on experience with a wide range of fermentation platforms, from benchtop
> reactors to pilot-scale systems, and has successfully supported projects involving
> bacteria, yeast, fungi, and other microorganisms for research and commercial
> applications.

---

## Adding a returned bio to the site

Bios live in [`src/data/team.json`](src/data/team.json). Add a `bio` key to that person's
entry; paragraph breaks are `\n\n` inside the string:

```json
{
  "name": "Dr Jane Doe",
  "role": "Bioprocess Engineer",
  "image": "/images/team-jane-doe.jpg",
  "bio": "First paragraph.\n\nSecond paragraph."
}
```

Notes:

- The modal splits on blank lines, so `\n\n` is the only formatting that has any effect —
  markdown, bold and links are rendered as literal text.
- Use the real typographic apostrophe (`’`) rather than `'`, to match the rest of the file.
- New headshots go in `public/images/` as `team-firstname-lastname.jpg`, and should be
  listed in [`ASSETS.md`](ASSETS.md).
- The order of the array is the order shown on the page.
