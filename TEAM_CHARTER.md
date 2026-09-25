# Team Charter

*C12 Fall 2026 · Week 3's homework · written as a team after kickoff
(section 4 while the migration review is fresh) · merged into your team
repo by the Week-4 session · revisit at midterm. Worked example: [charter-example.md](charter-example.md) · how-to:
[charter-guide.md](charter-guide.md).*

## 1 · Team & Project

**Team name:** Recipe  Hub

**Project (adopted pitch):** A platform for saving, organizing, planning, and sharing recipes

**Section:** Fri 3:00 

**Members:**

| Name | GitHub | Email |
|------|--------|-------|
| Olivia Jervise   |  @olivia-jervise  |  oliviajervise@gmail.com  |
|    Nathan Chin   |    @JavaNathan    |  nathanjchin4@gmail.com.  |
|   Alyssa Johnson |   @alyssajodi2004 |  alyssajodi2005@gmail.com |


### Roles & responsibilities

**Rotating roles (who has it this week is posted in the channel):**
____________ *(e.g., stand-up lead runs the meeting + posts notes; review
captain is first responder on every PR; demo owner keeps `main` deployable)*

**Standing ownership:** ____________ *(e.g., each member is first stop for
their jigsaw aspect — first stop, not sole owner)*

**Everyone, every week:** ____________ *(e.g., one merged PR, one review
given, stand-up attended or an async update posted before it starts)*

## 2 · The Product

*Pull this from your adopted pitch, then sharpen it as a team — this is
refinement, not re-ideation.*

**The problem:** People find recipes across social platforms like TikTok, or recommendations from other which leaves recipes scattered. If recipes are saved somewhere it is hard planning and figuring out what to cook and the ingredients to buy.

**Who it's for:** People who cook or enjoy collecting recipes and want a simple way to organize what they want to cook, plan meals and prepare grocery shopping lists.

**Three core features (the MVP):**
1. complete recipe extraction --> using links users can upload and create recipes that are searchable by others
2. generate grocery lists --> allows user to add ingredients to a grocery list
3. Portion Scaler --> scale recipes based on user preference 

**What ships by Week 13 (demo day):** A user will open the URL and sign in or create an account, paste a social media link or search for recipes and save them into a cookbook. *

**Out of scope / v2 ideas (Week-9 pitch fodder):** Tiktok and social media video recipe importing, video transciption, AI recipe extraction, nutrition information, dietary filter

## 3 · Working Agreement

**Where we talk:** Slack Channel and Zoom Meetings *(e.g., team Slack channel)*

**Response window:** 24 hours *(e.g., within 24 hours on weekdays)*

**When we meet (outside class):** Tuesdays and Thursdays at 4pm

**Availability notes:** Alyssa - works mornings 8am - 12pm on Wednesday - Thursday


**How we decide when we disagree:** try to reach an agreement as a team through respectful discussion

**Definition of done:** the applications features work locally, all features have been merged into main through the gate, CI green, reviewed by someone who pulled and ran it, and it works at the preview URL

### Rituals

| Ritual | When | Shape |
|--------|------|-------|
| Stand-up |Thursday 4pm| Each person: merged / in review / blocked |
| Team review (in class) | every session, ~15 min | Put one PR on screen, pull it, run it, read it, and ask questions. Review comments are added to the actual PR.|
| Async check-in | Thursday in slack Channel | One line each: what is in progress and whether anything is blocked or slipping |
| Retro | midterm + before demo day | Update the charter based on what is actually working for the team |
| Planning |Tuesday 4pm | Decide the next issues/PRs and assign one owner to each.|

**How we track work:** Github issues, planned features or tasks are given to each group member

## 4 · Code & Review Norms

*Complete this section together in Week 3, at code kickoff.*

**Branch & PR flow:** main stays deployable. Branch from the latest main using yourname/short-feature-name, commit work to that branch, and open a PR when it is ready for feedback. At least one teammate reviews the PR before it is merged.

**What blocks approval:** The reviewer cannot run the feature, existing functionality breaks, there are unresolved merge conflicts, the feature does not meet its issue requirements, or the author cannot explain code they added—including AI-generated code. Small formatting/style preferences do not block a merge.

**Review response time:** First response within 24 hours on weekdays. If the assigned reviewer cannot review it in that time, they tell the team so someone else can take it.

**Comment conventions:** nit: for an optional/small improvement · q: for a question that should be answered · blocker: for something that must be fixed before merging · praise: for something done particularly well.

## 5 · AI Working Norms

**Course policy (not optional):** no AI-generated code gets merged unread.
The PR author owns every line they open, wherever it came from. AI
explanations get verified by running the code.

**How we use AI as a team:** AI can act as a pair programmer and learning tool. We can use it to explain unfamiliar concepts, brainstorm implementation approaches, debug errors, suggest tests, and draft code that we then read, understand, modify when necessary, and test ourselves.

**What we never delegate to AI:** The schema and migrations (hand-typed, per kickoff), anything touching user scoping, and the review itself a reviewer reads the diff, not a summary of it.

## 6 · When Things Go Wrong

Stuck protocol (course default): 15 minutes stuck → post in the team
thread → still stuck at stand-up → TA → office hours.

**If someone can't deliver on time:** Tell the team as soon as you know rather than waiting for the deadline. At the next check-in, we decide whether to reduce the scope, move the issue to the following week, pair with that person, or redistribute part of the work.

**If we have a conflict:** name it at stand-up, out loud, kindly. If it's still there next stand-up, Instuctor mediates.

## 7 · Commitment

We wrote this together, we mean it, and we'll revisit it at midterm and
update what isn't working.

| Signed | Date |
|--------|------|
| Alyssa Johnson |  Sep 24, 2026    |
| Olivia Jervise |  Sep 24, 2026    |
| Nathan Chin    |   Sep 24, 2026   |

