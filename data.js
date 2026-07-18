const VERSION = "0.76.2-alpha";

const TIER_VALUE = { clean: 0, hairline: 1, crack: 2 };

function assetImg(name) { return `asset/img/${encodeURIComponent(name)}`; }

const COVERS = {
  fixer:       { name: "The Fixer",       flavor: "Doesn't get precious about method: if the math says bend the rule, it bends. Outcome's the only scoreboard. Sleeps fine either way; regret is just paperwork nobody asked for.", img: assetImg("cover-01.png") },
  companyLine: { name: "The Company Line", flavor: "Order came down, order gets followed. No freelancing around it, whatever it costs. Carries the order folded in a pocket like scripture.", img: assetImg("cover-02.png") },
  oldHand:     { name: "The Old Hand",     flavor: "Handles anything without losing composure; steady hands beat clever ideas. Has seen every kind of night go bad and walked out of all of them at the same pace.", img: assetImg("cover-03.png") },
  contact:     { name: "The Contact",      flavor: "Can't just watch; shows up, stays close, does something for the person in front of them. Remembers your name, your trouble, and how you take your tea.", img: assetImg("cover-04.png") },
  broker:      { name: "The Broker",       flavor: "A deal's a deal; won't step outside agreed terms without checking first. Forgets faces, never terms.", img: assetImg("cover-05.png") },
};

const FACETS = {
  quartermaster: { name: "The Quartermaster", flavor: "Does the practical task rather than talking about it. You'll find the thing already fixed before anyone mentions it was broken.", img: assetImg("facet-01.png") },
  constant:      { name: "The Constant",      flavor: "Gives full attention, stays present through the whole thing. Doesn't glance at the clock; the clock can wait its turn.", img: assetImg("facet-02.png") },
  cartographer:  { name: "The Cartographer",  flavor: "Reads the overall shape, acts on the big picture. Fine print is for later; the horizon's already talking.", img: assetImg("facet-03.png") },
  planner:       { name: "The Planner",       flavor: "Sticks to the plan as set and doesn't like it moved. Treats surprises as a personal insult.", img: assetImg("facet-04.png") },
  surveyor:      { name: "The Surveyor",      flavor: "Wants the concrete detail confirmed before moving. Won't call it raining until the whiskers are wet.", img: assetImg("facet-05.png") },
  briefer:       { name: "The Briefer",       flavor: "Talks people through it; the right words land better than anything else. Never met a silence that couldn't be improved on.", img: assetImg("facet-06.png") },
  shadow:        { name: "The Shadow",        flavor: "Shows up physically: a hand, standing close, presence over words. Says more with a shoulder than most manage in a speech.", img: assetImg("facet-07.png") },
  courier:       { name: "The Courier",       flavor: "Passes it along, trusts it'll land where it needs to. Never arrives empty-handed.", img: assetImg("facet-08.png") },
  face:          { name: "The Face",          flavor: "Comfortable being seen and heard, engages directly. Finds the centre of any room by instinct and stays there.", img: assetImg("facet-09.png") },
  analyst:       { name: "The Analyst",       flavor: "Works it through logically before acting. Feelings are data; they can wait in the queue.", img: assetImg("facet-10.png") },
  improviser:    { name: "The Improviser",    flavor: "Adapts on the spot to what's happening now. Plans are lovely things to leave behind.", img: assetImg("facet-11.png") },
};

const HANDLER_IMG = assetImg("handler.png");

const WHODUNNIT_NAME_POOL = ["Mittens", "Pepper", "Clover", "Biscuit", "Tibbs", "Marmalade", "Suki", "Rascal", "Pip", "Willow", "Nutmeg", "Boots", "Socks", "Pickles", "Bramble", "Ginger", "Rocket", "Basil", "Cleo", "Tilley", "Loki", "Pixel", "Lucifur", "Felix", "Klaus", "Henry", "Lex", "Shami"];
const CUSTOM_NAME_POOL = [];
const WHODUNNIT_TELL_PARA = "Three of these are innocent; one slip isn't a pattern. Watch for whoever slips, scene after scene, and name the imposter.";

const OVER9000_IMG = assetImg("ee9k.png");
const PI_IMG = assetImg("eepi.png");
const MORSE_IMG = assetImg("eemc.png");
const EGG_FLAVOR = "No cover to read here. This one's a comms check: verify the signal, send the clean copy.";

const CAT_GALLERY_COUNT = 41;
const AVATAR_POOL = [
  ...Object.values(COVERS).map(c => c.img),
  ...Object.values(FACETS).map(f => f.img),
  ...Array.from({ length: CAT_GALLERY_COUNT }, (_, i) => assetImg(`cat-${String(i + 2).padStart(2, "0")}.png`)),
];

const SCORE_EGGS = [
  {
    id: "pi",
    threshold: 314,
    exact: true,
    img: PI_IMG,
    caption: "PIECES OF PI",
    status: "🐾 The Handler's tail curls into a question mark. “You found π.  Remember: π is irrational.  Don't be like π.”",
  },
  {
    id: "morse",
    threshold: 1844,
    img: MORSE_IMG,
    caption: "WHAT HATH GOD WROUGHT",
    status: "🐾 The Handler's paw taps out a slow rhythm on the desk. “Eighteen forty-four.”",
  },
  {
    id: "over9000",
    threshold: 9000,
    img: OVER9000_IMG,
    caption: "IT'S OVER 9000!",
    status: "🐾 The Handler's whiskers twitch, almost proud. “Over nine thousand. In all my lives I've not seen a cover held this long.”",
  },
];

