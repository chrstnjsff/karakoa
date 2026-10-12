---
title: "Capstone defense questions panels actually ask, and how to answer them"
seoTitle: "Capstone Defense Questions and How to Answer Them"
description: "The questions Philippine panels ask at capstone and thesis defenses, a simple answer pattern that works, and the defense-day mistakes that cost students the most."
summary: "Know the questions before you walk in. Most panels draw from the same set, and a clear answer pattern beats memorized scripts."
audience: "For students preparing for a proposal or final defense"
updated: 2026-10-12
order: 3
sources:
  - label: "Capstone defense mistakes to avoid, BSIT 2026 (itsourcecode)"
    url: "https://itsourcecode.com/blogs/capstone-defense-mistakes-to-avoid-bsit-2026/"
  - label: "30 most common questions asked in research defenses for computer students (SlideShare)"
    url: "https://www.slideshare.net/slideshow/30-most-common-questions-asked-in-research-defences-computer-technology-student-computer-science-student-information-technology-student/238607157"
  - label: "Thesis defense questions for computer science (Viva Coach)"
    url: "https://vivacoach.ai/viva-questions/computer-science"
---

A defense is not a quiz with trick questions.
Panels want to confirm three things: that the problem is real, that the system works, and that you understand what you built.
Prepare for the questions below and most of the defense becomes a conversation you can lead.

## The questions to expect

About the problem and the users:

- Why did you choose this topic, and why this beneficiary?
- What is the current process, and what exactly is wrong with it?
- How did you gather requirements, and from whom?
- How is your system different from existing systems that do the same thing?

About the method and the design:

- Why did you use this software development model?
- Walk us through the system architecture.
- Explain your database design. Why these tables and these relationships?
- Why this programming language, framework, or database?
- What are the user roles, and what can each role do?

About the build and the evidence:

- How did you test the system, and what failed during testing?
- How do you protect user data? How are passwords stored? Who can see what?
- What happens when the internet goes down, the database is full, or a user enters bad data?
- Show us the feature that satisfies objective number three.
- What did the evaluation results show, and what do the numbers mean?

About limits and the future:

- What are the limitations of the study?
- If you had one more semester, what would you add?
- Who will maintain the system after you graduate?

For group projects, expect any member to be asked about any module.
Panels do this on purpose to check that the whole team understands the whole system.

## An answer pattern that works

Give the claim, the reason, and the evidence, in that order.

A weak answer: "We used MVC because it is good."

A strong answer: "We used MVC to separate concerns. The model handles database queries, the view renders the pages, and the controller validates input. That let us test the inventory calculations without the interface, which saved days during testing."

Keep answers under a minute.
If a panelist wants more, they will ask.

## When you do not know

Do not pretend.
Say that you did not test that scenario, give your best reasoning, state how you would verify it, and offer to follow up in writing.
Panels respect honesty with a plan far more than confident guessing.

## Defense-day mistakes that cost the most

- The demo breaks. Freeze the code at least three days before the defense. Bring a live deployed version, an offline copy, and a recorded demo or screenshots as a last resort. Seed the database with realistic sample data. Test on the exact laptop, projector, and network the day before.
- Reading the slides. Panels read faster than you talk. Put one idea per slide and speak to it.
- Walls of text. Large fonts, few words, and a screenshot or diagram per slide.
- Running over time. Demo the critical path, not every feature.
- Only one member knows a module. Cross-train in the last two weeks so everyone can explain every module at a high level.
- Being defensive. Thank the panelist, acknowledge the valid part, explain your reasoning, and note it for revisions. Never argue.
- Not being able to explain your own code. This has become common with AI-assisted coding. Print your five most important functions and explain them line by line before the defense. If you cannot, refactor until you can.
- No practice runs. Do at least three: a full run with your adviser a week before, a run for a friend who knows nothing about the project, and a timed solo dress rehearsal the day before.

## After the defense

Write down every comment from the panel while it is fresh.
Most programs require a revision sheet that lists each comment and where in the manuscript it was addressed.
Turn that sheet into a checklist and work through it with your adviser.

## Where we fit in

Students who build with Karakoa get a full walkthrough of the system before the defense, module by module, with the reasoning behind each design choice.
We also run a mock defense if you want one.
See the capstone and thesis service page for what is included.
