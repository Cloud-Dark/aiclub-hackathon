export default {
  "meta": {
    "lang": "en",
    "label": "EN",
    "name": "English",
    "title": "AI Agent Hackathon Registration"
  },
  "top": {
    "open": "registration Oct 15 – Nov 1",
    "demo": "demo day late Nov · Jakarta",
    "langLabel": "Language"
  },
  "steps": [
    {
      "label": "SIGN UP",
      "ket": "details, quiz & team"
    },
    {
      "label": "TENCENT",
      "ket": "register team"
    },
    {
      "label": "SUBMIT",
      "ket": "send project"
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
    "sub": "Tencent Cloud Indonesia · registration closes Nov 1",
    "body": "Sign up solo first, no team needed. Answer 6 scenarios and we'll drop you on the track that fits best — maybe CEO, maybe AI engineer, maybe the one who gets the problem best. Then you hit the team market: recruit, or get recruited.",
    "cta": "START SIGNING UP",
    "ctaHint": "free · 4 minutes · no pro skills needed",
    "whyTitle": "WHY A QUIZ",
    "whyBody": "People often misjudge their own role. The self-proclaimed CEO turns out to be an engineer. The one who's \"just tagging along\" is the only one who gets the problem."
  },
  "identity": {
    "step": "step 1 of 3 · your details",
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
    "waPh": "+62 8xx xxxx xxxx",
    "linkedin": "LINKEDIN",
    "linkedinPh": "optional, profile link",
    "optional": "optional",
    "fromAccount": "Linked to your aiclub.id account. Fill in what's missing; city and WhatsApp are required.",
    "errCity": "Fill in your city first",
    "errWa": "WhatsApp number doesn't look right (9-15 digits)",
    "emailLocked": "from your aiclub.id account",
    "github": "GITHUB",
    "githubPh": "https://github.com/username"
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
    "openTraining": "Build with WorkBuddy and pick 1 of 3 challenges",
    "redo": "Retake",
    "toGroup": "JOIN WHATSAPP GROUP"
  },
  "roles": {
    "CEO": {
      "ringkas": "CEO / IDEA OWNER",
      "nama": "CEO / Idea owner",
      "desc": "You move from direction and people. Your job: pick a problem worth working on until demo day, then pull in people who believe."
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
      "teks": "Finalists present onsite in Jakarta. Five minutes, plus Q&A. You own the first minute.",
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
  "market": {
    "prompt": "team market · closes Nov 1",
    "titleTwoWay": "TWO-WAY: APPLY OR GET INVITED",
    "titleDraft": "TEAMS RECRUIT, YOU APPLY",
    "asRole": "you're joining as",
    "tabTeams": "TEAMS THAT NEED YOU",
    "tabBuilders": "BUILDERS SEEKING TEAMS",
    "members": "{n} members",
    "ceo": "CEO {name}",
    "slots": "OPEN SLOTS",
    "stMatch": "MATCHES YOUR TRACK",
    "stOpen": "OPEN",
    "stSent": "APPLICATION SENT",
    "apply": "APPLY FOR THIS SLOT",
    "withdraw": "WITHDRAW",
    "invite": "INVITE TO MY TEAM",
    "invited": "INVITE SENT",
    "needCeo": "CEO TRACK ONLY",
    "summary": "{a} active applications",
    "toStatus": "SEE MY STATUS",
    "stApproved": "APPROVED",
    "stRejected": "REJECTED",
    "yourTeam": "YOUR TEAM",
    "youOwner": "YOU'RE THE OWNER",
    "openGroup": "OPEN TEAM GROUP",
    "rejectedBtn": "APPLICATION REJECTED",
    "groupSoon": "GROUP LINK COMING",
    "hint": "A person can only apply to one team at a time. Want to switch? Withdraw your current application first. The WhatsApp group link only opens once the owner approves you.",
    "lockedOwner": "You own a team. Close it first to apply elsewhere.",
    "lockedMember": "You're already in a team.",
    "viewDetail": "VIEW DETAILS",
    "appliedElsewhere": "ALREADY APPLIED",
    "shortMember": "ALREADY IN A TEAM",
    "oneAtATime": "You're still applying to {team}. Withdraw that application first to apply to another team.",
    "viaLink": "VIA LINK"
  },
  "dash": {
    "greeting": "{name}, NO TEAM YET",
    "guest": "PARTICIPANT",
    "actsTitle": "APPLICATIONS & INVITES",
    "empty": "No applications yet. Head back to the team market and apply to a team that fits you.",
    "appliedKet": "your application · waiting on CEO",
    "appliedSt": "PENDING",
    "invitedKet": "your invite · no reply yet",
    "invitedSt": "SENT",
    "roadTitle": "ROAD TO DEMO DAY",
    "formed": "TEAMS FORMED",
    "formedBody": "from 120+ sign-ups · goal: 30 teams",
    "yourRole": "YOUR TRACK",
    "challengeTitle": "CHALLENGE FROM TENCENT",
    "challengeBody": "Drops in week 2, along with the briefing. Until then, build your team.",
    "toMarket": "BACK TO TEAM MARKET",
    "restart": "Start over",
    "approvedKet": "approved by owner · time to join the team group",
    "rejectedKet": "rejected by owner · try another team",
    "stApproved": "APPROVED",
    "stRejected": "REJECTED",
    "joinTeam": "JOIN TEAM GROUP",
    "noLink": "owner hasn't added a group link yet",
    "demoNote": "DEMO MODE · owner decisions are simulated on this device",
    "simApprove": "APPROVE",
    "simReject": "REJECT",
    "mainTitle": "MAIN HACKATHON GROUP",
    "mainJoined": "joined",
    "mainOpen": "OPEN GROUP",
    "logTitle": "YOUR ACTIVITY",
    "logEmpty": "No activity yet.",
    "log": {
      "joinMain": "Joined the main hackathon group",
      "apply": "Applied to {team}",
      "withdraw": "Withdrew application from {team}",
      "approved": "{team} approved your application",
      "rejected": "{team} rejected your application",
      "invite": "Invited {who} to your team",
      "uninvite": "Cancelled invite to {who}",
      "openTeam": "Opened team {team}",
      "approveWho": "Approved {who} into your team",
      "rejectWho": "Rejected {who}",
      "closeTeam": "Closed team {team}",
      "leave": "Left team {team}",
      "autoWithdraw": "Application to {team} cancelled automatically",
      "withdrawAll": "Withdrew all applications",
      "autoReject": "Application to {team} rejected automatically (over 24 hours)",
      "autoRejectWho": "{who}'s application rejected automatically (over 24 hours)",
      "chat": "Sent a message in {team} chat"
    },
    "myTeam": {
      "title": "MY TEAM",
      "createTitle": "START YOUR OWN TEAM",
      "createBody": "You become the owner: create the team's WhatsApp group, then approve or reject applicants.",
      "name": "TEAM NAME",
      "namePh": "e.g. LAPOR WARGA",
      "desc": "DESCRIPTION",
      "descPh": "one sentence: what this agent solves",
      "slots": "OPEN SLOTS",
      "wa": "TEAM WHATSAPP GROUP LINK",
      "waPh": "https://chat.whatsapp.com/...",
      "waHint": "Create a group in WhatsApp, copy the invite link and paste it here. Applicants you approve will see this link.",
      "createBtn": "OPEN TEAM",
      "save": "SAVE LINK",
      "saved": "Group link saved",
      "errName": "Enter a team name first",
      "errSlot": "Pick at least one slot",
      "errWa": "Link must start with https://chat.whatsapp.com/",
      "inbox": "INCOMING APPLICANTS",
      "noApplicants": "No applicants yet.",
      "approve": "APPROVE",
      "reject": "REJECT",
      "pending": "PENDING",
      "approved": "APPROVED",
      "rejected": "REJECTED",
      "openGroup": "OPEN TEAM GROUP",
      "noLink": "No group link yet · add it above",
      "close": "CLOSE TEAM",
      "invite": "INVITE",
      "invited": "SENT",
      "shareTitle": "SHARE TEAM LINK",
      "shareBody": "Send this link to potential members. Anyone who opens it can see your team and apply after completing registration.",
      "copy": "COPY LINK",
      "copied": "Team link copied",
      "copyFail": "Copy failed, copy it manually from the box above",
      "shareWa": "SHARE TO WHATSAPP",
      "shareMore": "SHARE…",
      "shareMsg": "Join team {team} at the AI Agent Hackathon! We are looking for: {slots}. Apply via this link:",
      "shareDemo": "Demo mode: applications via link do not reach your applicant inbox until the aiclub.id backend is connected. The team WhatsApp group link is not included in this link."
    },
    "changeChoice": "CHANGE MY CHOICE",
    "memberTag": "MEMBER",
    "inviteTitle": "INVITE BUILDERS",
    "inviteBody": "Builders looking for a team. Your invites show up here.",
    "toTencent": "ON TO STEP 2"
  },
  "teams": [
    "An agent that matches merchant transactions every night, no humans needed.",
    "A sidekick agent for small neighborhood shops: take payments, track stock, all from one chat.",
    "A micro-loan risk scorer that can explain its reasoning.",
    "An internal agent that answers ops team questions from old docs.",
    "An agent that reschedules public service queues in small towns.",
    "An agent that reads vendor contracts and flags risky clauses."
  ],
  "builders": [
    "Built two agents with tool-calling. Never worked on a team.",
    "4 years in product design. Looking for a team that wants its prototype actually used.",
    "7 years in payment ops. Knows where the process leaks.",
    "Retail data analyst. Can prove whether the agent saves time or not.",
    "Backend, deploys my own stuff. Need someone who knows the real problem.",
    "Grew a community of 8K people from zero. Looking for a team with a product ready to use."
  ],
  "schedule": [
    {
      "minggu": "OCT 15",
      "judul": "Registration opens",
      "ket": "Sign up at aiclub.id, join the WhatsApp group, then pick one challenge."
    },
    {
      "minggu": "NOV 1 · 23:59 WIB",
      "judul": "Registration & submission deadline",
      "ket": "Team market and registration close. Submit the Agentic AI project you built with WorkBuddy."
    },
    {
      "minggu": "NOV 14",
      "judul": "Finalists announced",
      "ket": "Finalists are announced."
    },
    {
      "minggu": "NOV 27 · 13:00–16:00 WIB",
      "judul": "Demo Day & Awarding, Jakarta",
      "ket": "Finalists present. 1st, 2nd and 3rd place announced."
    }
  ],
  "group": {
    "prompt": "required step · main group",
    "title": "JOIN THE MAIN GROUP FIRST",
    "required": "REQUIRED",
    "s1": "STEP 1 · REQUIRED",
    "s1t": "Join the Hackathon WhatsApp group",
    "s1b": "All official info, briefings and announcements live in the main group. You must join before you can apply to a team.",
    "joinCta": "CLICK HERE TO JOIN WHATSAPP",
    "s2": "STEP 2",
    "s2t": "Introduce yourself in the group",
    "s2b": "Your details are put together as a message. Just send it in the group so other participants and team owners know who you are.",
    "shareCta": "CLICK HERE TO SEND YOUR INFO TO WHATSAPP",
    "previewTitle": "MESSAGE PREVIEW",
    "confirm": "I'VE JOINED",
    "confirmHint": "Click the join button above first, then you can continue.",
    "joined": "Joined the main group",
    "next": "NEXT: CHOOSE YOUR PATH",
    "gate": "Join the main group before entering the team market",
    "msg": {
      "head": "Hi, I'm a participant of the AI Agent Hackathon",
      "name": "Name",
      "city": "City",
      "email": "Email",
      "latar": "Background",
      "wa": "WhatsApp",
      "linkedin": "LinkedIn",
      "role": "Track",
      "role2": "Second track",
      "github": "GitHub"
    }
  },
  "login": {
    "prompt": "login/aiclub.id",
    "title": "SIGN IN WITH AICLUB.ID",
    "body": "Use your AIClub.id community account so your data stays linked. After signing in, fill in whatever is missing, then the team market opens.",
    "badge": "DUMMY · NOT CONNECTED TO THE REAL AICLUB.ID",
    "email": "AICLUB.ID EMAIL",
    "emailPh": "name@aiclub.id",
    "pass": "PASSWORD",
    "passPh": "anything, it's a dummy",
    "submit": "SIGN IN",
    "demoTitle": "OR USE A DEMO ACCOUNT",
    "demoHint": "Each account has a different profile: some are missing city or WhatsApp.",
    "errEmail": "That email doesn't look right",
    "errPass": "Enter a password first",
    "logout": "SIGN OUT",
    "as": "Signed in as"
  },
  "sub": {
    "group": "MAIN GROUP",
    "choose": "CHOOSE",
    "join": "APPLY",
    "create": "CREATE TEAM",
    "status": "STATUS",
    "data": "DETAILS",
    "quiz": "SCENARIOS",
    "track": "TRACK",
    "team": "TEAM",
    "teamCreate": "CREATE TEAM"
  },
  "choose": {
    "prompt": "choose your path",
    "title": "JOIN A TEAM OR START ONE?",
    "body": "Pick one. A person can belong to one team, or run one team. Not both at the same time.",
    "joinTitle": "JOIN A TEAM",
    "joinBody": "Apply to an existing team. The team owner approves you, then you enter that team's WhatsApp group.",
    "joinCta": "FIND A TEAM",
    "createTitle": "START A TEAM",
    "createBody": "You become the owner: create the team's WhatsApp group, invite builders, then approve or reject applicants.",
    "createCta": "START MY OWN TEAM",
    "now": "YOUR CURRENT CHOICE",
    "continueJoin": "CONTINUE TO MY APPLICATIONS",
    "continueCreate": "CONTINUE TO MY TEAM",
    "lockedOwner": "You're the owner of team {team}. Close the team first if you want to join another.",
    "lockedMember": "You're already in team {team}. Leave first if you want to start your own.",
    "lockedPending": "You still have {n} pending application(s). Withdraw them first if you want to start a team.",
    "closeTeam": "CLOSE TEAM",
    "leaveTeam": "LEAVE TEAM",
    "withdrawAll": "WITHDRAW ALL APPLICATIONS",
    "sure": "SURE? CLICK AGAIN"
  },
  "create": {
    "prompt": "create team",
    "title": "CREATE A TEAM",
    "s1": "1 · YOUR TEAM",
    "s2": "2 · WHO YOU'RE LOOKING FOR",
    "s3": "3 · TEAM WHATSAPP GROUP"
  },
  "ann": {
    "nav": "ANNOUNCEMENTS",
    "prompt": "info/announcements",
    "title": "ANNOUNCEMENTS",
    "lead": "Official updates from the organizers for all participants. Click to read the details.",
    "pinned": "PINNED",
    "views": "{n} views",
    "new": "NEW",
    "read": "READ",
    "open": "READ",
    "back": "BACK TO LIST",
    "latest": "LATEST ANNOUNCEMENTS",
    "all": "SEE ALL ANNOUNCEMENTS",
    "unread": "{n} unread",
    "demo": "Demo mode: view count = sample number + your views on this device. Each account counts once per announcement."
  },
  "announcements": [
    {
      "judul": "Finalist and Demo Day schedule",
      "ringkas": "Finalists announced Nov 14, Demo Day & Awarding Nov 27 in Jakarta.",
      "isi": [
        "After the submission deadline on Nov 1, 23:59 WIB, the organizers review every submitted project.",
        "Finalists are announced on Nov 14. They present their work at Demo Day & Awarding on Nov 27, 13:00–16:00 WIB in Jakarta.",
        "1st, 2nd, and 3rd place are announced at the event."
      ]
    },
    {
      "judul": "Reminder: registration closes Nov 1, 23:59 WIB",
      "ringkas": "Team registration and submissions close Nov 1 at 23:59 WIB.",
      "isi": [
        "The team market and registration close on Nov 1 at 23:59 WIB. Agentic AI projects are due by the same deadline.",
        "Make sure your team is registered on the Tencent portal (step 2) and your project is submitted (step 3) before the deadline."
      ]
    },
    {
      "judul": "Team rule: owners decide within 24 hours",
      "ringkas": "Applications not decided by the owner within 24 hours are rejected automatically.",
      "isi": [
        "One person can be a member of one team or the owner of one team, and may have only one active application.",
        "Owners have 24 hours from when an application arrives to approve or reject it. After that it is rejected automatically so the applicant can look for another team.",
        "While waiting, applicants may withdraw. Once approved, members can see the other team members with their contacts and chat in the team room."
      ]
    },
    {
      "judul": "AI Agent Hackathon registration is open",
      "ringkas": "Register on this portal, register your team with Tencent, then submit your project.",
      "isi": [
        "Registration opened on Oct 15. There are three steps: register on this portal (details, scenarios, main group, team), register your team on the Tencent portal, then submit your project.",
        "Join the main WhatsApp group to receive official updates from the organizers."
      ]
    }
  ],
  "room": {
    "title": "MEMBERS & CONTACTS",
    "owner": "OWNER",
    "you": "YOU",
    "noContact": "Owner contacts appear once the backend is connected.",
    "locked": "Members, contacts, and team chat unlock once your application is approved.",
    "chatTitle": "TEAM CHAT",
    "ph": "Write a message to your team…",
    "send": "SEND",
    "empty": "No messages yet. Say hi to your team.",
    "welcome": "Hi, welcome to team {team}! Introduce yourself here.",
    "demo": "Demo mode: messages are stored on this device only. Once the backend is connected, chat syncs to every member.",
    "errEmpty": "Write a message first",
    "label": "Team chat message"
  },
  "deadline": {
    "left": "The owner has {h} h {m} min left to decide",
    "leftOwner": "{h}h {m}m left",
    "expired": "Rejected automatically: the owner did not decide within 24 hours",
    "auto": "AUTO-REJECTED"
  },
  "invite": {
    "banner": "You are invited to team {team}. Finish the registration steps and you will be taken straight to this team's page to apply.",
    "bad": "Team link is invalid or broken",
    "own": "This is your own team link"
  },
  "detail": {
    "prompt": "detail/{team}",
    "about": "ABOUT THE TEAM",
    "city": "CITY",
    "members": "MEMBERS",
    "owner": "OWNER",
    "opened": "OPENED",
    "days": "{n} days ago",
    "slots": "OPEN SLOTS",
    "matchYes": "Matches your track",
    "matchNo": "Not exactly your track, but you can still apply",
    "group": "TEAM WHATSAPP GROUP",
    "groupName": "{team} group",
    "groupSize": "{n} people in the group",
    "groupBody": "Daily team discussion. The group link only opens once the owner approves your application.",
    "how": "HOW TO GET IN",
    "h1": "Apply to this team",
    "h2": "Owner approves",
    "h3": "Join the WhatsApp group",
    "sNone": "You haven't applied to this team.",
    "sPending": "Application sent. Waiting for the owner's approval.",
    "sApproved": "Approved! Time to join the team's WhatsApp group.",
    "sRejected": "The owner rejected your application. Try another team.",
    "join": "JOIN TEAM WHATSAPP GROUP",
    "locked": "GROUP LINK LOCKED · WAITING FOR APPROVAL",
    "back": "BACK TO TEAM LIST",
    "otherTeam": "You're applying to {team}. Withdraw that application first to apply to this team.",
    "inTeam": "You're already in team {team}. Leave first if you want to switch."
  },
  "tencent": {
    "prompt": "step 2 of 3",
    "title": "REGISTER YOUR TEAM WITH TENCENT",
    "body": "After signing up on our portal, your team must also be registered on the Tencent portal. Usually the team owner does it.",
    "teamTitle": "YOUR TEAM STATUS",
    "teamOwner": "You own team {team}. Register your team now.",
    "teamMember": "You're in team {team}. Make sure your team owner has registered the team with Tencent.",
    "teamPending": "Your application to {team} is still waiting for the owner's approval.",
    "teamNone": "You don't have a team yet. Go back to step 1 to apply to one or create your own.",
    "toTeam": "BACK TO STEP 1",
    "cta": "CLICK HERE TO REGISTER YOUR TEAM WITH TENCENT",
    "opened": "Tencent portal opened",
    "hint": "The link opens in a new tab. When you're done, come back here.",
    "next": "ON TO SUBMIT PROJECT",
    "later": "Step 3 comes later, once your project is built."
  },
  "submit": {
    "prompt": "step 3 of 3",
    "title": "SUBMIT YOUR PROJECT TO TENCENT",
    "body": "The last step. Do this once your project is finished, not before.",
    "ready": "My project is finished and ready to send",
    "readyHint": "Tick this first to unlock the submit button.",
    "cta": "CLICK HERE TO SUBMIT YOUR PROJECT TO TENCENT",
    "sent": "Submission portal opened. Good luck at Demo Day!",
    "restart": "Start over"
  },
  "event": {
    "title": "TENCENT CLOUD HACKATHON INDONESIA 2026",
    "tagline": "Build AI agents that actually help with work, not just chat, using WorkBuddy.",
    "collab": "A Tencent Cloud & AICLUB.ID collaboration · free",
    "prizeTitle": "TOTAL PRIZES",
    "prizeTotal": "USD 3,100",
    "place": [
      "1ST PLACE",
      "2ND PLACE",
      "3RD PLACE"
    ],
    "datesTitle": "KEY DATES",
    "dates": [
      {
        "d": "OCT 15",
        "l": "Registration opens"
      },
      {
        "d": "NOV 1",
        "l": "Registration & submission deadline, 23:59 WIB"
      },
      {
        "d": "NOV 14",
        "l": "Finalists announced"
      },
      {
        "d": "NOV 27",
        "l": "Demo Day & Awarding · Jakarta, 13:00–16:00 WIB"
      }
    ],
    "challengeTitle": "PICK 1 OF 3 CHALLENGES",
    "challenges": [
      {
        "name": "The Workplace Brain",
        "tag": "LEARN ANYWHERE",
        "desc": "Agents that help people learn and find knowledge at work."
      },
      {
        "name": "The Office Agent",
        "tag": "AUTOMATE BETTER",
        "desc": "Agents that automate repetitive office work."
      },
      {
        "name": "The Creator Agent",
        "tag": "CREATE BOLDER",
        "desc": "Agents that help creators make bolder work."
      }
    ],
    "partnersTitle": "SUPPORTED BY",
    "posterAlt": "Official Tencent Cloud Hackathon Indonesia 2026 poster",
    "venue": "Jakarta · venue details coming soon"
  }
};