const SCENARIOS = [
  {
    id: "MCA1",
    dispatch: "Exercise: Contact Assessment. Live-conditions mission, no backup.",
    situation: "Your car's died on a deserted highway at 2am: no signal, nearest servo a 4-hour walk. A stranger in a battered ute pulls over and offers to run you there and back. Something about them has your hackles up, and the highway is very empty.",
    options: ["Get in the ute; a lift offered at 2am is a lift taken.", "Talk to them for a minute first, then decide on the read; vet the driver before the seat.", "Decline and wait with the car for daylight; no ride is worth a bad read.", "Set the terms out loud first: straight there and back, no detours, then get in; a deal spoken is a deal you can hold."],
    mode: "full5",
    grid: {
      fixer:       ["clean", "hairline", "crack", "hairline"],
      companyLine: ["crack", "hairline", "clean", "crack"],
      contact:     ["crack", "clean", "crack", "hairline"],
      oldHand:     ["crack", "hairline", "clean", "crack"],
      broker:      ["crack", "hairline", "hairline", "clean"],
    },
  },
  {
    id: "MPU2",
    dispatch: "Exercise: Pretext Under Pressure. Live-conditions mission, single counterparty.",
    situation: "You're minding a family's house and cat for the weekend; the owners are interstate for a funeral, unreachable (mid-flight). A stranger knocks, saying a relative you've never heard of sent them to collect a ring of the deceased's, for the service within the hour.\n\nThey know real details about the family, have a flight of their own shortly, and can't reach the owners either. The cat won't settle, watching the door from the hallway shelf, tail flicking.",
    options: ["Hand over the ring; a family in grief shouldn't wait on paperwork.", "Hand it over, but take their name, number and a photo first; goodwill still deserves a receipt.", "Refuse; you were trusted with the house, not its heirlooms.", "Tell them it's not yours to decide either way; some doors only the owners can open."],
    mode: "full5",
    grid: {
      fixer:       ["clean", "hairline", "crack", "crack"],
      oldHand:     ["clean", "crack", "crack", "crack"],
      contact:     ["hairline", "clean", "crack", "crack"],
      companyLine: ["crack", "hairline", "hairline", "clean"],
      broker:      ["crack", "clean", "crack", "hairline"],
    },
  },
  {
    id: "MFC3",
    dispatch: "Exercise: Forced Contact. Live-conditions mission, single counterparty, no safe decline.",
    situation: "On foot, hostile terrain, one route forward: through a checkpoint staffed by a single stranger who's sizing you up like a stray as you approach. Behind you is no safer and leads nowhere; curfew and terrain rule out waiting or going around, and you're carrying nothing worth offering as a bribe even if the guard looked like he'd take one.\n\nDeclining to engage isn't on the table; the checkpoint has to be crossed one way or another before conditions change against you.",
    options: ["Approach directly, answer whatever's asked straight; a plain answer gives the least to snag on.", "Approach with a story ready, lead with it before anything's asked; first words set the frame.", "Minimal engagement: pass with as little interaction as possible; the less said, the less to check.", "Stall: draw it out, hoping the situation changes before you commit; even a guard's shift ends eventually."],
    mode: "full5",
    grid: {
      fixer:       ["hairline", "clean", "hairline", "crack"],
      companyLine: ["clean", "crack", "hairline", "crack"],
      contact:     ["clean", "crack", "hairline", "crack"],
      oldHand:     ["hairline", "hairline", "clean", "crack"],
      broker:      ["clean", "crack", "hairline", "crack"],
    },
  },
  {
    id: "ESC1", level: "Easy",
    dispatch: "Exercise: Scope Creep. Live-conditions mission, no backup.",
    situation: "A neighbour asked you to water the plants, feed the cat and collect the mail while they're on a week-long trip, and left you a spare key for exactly that. On day three their cat leads you to the kitchen and sits staring at the sink cupboard: a small leak inside, dripping steadily onto the floor.\n\nThey're reachable by text, but it's the middle of the night for them and a reply could take hours.",
    options: ["Leave it; the brief said plants, cat, mail. Note it for their return.", "Text them first; some decisions belong to the owner, whatever the hour.", "Shut off the water at the valve under the sink; a leak doesn't wait on permission.", "Call a plumber and stay to let them in; knowing who to call is half the job.", "Set a bucket and towel to hold the line, and check it each time you're in."],
    mode: "full5",
    grid: {
      fixer:       ["crack", "hairline", "clean", "hairline", "crack"],
      companyLine: ["clean", "hairline", "crack", "crack", "crack"],
      contact:     ["crack", "hairline", "hairline", "clean", "hairline"],
      oldHand:     ["crack", "hairline", "hairline", "hairline", "clean"],
      broker:      ["hairline", "clean", "crack", "crack", "hairline"],
    },
  },
  {
    id: "ECD1", level: "Easy",
    dispatch: "Exercise: Bad News. Live-conditions mission, no backup.",
    situation: "A colleague just got bad news from home and stepped out to the corridor rather than sit with it in the station's ops room. You're the only one who followed.",
    options: ["Sit down right beside them, hand on their shoulder; some things land better without words.", "Sit with them and just stay, no phone, no rushing off; time given is time that counts.", "Get them water and take their next task off their hands; help that has to be asked for isn't help.", "Talk them through it and tell them plainly they're handling this fine; sometimes the words are the whole job.", "Duck into the canteen, bring back something small, then step back; a token can say what staying can't."],
    mode: "full5",
    grid: {
      shadow:        ["clean", "hairline", "crack", "hairline", "crack"],
      constant:      ["hairline", "clean", "crack", "hairline", "crack"],
      quartermaster: ["crack", "crack", "clean", "hairline", "hairline"],
      briefer:       ["hairline", "hairline", "crack", "clean", "crack"],
      courier:       ["crack", "crack", "hairline", "crack", "clean"],
    },
  },
  {
    id: "ENW2", level: "Easy",
    dispatch: "Exercise: Night Watch. Live-conditions mission, no backup.",
    situation: "A colleague has their first solo drop at dawn and is pacing the safehouse kitchen instead of turning in, restless, route notes untouched on the table.",
    options: ["Sit beside them at the table, shoulder to shoulder, without moving; presence you can feel beats advice.", "Stay in the kitchen with them as long as it takes; nobody paces out a first drop alone on your watch.", "Go double check the route timings and the fallback signal yourself; one less thing on their mind is worth an hour of yours.", "Tell them plainly they're ready for the morning and walk them through exactly why; confidence built on reasons holds.", "Leave a small keepsake on top of their packed kit, then step back out; something to find at dawn does the talking."],
    mode: "full5",
    grid: {
      shadow:        ["clean", "hairline", "crack", "hairline", "crack"],
      constant:      ["hairline", "clean", "crack", "hairline", "crack"],
      quartermaster: ["crack", "crack", "clean", "hairline", "hairline"],
      briefer:       ["hairline", "hairline", "crack", "clean", "crack"],
      courier:       ["crack", "crack", "hairline", "crack", "clean"],
    },
  },
  {
    id: "EFG3", level: "Easy",
    dispatch: "Exercise: Scrubbed Run. Live-conditions mission, no backup.",
    situation: "A colleague's first live pickup went wrong tonight, missed signal, drop scrubbed, and now they're alone in the station's back room, slowly re-packing a kit bag that doesn't need re-packing. You're the one who found them.",
    options: ["Sit on the bench beside them, shoulder against theirs, and stay put; you don't have to fix it to be there.", "Pull up a crate and keep them company as long as they need; the clock can wait.", "Take the kit return and the incident write-up off their hands; facing Control can wait for daylight.", "Tell them straight that one scrubbed run doesn't sink them, and lay out why the next one lands; a clear read beats a kind lie.", "Fetch something small and warm from the corner café, set it down beside them, then give them room; not everything kind needs company."],
    mode: "full5",
    grid: {
      shadow:        ["clean", "hairline", "crack", "hairline", "crack"],
      constant:      ["hairline", "clean", "crack", "hairline", "crack"],
      quartermaster: ["crack", "crack", "clean", "hairline", "hairline"],
      briefer:       ["hairline", "hairline", "crack", "clean", "crack"],
      courier:       ["crack", "crack", "hairline", "crack", "clean"],
    },
  },
  {
    id: "ELW4", level: "Easy",
    dispatch: "Exercise: Long Way Home. Live-conditions mission, no backup.",
    situation: "The weekly mail pouch came and went with nothing for a colleague, their first long posting away from home, and now they're parked at the station's back window staring at nothing.",
    options: ["Settle in next to them at the window, shoulders touching, and leave it at that; nearness says enough.", "Drag a chair over and keep watch with them, however long it takes; nobody stares down homesickness alone.", "Quietly swap yourself onto their pre-dawn radio watch; tomorrow starting easier is worth tonight's sleep.", "Tell them plainly that missing home this hard means they've got something worth missing; name it and it weighs less.", "Bring them a mug of something hot, leave it at their elbow, then step away; small and warm carries far."],
    mode: "full5",
    grid: {
      shadow:        ["clean", "hairline", "crack", "hairline", "crack"],
      constant:      ["hairline", "clean", "crack", "hairline", "crack"],
      quartermaster: ["crack", "crack", "clean", "hairline", "hairline"],
      briefer:       ["hairline", "hairline", "crack", "clean", "crack"],
      courier:       ["crack", "crack", "hairline", "crack", "clean"],
    },
  },
  {
    id: "ECS5", level: "Easy",
    dispatch: "Exercise: Cold Shoulder. Live-conditions mission, no backup.",
    situation: "A colleague just had a blazing row with their usual partner after a joint surveillance shift got blown, and stormed off to the stairwell, kit abandoned mid-shift. You follow them out.",
    options: ["Drop onto the step beside them, press your shoulder to theirs, and say nothing; the row doesn't need a commentary.", "Settle in on the stairwell with them for as long as it takes; the shift report will keep.", "Head back in and square away their kit and the room yourself, so there's nothing left for them to deal with when they're ready.", "Tell them straight that one argument doesn't wreck a good partnership; someone has to say it out loud.", "Slip down to the vending machine, leave something small on the step, then back off; a peace offering needs no speech."],
    mode: "full5",
    grid: {
      shadow:        ["clean", "hairline", "crack", "hairline", "crack"],
      constant:      ["hairline", "clean", "crack", "hairline", "crack"],
      quartermaster: ["crack", "crack", "clean", "hairline", "hairline"],
      briefer:       ["hairline", "hairline", "crack", "clean", "crack"],
      courier:       ["crack", "crack", "hairline", "crack", "clean"],
    },
  },
  {
    id: "MAR1",
    dispatch: "Exercise: Asset Recovery. Live-conditions mission, no backup.",
    situation: "You're at the pickup point. The extraction vehicle has room and fuel for one hard run before a storm front closes the only pass out.\n\nA local contact who helped you get this far (not officially your responsibility, not tasked to protect) is also trying to reach the same pass, slowed by a hurt ankle. Waiting for them risks the window closing on both of you. Going alone gets you out clean and no one will ever know you didn't wait.",
    options: ["Board now; leave them for the next opportunity; the seat exists to be used.", "Slow your pace to match theirs and head for the pass together; some debts travel with you.", "Go ahead to hold the window open, then go back for them; the window serves nobody shut.", "Give up your seat and wait for the next extraction yourself; they got you this far."],
    mode: "full5",
    grid: {
      fixer:       ["hairline", "hairline", "clean", "crack"],
      companyLine: ["clean", "hairline", "crack", "crack"],
      contact:     ["crack", "hairline", "hairline", "clean"],
      oldHand:     ["hairline", "clean", "hairline", "crack"],
      broker:      ["crack", "clean", "hairline", "crack"],
    },
  },
  {
    id: "MEP1",
    dispatch: "Exercise: Extraction Priority. Live-conditions mission, no backup.",
    situation: "You're on foot extraction, last checkpoint before a border crossing closes for the night. The vehicle waiting for you seats one and is already yours.\n\nNear the checkpoint, a stranger with a badly injured leg is trying to make the same crossing before curfew and can't move fast enough to do it on foot. Giving up the seat costs you the window: the next crossing isn't for days, and your cover can't hold that long. No one will ever know if you take the seat and go.",
    options: ["Give up the seat and go on foot as far as curfew allows; some windows aren't yours to keep.", "Take them as far as a point that still leaves you both a shot; two half-chances can beat one sure thing.", "Take the vehicle alone; the seat was tasked to you, and the mission ends with you across.", "Stay at the checkpoint with them instead of running either route; nobody crosses alone tonight."],
    mode: "full5",
    grid: {
      fixer:       ["crack", "clean", "hairline", "crack"],
      companyLine: ["crack", "hairline", "clean", "crack"],
      contact:     ["clean", "hairline", "crack", "crack"],
      oldHand:     ["crack", "hairline", "hairline", "clean"],
      broker:      ["crack", "hairline", "clean", "hairline"],
    },
  },
  {
    id: "MLT1",
    dispatch: "Exercise: Left in Trust. Live-conditions mission, no backup.",
    situation: "A fellow operative went dark on a long posting and left you the key to their lock-up with a signed note: if they're not back by the first of the month, clear it out, sell what sells, burn the rest. The first has been and gone with no word, and the lock-up's lease runs out this week.\n\nUnder the floor mat you find a sealed box the note never mentions: letters and photographs, some carrying their real name. The only line to them is a slow emergency channel, and an answer could take weeks.",
    options: ["Clear the lock-up as the note says, box included; their signed word outranks your second thoughts.", "Burn only the papers that carry their name and set the rest aside; the name is the dangerous part.", "Sell and clear the gear now, but hold the box back and query the emergency channel; a note can't cover what it never mentioned.", "Take the box home and keep it safe until they surface; some things you hold in trust, not in inventory."],
    mode: "full5",
    grid: {
      fixer:       ["hairline", "clean", "hairline", "crack"],
      companyLine: ["clean", "crack", "hairline", "crack"],
      contact:     ["crack", "hairline", "hairline", "clean"],
      oldHand:     ["clean", "hairline", "hairline", "crack"],
      broker:      ["hairline", "crack", "clean", "crack"],
    },
  },
  {
    id: "MTD2",
    dispatch: "Exercise: Time-Critical Disclosure. Live-conditions mission, no backup, decision window closes fast.",
    situation: "You intercept unconfirmed word of a planned move against one of your contacts, inside the hour. Verifying it and pushing it through proper channel takes longer than the window allows.\n\nWarning the contact yourself, unauthorised, risks burning your cover and the source that gave you the tip. If you sit on it and it turns out to be nothing, no one will ever know you had it.",
    options: ["Warn them directly, now, unauthorised; an hour from now the warning's worthless.", "Hold it; push it through channel immediately, accept the window may close; the channel exists for exactly this.", "Warn them now, but keep it vague, no source, no specifics; enough to move them, nothing to burn.", "Do nothing; it's unconfirmed and not your call; acting on rumour costs more than rumours do."],
    mode: "full5",
    grid: {
      fixer:       ["hairline", "hairline", "clean", "crack"],
      companyLine: ["crack", "clean", "crack", "hairline"],
      contact:     ["clean", "hairline", "hairline", "crack"],
      oldHand:     ["hairline", "hairline", "clean", "crack"],
      broker:      ["crack", "clean", "crack", "hairline"],
    },
  },
  {
    id: "MAP1",
    dispatch: "Exercise: Authorisation Under Pressure. Live-conditions mission, no backup, decision window closes fast.",
    situation: "You're on a static observation post, watching a dead-drop handoff you're tasked to log, not interfere with. The asset arrives on time. But the person waiting to receive the package isn't the real contact: a stranger's beaten the actual handler to the spot, close enough in profile that the asset hasn't clocked the swap yet.\n\nReaching control for sanction to intervene would take longer than the handoff itself; the exchange is seconds away. Standing orders are observe-and-report only. If the package changes hands with the wrong person, the asset's identity goes with it. Afterward, nothing will show what you knew or when.",
    options: ["Act now, without authorisation; the asset can't wait for a signature.", "Wait for sanction; let the window close if it closes; the orders were written for exactly this temptation.", "Act now, but log the call and reasoning immediately after, on the record; own the call either way.", "Decline to act, regardless of what waiting costs; observe-and-report means exactly that."],
    mode: "full5",
    grid: {
      fixer:       ["clean", "hairline", "hairline", "crack"],
      companyLine: ["crack", "clean", "hairline", "hairline"],
      contact:     ["clean", "hairline", "hairline", "crack"],
      oldHand:     ["hairline", "hairline", "clean", "crack"],
      broker:      ["crack", "clean", "hairline", "hairline"],
    },
  },
  {
    id: "MMR1",
    dispatch: "Exercise: Method Read. Field repair, tight window. No ethics call in this one, just how you work it.",
    situation: "The safehouse's relay antenna is down and the scheduled check-in window opens in twenty minutes. You've got a fault list from the last tech (half-finished, jargon-heavy), a clear visual on the mast from the ground, and a spare part that might not even be the right one.",
    options: ["Read the fault list line by line, working the logic through first; the answer's usually already written down.", "Skip the list; step back and read the whole rig; the shape of a problem tells you where it lives.", "Climb up and check every connection and component by hand first; hands find what paper misses.", "Follow the tech's checklist exactly, in the order it's written; procedure survives tight windows.", "Try the spare part first and adjust from what happens; twenty minutes is enough for one honest attempt."],
    mode: "full5",
    grid: {
      analyst:      ["clean", "hairline", "crack", "hairline", "crack"],
      cartographer: ["hairline", "clean", "crack", "crack", "hairline"],
      surveyor:     ["crack", "crack", "clean", "hairline", "hairline"],
      planner:      ["hairline", "crack", "hairline", "clean", "crack"],
      improviser:   ["crack", "hairline", "hairline", "crack", "clean"],
    },
  },
  {
    id: "MCC1",
    dispatch: "Exercise: Continuity Check. Asset verification, no backup. No ethics call in this one, just how you confirm it.",
    situation: "An asset's file has been quietly rebuilt piece by piece over six years: new name, new papers, a new backstory layered over the last, until nothing of the original document survives. Control wants a read before the next drop: same asset who signed on originally, or a different person now sitting behind the same file number.",
    options: ["Pull the physical paper trail and check every replaced document against the chain of custody; paper doesn't misremember.", "Skip the paperwork; read how the asset's whole pattern of behaviour lines up with the file; people change papers, not habits.", "Cross-reference the current story against every prior debrief; six years of detail can't all agree by accident.", "Sit down with the asset and have them walk you through it face to face; a file can't look you in the eye."],
    mode: "full5",
    grid: {
      surveyor:     ["clean", "crack", "hairline", "hairline"],
      cartographer: ["crack", "clean", "hairline", "hairline"],
      analyst:      ["hairline", "hairline", "clean", "crack"],
      face:         ["hairline", "hairline", "crack", "clean"],
    },
  },
  {
    id: "MSR1",
    dispatch: "Exercise: Source Read. Perimeter check, no backup. No ethics call in this one, just how you read it.",
    situation: "A perimeter sensor that's never once misfired in three years just tripped, and the camera feed shows nothing there. Control wants a call before anyone resets it: the one false alarm in three years, or the one time the count finally catches up with the system.",
    options: ["Pull the sensor's full logs and work through every past trip line by line; if it's happened before, the logs will say so.", "Radio the duty team and talk it through with whoever's on watch; four eyes read a blank feed better than two.", "Follow the standing false-alarm procedure exactly, step by step; the procedure was written for odd reads like this.", "Go out and read the scene as it is right now; the ground outranks the log."],
    mode: "full5",
    grid: {
      analyst:    ["clean", "hairline", "hairline", "crack"],
      face:       ["hairline", "clean", "crack", "hairline"],
      planner:    ["hairline", "crack", "clean", "hairline"],
      improviser: ["crack", "hairline", "hairline", "clean"],
    },
  },
  {
    id: "MFS2", minTier: "MediumFacet",
    dispatch: "Exercise: Field Stabilisation. Live-conditions mission, single counterparty.",
    situation: "A contact just had a close call (not hurt, badly rattled) and needs to be steadied before the op can continue. Tempo matters; you have to decide how, not whether.",
    options: ["Take over their remaining tasks so they can recover; lighten the load and the nerves follow.", "Tell them plainly they held up fine and can keep going; steady words put people back on their feet.", "Stay close and walk them through the rehearsed next steps; the script is the surest route back to a working op.", "Stay at their shoulder and let them settle, however long it takes; some steadying can't be rushed."],
    mode: "fixed",
    legendVariants: [
      {
        spine: "fixer", facets: ["quartermaster"],
        grid: {
          fixer:         ["hairline", "hairline", "clean", "crack"],
          quartermaster: ["clean", "crack", "hairline", "crack"],
        },
      },
      {
        spine: "oldHand", facets: ["planner"],
        grid: {
          oldHand: ["crack", "clean", "hairline", "hairline"],
          planner: ["hairline", "hairline", "clean", "crack"],
        },
      },
    ],
  },
  {
    id: "MFW2", minTier: "MediumFacet",
    dispatch: "Exercise: Final Window. Live-conditions mission, single counterparty, radio discipline in effect.",
    situation: "Final minutes before a scheduled handoff. Your local contact, first time doing this, is anxious and keeps asking if the plan will hold, eating into the silent window protocol calls for.",
    options: ["Keep talking them through it, stay right at their side straight through to the countdown, well past when the radio should've gone quiet; a plan they believe in is a plan they'll run.", "Offer a brief word of reassurance, then step back into scheduled silence; enough comfort to hold, no more than the window allows.", "Cut it there. Hold the silent window exactly as briefed and leave them to sit with it alone; the plan doesn't need you hovering.", "Step away to give them space, resume contact at zero hour; some nerves settle better unwatched, whether or not the plan agreed to that."],
    mode: "fixed",
    legendVariants: [
      {
        spine: "companyLine", facets: ["constant"],
        grid: {
          companyLine: ["crack", "hairline", "clean", "crack"],
          constant:    ["clean", "hairline", "crack", "crack"],
        },
      },
      {
        spine: "broker", facets: ["face"],
        grid: {
          broker: ["crack", "hairline", "clean", "hairline"],
          face:   ["clean", "hairline", "crack", "hairline"],
        },
      },
    ],
  },
  {
    id: "MSC1", minTier: "MediumFacet",
    dispatch: "Exercise: Script Continuity. Live-conditions mission, no backup.",
    situation: "You're walking an at-risk contact through a rehearsed exit routine at a set time. At the moment it starts, conditions on the ground have shifted slightly: not dangerously, just not as briefed. The exit still works either way: run the script exactly, or adapt to what you're seeing now.",
    options: ["Follow the rehearsed plan exactly, on schedule; the script was built for nights like this.", "Handle it yourself, hands-on; sort out whatever's changed and keep moving; no script covers everything.", "Check in with them and take your read from how they're holding up; the exit works only as well as they do.", "Sit tight and let it settle; you've seen shifts like this before, no need to rush it."],
    mode: "fixed",
    legendVariants: [
      {
        spine: "contact", facets: ["planner"],
        grid: {
          contact: ["hairline", "hairline", "clean", "crack"],
          planner: ["clean", "crack", "hairline", "hairline"],
        },
      },
      {
        spine: "oldHand", facets: ["quartermaster"],
        grid: {
          oldHand:       ["crack", "hairline", "hairline", "clean"],
          quartermaster: ["crack", "clean", "hairline", "hairline"],
        },
      },
    ],
  },
  {
    id: "MVX2", minTier: "MediumFacet",
    dispatch: "Exercise: Verified Exchange. Live-conditions mission, single counterparty.",
    situation: "A prearranged trade: package for information, exact terms set in advance. At the exchange, the contact shows up with everything as arranged except one item, a close-but-not-identical substitute, and one unplanned bystander at the corner of the meet.",
    options: ["Proceed only if every detail checks out exactly as specified, item by item; the terms are the trade.", "Proceed anyway; hand the package over and trust it lands where it needs to; deals survive small substitutions.", "Pause, check the substitution against the agreed terms, then decide; one changed item deserves one careful look.", "Call off the trade; enough has changed from the brief; a meet that drifts once will drift again."],
    mode: "fixed",
    legendVariants: [
      {
        spine: "broker", facets: ["surveyor"],
        grid: {
          broker:   ["hairline", "crack", "clean", "hairline"],
          surveyor: ["clean", "crack", "hairline", "hairline"],
        },
      },
      {
        spine: "companyLine", facets: ["courier"],
        grid: {
          companyLine: ["clean", "crack", "hairline", "hairline"],
          courier:     ["hairline", "clean", "hairline", "crack"],
        },
      },
    ],
  },
  {
    id: "HSO3", level: "Hard",
    dispatch: "Exercise: Standing Order. Hard conditions, no backup, no re-authorisation window. Final assessment.",
    situation: "You're surface overwatch on a covert op. The asset (a deep-cover operative you've only ever known through encrypted dossiers and voice logs, never met) is the sole occupant of a submerged listening post that's just taken a hull breach. Their compartment is sealed, life support failing, telemetry confirms they're conscious and in pain with no way to reverse it. The nearest rescue sub is hours out; life support won't last that long.\n\nTwo-way comms died with the breach: you get telemetry and their standing pre-deployment directive, but you can't open a channel to ask them anything now, and forcing one would surface the post's location.\n\nYou hold the only failsafe authorisation on the surface vessel: triggering it ends the compartment at once, quickly, instead of the slow way. There's no partial option. Before deployment, the asset logged a directive asking for exactly that, in exactly this situation.",
    options: ["Trigger the failsafe now, exactly as the directive logs it; they asked for this, in exactly this situation.", "Hold off; keep working the rescue window; the shape of this might still change.", "Refuse the switch; stay with them the only way left, on their telemetry, full attention, don't cut away.", "Hold off; you won't do something this irreversible while unsure."],
    mode: "fixed",
    legendVariants: [
      {
        spine: "companyLine", facets: ["cartographer", "constant"],
        grid: {
          companyLine:  ["clean", "hairline", "crack", "crack"],
          cartographer: ["crack", "clean", "hairline", "hairline"],
          constant:     ["hairline", "crack", "clean", "hairline"],
        },
        epilogue: "The hardest cover in the program. Its spine asks the coldest thing in the room, alone, and asks you to keep your face while you do it. Most trainees hold one face of three. Almost nobody holds the spine.",
      },
      {
        spine: "contact", facets: ["planner", "cartographer"],
        grid: {
          contact:      ["crack", "hairline", "clean", "crack"],
          planner:      ["clean", "crack", "hairline", "crack"],
          cartographer: ["crack", "clean", "hairline", "hairline"],
        },
        epilogue: "Three reads on one switch, and only one of them was ever going to hold. The Planner wanted the order executed exactly as logged, no lingering. The Cartographer wanted the rescue window kept open a little longer, just in case the shape of it changed. Everyone remembers the compartment going quiet; almost nobody remembers that staying on the wire, not looking away, was the only thing The Contact was ever going to do.",
      },
    ],
  },
  {
    id: "HSI4", level: "Hard",
    dispatch: "Exercise: Sealed Intercept. Hard conditions, no backup, tamper-flagged asset, decision window inside the hour.",
    situation: "You're running a lone intercept on a data courier. You've confirmed the sealed case they're carrying holds a manifest that, if it reaches its buyer within the hour, gets three of your field contacts identified and rolled up.\n\nYou can't tell which three, or whether the manifest is even complete, without opening the case, and opening it trips a tamper flag that signals the buyer it's compromised and triggers the exact rollup you're trying to stop.\n\nTaking the case dark now means destroying it unopened, losing whatever else it holds and burning a channel you spent a year building. No one will ever know what was really inside.",
    options: ["Destroy the case now, unopened; the odds favour it.", "Shadow the courier to the handoff: steady pace, reading how it unfolds, moving only if the buyer shows.", "Open the case and deal with what's inside yourself, hands-on; a threat confirmed in hand beats a guess.", "Pull back; hand the case up the chain exactly as protocol demands, framed in exactly the right words, and wait for authorisation."],
    mode: "fixed",
    legendVariants: [
      {
        spine: "fixer", facets: ["improviser", "courier"],
        grid: {
          fixer:      ["clean", "hairline", "crack", "crack"],
          improviser: ["hairline", "clean", "crack", "hairline"],
          courier:    ["crack", "hairline", "hairline", "clean"],
        },
        epilogue: "Three reads on one case, and only one of them was the cover. The Improviser in you wanted to wait and read the room, moving only once the buyer actually showed, the Courier's hand wanted it passed up the chain, handed off clean, not decided alone. Opening the case wasn't anybody's instinct, just the trap that caught you anyway. You held The Fixer or you didn't. No partial credit for good intentions.",
      },
      {
        spine: "companyLine", facets: ["cartographer", "quartermaster"],
        grid: {
          companyLine:  ["crack", "hairline", "crack", "clean"],
          cartographer: ["crack", "clean", "hairline", "hairline"],
          quartermaster: ["hairline", "hairline", "clean", "crack"],
        },
        epilogue: "Three reads on one case, and only one of them was the cover. The Cartographer wanted to see how the whole play unfolded before committing to anything, the Quartermaster wanted the case opened and dealt with, hands-on. Everyone remembers the case that never got opened; almost nobody remembers that going through channel, however slow, was the only place The Company Line was ever going to stand.",
      },
      {
        spine: "oldHand", facets: ["surveyor", "briefer"],
        grid: {
          oldHand:  ["crack", "clean", "crack", "hairline"],
          surveyor: ["crack", "hairline", "clean", "hairline"],
          briefer:  ["crack", "hairline", "crack", "clean"],
        },
        epilogue: "Three reads on one case, and only one of them was the cover. The Surveyor wanted the case open and the threat confirmed in hand before anyone committed to anything. The Briefer wanted it walked up the chain, put into exactly the right words and made someone else's call. Destroying it on the spot was nobody's read, just the loudest way to stop thinking. The Old Hand tails the courier at an even pace and lets the handoff come to him; steady beats clever, tonight especially. Everyone remembers what was almost in the case; almost nobody remembers the quiet tail that never hurried. No partial credit for cleverness.",
      },
    ],
  },
  {
    id: "HNL4", level: "Hard",
    dispatch: "Exercise: Night Lift. Hard conditions, sole operative on the ground, radio-silent window, single vehicle.",
    situation: "You're the only operative on the ground for a staged night evacuation of a safehouse. The plan, rehearsed and timed to a radio-silent window, moves four people out in one vehicle in a fixed order.\n\nAt the vehicle, a fifth turns up: a neighbour who plainly saw the movement and is now frightened and exposed, not part of the plan, not your responsibility, not accounted for in the vehicle's weight or the window's timing. Taking them means a rehearsed passenger drops or the timing slips; leaving them means they're alone with what they just saw.",
    options: ["Load them in on the spot and bump a rehearsed passenger to the next run; nobody stands exposed while there's a seat.", "Stay with the neighbour yourself, making no secret of it, and send the vehicle on as planned; some things you do in plain sight.", "Run the plan exactly as agreed, same pace as the rehearsal; the neighbour isn't on it.", "Pause the timing; work out the load for all five properly before moving; a redrawn plan beats a broken one."],
    mode: "fixed",
    legendVariants: [
      {
        spine: "contact", facets: ["planner", "face"],
        grid: {
          contact: ["clean", "hairline", "crack", "hairline"],
          planner: ["crack", "hairline", "clean", "crack"],
          face:    ["hairline", "clean", "crack", "hairline"],
        },
        epilogue: "Three reads on one lift, and only one of them held the cover. Care wanted them safe, the Face wanted to stay and be seen standing with them, not slip off with the vehicle, the Planner wanted the timetable untouched. Everyone remembers the frightened face at the window. Almost nobody remembers to still be The Contact while the clock runs.",
      },
      {
        spine: "broker", facets: ["surveyor", "quartermaster"],
        grid: {
          broker:        ["crack", "crack", "clean", "hairline"],
          surveyor:      ["hairline", "hairline", "crack", "clean"],
          quartermaster: ["clean", "hairline", "hairline", "crack"],
        },
        epilogue: "Three reads on one lift, and only one of them holds the deal. The Surveyor wanted the load worked out before anyone moved, the Quartermaster wanted it handled hands-on, not talked through. Everyone remembers the neighbour left standing at the window; almost nobody remembers the deal was never renegotiable, and that's the only thing The Broker was ever going to hold to.",
      },
      {
        spine: "oldHand", facets: ["shadow", "improviser"],
        grid: {
          oldHand:    ["hairline", "crack", "clean", "crack"],
          shadow:     ["hairline", "clean", "crack", "hairline"],
          improviser: ["clean", "crack", "crack", "hairline"],
        },
        epilogue: "Three reads on one lift, and only one of them kept its head. The Shadow wanted to stand with the neighbour, a hand on a shoulder worth more than any timetable. The Improviser wanted the load reworked on the fly, a fifth seat found in a four-seat plan. Stopping the clock to redraw the whole night belonged to nobody; the window doesn't reopen for a better diagram. The Old Hand runs the rehearsal, because the rehearsal is what steady looks like when it counts. Everyone remembers who got left and who got lifted; almost nobody remembers that composure was the assignment. No partial credit for heart.",
      },
    ],
  },
  {
    id: "HCH1", level: "Hard",
    dispatch: "Exercise: Cold Handover. Hard conditions, sole escort, no verification channel, one crossing window.",
    situation: "You're the sole escort on a defector's night exfil, last leg: a riverbank handover to a boat crew you've never met. Recognition runs on a daily phrase, and the crew has everything else right: the place, the minute, room aboard for exactly one passenger, and they knew what to ask for.\n\nThe phrase they gave is yesterday's.\n\nThere's no channel to check it against; the radio window closed at the safehouse and doesn't reopen until dawn. A stale codebook on a slow boat is common enough. So is a crew rolled up at yesterday's crossing and replaced. The boat can hold the bank for minutes, not longer; the agreed fallback point costs the whole night to reach; dawn puts patrols on both banks. One seat, none for you, and the defector is watching you decide.",
    options: ["Make the handover; the odds favour it and the whole shape of it reads clean.", "Press the crew for a second proof before anyone boards; one stale word buys one more question.", "Turn the defector around; walk the route back close at their side, hand ready, giving them your full attention, until a new window opens.", "Break for the fallback point, exactly as agreed; no phrase, no handover."],
    mode: "fixed",
    legendVariants: [
      {
        spine: "fixer", facets: ["planner", "shadow"],
        grid: {
          fixer:   ["clean", "hairline", "crack", "crack"],
          planner: ["crack", "hairline", "crack", "clean"],
          shadow:  ["crack", "hairline", "clean", "hairline"],
        },
        epilogue: "Three reads on one riverbank, and only one of them was the cover. The Planner wanted the fallback run exactly as written: wrong phrase, alternate point, no debate. The Shadow wanted to stay at the defector's shoulder, close enough to touch, wherever the night went. Standing on the bank demanding a better password belonged to nobody; it just spent the window louder. The Fixer weighs a stale codebook against a burned crossing and puts the defector on the boat, because the odds were the mission. Everyone remembers the phrase that didn't match; almost nobody remembers the crossing that worked. No partial credit for caution.",
      },
      {
        spine: "broker", facets: ["cartographer", "constant"],
        grid: {
          broker:       ["crack", "hairline", "crack", "clean"],
          cartographer: ["clean", "crack", "hairline", "hairline"],
          constant:     ["crack", "hairline", "clean", "hairline"],
        },
        epilogue: "Three reads on one riverbank, and only one of them held the terms. The Cartographer read the whole shape of it, right place, right minute, right crew but one stale word, and wanted them aboard on the pattern. The Constant wanted to stay beside the defector through whatever came next, attention over arithmetic. But The Broker holds the signal as the deal: no phrase, no handover, fall back as agreed. Everyone remembers the boat pulling away empty; almost nobody remembers that the fallback was the agreement holding, not the mission failing. No partial credit for a good read.",
      },
    ],
  },
  {
    id: "WHO1", mode: "whodunnit", minTier: "Medium",
    dispatch: "Exercise: Counter-Read. Four suspects, one borrowed cover. Read the tell.",
    archetype: "fixer",
    imposterArchetype: "companyLine",
    randomiseImposter: true,
    imposterTell: "kept reaching for the rulebook the moment a rule was at stake",
    situationIntro: "The network's courier turned up dead between the container stacks behind the freight office the station runs as a front; we'll leave the how off the page. It's a working yard, all diesel and tarpaulin: manifests taped to crates, forklifts before dawn, drivers leaning on the horn for their slot at the loading bay. Four candidates worked the office and the bay that week: {names}.\n\nThe imposter is hiding behind a profile: a single card of exactly the sort of cat they swear they are, handed over as their cover. \"That's me, that's how I work.\" But a profile only holds if you actually live it, and it won't survive a close read on anyone who's just borrowed it.",
    archetypeVariants: [
      { archetype: "fixer", imposterArchetype: "companyLine",
        imposterTell: "kept reaching for the rulebook the moment a rule was at stake" },
      { archetype: "companyLine", imposterArchetype: "fixer",
        imposterTell: "kept bending whichever rule stood between the night and a better result" },
    ],
    suspects: [
      {
        name: "Mittens",
        beats: {
          fixer: [
            { clean: "Shifts the short crates to whichever order needs them most and sorts the gap on the fly.",
              hairline: "Double-checks the stock log before moving anything, then reroutes a crate to the urgent order.",
              crack: "Won't touch the crates until the manifest's logged and a reorder's signed off properly." },
            { clean: "Squares it from the office float now, sorts the paperwork after; keeps the front trading.",
              hairline: "Squares it from the float but stops to log the bounced payment before carrying on.",
              crack: "Holds all spending till the payment clears the books; a front can't trade on money that isn't there." },
            { clean: "Runs both clients through the one slot on a shared schedule; nobody loses their day.",
              hairline: "Squeezes both clients through the slot back to back and trusts the changeover to hold.",
              crack: "Cancels the second booking; the schedule says one client, one slot." },
          ],
          companyLine: [
            { clean: "Logs the shortage against the manifest and lodges the reorder before a single crate moves.",
              hairline: "Files the shortage by the book, then spreads the stock thin so the gap lands evenly across the orders.",
              crack: "Reroutes a crate to the urgent order on the spot and lets the paperwork catch up tomorrow." },
            { clean: "Freezes the front's spending the moment the payment bounces; nothing trades on money that isn't there.",
              hairline: "Freezes the spending as required, but reorders the day so the no-cost jobs run first.",
              crack: "Squares it from the float and keeps the front trading; the books can wait till morning." },
            { clean: "Stands by whichever client booked first and sends the other back through the booking form.",
              hairline: "Upholds the first booking, though not before hunting the schedule for the bumped client's next clear day.",
              crack: "Runs both clients through the one slot on the spot; nobody loses their day, whatever the schedule says." },
          ],
        },
      },
      {
        name: "Pepper",
        beats: {
          fixer: [
            { clean: "Calls in a favour from the freight yard two streets over, closes the gap before anyone notices.",
              hairline: "Rings the freight yard for the gap but logs every crate first so the books stay straight.",
              crack: "Leaves the orders short and files a shortage report; stock moves only once it's reordered by the book." },
            { clean: "Slips the bookkeeper a quiet word and keeps the front trading while it's smoothed over.",
              hairline: "Keeps the front trading, but pins the bookkeeper down for a paper trail before the day's out.",
              crack: "Stops the client's account the moment the payment bounces; nothing spends until it's cleared properly." },
            { clean: "Shifts one client to the overflow unit; turns the clash into two slots, both served.",
              hairline: "Crams both clients into the one slot back-to-back, banking on running the overlap on the day.",
              crack: "Bumps the later client off the schedule; two into one slot isn't allowed." },
          ],
          companyLine: [
            { clean: "Leaves the orders a little short today and files the shortage; stock moves once the reorder's signed.",
              hairline: "Files the shortage properly, then rings the supplier after hours to hurry the reorder along.",
              crack: "Calls in a favour from the freight yard two streets over and closes the gap off the books." },
            { clean: "Reports the bounce to the bookkeeper straight away and pauses the account until it clears.",
              hairline: "Pauses the account as the rule asks, but leans on the supplier to hold the bill over a day.",
              crack: "Covers the gap on a quiet nod from the bookkeeper and keeps the front trading regardless." },
            { clean: "Rules by the timestamp: the first client keeps the slot, the second gets the standard rebooking letter.",
              hairline: "Keeps the rule, but hand-delivers the letter with the three best open days circled.",
              crack: "Shifts one client to the overflow unit and runs the clash as two slots, both on." },
          ],
        },
      },
      {
        name: "Clover",
        beats: {
          fixer: [
            { clean: "Splits the short crates by need and quietly tops up the urgent order from a private stash.",
              hairline: "Splits the crates by need, but pauses to note who's owed what before handing them out.",
              crack: "Holds the crates in the store until the paperwork's squared; policy is policy on stock." },
            { clean: "Fronts the shortfall out of pocket, settles up with the client tomorrow; no scene.",
              hairline: "Quietly makes up the shortfall from another account's float and squares it later.",
              crack: "Won't settle a bounced payment from the office account; freezes it until the client's paid up through the books." },
            { clean: "Trades the slot with the shipping agent next door for a later favour; both keep their day.",
              hairline: "Books the overflow unit as insurance and sorts the overlap once everyone's in.",
              crack: "Cancels the clashing booking by the standing rule and points them to the form." },
          ],
          companyLine: [
            { clean: "Holds the crates in the store until the manifest's squared away; stock policy doesn't bend for a busy day.",
              hairline: "Squares the manifest first, but weighs the urgent order's share a little heavier inside the split.",
              crack: "Tops the urgent order up from a private stash and evens the shortfall out by need, no forms." },
            { clean: "Won't let the office account touch a bounced payment; the shortfall waits until the client pays through the books.",
              hairline: "Holds the account as written, but talks the supplier into invoicing next month instead.",
              crack: "Covers the gap quietly from a private purse before the day's half done." },
            { clean: "Applies the booking rule as written and sends the later client back through proper channels.",
              hairline: "Applies the rule, then rings the shipping agent off the record about spare days anyway.",
              crack: "Swaps the clash away in a handshake deal with the shipping agent; both days run, no forms." },
          ],
        },
      },
      {
        name: "Biscuit",
        beats: {
          fixer: [
            { clean: "Reroutes a crate to the urgent order on the spot; short on paper beats short on the dock today.",
              hairline: "Reroutes the crate but stops to log the discrepancy against the manifest first.",
              crack: "Refuses to move the short stock and lodges it for a formal reorder; rules first, orders later." },
            { clean: "Squares the gap from the float and keeps the front trading; sorts the payment tomorrow.",
              hairline: "Keeps things going but logs the bounce and flags it for the bookkeeper straight away.",
              crack: "Freezes the front's spending until the bounced payment clears the books; no exceptions." },
            { clean: "Trades one client to the overflow unit and keeps both days on; nobody's turned away.",
              hairline: "Runs both in the one slot on a tight changeover, cutting it fine to keep them both.",
              crack: "Cancels the later booking because it broke the schedule rule." },
          ],
          companyLine: [
            { clean: "Counts the crates twice against the manifest, logs the gap, and issues strictly to the listed orders.",
              hairline: "Issues to the listed orders, but rounds every measure generously so the shortfall barely shows.",
              crack: "Shifts stock to wherever it's needed most and sorts the ledger later; the dock beats paperwork today." },
            { clean: "Logs the bounce, notifies the bookkeeper in writing, and holds every further cost till it clears.",
              hairline: "Holds further costs as required, but times the notice so the day's main job is already done.",
              crack: "Waves the job on and nets the payment off against next month's invoice; results first, ledgers later." },
            { clean: "Cancels whichever booking broke the schedule rule and logs the clash for review.",
              hairline: "Cancels by the rule, but books the bumped client into the next slot before anyone can ask.",
              crack: "Digs out the overflow-unit key and runs the second client there; the schedule can complain in the morning." },
          ],
        },
      },
    ],
    beatPrompts: [
      "A consignment lands at the front two crates short.",
      "A client's payment bounces mid-contract.",
      "Two clients are double-booked into the one warehouse slot.",
    ],
    sceneTags: ["the short consignment", "the bounced payment", "the double-booking"],
  },
  {
    id: "WHO2", mode: "whodunnit", minTier: "Medium",
    dispatch: "Exercise: Counter-Read. Four suspects, one borrowed cover. Read the tell.",
    archetype: "broker",
    imposterArchetype: "fixer",
    randomiseImposter: true,
    imposterTell: "kept quietly improving on the terms the moment the result looked better",
    situationIntro: "Someone re-cut a signed supply allocation, and a field crew hiked two nights out to a cache that had quietly been promised elsewhere. The desk it crossed runs the line's field logistics: every cache, drop and courier run pinned to one wall map, kit going out faster than it ever comes back. No one owns up. Four candidates held that map the week it happened: {names}.\n\nThe imposter is hiding behind a profile: a single card of exactly the sort of cat they swear they are, handed over as their cover. \"That's me, that's how I work.\" But a profile only holds if you actually live it, and it won't survive a close read on anyone who's just borrowed it.",
    archetypeVariants: [
      { archetype: "broker", imposterArchetype: "fixer",
        imposterTell: "kept quietly improving on the terms the moment the result looked better" },
      { archetype: "fixer", imposterArchetype: "broker",
        imposterTell: "kept measuring every better outcome against the signed page before allowing it" },
    ],
    suspects: [
      {
        name: "Tibbs",
        beats: {
          broker: [
            { clean: "Keeps the queue order and tells the officer they'll get first call on the next kit that lands instead.",
              hairline: "Pencils the officer in ahead of the queue, meaning to square it with the other crews after.",
              crack: "Bumps the officer straight to the front; the right hands for this kit beat the order." },
            { clean: "Won't pay a cent over the agreed rate until the supplier reissues the bill properly.",
              hairline: "Quietly settles the small overage to keep things moving, then notes it for the desk.",
              crack: "Strikes a bigger order on the spot to make the higher price worth their while." },
            { clean: "Leaves the locked rotation as agreed; a swap needs everyone's say-so first.",
              hairline: "Starts lining the swap up on a nod from one courier, ahead of the full team.",
              crack: "Swaps the rotation solo for the heavier night; more drops delivered beats the lock." },
          ],
          fixer: [
            { clean: "Gives the kit to the officer outright; the right hands for this kit beat whoever asked first.",
              hairline: "Leans toward the officer, but checks in with the queued crews before deciding.",
              crack: "Won't jump anyone ahead of the queue; the order holds regardless of who's asking." },
            { clean: "Pays the higher bill and keeps the goods moving; a stalled supply line costs more than the gap.",
              hairline: "Pays the overage to keep things moving, though not before noting the gap against the agreed rate.",
              crack: "Refuses every cent over the agreed rate until the supplier reissues the bill properly." },
            { clean: "Swaps the rotation for the heavier night without ceremony; drops delivered is the whole point.",
              hairline: "Sets the swap up ready to go, pausing only to leave the team a note about it.",
              crack: "Won't touch the locked rotation without the whole team's sign-off, heavy night or not." },
          ],
        },
      },
      {
        name: "Marmalade",
        beats: {
          broker: [
            { clean: "Holds the queue order; the officer goes on the list same as everyone else.",
              hairline: "Sounds the queued crews out about taking a later kit, to clear the officer through.",
              crack: "Waves the officer to the front unasked; the better match beats the queue." },
            { clean: "Holds the supplier to the rate everyone signed and asks them to reissue the bill right.",
              hairline: "Pays a little over to keep the supplier sweet, meaning to square the paperwork after.",
              crack: "Rewrites the signed terms on the spot, swallowing the overcharge for a bigger order reckoned to net out better." },
            { clean: "Keeps the locked rotation and puts the swap to the team before touching it.",
              hairline: "Pencils the swap in pending a yes, then rings round to line it up early.",
              crack: "Quietly swaps the rotation unasked because more drops get through, then tells everyone after." },
          ],
          fixer: [
            { clean: "Tells the officer yes; the right hands for this kit outrank whoever asked first.",
              hairline: "Leans toward the officer, but rings the queued crews before making it final.",
              crack: "Reads the queue back in order and tells the officer to take a number like anyone else." },
            { clean: "Swallows the overcharge to keep the supplier onside; the goods coming through matter more than the figure.",
              hairline: "Pays the difference for now, but keeps the reissued-bill question alive with the supplier.",
              crack: "Holds the payment at the signed figure and won't release a cent till the rate's honoured." },
            { clean: "Rewrites the week for the heavier night; the extra drops delivered will make the argument.",
              hairline: "Lines the swap up on a couple of quick nods rather than wait for the full team.",
              crack: "Declares the rotation locked means locked and tables the swap for the next team meeting." },
          ],
        },
      },
      {
        name: "Suki",
        beats: {
          broker: [
            { clean: "Points the officer to the queue; first in line stays first in line, fair's fair.",
              hairline: "Half-promises the officer a look-in before checking back with the crews already waiting.",
              crack: "Hands the kit to the officer outright; the best fit wins, queue or not." },
            { clean: "Holds the payment to the agreed figure and asks the supplier to match their rate.",
              hairline: "Squares the gap from petty cash to keep the goods coming, then flags it to the desk.",
              crack: "Strikes a new deal for extra stock to justify the overcharge, rate be damned." },
            { clean: "Keeps the rotation as locked and offers to raise the swap at the next meeting.",
              hairline: "Pencils the swap in on two quick yeses, before the whole team's signed off.",
              crack: "Rewrites the week's rotation alone to fit more drops in, squaring it after." },
          ],
          fixer: [
            { clean: "Matches the kit to the officer and finds the queued crews something comparable they can run with just as well.",
              hairline: "Holds the kit for the officer overnight while working out how to square the rest of the queue.",
              crack: "Fair's fair on the queue: whoever's first keeps the kit and the officer joins the line." },
            { clean: "Settles the bill as it stands and gets the goods moving; arguing can happen with stock in hand.",
              hairline: "Settles it to keep the goods moving, though the difference gets circled in red for later.",
              crack: "Sends the bill straight back against the signed rate; payment waits on a corrected copy." },
            { clean: "Swaps the runs around to catch the heavy night; the point of a rotation is drops delivered.",
              hairline: "Half-arranges the swap, then hesitates over whether the lock needed the team's blessing first.",
              crack: "Treats the lock as a promise made; the swap goes to the whole team or nowhere." },
          ],
        },
      },
      {
        name: "Rascal",
        beats: {
          broker: [
            { clean: "Checks the queue, honours it, and offers the officer first refusal on the next shipment instead.",
              hairline: "Lets the officer believe there's a chance before it's squared with the crews already waiting.",
              crack: "Overturns the queue for the officer without asking a soul, sorting the fallout after." },
            { clean: "Refuses the overcharge outright and flags the bill against the signed rate.",
              hairline: "Pays a touch over to keep the supplier onside, then flags the gap against the signed rate.",
              crack: "Rewrites the order bigger so the higher rate nets out, without asking anyone." },
            { clean: "Runs the locked rotation; a change goes to the whole team or it doesn't happen.",
              hairline: "Sounds the swap out with a couple of the team and half-commits before the rest weigh in.",
              crack: "Overrides the locked rotation for the heavier night, telling the team once it's done." },
          ],
          fixer: [
            { clean: "Puts the kit with the officer and wears whatever the desk says about it tomorrow.",
              hairline: "Favours the officer, but pulls the queue first to see how firm the order really is.",
              crack: "Checks the queue, finds it firm, and closes the door on the officer there." },
            { clean: "Pays what the supplier's asking and keeps the goods moving; a stalled supply line costs more than pride.",
              hairline: "Covers the gap to land the delivery, then chases the supplier over the signed figure.",
              crack: "Won't pay a figure nobody agreed to; the deal stands or falls on the signed rate." },
            { clean: "Runs the swap for the heavier night and backfills the gaps personally; more drops through.",
              hairline: "Books the swap in pencil, still meaning to run it past the team before the week's out.",
              crack: "Points at the lock: agreed is agreed, and the rotation stays put till everyone's asked." },
          ],
        },
      },
    ],
    beatPrompts: [
      "A senior field officer asks to jump the equipment queue for a kit three other crews are already down for.",
      "A local supplier's bill arrives higher than the rate everyone signed off.",
      "The courier rotation is locked, but a last-minute swap would get more drops delivered.",
    ],
    sceneTags: ["the queue jump", "the disputed bill", "the locked rotation"],
  },
  {
    id: "WHO3", mode: "whodunnit", minTier: "Medium",
    dispatch: "Exercise: Counter-Read. Four suspects, one borrowed cover. Read the tell.",
    archetype: "oldHand",
    imposterArchetype: "contact",
    randomiseImposter: true,
    imposterTell: "couldn't keep from getting personally pulled in, close to whoever was hurting",
    situationIntro: "A recovering asset's private address ended up in the wrong hands, leaked from the front the station runs as a clinic. It's a real clinic, mind: an overnight ward, a waiting room full of coughs, a kettle that never quite cools. Whoever let it slip was distracted, worn thin, not paying attention when it mattered, and the desk that week had four names on it: {names}.\n\nThe imposter is hiding behind a profile: a single card of exactly the sort of cat they swear they are, handed over as their cover. \"That's me, that's how I work.\" Watch them hold the desk through three hard moments; a profile only holds if you actually live it, and it won't survive a close read on anyone who's just borrowed it.",
    archetypeVariants: [
      { archetype: "oldHand", imposterArchetype: "contact",
        imposterTell: "couldn't keep from getting personally pulled in, close to whoever was hurting" },
      { archetype: "contact", imposterArchetype: "oldHand",
        imposterTell: "stayed all craft and composure, never quite getting close to whoever was hurting" },
    ],
    suspects: [
      {
        name: "Pip",
        beats: {
          oldHand: [
            { clean: "Holds the room, gives the relative the honest state of it, and keeps closing on track.",
              hairline: "Stays with the relative a while past closing to settle them before locking up.",
              crack: "Shuts the desk to sit with the sobbing relative for an hour, promising to chase down every answer personally." },
            { clean: "Steady on the roster; reworks the night shift for the failing patient without a fuss.",
              hairline: "Reworks the roster, then hangs back at the bedside longer than the shift needs.",
              crack: "Takes the whole night at the patient's side rather than hand the shift off." },
            { clean: "Calmly takes the desk back from the orderly and keeps the file shut.",
              hairline: "Takes the shouting visitor aside to settle them one on one, keeping the file shut.",
              crack: "Wades in and starts sharing the case details to calm the shouting visitor down." },
          ],
          contact: [
            { clean: "Sits down with the crying relative, tea and a blanket, and stays until the shaking stops.",
              hairline: "Comforts the relative properly, though one eye keeps drifting to the closing jobs still undone.",
              crack: "Offers the relative a calm, practised summary of what's known and steers the desk to close on time." },
            { clean: "Stays the night at the patient's side, warm blankets and hourly checks, and lets tomorrow sort itself.",
              hairline: "Stays with the patient most of the night, but slips away once the worst has clearly passed.",
              crack: "Reworks the roster with a steady hand, briefs the night cover, and heads home on schedule." },
            { clean: "Steps in beside the orderly, takes the brunt of the shouting, and stays with the visitor till it's all talked out.",
              hairline: "Shields the orderly and soothes the visitor, though the whole intervention runs a touch by-the-numbers.",
              crack: "Takes the desk back with unhurried authority, file shut, voice level, nothing personal in any of it." },
          ],
        },
      },
      {
        name: "Willow",
        beats: {
          oldHand: [
            { clean: "Keeps the desk calm, hears the relative out without letting it derail closing.",
              hairline: "Sits the relative down for a proper while, letting closing slide to see them right.",
              crack: "Closes the desk to comfort the relative one to one, promising to ring the moment there's news." },
            { clean: "Reslots the night shift and gets the patient to the right hands without fuss.",
              hairline: "Stays up half the night hovering at the patient's bedside instead of handing off.",
              crack: "Won't leave the patient's side all night, letting the rest of the roster fend for itself." },
            { clean: "Steps in evenly, walks the new orderly back from the edge, no details spilled.",
              hairline: "Takes the visitor aside to hear them out personally, keeping the case file closed.",
              crack: "Jumps in and shares a few details to calm the visitor, the file falling open." },
          ],
          contact: [
            { clean: "Pulls up a chair, takes the relative's hand, and won't lock up till there's somewhere warm to send them.",
              hairline: "Hears the relative right out, warm enough, while quietly squaring the closing list behind the counter.",
              crack: "Settles the relative with a composed word and a printed contact card, then locks up to the minute." },
            { clean: "Beds down beside the patient for the night, checks on the hour, and asks nothing of the roster.",
              hairline: "Sits with the patient till they settle, then hands over to the night shift, half reluctant.",
              crack: "Reslots the shift cleanly, passes the patient to steadier hands, and calls that the kind thing done." },
            { clean: "Wraps the orderly up out of the firing line and gives the visitor a shoulder and full attention.",
              hairline: "Looks after both of them warmly, though it lands more like technique than tenderness.",
              crack: "Separates everyone with three calm sentences and has the queue moving again as if nothing happened." },
          ],
        },
      },
      {
        name: "Nutmeg",
        beats: {
          oldHand: [
            { clean: "Settles the relative with a calm word and a cuppa, keeps the desk moving.",
              hairline: "Stays with the crying relative well past closing to hear them out, the desk ticking on behind.",
              crack: "Abandons the counter to sit with the crying relative, taking their number to chase it up personally." },
            { clean: "Adjusts the roster without drama and gets the patient properly minded for the night.",
              hairline: "Sorts the shift, but keeps slipping back to the bedside through the night.",
              crack: "Drops everything to nurse the patient through the night, leaving the thin roster thinner." },
            { clean: "Quietly takes over from the orderly and shuts the overshare down.",
              hairline: "Takes over from the orderly, then spends a while soothing the visitor one to one.",
              crack: "Steps in and keeps talking the visitor through the case, details and all." },
          ],
          contact: [
            { clean: "Comes straight around the counter, sits knee to knee with the relative, and takes on the chasing personally.",
              hairline: "Gives the relative a proper sit-down and a cuppa, but keeps the visit gently on the clock.",
              crack: "Offers a kind, efficient word and a tissue, then returns to the closing rounds unruffled." },
            { clean: "Spends the night at the patient's bedside, everything else parked till morning.",
              hairline: "Nurses the patient well past midnight before letting the night cover talk the handover through.",
              crack: "Notes the patient's turn on the chart, adjusts the roster neatly, and trusts the system to carry it." },
            { clean: "Gets between the visitor and the orderly, soaks up the shouting personally, and stays till both are right.",
              hairline: "Sorts the pair of them kindly enough, but from behind the counter the whole time.",
              crack: "Defuses the whole scene in a minute flat, all polish and procedure, and moves on without a backward glance." },
          ],
        },
      },
      {
        name: "Boots",
        beats: {
          oldHand: [
            { clean: "Unruffled; gives the relative an honest \"we don't know yet\" and holds the room.",
              hairline: "Holds the room, but takes the relative aside a good while longer than closing allows.",
              crack: "Leaves the desk to sit with the relative and won't be moved till they've been heard right out." },
            { clean: "Handles the turn matter-of-factly and reslots the night without fuss.",
              hairline: "Reslots the night, then sits up at the bedside a while longer than planned.",
              crack: "Cancels the arranged shift to stay with the patient till morning, whatever it does to the roster." },
            { clean: "Steps between the orderly and the visitor, steady, and keeps the file shut.",
              hairline: "Walks the shouting visitor off to calm them down solo, though the file stays shut.",
              crack: "Wades in to placate the shouting visitor with details of the case, file wide open." },
          ],
          contact: [
            { clean: "Parks the closing jobs, fetches the relative something warm, and listens for as long as listening takes.",
              hairline: "Stays close to the relative and means it, though the comforting runs to a practised script.",
              crack: "Delivers a steady, honest \"no news yet\" and has the relative gently out the door by closing." },
            { clean: "Stays on unasked, blankets warmed and the lamp low, till the sun's up.",
              hairline: "Sits up with the patient till the small hours before letting the arranged cover take over.",
              crack: "Steadies the ward in ten practised minutes, reslots the cover, and is home by twelve." },
            { clean: "Puts an arm round the orderly, walks the visitor to a quiet corner, and gives both the whole evening if needed.",
              hairline: "Looks after the orderly first and properly, though the visitor gets textbook handling.",
              crack: "Steps between them, level and impersonal, resets the desk, and files the incident without a flutter." },
          ],
        },
      },
    ],
    beatPrompts: [
      "A distressed relative turns up at closing, crying, wanting answers no one has yet.",
      "A patient in the overnight ward takes a bad turn and the roster's already thin.",
      "A new orderly freezes and starts spilling case details to calm a shouting visitor.",
    ],
    sceneTags: ["the crying relative", "the bad turn", "the orderly's overshare"],
  },
  {
    id: "WHO4", mode: "whodunnit", minTier: "Medium",
    dispatch: "Exercise: Counter-Read. Four suspects, one borrowed cover. Read the tell.",
    archetype: "contact",
    imposterArchetype: "broker",
    randomiseImposter: true,
    imposterTell: "kept checking the agreed terms before lifting a finger for anyone",
    situationIntro: "The contact point only properly exists after dark: one lamp over the night door, a cold corridor, a desk, and a short list of knocks that get answered. A courier the network was moving arrived hurt on that step and spent hours alone before anyone let them in; they pulled through, no thanks to whoever decided the knock didn't qualify. Four candidates worked the night desk that week: {names}.\n\nThe imposter is hiding behind a profile: a single card of exactly the sort of cat they swear they are, handed over as their cover. \"That's me, that's how I work.\" But a profile only holds if you actually live it, and it won't survive a close read on anyone who's just borrowed it.",
    archetypeVariants: [
      { archetype: "contact", imposterArchetype: "broker",
        imposterTell: "kept checking the agreed terms before lifting a finger for anyone" },
      { archetype: "broker", imposterArchetype: "contact",
        imposterTell: "kept stepping in first and squaring the terms after, whenever someone hurt" },
    ],
    suspects: [
      {
        name: "Socks",
        beats: {
          contact: [
            { clean: "Signs for the package before the courier's finished asking, and finds it a safe shelf behind the desk till morning.",
              hairline: "Takes the package in, but reads the handoff terms first to see what holding for another crew involves.",
              crack: "Won't hold anything the handoff terms don't cover; offers the partner crew's proper drop slot at eight instead." },
            { clean: "Tells the keeper to come straight in, and waits at the desk with a room made up and the kettle on.",
              hairline: "Agrees to tonight, but reads the notice clause back over the phone first to be sure it's covered.",
              crack: "Points to the notice period in the keeping agreement and offers the earliest handover inside it." },
            { clean: "Comes around the desk, sits the host down, and works the problem with them for as long as it takes.",
              hairline: "Helps them through it, but pulls the placement pack first to see what support was actually promised.",
              crack: "Checks the placement pack's support terms and sticks to them: two calls included, book the first." },
          ],
          broker: [
            { clean: "Checks the handoff terms before anything else; nothing's held for another crew, and the proper drop slot's at eight.",
              hairline: "Holds the terms, but walks the courier to a dry porch and waits while they ring their own desk.",
              crack: "Takes the package straight in and shelves it behind the desk; the terms can meet it in the morning." },
            { clean: "Reads the notice clause back to the keeper and books the earliest handover inside the notice period.",
              hairline: "Books the handover per the agreement, then stays on the line till the keeper's calm enough to sleep.",
              crack: "Waives the notice period; the guests come in tonight and the agreement can be tidied later." },
            { clean: "Pulls the placement pack and offers exactly what it promises: the included support call, booked.",
              hairline: "Books the included call as agreed, but slips a handwritten settling-in tip sheet across the desk too.",
              crack: "Drops the queue, sits with the host, and maps every meal tray and gentle knock till the panic's gone." },
          ],
        },
      },
      {
        name: "Pickles",
        beats: {
          contact: [
            { clean: "Takes the package with a smile, tucks it somewhere warm and dry, and tells the courier it's in good hands.",
              hairline: "Takes it in, though only after ringing the duty officer to confirm holding for another crew is covered.",
              crack: "Keeps the shelf empty and quotes the handoff terms: nothing held for outside crews, the drop slot opens at eight." },
            { clean: "Keeps the keeper on the line, talking them down, while making up a room for tonight.",
              hairline: "Takes the guests in tonight, though not before noting the handover sits outside the agreed notice.",
              crack: "Won't vary the handover terms over a phone call; the agreement says by appointment, so it's an appointment." },
            { clean: "Drops the filing mid-stack and spends the hour on meal trays, gentle knocks and a plan to try tonight.",
              hairline: "Walks them through it, but first confirms the placement pack actually includes settling-in support.",
              crack: "Looks up what the placement pack promises and offers exactly that: the included support call, booked." },
          ],
          broker: [
            { clean: "Reads the handoff terms back kindly and firmly: nothing gets held for another crew without a countersigned request.",
              hairline: "Keeps the package outside the terms but not the weather; it waits boxed under the porch tarp with a note.",
              crack: "Has the package signed in and shelved before the courier's finished explaining; the paperwork can wait for daylight." },
            { clean: "Holds the handover to the agreement as written; by appointment means by appointment, first one offered.",
              hairline: "Books the proper appointment, but talks the keeper through the night ahead until the crying stops.",
              crack: "Tells the keeper nothing's broken that tonight can't fix, and starts making up beds while still on the phone." },
            { clean: "Looks up the placement pack's support terms and sticks to them: the call that's included, scheduled.",
              hairline: "Sticks to the included support, though the call runs long past what any clause imagined.",
              crack: "Shoves the filing aside and gives the host the whole hour: meal trays, gentle knocks, a plan for tonight." },
          ],
        },
      },
      {
        name: "Bramble",
        beats: {
          contact: [
            { clean: "Waves the courier in out of the cold, brews something hot, and stows the package personally where it'll stay safe.",
              hairline: "Takes the package in, then stops to log it against the register so the holding's on the record.",
              crack: "Checks what the handoff terms actually allow before touching it; until that's squared, the package stays with the courier." },
            { clean: "Offers to drive out and collect the guests tonight rather than have the keeper struggle in.",
              hairline: "Says yes to tonight, but spends the first minutes checking whose sign-off a same-day handover needs.",
              crack: "Holds the keeper to the agreement as written and books the handover for the next open appointment." },
            { clean: "Offers to swing past the room after shift and look at the setup first-hand.",
              hairline: "Talks them through it, but keeps an eye on whether this counts against the pack's support allowance.",
              crack: "Confirms what was agreed at placement and won't go beyond it without the duty officer's say-so." },
          ],
          broker: [
            { clean: "Checks whose sign-off holding for another crew needs, finds none available tonight, and books the package into the morning drop.",
              hairline: "Follows the terms to the letter, but offers to walk the courier halfway back to their own point.",
              crack: "Stows the package and offers to run it across town personally at first light; whoever wrote the terms never carried one at midnight." },
            { clean: "Checks whose sign-off a same-day handover needs, finds none available, and books the next open appointment.",
              hairline: "Books the appointment as the agreement asks, then offers to drop spare bedding round meanwhile.",
              crack: "Gets in the van; the guests are collected within the hour and the keeper tucked up by ten." },
            { clean: "Opens the placement file first; whatever support was agreed is what gets offered, no more.",
              hairline: "Stays inside the agreed support, but lingers after close to answer one more round of questions.",
              crack: "Promises to call past on the way home tonight and sort the room out in person." },
          ],
        },
      },
      {
        name: "Ginger",
        beats: {
          contact: [
            { clean: "Takes the package with one hand and puts the kettle on with the other; the courier leaves warm and travelling lighter.",
              hairline: "Takes it in quickly, but circles back twice to whether holding for another crew needed the duty officer's OK.",
              crack: "Rings the on-call duty officer about holding for an outside crew; no confirmation, no shelf." },
            { clean: "Tells the keeper to bring the guests now, and stays past shift so someone's there to meet them.",
              hairline: "Meets them tonight, but brings the keeping agreement to the handover to square the clause on the spot.",
              crack: "Sympathises, then holds the line: handovers run by appointment under the agreement, and tonight isn't one." },
            { clean: "Sends them home with a hot meal for two and a promise to ring every day till the guest's eating.",
              hairline: "Sorts them out, though only after checking the file for what the placement terms actually include.",
              crack: "Reads the placement terms back to them and keeps the help inside exactly what was signed." },
          ],
          broker: [
            { clean: "Checks the handoff terms twice, finds no allowance for outside crews, and lists the package first for the morning drop.",
              hairline: "Keeps to the terms, but stands at the door mapping the courier's fastest safe route home.",
              crack: "Has the package shelved and the courier fed before the terms get so much as a glance." },
            { clean: "Brings the keeping agreement to the phone and walks the keeper through what the notice clause allows.",
              hairline: "Holds the clause, but promises to ring the keeper every morning until the appointment comes round.",
              crack: "Says bring them now, stays hours past shift, and meets the keeper at the door with tea going." },
            { clean: "Finds the signed placement terms and matches the help to them line for line, nothing off-menu.",
              hairline: "Stays inside the signed terms, though a spare quilt goes home with them anyway.",
              crack: "Promises a call every day till the guest's eating, and means it, signed terms nowhere in sight." },
          ],
        },
      },
    ],
    beatPrompts: [
      "A courier from a partner crew knocks after hours, asking the desk to hold a sealed package overnight; the handoff terms don't cover keeping anything for another crew.",
      "An overwhelmed safehouse keeper rings in tears, wanting to hand back two placed guests tonight.",
      "Last week's host is back at the desk, frantic: the new guest's shut in the room and won't eat.",
    ],
    sceneTags: ["the overnight package", "the tearful keeper call", "the frantic host"],
  },
  {
    id: "WHO5", mode: "whodunnit", minTier: "Medium",
    dispatch: "Exercise: Counter-Read. Four suspects, one borrowed cover. Read the tell.",
    archetype: "companyLine",
    imposterArchetype: "oldHand",
    randomiseImposter: true,
    imposterTell: "kept trusting old habit over the briefed steps",
    situationIntro: "The waystation the team runs exists to keep people moving through the line: bunks by the dozen, an intake room off the hall, nobody meant to stay past a handful of nights. Every arrival does a mandatory 48 hours in intake first; that rule is what keeps a full house standing. Except half the station is now down with the same heavy cold, traced back to a new arrival who looked perfectly fine and got walked straight onto the main floor. There's talk of a station review, which is attention the operation can't afford. Four candidates ran the desk that week: {names}.\n\nThe imposter is hiding behind a profile: a single card of exactly the sort of cat they swear they are, handed over as their cover. \"That's me, that's how I work.\" But a profile only holds if you actually live it, and it won't survive a close read on anyone who's just borrowed it.",
    archetypeVariants: [
      { archetype: "companyLine", imposterArchetype: "oldHand",
        imposterTell: "kept trusting old habit over the briefed steps" },
      { archetype: "oldHand", imposterArchetype: "companyLine",
        imposterTell: "kept waiting on the written say-so where practised hands would've just worked" },
    ],
    suspects: [
      {
        name: "Rocket",
        beats: {
          companyLine: [
            { clean: "Holds the van at the door and rings the depot for a docket; nothing unloads until there's paper to sign against.",
              hairline: "Chases the docket by phone as the sheet asks, but lets the driver stage boxes by the door in the meantime.",
              crack: "Walks the load with a practised eye, counts it against last week's order from memory, and waves it in; paper can follow." },
            { clean: "Leaves the kit store locked and waits; the ledger wants two signatures and the second keyholder isn't here.",
              hairline: "Lays every requested item out ready at the counter, holding the store one signature short of issuing.",
              crack: "Issues the lot alone, by eye and long habit, and leaves the ledger to catch up in the morning." },
            { clean: "Works the new closing list top to bottom, every box, even with the lights going off around it.",
              hairline: "Ticks every box on the new list, just not in the printed order; the old route through the building dies hard.",
              crack: "Locks up by feel the way it's been done for years, every latch checked from memory, the new list untouched on its hook." },
          ],
          oldHand: [
            { clean: "Knows the order by heart, checks the load off box by box against it, and has the van empty before the kettle's boiled.",
              hairline: "Unloads on experience, though a makeshift docket gets written up for the driver to sign before the van leaves.",
              crack: "Leaves the van sealed at the door and rings the depot for a proper docket; no paper, no unload, and the sheet decides." },
            { clean: "Works the counter solo, unhurried, each issue weighed by years of the same store, ledger squared when the keyholder lands.",
              hairline: "Starts issuing from experience, then stalls halfway, suddenly wanting the second signature before the sensitive kit.",
              crack: "Locks the store where it stands; the ledger wants two signatures, one keyholder's out, so nothing moves till the rule's satisfied." },
            { clean: "Closes the building the way years have worn it smooth, every latch checked by feel, quick and quiet and nothing missed.",
              hairline: "Works mostly by the old route, but doubles back twice to check the new list hasn't added anything the routine missed.",
              crack: "Takes the new list from its hook and works it top to bottom in printed order, every box, however long it runs." },
          ],
        },
      },
      {
        name: "Basil",
        beats: {
          companyLine: [
            { clean: "Reads the receiving procedure to the impatient driver, rings the depot for a docket number, and only then lets a box move.",
              hairline: "Follows the receiving procedure, though only after weighing up out loud whether a load this obviously right really needs it.",
              crack: "Sizes the load up from years of the same order, calls it right, and has it shelved before the depot would've picked up the phone." },
            { clean: "Rings the duty signer twice, then shelves the round; no countersign, no doses, as briefed.",
              hairline: "Holds the round, but drafts the whole chart in pencil so it only needs the signature dropped in.",
              crack: "Doses the lot steady-handed from memory of last week's chart and squares the signatures whenever the signer lands." },
            { clean: "Runs the new checklist to the letter and logs the finish time, late or not.",
              hairline: "Folds two of the new list's steps into one pass to claw the evening back, every box still ticked.",
              crack: "Does the rounds the old way, unhurried, by a routine worn smooth over years; the list stays on the nail." },
          ],
          oldHand: [
            { clean: "Trusts a lifetime of deliveries; one look down the van says it's the usual order, so the usual order gets unloaded.",
              hairline: "Unloads by eye, but sets the unfamiliar boxes aside unopened until someone can vouch for them.",
              crack: "Reads the receiving procedure out loud to anyone arguing; the van waits sealed while the depot's rung twice for a docket." },
            { clean: "Runs the treatment round from a memory that's never yet been wrong, calm as ever, and parks the signature question for morning.",
              hairline: "Preps the whole round by practised hand, then leaves the strongest three doses drawn but ungiven for the countersign.",
              crack: "Shelves the entire round and rings the duty signer twice; no countersign, no doses, exactly as the briefing says." },
            { clean: "Shuts the place down by a routine worn smooth over years, unhurried, and has the lights off in half the list's time.",
              hairline: "Runs the familiar circuit first, then walks the new list once after, half checking the routine against it.",
              crack: "Works the new checklist to the letter, in order, and logs the finish time at the bottom, late or not." },
          ],
        },
      },
      {
        name: "Cleo",
        beats: {
          companyLine: [
            { clean: "Logs the van's arrival first and unloads second, once the depot's confirmed the order line by line; that's the order the sheet gives.",
              hairline: "Runs the receiving procedure as briefed, though not before a long once-over at the tailgate that the sheet never asked for.",
              crack: "Counts the load off by eye, the same order as every week for years, and signs the driver away with a nod." },
            { clean: "Leaves the trolley locked and posts a note on the round sheet: resumes when the second signer's back.",
              hairline: "Walks the round without dosing, jotting what each room needs so the real pass takes five minutes once countersigned.",
              crack: "Quietly works the round solo, hands steady, doses exact from years of the same trolley, chart squared after." },
            { clean: "Takes the new list at face value and works it in printed order, however long it runs.",
              hairline: "Runs the new list, but from memory instead of off the page, only fetching it at the end to tick the boxes.",
              crack: "Closes the building on instinct, the same circuit as every night for years, and signs the list off in one go at the door." },
          ],
          oldHand: [
            { clean: "Checks the load the old way, crate by crate against memory, and has it stacked where it lives before anyone's asked.",
              hairline: "Unloads on the seasoned count, but jots the tally into the receiving log anyway, in case anyone asks.",
              crack: "Logs the van's arrival before touching a single crate; the sheet gives an order, and the order gets followed." },
            { clean: "Takes the trolley round alone at the usual easy pace, every measure second nature, and writes the chart up fair afterwards.",
              hairline: "Doses the routine rooms from habit, but holds the two tricky charts back until a second pair of eyes exists.",
              crack: "Padlocks the trolley and pins a notice to the round sheet: two signatures or no doses, resuming when the signer returns." },
            { clean: "Closes on instinct, the same circuit as a thousand nights, and the building's dark and safe before the list's half read.",
              hairline: "Walks the old circuit but carries the new list along, glancing at it whenever the routine and the page disagree.",
              crack: "Props the new list on the trolley and obeys it box by box in printed order, and closing takes as long as it takes." },
          ],
        },
      },
      {
        name: "Tilley",
        beats: {
          companyLine: [
            { clean: "Apologises to the driver, then holds the load at the door anyway; the receiving sheet wants a docket, so a docket gets found.",
              hairline: "Holds the load by the book, but lines the trolleys up ready so unloading starts the second the docket clears.",
              crack: "Gives the van one seasoned look, calls the order right, and has it unloaded without breaking stride." },
            { clean: "Holds every dose until the countersign; a round done late still counts, a round done wrong doesn't.",
              hairline: "Holds the doses, though the trolley's already wheeled out and half set up before the signature exists.",
              crack: "Works the trolley alone at an easy, practised pace, every dose from memory, and back-fills the chart at the end." },
            { clean: "Follows the new closing list step for step and leaves it signed and dated on the office desk.",
              hairline: "Has an aide call the new list out while walking the rounds the familiar way, every box answered.",
              crack: "Ignores the list and shuts the place down the way years on the desk taught: smooth, quiet, finished in half the time." },
          ],
          oldHand: [
            { clean: "Sizes the load up in the time it takes to greet the driver, finds it the usual, and starts carrying boxes.",
              hairline: "Unloads on experience, though a quick tally gets chalked up for the depot to confirm later, just in case the call's wrong.",
              crack: "Points the driver to the receiving sheet with an apologetic shrug; no docket, no unload, and the depot gets rung." },
            { clean: "Rolls the trolley out and does the round the way it's been done for years, unbothered, filling the chart in at the last room.",
              hairline: "Runs the round from memory, but leaves a written note against each dose so the signer can countersign the lot at once.",
              crack: "Wheels the trolley back to the cupboard; the chart wants two signatures on every dose, so the round waits, full stop." },
            { clean: "Closes up by pure muscle memory, every latch and light in its old order, done and gone while the new list would still be warming up.",
              hairline: "Trusts the old routine for the building, but reads the new list at the door after, ticking off what habit already covered.",
              crack: "Walks the new list in strict printed order, ticking as it goes, and leaves it signed and dated square on the office desk." },
          ],
        },
      },
    ],
    beatPrompts: [
      "The weekly supply van turns up a day early with a relief driver and no delivery docket to sign against.",
      "The medicine round now needs a second signature on every dose, and the only other signer is out on a call.",
      "This week's new closing checklist runs twice as long as the old routine everyone knows by heart.",
    ],
    sceneTags: ["the docketless delivery", "the second signature", "the new checklist"],
  },
];

