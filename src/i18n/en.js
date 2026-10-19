export default {
  "meta": {
    "lang": "en",
    "label": "EN",
    "name": "English",
    "title": "AI Agent Hackathon Registration"
  },
  "top": {
    "open": "registration opens Oct 15",
    "demo": "demo day late Nov · Jakarta",
    "langLabel": "Language"
  },
  "steps": [
    {
      "label": "SIGN UP",
      "ket": "name & city"
    },
    {
      "label": "SCENARIOS",
      "ket": "{n} questions"
    },
    {
      "label": "TRACK",
      "ket": "role detected"
    },
    {
      "label": "WHATSAPP",
      "ket": "join the group"
    }
  ],
  "combo": {
    "search": "Search…",
    "empty": "No match for “{q}”",
    "count": "{n} options"
  },
  "nav": {
    "back": "Back",
    "next": "Next",
    "home": "Home",
    "stepOf": "Step {a} of {b}",
    "locked": "Finish the previous step first"
  },
  "intro": {
    "prompt": "register/ai-agent-hackathon",
    "title1": "AI AGENT",
    "title2": "HACKATHON",
    "sub": "Tencent Cloud Indonesia · 6 weeks",
    "body": "Sign up solo first, no team needed. Answer 6 scenarios and we'll drop you on the track that fits best — maybe CEO, maybe AI engineer, maybe the one who gets the problem best. Then you hit the team market: recruit, or get recruited.",
    "cta": "START SIGNING UP",
    "ctaHint": "free · 4 minutes · no pro skills needed",
    "whyTitle": "WHY A QUIZ",
    "whyBody": "People often misjudge their own role. The self-proclaimed CEO turns out to be an engineer. The one who's \"just tagging along\" is the only one who gets the problem.",
    "targetTitle": "WHO CAN JOIN",
    "targetBody": "all of Indonesia · online, final onsite"
  },
  "identity": {
    "step": "step 1 of 4",
    "title": "WHO ARE YOU",
    "name": "NAME",
    "namePh": "nickname works too",
    "city": "CITY",
    "cityPh": "Kupang, Malang, Jakarta...",
    "email": "EMAIL",
    "emailPh": "for team invites",
    "now": "RIGHT NOW YOU'RE",
    "latar": {
      "kerja-tech": "Working at a tech company",
      "kerja-nontech": "Working at a non-tech company",
      "mahasiswa": "University student / student",
      "freelance": "Freelancer / contractor",
      "founder": "Building my own business",
      "cari-kerja": "Looking for a job"
    },
    "note": "This doesn't decide your role. Your role comes from how you answer the scenarios in the next step.",
    "next": "ON TO SCENARIOS",
    "errName": "Fill in your name first",
    "errEmail": "That email doesn't look right",
    "wa": "WHATSAPP",
    "waPh": "optional, +62…",
    "linkedin": "LINKEDIN",
    "linkedinPh": "optional, profile link",
    "optional": "optional"
  },
  "quiz": {
    "progress": "scenario {a} of {b}",
    "noRight": "there's no right answer",
    "next": "NEXT",
    "finish": "SEE RESULTS",
    "pick": "Pick an answer first"
  },
  "result": {
    "prompt": "role detection result",
    "main": "MAIN TRACK",
    "second": "SECOND TRACK",
    "fixTitle": "WE CAN BE WRONG — FIX IT HERE",
    "fixBody": "If the track feels off, switch it. Whatever you pick here is what the team market uses.",
    "scoreTitle": "SCORE PER TRACK",
    "openTitle": "WHAT'S OPEN TO YOU",
    "openTeam": "Start your own team and recruit members",
    "openTeamLocked": "Only the CEO track can start a team in this mode",
    "openApply": "Apply to teams that need a {role}",
    "openInvited": "Get invited directly by other teams",
    "openTraining": "WorkBuddy & CodeBuddy training, weeks 3-4",
    "redo": "Retake",
    "toFinal": "LAST 2 STEPS"
  },
  "roles": {
    "CEO": {
      "ringkas": "CEO / IDEA OWNER",
      "nama": "CEO / Idea owner",
      "desc": "You move from direction and people. Your job: pick a problem worth six weeks, then pull in people who believe."
    },
    "CTO": {
      "ringkas": "CTO / ENGINEER",
      "nama": "CTO / Engineer",
      "desc": "You move from what actually runs. Your instinct is to open the editor first, not a doc."
    },
    "AI": {
      "ringkas": "AI / AGENT ENGINEER",
      "nama": "AI / Agent engineer",
      "desc": "You think of agents as systems that can fail. Tool-calling, permission limits, evals."
    },
    "PM": {
      "ringkas": "PRODUCT / PM",
      "nama": "Product / PM",
      "desc": "You cut. Out of ten things that could be built, you know the one that ships first."
    },
    "DSG": {
      "ringkas": "DESIGNER",
      "nama": "Designer",
      "desc": "You're the one who notices the prototype works but nobody can use it. Flow, not decoration."
    },
    "GRW": {
      "ringkas": "GROWTH / MARKETING",
      "nama": "Growth / Marketing",
      "desc": "You think about who'll use this tomorrow, and how they'll hear about it."
    },
    "DOM": {
      "ringkas": "DOMAIN EXPERT",
      "nama": "Domain expert (ops, risk, finance)",
      "desc": "You know how the work really gets done today. Without you, the team builds for the wrong problem."
    },
    "DAT": {
      "ringkas": "DATA ANALYST",
      "nama": "Data analyst",
      "desc": "You can prove the agent actually helps. Numbers before and after."
    }
  },
  "questions": [
    {
      "judul": "DAY ONE",
      "teks": "Your team gets a challenge from Tencent: reconciling merchant transactions that are still done by hand every night. What do you do in the first hour?",
      "opsi": [
        "Call the two people who do it every night and ask them to walk through it",
        "Sketch the agent flow first — steps, inputs, where it gets to decide",
        "Open the editor, hit the API, see what's actually usable",
        "Decide who does what and what has to ship by end of week",
        "Pull the data first, count how many transactions fail to match each day"
      ]
    },
    {
      "judul": "THE PROTOTYPE WORKS, BUT IT'S UGLY",
      "teks": "It works. But the first person to try it got confused in three different places. Three days left before submission.",
      "opsi": [
        "Clean up the flow: cut two steps, one clear main button",
        "Leave it. Judges score function, and that's already right",
        "Ask three potential users which part made them stop",
        "Write a tight demo script so the flow reads like a story"
      ]
    },
    {
      "judul": "YOUR AGENT MAKES STUFF UP",
      "teks": "In one out of ten chats, your agent answers confidently but wrong. Demo day is two weeks away.",
      "opsi": [
        "Switch to tool-calling, give it less room to guess",
        "Build automated evals first, measure on 100 cases, then fix",
        "Narrow its scope: just one job it's allowed to handle",
        "Add a human escalation path — mistakes here are expensive"
      ]
    },
    {
      "judul": "SOMEONE GOES MISSING",
      "teks": "Two weeks before demo day, a teammate stops replying. Their part isn't done.",
      "opsi": [
        "I'll take over their part, tonight",
        "Reopen that slot in the team market, recruit today",
        "Cut the feature they owned, lock the scope",
        "Change the demo story so that part isn't needed"
      ]
    },
    {
      "judul": "FIVE MINUTES WITH THE JUDGES",
      "teks": "Top 8 present onsite in Jakarta. Five minutes, plus Q&A. You own the first minute.",
      "opsi": [
        "Whose problem it is, how much it costs, why us",
        "Live demo, one full flow, no slides",
        "Before and after: 40 minutes a day then, two minutes now",
        "One user, one workday, from stuck to done"
      ]
    },
    {
      "judul": "AFTER THE HACKATHON",
      "teks": "Demo day is over. Where do you take this prototype?",
      "opsi": [
        "Turn it into a business. I'll find a cofounder and first users",
        "Open source it so others can use it and build on it",
        "Deploy it at my own workplace — it's our problem anyway",
        "I'll handle distribution. Great work with no users is zero",
        "I want to know why it worked or failed, then write it up"
      ]
    }
  ],
  "final": {
    "prompt": "last 2 steps",
    "title": "LAST 2 STEPS",
    "s1": "STEP 1",
    "s1t": "Join the WhatsApp group",
    "s1b": "Participant info, briefings and team forming all happen in this group.",
    "joinCta": "CLICK HERE TO JOIN WHATSAPP",
    "s2": "STEP 2",
    "s2t": "Share your info in the group",
    "s2b": "Your details are put together as a message. Just send it in the group so others know who you are.",
    "shareCta": "CLICK HERE TO SEND YOUR INFO TO WHATSAPP",
    "previewTitle": "MESSAGE PREVIEW",
    "done": "All done. See you in the group!",
    "restart": "Start over",
    "msg": {
      "head": "Hi, I'm a participant of the AI Agent Hackathon",
      "name": "Name",
      "city": "City",
      "email": "Email",
      "latar": "Background",
      "wa": "WhatsApp",
      "linkedin": "LinkedIn",
      "role": "Track",
      "role2": "Second track"
    }
  }
};