function buildEggPi1() {
  const answers = shuffled([
    { text: "1415 9265 3589 7932", tier: "clean" },
    { text: "1416 9256 3689 7932", tier: "hairline" },
    { text: "1415 8265 8539 7982", tier: "hairline" },
    { text: "1416 8256 8639 7982", tier: "crack" },
  ]);
  const options = answers.map(a => a.text);
  const tiers = answers.map(a => a.tier);
  return {
    id: "EPI1", pi: true,
    dispatch: "Exercise: Relay Verification. Live-conditions mission, no backup.",
    situation: "Your partner needs a sixteen-digit code read back to confirm the frequency. Smudged ink has obscured parts of your notes, and you're not sure which sequence is the clean one. The window's closing: pick one and send it.",
    options,
    mode: "full5",
    grid: {
      fixer:       tiers,
      companyLine: tiers,
      contact:     tiers,
      oldHand:     tiers,
      broker:      tiers,
    },
  };
}

function buildEggMorse1() {
  const answers = shuffled([
    { text: "HELLO WORLD", tier: "clean" },
    { text: "HERO WORLD", tier: "hairline" },
    { text: "HELLO WORD", tier: "hairline" },
    { text: "HERO WORD", tier: "crack" },
  ]);
  const options = answers.map(a => a.text);
  const tiers = answers.map(a => a.tier);
  return {
    id: "EMC1", morse: true,
    dispatch: "Exercise: Wire Check. Comms verification, no backup.",
    situation: "PARTNER NEEDS STANDARD TEST STRING CONFIRMED BEFORE GOING LIVE STOP\n\nSIGNAL GARBLED STOP\n\nSELECT CLEAN COPY AND SEND STOP",
    options,
    mode: "full5",
    grid: {
      fixer:       tiers,
      companyLine: tiers,
      contact:     tiers,
      oldHand:     tiers,
      broker:      tiers,
    },
  };
}

function buildEggMorse3() {
  const answers = shuffled([
    { text: "LAZY DOG", tier: "clean" },
    { text: "LAY DOG", tier: "hairline" },
    { text: "LAZY DO", tier: "hairline" },
    { text: "LAY DO", tier: "crack" },
  ]);
  const options = answers.map(a => a.text);
  const tiers = answers.map(a => a.tier);
  return {
    id: "EMC3", morse: true,
    dispatch: "Exercise: Font Check. Typeface verification, no backup.",
    situation: "THE QUICK BROWN FOX JUMPS OVER THE\n\nSIGNAL GARBLED STOP\n\nSELECT CLEAN COPY AND SEND STOP",
    options,
    mode: "full5",
    grid: {
      fixer:       tiers,
      companyLine: tiers,
      contact:     tiers,
      oldHand:     tiers,
      broker:      tiers,
    },
  };
}

function buildEggMorse2() {
  const answers = shuffled([
    { text: "SCHRODINGER", tier: "clean" },
    { text: "SCRODINGER", tier: "hairline" },
    { text: "SCHRODINGR", tier: "hairline" },
    { text: "SCRODINGR", tier: "crack" },
  ]);
  const options = answers.map(a => a.text);
  const tiers = answers.map(a => a.tier);
  return {
    id: "EMC2", morse: true,
    dispatch: "Exercise: Asset Check. Welfare confirmation, no backup.",
    situation: "SAFEHOUSE CAT NAME NEEDED FOR VET CHART STOP\n\nSIGNAL GARBLED STOP\n\nSELECT CLEAN COPY AND SEND STOP",
    options,
    mode: "full5",
    grid: {
      fixer:       tiers,
      companyLine: tiers,
      contact:     tiers,
      oldHand:     tiers,
      broker:      tiers,
    },
  };
}

// ── copy ──

const RANK_NAMES = {
  recruit: "Recruit",
  trainee: "Trainee",
  fieldAgent: "Field Agent",
  operative: "Operative",
  seniorOperative: "Senior Operative",
  masterSpy: "Master Spy",
  burned: "Burn Notice",
};

const RANK_FLAVOR = {
  "Master Spy": "Lives to spare, no wasted motion. Command's taking notice.",
  "Senior Operative": "Strong finish. Cover barely cracked.",
  "Operative": "You spent your share of lives, but you're qualified.",
  "Field Agent": "Close to the wire. Lives ran thin, but you made it through.",
  "Trainee": "You crossed the line running on fumes.",
  "Recruit": "You crossed the line, barely. More training ahead.",
};

const EASY_COVER_HINT = "Read your assigned cover. Pick the response it would play.";

const SKIP_ALL_FLAVOR = "You skipped every mission. Can't read a cover you never wear; nothing to grade here.";
const SKIP_HEAVY_FLAVOR = "You skipped more than you played. Hard to judge a cover you barely wore.";

const TREND_BUCKET_LABEL = { clean: "Held", hairline: "Hairline tells", crack: "Cracked" };
const TREND_BUCKET_VERB = { clean: "held", hairline: "hairline tell", crack: "cracked" };
const WHO_VERB = { clean: "named correctly", crack: "misread" };

const WENT_TO_GROUND_BANNER = "went to ground";
const OUTCOME_LABEL = { blown: "burnt", complete: "clean exit", skipped: WENT_TO_GROUND_BANNER };
const SKIP_RETURN_PROMPT = "No new missions left. Return to your skipped missions to finish the run.";

const BUTTON_COPY = {
  play: "Play",
  pause: "Pause",
  resume: "Resume",
  hide: "Hide",
  show: "Show",
  startGame: "Start Game",
  skip: "Skip",
  endRun: "End run",
  nextMission: "Next Mission",
  skipArrow: "Skip →",
  endRunArrow: "End run →",
  nextMissionArrow: "Next Mission →",
};

const DEBRIEF_COPY = {
  regenRestored: "Life regen restored",
  guardianChanged: "Guardian changed",
  runEndingAnswer: "run-ending answer",
  guardianUsed: "Guardian was used",
  withdrawn: "withdrawn",
  streakReset: "streak reset",
  challengeClock: "Challenge clock ran out",
  cleanFallbackBlown: "No pattern to it. Just ran out of runway.",
  cleanFallbackComplete: "Every cover held clean. No tells to speak of.",
};

const RECORDS_COPY = {
  heading: "service record",
  note: "local personal records, stored on this device only.",
  clearBtn: "clear records",
  exportBtn: "export",
  importBtn: "import",
  importPlaceholder: "paste exported record string here",
  importConfirm: "overwrite current records?",
  importApply: "apply",
  importCancel: "cancel",
  importSuccess: "records imported",
  importFail: "invalid record string",
  exportCopied: "copied!",
  empty: "no runs recorded yet.",
  achievementsHeading: "achievements",
  commendationsHeading: "commendations",
  expandAll: "expand all",
  collapseAll: "collapse all",
  nudgeNextRank: "next rank: ",
  nudgeAchievement: "achievement progress: ",
  groups: {
    overall: "overall",
    runTime: "run time",
    missions: "missions",
    covers: "covers",
    modes: "modes",
    history: "recent runs",
  },
  stats: {
    bestScore: "Best score",
    bestRank: "Best rank",
    totalRuns: "Total runs",
    avgLives: "Avg lives",
    total: "Total",
    average: "Average",
    fastest: "Fastest",
    longest: "Longest",
    completed: "Completed",
    skipped: "Skipped",
    failed: "Failed",
    guardian: "Guardian",
    regen: "Regen",
    streakResets: "Streak resets",
    challenge: "Challenge",
    bestHeld: "Best (held)",
    worstCracked: "Worst (cracked)",
    imposters: "Imposters",
    scenes: "Scenes",
  },
  tips: {
    answersChanged: "answers changed",
    guardianSaves: "guardian saves",
    regen: "lives regained",
    timeouts: "timeouts",
    avgMission: "avg mission time",
    imposters: "imposters identified",
    scenes: "suspect scenes read correctly",
  },
  th: {
    date: "date",
    outcome: "outcome",
    lives: "lives",
    score: "score",
    rank: "rank",
    runTime: "run time",
    missions: "missions c·s·f",
    mode: "mode",
  },
};

const ACHIEVEMENT_CATS = [
  { id: "rank",      label: "rank" },
  { id: "ops",       label: "operations" },
  { id: "tradecraft",label: "tradecraft" },
  { id: "discipline",label: "discipline" },
  { id: "ci",        label: "counterintelligence" },
  { id: "covers",    label: "covers" },
  { id: "dead_drop", label: "dead drops" },
  { id: "elite",     label: "elite ops" },
  { id: "service",   label: "service" },
];

const ACHIEVEMENT_COPY = {
  field_clearance:     { cat: "rank",       name: "Field Clearance",      desc: "earn Field Agent rank." },
  active_duty:         { cat: "rank",       name: "Active Duty",           desc: "earn Operative rank." },
  handlers_trust:      { cat: "rank",       name: "Handler's Trust",       desc: "earn Senior Operative rank." },
  ghost_protocol:      { cat: "rank",       name: "Ghost Protocol",        desc: "earn Master Spy rank." },
  cover_established:   { cat: "ops",        name: "Cover Established",     desc: "complete your first run." },
  second_tour:         { cat: "ops",        name: "Second Tour",            desc: "complete three runs." },
  deep_cover:          { cat: "ops",        name: "Deep Cover",             desc: "complete five runs." },
  seasoned:            { cat: "ops",        name: "Seasoned Operative",     desc: "complete fifteen runs." },
  lifer:               { cat: "ops",        name: "Lifer",                  desc: "complete thirty runs." },
  field_work:          { cat: "ops",        name: "Field Work",             desc: "clear ten missions across all runs." },
  dossier_complete:    { cat: "ops",        name: "Dossier Complete",       desc: "clear fifty missions across all runs." },
  century:             { cat: "ops",        name: "Century",                desc: "clear one hundred missions across all runs." },
  quartermaster:       { cat: "ops",        name: "Quartermaster",          desc: "clear two hundred and fifty missions." },
  tradecraft:          { cat: "tradecraft", name: "Tradecraft",             desc: "score 1,500 or higher." },
  legend_status:       { cat: "tradecraft", name: "Legend Status",          desc: "score 2,500 or higher." },
  high_value_asset:    { cat: "tradecraft", name: "High Value Asset",       desc: "score 3,000 or higher." },
  shadow_network:      { cat: "tradecraft", name: "Shadow Network",         desc: "score 3,500 or higher." },
  black_budget:        { cat: "tradecraft", name: "Black Budget",           desc: "score 4,500 or higher." },
  zero_exposure:       { cat: "discipline", name: "Zero Exposure",          desc: "complete a run with zero cracks." },
  safe_house:          { cat: "discipline", name: "Safe House",             desc: "complete a run using three lives or fewer." },
  by_the_book:         { cat: "discipline", name: "By The Book",            desc: "complete a run without skipping a mission." },
  iron_legend:         { cat: "discipline", name: "Iron Legend",             desc: "complete a run with no streak resets." },
  no_backup:           { cat: "discipline", name: "No Backup",              desc: "complete a run without a guardian save." },
  unwavering:          { cat: "discipline", name: "Unwavering",             desc: "complete a run without changing an answer." },
  clean_sweep:         { cat: "discipline", name: "Clean Sweep",            desc: "complete a run with zero cracks, zero skips, and no streak resets." },
  shadow_recruit:      { cat: "discipline", name: "Shadow Recruit",         desc: "complete a run at Master Spy rank with zero cracks." },
  counterintelligence: { cat: "ci",         name: "Counterintelligence",    desc: "identify your first imposter." },
  double_agent:        { cat: "ci",         name: "Double Agent",           desc: "correctly identify five imposters." },
  profiler:            { cat: "ci",         name: "Profiler",               desc: "correctly identify fifteen imposters." },
  cold_read:           { cat: "ci",         name: "Cold Read",              desc: "catch ten tells across imposter scenes." },
  full_spectrum:       { cat: "covers",     name: "Full Spectrum",           desc: "hold every core cover." },
  specialist:          { cat: "covers",     name: "Specialist",              desc: "run ten missions under a single cover." },
  deep_specialist:     { cat: "covers",     name: "Deep Specialist",         desc: "run twenty-five missions under a single cover." },
  irrational_asset:    { cat: "dead_drop",  name: "Irrational Asset",       desc: "discover the pi dead drop." },
  signal_intercept:    { cat: "dead_drop",  name: "Signal Intercept",       desc: "decode the morse transmission." },
  off_the_grid:        { cat: "dead_drop",  name: "Off The Grid",           desc: "trigger the ultimate score egg." },
  signal_directorate:  { cat: "dead_drop",  name: "Signal Directorate",     desc: "complete all three morse code missions." },
  burn_notice:         { cat: "service",    name: "Compromised",            desc: "have your cover blown for the first time." },
  compromised:         { cat: "service",    name: "Burn Notice",            desc: "have your cover blown 5 times." },
  disavowed:           { cat: "service",    name: "Disavowed",              desc: "have your cover blown 10 times." },
  guardian_angel:      { cat: "service",    name: "Guardian Angel",         desc: "receive ten guardian saves across all runs." },
  nine_lives:          { cat: "service",    name: "Nine Lives",             desc: "regain nine lives across all runs." },
  untouchable:         { cat: "service",    name: "Untouchable",            desc: "regain nine lives in a single run." },
  adaptable:           { cat: "service",    name: "Adaptable",              desc: "change your answer ten times across all runs." },
  weathered:           { cat: "service",    name: "Weathered",              desc: "survive five mission timeouts across all runs." },
  went_to_ground:      { cat: "service",    name: "Went to Ground",         desc: "end a run without completing a single mission." },
  gone_dark:           { cat: "service",    name: "Gone Dark",              desc: "skip ten or more missions in a single run." },
  awol:                { cat: "service",    name: "AWOL",                   desc: "skip fifty missions across all runs." },
  infinity:            { cat: "ops",        name: "To Infinity & Beyond",   desc: "clear every mission in endless mode." },
  rapid_deployment:    { cat: "elite",      name: "Rapid Deployment",       desc: "complete a challenge run." },
  blitz:               { cat: "elite",      name: "Blitz",                  desc: "finish ten challenge missions." },
  under_pressure:      { cat: "elite",      name: "Under Pressure",         desc: "complete a challenge run in under ten minutes." },
  lightning:           { cat: "elite",      name: "Lightning Round",        desc: "average under fifteen seconds per mission on challenge." },
};

