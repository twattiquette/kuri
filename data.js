const VERSION = "0.55.8-alpha";

const TIER_VALUE = { grey: 0, hairline: 1, crack: 2 };

function assetImg(name) { return `asset/img/${encodeURIComponent(name)}`; }

const COVERS = {
  fixer:       { name: "The Fixer",       flavor: "Doesn't get precious about method: if the math says bend the rule, it bends. Outcome's the only scoreboard. Sleeps fine either way; regret's just paperwork nobody asked for.", img: assetImg("cover-01.png") },
  companyLine: { name: "The Company Line", flavor: "Order came down, order gets followed. No freelancing around it, whatever it costs. Carries the order folded in a pocket like scripture.", img: assetImg("cover-02.png") },
  oldHand:     { name: "The Old Hand",     flavor: "Old pro. Handles anything without losing composure; steady hands beat clever ideas. Has seen every kind of night go bad and walked out of all of them at the same pace.", img: assetImg("cover-03.png") },
  contact:     { name: "The Contact",      flavor: "Can't just watch. Shows up, stays close, does something for the person in front of them. Remembers your name, your trouble, and how you take your milk.", img: assetImg("cover-04.png") },
  broker:      { name: "The Broker",       flavor: "A deal's a deal. Won't step outside agreed terms without checking first. Forgets faces, never terms.", img: assetImg("cover-05.png") },
};

const FACETS = {
  quartermaster: { name: "The Quartermaster", flavor: "Does the practical task rather than talking about it. You'll find the thing already fixed before anyone mentions it was broken.", img: assetImg("facet-01.png") },
  constant:      { name: "The Constant",      flavor: "Gives full attention, stays present through the whole thing. Doesn't glance at the clock; the clock can wait its turn.", img: assetImg("facet-02.png") },
  cartographer:  { name: "The Cartographer",  flavor: "Reads the overall shape, acts on the big picture. Fine print is for later; the horizon's already talking.", img: assetImg("facet-03.png") },
  planner:       { name: "The Planner",       flavor: "Sticks to the plan as set and doesn't like it moved. Treats surprises as a personal insult.", img: assetImg("facet-04.png") },
  surveyor:      { name: "The Surveyor",      flavor: "Wants the concrete detail confirmed before moving. Won't call it raining until the whiskers are wet.", img: assetImg("facet-05.png") },
  briefer:       { name: "The Briefer",       flavor: "Talks people through it; the right words land better than anything else. Never met a silence that couldn't be improved on.", img: assetImg("facet-06.png") },
  shadow:        { name: "The Shadow",        flavor: "Shows up physically: a hand, standing close, presence over words. Says more with a shoulder than most manage in a speech.", img: assetImg("facet-07.png") },
  courier:       { name: "The Courier",       flavor: "Passes it along, trusts it'll land where it needs to. Never arrives empty-pawed.", img: assetImg("facet-08.png") },
  face:          { name: "The Face",          flavor: "Comfortable being seen and heard, engages directly. Finds the centre of any room by instinct and stays there.", img: assetImg("facet-09.png") },
  analyst:       { name: "The Analyst",       flavor: "Works it through logically before acting. Feelings are data; they can wait in the queue.", img: assetImg("facet-10.png") },
  improviser:    { name: "The Improviser",    flavor: "Adapts on the spot to what's happening now. Plans are lovely things to leave behind.", img: assetImg("facet-11.png") },
};

const HANDLER_IMG = assetImg("handler.png");

const WHODUNNIT_NAME_POOL = ["Mittens", "Pepper", "Clover", "Biscuit", "Tibbs", "Marmalade", "Suki", "Rascal", "Pip", "Willow", "Nutmeg", "Boots", "Socks", "Pickles", "Bramble", "Ginger", "Rocket", "Basil", "Cleo", "Tilley", "Loki", "Pixel", "Lucifur", "Felix", "Klaus", "Henry", "Lex", "Shami"];
const CUSTOM_NAME_POOL = [];
const WHODUNNIT_TELL_PARA = "Three of these are innocent; one stray slip isn't a pattern. Watch for whoever slips, scene after scene, and name the imposter.";

const OVER9000_IMG = assetImg("ee9k.png");
const PI_IMG = assetImg("eepi.png");
const MORSE_IMG = assetImg("eemc.png");
const EGG_FLAVOR = "No cover to read here, just pick the string that's actually correct.";

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
    status: "🐾 The Handler's tail curls into a question mark. “A good cover's like pi, it never quite closes.”",
  },
  {
    id: "morse",
    threshold: 1844,
    img: MORSE_IMG,
    caption: "WHAT HATH GOD WROUGHT",
    status: "🐾 The Handler's paw taps out a slow rhythm on the desk. “Eighteen forty-four”",
  },
  {
    id: "over9000",
    threshold: 9000,
    img: OVER9000_IMG,
    caption: "IT'S OVER 9000!",
    status: "🐾 The Handler's whiskers twitch, almost proud. “Over nine thousand. In all my lives I've not watched a cover held this long.”",
  },
];

const SCENARIOS = [
  {
    id: "MCA1",
    dispatch: "Exercise: Contact Assessment. Live-conditions mission, no backup.",
    situation: "Your car's died on a deserted highway at 2am: no signal, nearest servo a 4-hour walk. A stranger in a battered ute pulls over and offers to run you there and back. Something about them has your hackles up, and the highway is very empty.",
    options: ["Get in the ute.", "Talk to them for a minute first, then decide based on the read.", "Decline; wait with the car for daylight.", "Set the terms out loud first: straight there and back, no detours, then get in."],
    mode: "full5",
    grid: {
      fixer:       ["grey", "hairline", "crack", "hairline"],
      companyLine: ["crack", "hairline", "grey", "crack"],
      contact:     ["crack", "grey", "crack", "hairline"],
      oldHand:     ["crack", "hairline", "grey", "crack"],
      broker:      ["crack", "hairline", "hairline", "grey"],
    },
  },
  {
    id: "MPU2",
    dispatch: "Exercise: Pretext Under Pressure. Live-conditions mission, single counterparty.",
    situation: "You're minding a family's house and cat for the weekend; the owners are interstate for a funeral, unreachable (mid-flight). A stranger knocks, saying a relative you've never heard of sent them to collect a ring of the deceased's, for the service within the hour.\n\nThey know real details about the family, have a flight of their own shortly, and can't reach the owners either. The cat won't settle, watching the door from the hallway shelf, tail flicking.",
    options: ["Hand over the ring.", "Hand it over, but take their name, number, and a photo first.", "Refuse.", "Tell them it's not yours to decide either way."],
    mode: "full5",
    grid: {
      fixer:       ["grey", "hairline", "crack", "crack"],
      oldHand:     ["grey", "crack", "crack", "crack"],
      contact:     ["hairline", "grey", "crack", "crack"],
      companyLine: ["crack", "hairline", "hairline", "grey"],
      broker:      ["crack", "grey", "crack", "hairline"],
    },
  },
  {
    id: "MFC3",
    dispatch: "Exercise: Forced Contact. Live-conditions mission, single counterparty, no safe decline.",
    situation: "On foot, hostile terrain, one route forward: through a checkpoint staffed by a single stranger who's sizing you up like a stray as you approach. Behind you is no safer and leads nowhere; curfew and terrain rule out waiting or going around, and you're carrying nothing worth offering as a bribe even if the guard looked like he'd take one.\n\nDeclining to engage isn't on the table; the checkpoint has to be crossed one way or another before conditions change against you.",
    options: ["Approach directly, answer whatever's asked straight.", "Approach with a cover story ready, lead with it before anything's asked.", "Minimal engagement: try to pass with as little interaction as possible.", "Stall: draw it out, hoping the situation changes before you have to commit."],
    mode: "full5",
    grid: {
      fixer:       ["hairline", "grey", "hairline", "crack"],
      companyLine: ["grey", "crack", "hairline", "crack"],
      contact:     ["grey", "crack", "hairline", "crack"],
      oldHand:     ["hairline", "hairline", "grey", "crack"],
      broker:      ["grey", "crack", "hairline", "crack"],
    },
  },
  {
    id: "ESC1", level: "Easy",
    dispatch: "Exercise: Scope Creep. Live-conditions mission, no backup.",
    situation: "A neighbour asked you to water the plants, feed the cat and collect the mail while they're on a week-long trip, and left you a spare key for exactly that. On day three their cat leads you to the kitchen and sits staring at the sink cupboard: a small leak inside, dripping steadily onto the floor.\n\nThey're reachable by text, but it's the middle of the night for them and a reply could take hours.",
    options: ["Leave it; mention it when they're back.", "Text them to check before doing anything.", "Shut off the water at the valve under the sink, right away.", "Call a plumber and stay to let them in.", "Place a bucket and towel to contain it, checking back periodically."],
    mode: "full5",
    grid: {
      fixer:       ["crack", "hairline", "grey", "hairline", "crack"],
      companyLine: ["grey", "hairline", "crack", "crack", "crack"],
      contact:     ["crack", "hairline", "hairline", "grey", "hairline"],
      oldHand:     ["crack", "hairline", "hairline", "hairline", "grey"],
      broker:      ["hairline", "grey", "crack", "crack", "hairline"],
    },
  },
  {
    id: "ECD1", level: "Easy",
    dispatch: "Exercise: Comfort Drill. Live-conditions mission, no backup.",
    situation: "A fellow trainee just got bad news from home and stepped out to the corridor rather than sit with it in the ready room. You're the only one there, and the drill is to hold whatever comfort style you've been assigned, not just whatever comes naturally.",
    options: ["Sit down right beside them and put a hand on their shoulder, staying close.", "Sit with them and just stay, however long it takes, no phone, no rushing off.", "Go get them water and take their next task off their hands without asking.", "Talk them through it and tell them plainly they're handling this fine.", "Duck into the canteen, bring back something small for them, then step back."],
    mode: "full5",
    grid: {
      shadow:        ["grey", "hairline", "crack", "hairline", "crack"],
      constant:      ["hairline", "grey", "crack", "hairline", "crack"],
      quartermaster: ["crack", "crack", "grey", "hairline", "hairline"],
      briefer:       ["hairline", "hairline", "crack", "grey", "crack"],
      courier:       ["crack", "crack", "hairline", "crack", "grey"],
    },
  },
  {
    id: "ENW2", level: "Easy",
    dispatch: "Exercise: Night Watch. Live-conditions mission, no backup.",
    situation: "A fellow trainee has a big evaluation first thing tomorrow and is pacing their quarters instead of turning in, restless, book untouched on the bed.",
    options: ["Sit on the edge of the bed beside them and stay there, shoulder to shoulder, without moving.", "Stay in the room with them as long as it takes, no ducking out to your own bunk.", "Go double check the roster and lock arrangements yourself so they don't have to think about it.", "Tell them plainly they're ready for tomorrow and walk them through exactly why.", "Leave a small keepsake on their pillow before you go, then step back out."],
    mode: "full5",
    grid: {
      shadow:        ["grey", "hairline", "crack", "hairline", "crack"],
      constant:      ["hairline", "grey", "crack", "hairline", "crack"],
      quartermaster: ["crack", "crack", "grey", "hairline", "hairline"],
      briefer:       ["hairline", "hairline", "crack", "grey", "crack"],
      courier:       ["crack", "crack", "hairline", "crack", "grey"],
    },
  },
  {
    id: "EFG3", level: "Easy",
    dispatch: "Exercise: Failed Grade. Live-conditions mission, no backup.",
    situation: "A fellow trainee just failed their field navigation qualification and is sitting alone in the gear room, slowly re-coiling rope that doesn't need re-coiling. You're the one who found them, and the drill holds: comfort in the style you've been assigned, not whichever comes easiest.",
    options: ["Sit on the bench beside them, shoulder against theirs, and stay put.", "Pull up the other bench and keep them company as long as they need, no checking the time.", "Take the kit return and the logbook entry off their hands so they don't have to face the desk tonight.", "Tell them straight that one failed run doesn't sink them, and lay out exactly why they'll pass the retake.", "Fetch something small and warm from the canteen, set it down beside them, then give them room."],
    mode: "full5",
    grid: {
      shadow:        ["grey", "hairline", "crack", "hairline", "crack"],
      constant:      ["hairline", "grey", "crack", "hairline", "crack"],
      quartermaster: ["crack", "crack", "grey", "hairline", "hairline"],
      briefer:       ["hairline", "hairline", "crack", "grey", "crack"],
      courier:       ["crack", "crack", "hairline", "crack", "grey"],
    },
  },
  {
    id: "ELW4", level: "Easy",
    dispatch: "Exercise: Long Way Home. Live-conditions mission, no backup.",
    situation: "Mail call came and went with nothing for a fellow trainee, their first long stretch away from home, and now they're parked at the common-room window staring at nothing. The drill still stands: hold the comfort style you've been assigned, not the one you'd reach for on instinct.",
    options: ["Settle in next to them at the window, close enough that your shoulders touch, and leave it at that.", "Drag a chair over and keep watch with them at the window, however long it takes, no drifting off to your bunk.", "Quietly swap yourself onto their pre-dawn kitchen shift so tomorrow starts easier for them.", "Tell them plainly that missing home this hard means they've got something worth missing, and they're holding up better than they think.", "Bring them a mug of something hot from the canteen, leave it at their elbow, then step away."],
    mode: "full5",
    grid: {
      shadow:        ["grey", "hairline", "crack", "hairline", "crack"],
      constant:      ["hairline", "grey", "crack", "hairline", "crack"],
      quartermaster: ["crack", "crack", "grey", "hairline", "hairline"],
      briefer:       ["hairline", "hairline", "crack", "grey", "crack"],
      courier:       ["crack", "crack", "hairline", "crack", "grey"],
    },
  },
  {
    id: "ECS5", level: "Easy",
    dispatch: "Exercise: Cold Shoulder. Live-conditions mission, no backup.",
    situation: "A fellow trainee just had a blazing row with their usual sparring partner and stormed off to the stairwell, kit abandoned mid-session on the mats. You follow them out, and the drill is to hold the comfort style you've been assigned, not just whatever comes naturally.",
    options: ["Drop onto the step beside them, press your shoulder to theirs, and say nothing.", "Settle in on the stairwell with them for as long as it takes, no nudging them back towards the hall.", "Head back in and square away both kits and the mats yourself so there's nothing waiting for them.", "Tell them straight that one argument doesn't wreck a good partnership, and that they'll patch it up.", "Slip down to the vending machine, leave something small on the step beside them, then back off."],
    mode: "full5",
    grid: {
      shadow:        ["grey", "hairline", "crack", "hairline", "crack"],
      constant:      ["hairline", "grey", "crack", "hairline", "crack"],
      quartermaster: ["crack", "crack", "grey", "hairline", "hairline"],
      briefer:       ["hairline", "hairline", "crack", "grey", "crack"],
      courier:       ["crack", "crack", "hairline", "crack", "grey"],
    },
  },
  {
    id: "MAR1",
    dispatch: "Exercise: Asset Recovery. Live-conditions mission, no backup.",
    situation: "You're at the pickup point. The extraction vehicle has room and fuel for one hard run before a storm front closes the only pass out.\n\nA local contact who helped you get this far (not officially your responsibility, not tasked to protect) is also trying to reach the same pass, slowed by a hurt ankle. Waiting for them risks the window closing on both of you. Going alone gets you out clean and no one will ever know you didn't wait.",
    options: ["Board now; leave them for the next opportunity.", "Slow your pace to match theirs; head for the pass together, sharing the risk of missing the window.", "Go ahead to hold the window open, then go back for them.", "Give up your seat; wait for the next extraction yourself."],
    mode: "full5",
    grid: {
      fixer:       ["hairline", "hairline", "grey", "crack"],
      companyLine: ["grey", "hairline", "crack", "crack"],
      contact:     ["crack", "hairline", "hairline", "grey"],
      oldHand:     ["hairline", "grey", "hairline", "crack"],
      broker:      ["crack", "grey", "hairline", "crack"],
    },
  },
  {
    id: "MEP1",
    dispatch: "Exercise: Extraction Priority. Live-conditions mission, no backup.",
    situation: "You're on foot extraction, last checkpoint before a border crossing closes for the night. The vehicle waiting for you seats one and is already yours.\n\nNear the checkpoint, a stranger with a badly injured leg is trying to make the same crossing before curfew and can't move fast enough to do it on foot. Giving up the seat costs you the window: the next crossing isn't for days, and your cover can't hold that long. No one will ever know if you take the seat and go.",
    options: ["Give up the seat; go on foot as far as curfew allows.", "Take them as far as a point that still leaves you both a shot at making it.", "Take the vehicle alone.", "Stay at the checkpoint with them instead of running either route."],
    mode: "full5",
    grid: {
      fixer:       ["crack", "grey", "hairline", "crack"],
      companyLine: ["crack", "hairline", "grey", "crack"],
      contact:     ["grey", "hairline", "crack", "crack"],
      oldHand:     ["crack", "hairline", "hairline", "grey"],
      broker:      ["crack", "hairline", "grey", "hairline"],
    },
  },
  {
    id: "MLT1",
    dispatch: "Exercise: Left in Trust. Live-conditions mission, no backup.",
    situation: "A fellow operative went dark on a long posting and left you the key to their lock-up with a signed note: if they're not back by the first of the month, clear it out, sell what sells, burn the rest. The first has been and gone with no word, and the lock-up's lease runs out this week.\n\nUnder the floor mat you find a sealed box the note never mentions: letters and photographs, some carrying their real name. The only line to them is a slow emergency channel, and an answer could take weeks.",
    options: ["Clear the lock-up as the note says: sell what sells, burn the rest, the box included.", "Burn only the papers that carry their name; sell the gear and set the rest of the box aside for them.", "Sell and clear the gear now, but hold the box back and send a query down the emergency channel before touching it.", "Take the box home and keep it safe for them until they surface."],
    mode: "full5",
    grid: {
      fixer:       ["hairline", "grey", "hairline", "crack"],
      companyLine: ["grey", "crack", "hairline", "crack"],
      contact:     ["crack", "hairline", "hairline", "grey"],
      oldHand:     ["grey", "hairline", "hairline", "crack"],
      broker:      ["hairline", "crack", "grey", "crack"],
    },
  },
  {
    id: "MTD2",
    dispatch: "Exercise: Time-Critical Disclosure. Live-conditions mission, no backup, decision window closes fast.",
    situation: "You intercept unconfirmed word of a planned move against one of your contacts, inside the hour. Verifying it and pushing it through proper channel takes longer than the window allows.\n\nWarning the contact yourself, unauthorised, risks burning your cover and the source that gave you the tip. If you sit on it and it turns out to be nothing, no one will ever know you had it.",
    options: ["Warn them directly, now, unauthorised.", "Hold it; push it through channel immediately, accept the window may close.", "Warn them now, but keep it vague: no source, no specifics.", "Do nothing; it's unconfirmed and not your call."],
    mode: "full5",
    grid: {
      fixer:       ["hairline", "hairline", "grey", "crack"],
      companyLine: ["crack", "grey", "crack", "hairline"],
      contact:     ["grey", "hairline", "hairline", "crack"],
      oldHand:     ["hairline", "hairline", "grey", "crack"],
      broker:      ["crack", "grey", "crack", "hairline"],
    },
  },
  {
    id: "MAP1",
    dispatch: "Exercise: Authorisation Under Pressure. Live-conditions mission, no backup, decision window closes fast.",
    situation: "You're on a static observation post, watching a dead-drop handoff you're tasked to log, not interfere with. The asset arrives on time. But the person waiting to receive the package isn't the real contact: a stranger's beaten the actual handler to the spot, close enough in profile that the asset hasn't clocked the swap yet.\n\nReaching control for sanction to intervene would take longer than the handoff itself; the exchange is seconds away. Standing orders are observe-and-report only. If the package changes hands with the wrong person, the asset's identity goes with it. Afterward, nothing will show what you knew or when.",
    options: ["Act now, without authorisation.", "Wait for sanction; let the window close if it closes.", "Act now, but log the call and reasoning immediately after, on the record.", "Decline to act, regardless of what waiting costs."],
    mode: "full5",
    grid: {
      fixer:       ["grey", "hairline", "hairline", "crack"],
      companyLine: ["crack", "grey", "hairline", "hairline"],
      contact:     ["grey", "hairline", "hairline", "crack"],
      oldHand:     ["hairline", "hairline", "grey", "crack"],
      broker:      ["crack", "grey", "hairline", "hairline"],
    },
  },
  {
    id: "MMR1",
    dispatch: "Exercise: Method Read. Field repair, tight window. No ethics call in this one, just how you work it.",
    situation: "The safehouse's relay antenna is down and the scheduled check-in window opens in twenty minutes. You've got a fault list from the last tech (half-finished, jargon-heavy), a clear visual on the mast from the ground, and a spare part that might not even be the right one.",
    options: ["Read the fault list line by line, working the logic through before touching anything.", "Skip the list; step back and read the whole rig, trust what the shape of the problem is telling you.", "Climb up and check every connection and component by hand before deciding anything.", "Follow the tech's checklist exactly, in the order it's written.", "Try the spare part first; adjust based on what happens, worry about the rest as it comes up."],
    mode: "full5",
    grid: {
      analyst:      ["grey", "hairline", "crack", "hairline", "crack"],
      cartographer: ["hairline", "grey", "crack", "crack", "hairline"],
      surveyor:     ["crack", "crack", "grey", "hairline", "hairline"],
      planner:      ["hairline", "crack", "hairline", "grey", "crack"],
      improviser:   ["crack", "hairline", "hairline", "crack", "grey"],
    },
  },
  {
    id: "MCC1",
    dispatch: "Exercise: Continuity Check. Asset verification, no backup. No ethics call in this one, just how you confirm it.",
    situation: "An asset's file has been quietly rebuilt piece by piece over six years: new name, new papers, a new backstory layered over the last, until nothing of the original document survives. Control wants a read before the next drop: same asset who signed on originally, or a different person now sitting behind the same file number.",
    options: ["Pull the physical paper trail and check every replaced document against the original chain of custody.", "Skip the paperwork; read how the asset's whole pattern of behaviour lines up with the file, trust the shape of it.", "Cross-reference the current story against every prior debrief for a place where the details don't logically fit.", "Sit down with the asset directly and ask them to walk you through it face to face."],
    mode: "full5",
    grid: {
      surveyor:     ["grey", "crack", "hairline", "hairline"],
      cartographer: ["crack", "grey", "hairline", "hairline"],
      analyst:      ["hairline", "hairline", "grey", "crack"],
      face:         ["hairline", "hairline", "crack", "grey"],
    },
  },
  {
    id: "MSR1",
    dispatch: "Exercise: Source Read. Perimeter check, no backup. No ethics call in this one, just how you read it.",
    situation: "A perimeter sensor that's never once misfired in three years just tripped, and the camera feed shows nothing there. Control wants a call before anyone resets it: the one false alarm in three years, or the one time the count finally catches up with the system.",
    options: ["Pull the sensor's full logs and work through every past trip line by line for anything that matches this one.", "Radio the duty team directly and talk it through with whoever's on watch before deciding anything.", "Follow the standing false-alarm procedure exactly, step by step, regardless of the odd read.", "Go out and read the scene as it is right now; decide on what's actually there, not on what the log says."],
    mode: "full5",
    grid: {
      analyst:    ["grey", "hairline", "hairline", "crack"],
      face:       ["hairline", "grey", "crack", "hairline"],
      planner:    ["hairline", "crack", "grey", "hairline"],
      improviser: ["crack", "hairline", "hairline", "grey"],
    },
  },
  {
    id: "MFS2", minTier: "MediumFacet",
    dispatch: "Exercise: Field Stabilisation. Live-conditions mission, single counterparty.",
    situation: "A contact just had a close call (not hurt, badly rattled) and needs to be steadied before the op can continue. Tempo matters; you have to decide how, not whether.",
    options: ["Take over their remaining tasks so they can recover.", "Tell them plainly they held up fine and can keep going.", "Stay close and walk them through the rehearsed next steps, the surest route back to a working op.", "Stay at their shoulder and let them settle, however long it takes."],
    mode: "fixed",
    legendVariants: [
      {
        spine: "fixer", facets: ["quartermaster"],
        grid: {
          fixer:         ["hairline", "hairline", "grey", "crack"],
          quartermaster: ["grey", "crack", "hairline", "crack"],
        },
      },
      {
        spine: "oldHand", facets: ["planner"],
        grid: {
          oldHand: ["crack", "grey", "hairline", "hairline"],
          planner: ["hairline", "hairline", "grey", "crack"],
        },
      },
    ],
  },
  {
    id: "MFW2", minTier: "MediumFacet",
    dispatch: "Exercise: Final Window. Live-conditions mission, single counterparty, radio discipline in effect.",
    situation: "Final minutes before a scheduled handoff. Your local contact, first time doing this, is anxious and keeps asking if the plan will hold, eating into the silent window protocol calls for.",
    options: ["Answer fully, walk them through it again, stay with them right up to the countdown; they need to hear it.", "Give a brief reassurance, then go quiet as scheduled.", "Say nothing further; hold radio discipline exactly as briefed.", "Step away to give them space, resume at zero hour."],
    mode: "fixed",
    legendVariants: [
      {
        spine: "companyLine", facets: ["constant"],
        grid: {
          companyLine: ["crack", "hairline", "grey", "crack"],
          constant:    ["grey", "hairline", "crack", "crack"],
        },
      },
      {
        spine: "broker", facets: ["face"],
        grid: {
          broker: ["crack", "hairline", "grey", "hairline"],
          face:   ["grey", "hairline", "crack", "hairline"],
        },
      },
    ],
  },
  {
    id: "MSC1", minTier: "MediumFacet",
    dispatch: "Exercise: Script Continuity. Live-conditions mission, no backup.",
    situation: "You're walking an at-risk contact through a rehearsed exit routine at a set time. At the moment it starts, conditions on the ground have shifted slightly: not dangerously, just not as briefed. The exit still works either way: run the script exactly, or adapt to what you're seeing now.",
    options: ["Follow the rehearsed plan exactly, on schedule.", "Handle it yourself, hands-on; sort out whatever's changed and keep moving, no script.", "Check in with them; take your read from how they're holding up.", "Sit tight and let it settle; you've seen shifts like this before, no need to rush it."],
    mode: "fixed",
    legendVariants: [
      {
        spine: "contact", facets: ["planner"],
        grid: {
          contact: ["hairline", "hairline", "grey", "crack"],
          planner: ["grey", "crack", "hairline", "hairline"],
        },
      },
      {
        spine: "oldHand", facets: ["quartermaster"],
        grid: {
          oldHand:       ["crack", "hairline", "hairline", "grey"],
          quartermaster: ["crack", "grey", "hairline", "hairline"],
        },
      },
    ],
  },
  {
    id: "MVX2", minTier: "MediumFacet",
    dispatch: "Exercise: Verified Exchange. Live-conditions mission, single counterparty.",
    situation: "A prearranged trade: package for information, exact terms set in advance. At the exchange, the contact shows up with everything as arranged except one item, a close-but-not-identical substitute, and one unplanned bystander at the corner of the meet.",
    options: ["Proceed only if every detail checks out exactly as specified, item by item.", "Proceed anyway; hand the package over and trust it lands where it needs to.", "Pause, check the substitution against the agreed terms, then decide.", "Call off the trade; enough has changed from the brief."],
    mode: "fixed",
    legendVariants: [
      {
        spine: "broker", facets: ["surveyor"],
        grid: {
          broker:   ["hairline", "crack", "grey", "hairline"],
          surveyor: ["grey", "crack", "hairline", "hairline"],
        },
      },
      {
        spine: "companyLine", facets: ["courier"],
        grid: {
          companyLine: ["grey", "crack", "hairline", "hairline"],
          courier:     ["hairline", "grey", "hairline", "crack"],
        },
      },
    ],
  },
  {
    id: "HSO3", level: "Hard",
    dispatch: "Exercise: Standing Order. Hard conditions, no backup, no re-authorisation window. Final assessment.",
    situation: "You're surface overwatch on a covert op. The asset (a deep-cover operative you've only ever known through encrypted dossiers and voice logs, never met) is the sole occupant of a submerged listening post that's just taken a hull breach. Their compartment is sealed, life support failing, telemetry confirms they're conscious and in pain with no way to reverse it. The nearest rescue sub is hours out; life support won't last that long.\n\nTwo-way comms died with the breach: you get telemetry and their standing pre-deployment directive, but you can't open a channel to ask them anything now, and forcing one would surface the post's location.\n\nYou hold the only failsafe authorisation on the surface vessel: triggering it ends the compartment at once, quickly, instead of the slow way. There's no partial option. Before deployment, the asset logged a directive asking for exactly that, in exactly this situation.",
    options: ["Trigger the failsafe now, exactly as the directive logs it.", "Hold off; keep working the rescue window; the shape of this might still change.", "Refuse the switch; stay with them the only way left, on their telemetry, full attention, don't cut away.", "Hold off; you won't do something this irreversible while unsure."],
    mode: "fixed",
    legendVariants: [
      {
        spine: "companyLine", facets: ["cartographer", "constant"],
        grid: {
          companyLine:  ["grey", "hairline", "crack", "crack"],
          cartographer: ["crack", "grey", "hairline", "hairline"],
          constant:     ["hairline", "crack", "grey", "hairline"],
        },
        epilogue: "The hardest cover in the program. Its spine asks the coldest thing in the room, alone, and asks you to keep your face while you do it. Most trainees hold one face of three. Almost nobody holds the spine.",
      },
      {
        spine: "contact", facets: ["planner", "cartographer"],
        grid: {
          contact:      ["crack", "hairline", "grey", "crack"],
          planner:      ["grey", "crack", "hairline", "crack"],
          cartographer: ["crack", "grey", "hairline", "hairline"],
        },
        epilogue: "Three reads on one switch, and only one of them was ever going to hold. The Planner wanted the order executed exactly as logged, no lingering. The Cartographer wanted the rescue window kept open a little longer, just in case the shape of it changed. Everyone remembers the compartment going quiet; almost nobody remembers that staying on the wire, not looking away, was the only thing The Contact was ever going to do.",
      },
    ],
  },
  {
    id: "HSI4", level: "Hard",
    dispatch: "Exercise: Sealed Intercept. Hard conditions, no backup, tamper-flagged asset, decision window inside the hour.",
    situation: "You're running a lone intercept on a data courier. You've confirmed the sealed case they're carrying holds a manifest that, if it reaches its buyer within the hour, gets three of your field contacts identified and rolled up.\n\nYou can't tell which three, or whether the manifest is even complete, without opening the case, and opening it trips a tamper flag that signals the buyer it's compromised and triggers the exact rollup you're trying to stop.\n\nTaking the case dark now means destroying it unopened, losing whatever else it holds and burning a channel you spent a year building. No one will ever know what was really inside.",
    options: ["Destroy the case now, unopened; the odds favour it.", "Shadow the courier to the handoff: steady pace, reading how it unfolds, moving only if the buyer shows.", "Open the case and deal with what's inside yourself, hands-on, rather than routing it through anyone else.", "Pull back; hand the case up the chain exactly as protocol demands, framed in exactly the right words, and wait for authorisation."],
    mode: "fixed",
    legendVariants: [
      {
        spine: "fixer", facets: ["improviser", "courier"],
        grid: {
          fixer:      ["grey", "hairline", "crack", "crack"],
          improviser: ["hairline", "grey", "crack", "hairline"],
          courier:    ["crack", "hairline", "hairline", "grey"],
        },
        epilogue: "Three reads on one case, and only one of them was the cover. The Improviser in you wanted to wait and read the room, moving only once the buyer actually showed, the Courier's hand wanted it passed up the chain, handed off clean, not decided alone. Opening the case wasn't anybody's instinct, just the trap that caught you anyway. You held The Fixer or you didn't. No partial credit for good intentions.",
      },
      {
        spine: "companyLine", facets: ["cartographer", "quartermaster"],
        grid: {
          companyLine:  ["crack", "hairline", "crack", "grey"],
          cartographer: ["crack", "grey", "hairline", "hairline"],
          quartermaster: ["hairline", "hairline", "grey", "crack"],
        },
        epilogue: "Three reads on one case, and only one of them was the cover. The Cartographer wanted to see how the whole play unfolded before committing to anything, the Quartermaster wanted the case opened and dealt with, hands-on. Everyone remembers the case that never got opened; almost nobody remembers that going through channel, however slow, was the only place The Company Line was ever going to stand.",
      },
      {
        spine: "oldHand", facets: ["surveyor", "briefer"],
        grid: {
          oldHand:  ["crack", "grey", "crack", "hairline"],
          surveyor: ["crack", "hairline", "grey", "hairline"],
          briefer:  ["crack", "hairline", "crack", "grey"],
        },
        epilogue: "Three reads on one case, and only one of them was the cover. The Surveyor wanted the case open and the threat confirmed in hand before anyone committed to anything. The Briefer wanted it walked up the chain, put into exactly the right words and made someone else's call. Destroying it on the spot was nobody's read, just the loudest way to stop thinking. The Old Hand tails the courier at an even pace and lets the handoff come to him; steady beats clever, tonight especially. Everyone remembers what was almost in the case; almost nobody remembers the quiet tail that never hurried. No partial credit for cleverness.",
      },
    ],
  },
  {
    id: "HNL4", level: "Hard",
    dispatch: "Exercise: Night Lift. Hard conditions, sole handler on the ground, radio-silent window, single vehicle.",
    situation: "You're the only handler on the ground for a staged night evacuation of a safehouse. The plan, rehearsed and timed to a radio-silent window, moves four people out in one vehicle in a fixed order.\n\nAt the vehicle, a fifth turns up: a neighbour who plainly saw the movement and is now frightened and exposed, not part of the plan, not your responsibility, not accounted for in the vehicle's weight or the window's timing. Taking them means a rehearsed passenger drops or the timing slips; leaving them means they're alone with what they just saw.",
    options: ["Load them in on the spot, no fuss; bump a rehearsed passenger to the next run.", "Stay with the neighbour yourself, making no secret of it; send the vehicle on as planned.", "Run the plan exactly as agreed, same pace as the rehearsal; the neighbour isn't on it.", "Pause the timing; work out the load for all five properly before moving."],
    mode: "fixed",
    legendVariants: [
      {
        spine: "contact", facets: ["planner", "face"],
        grid: {
          contact: ["grey", "hairline", "crack", "hairline"],
          planner: ["crack", "hairline", "grey", "crack"],
          face:    ["hairline", "grey", "crack", "hairline"],
        },
        epilogue: "Three reads on one lift, and only one of them held the cover. Care wanted them safe, the Face wanted to stay and be seen standing with them, not slip off with the vehicle, the Planner wanted the timetable untouched. Everyone remembers the frightened face at the window. Almost nobody remembers to still be The Contact while the clock runs.",
      },
      {
        spine: "broker", facets: ["surveyor", "quartermaster"],
        grid: {
          broker:        ["crack", "crack", "grey", "hairline"],
          surveyor:      ["hairline", "hairline", "crack", "grey"],
          quartermaster: ["grey", "hairline", "hairline", "crack"],
        },
        epilogue: "Three reads on one lift, and only one of them holds the deal. The Surveyor wanted the load worked out before anyone moved, the Quartermaster wanted it handled hands-on, not talked through. Everyone remembers the neighbour left standing at the window; almost nobody remembers the deal was never renegotiable, and that's the only thing The Broker was ever going to hold to.",
      },
      {
        spine: "oldHand", facets: ["shadow", "improviser"],
        grid: {
          oldHand:    ["hairline", "crack", "grey", "crack"],
          shadow:     ["hairline", "grey", "crack", "hairline"],
          improviser: ["grey", "crack", "crack", "hairline"],
        },
        epilogue: "Three reads on one lift, and only one of them kept its head. The Shadow wanted to stand with the neighbour, a hand on a shoulder worth more than any timetable. The Improviser wanted the load reworked on the fly, a fifth seat found in a four-seat plan. Stopping the clock to redraw the whole night belonged to nobody; the window doesn't reopen for a better diagram. The Old Hand runs the rehearsal, because the rehearsal is what steady looks like when it counts. Everyone remembers who got left and who got lifted; almost nobody remembers that composure was the assignment. No partial credit for heart.",
      },
    ],
  },
  {
    id: "HCH1", level: "Hard",
    dispatch: "Exercise: Cold Handover. Hard conditions, sole escort, no verification channel, one crossing window.",
    situation: "You're the sole escort on a defector's night exfil, last leg: a riverbank handover to a boat crew you've never met. Recognition runs on a daily phrase, and the crew has everything else right: the place, the minute, room aboard for exactly one passenger, and they knew what to ask for.\n\nThe phrase they gave is yesterday's.\n\nThere's no channel to check it against; the radio window closed at the safehouse and doesn't reopen until dawn. A stale codebook on a slow boat is common enough. So is a crew rolled up at yesterday's crossing and replaced. The boat can hold the bank for minutes, not longer; the agreed fallback point costs the whole night to reach; dawn puts patrols on both banks. One seat, none for you, and the defector is watching you decide.",
    options: ["Make the handover; the odds favour it and the whole shape of it reads clean.", "Press the crew for a second proof before anyone boards.", "Turn the defector around; walk the route back close at their side, hand ready, giving them your full attention, until a new window opens.", "Break for the fallback point, exactly as agreed; no phrase, no handover."],
    mode: "fixed",
    legendVariants: [
      {
        spine: "fixer", facets: ["planner", "shadow"],
        grid: {
          fixer:   ["grey", "hairline", "crack", "crack"],
          planner: ["crack", "hairline", "crack", "grey"],
          shadow:  ["crack", "hairline", "grey", "hairline"],
        },
        epilogue: "Three reads on one riverbank, and only one of them was the cover. The Planner wanted the fallback run exactly as written: wrong phrase, alternate point, no debate. The Shadow wanted to stay at the defector's shoulder, close enough to touch, wherever the night went. Standing on the bank demanding a better password belonged to nobody; it just spent the window louder. The Fixer weighs a stale codebook against a burned crossing and puts the defector on the boat, because the odds were the mission. Everyone remembers the phrase that didn't match; almost nobody remembers the crossing that worked. No partial credit for caution.",
      },
      {
        spine: "broker", facets: ["cartographer", "constant"],
        grid: {
          broker:       ["crack", "hairline", "crack", "grey"],
          cartographer: ["grey", "crack", "hairline", "hairline"],
          constant:     ["crack", "hairline", "grey", "hairline"],
        },
        epilogue: "Three reads on one riverbank, and only one of them held the terms. The Cartographer read the whole shape of it, right place, right minute, right crew but one stale word, and wanted them aboard on the pattern. The Constant wanted to stay beside the defector through whatever came next, attention over arithmetic. But the signal was the deal: no phrase, no handover, fall back as agreed. Everyone remembers the boat pulling away empty; almost nobody remembers that the fallback was the agreement holding, not the mission failing. No partial credit for a good read.",
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
    situationIntro: "A cat's been found dead at the shelter; we'll leave the how off the page. Four suspects tonight: {names}.\n\nThe imposter is hiding behind a profile: a single card laying out exactly the sort of cat they swear they are, handed over as their cover. \"That's me, that's who I am.\" But a profile only holds if you actually live it, and it won't survive a close read on anyone who's just borrowed it.",
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
            { grey: "Shuffles the short crates to where they're needed most and sorts the gap on the fly.",
              hairline: "Double-checks the sign-out log before moving anything, then reroutes a crate to the kittens.",
              crack: "Won't touch the crates until the delivery's logged and a reorder's signed off properly." },
            { grey: "Squares it from petty cash now, sorts the paperwork after; keeps the night running.",
              hairline: "Squares it from petty cash but stops to log the bounced cheque before carrying on.",
              crack: "Holds all spending till the cheque clears the books; can't run on money that isn't there." },
            { grey: "Merges them into one bigger night; nobody loses out.",
              hairline: "Squeezes both into the hall back to back and trusts the changeover to hold.",
              crack: "Cancels the second booking; the calendar says one slot, one event." },
          ],
          companyLine: [
            { grey: "Logs the shortage against the delivery note and lodges the reorder before a single tin moves.",
              hairline: "Files the shortage by the book, then stretches tonight's portions thin so the gap lands evenly.",
              crack: "Reroutes a crate to the kittens on the spot and lets the paperwork catch up tomorrow." },
            { grey: "Freezes the night's spending the moment the cheque bounces; nothing runs on money that isn't there.",
              hairline: "Freezes the spending as required, but reorders the programme so the free items run first.",
              crack: "Squares it from petty cash and keeps the night rolling; the books can wait till morning." },
            { grey: "Stands by whichever booking was lodged first and sends the other back through the booking form.",
              hairline: "Upholds the first booking, though not before hunting the diary for the bumped party's next free date.",
              crack: "Merges the two into one bigger night on the spot; nobody loses out, whatever the diary says." },
          ],
        },
      },
      {
        name: "Pepper",
        beats: {
          fixer: [
            { grey: "Calls in a favour from the deli two doors down, closes the gap before anyone notices.",
              hairline: "Rings the deli for the gap but logs every tin first so the books stay straight.",
              crack: "Leaves the bowls short and files a shortage report; stock moves only once it's reordered by the book." },
            { grey: "Slips the treasurer a quiet word and keeps the music going while it's smoothed over.",
              hairline: "Keeps the music going, but pins the treasurer down for a paper trail before the night's out.",
              crack: "Stops the event's tab the moment the cheque bounces; nothing spends until it's cleared properly." },
            { grey: "Shuffles one booking to the courtyard; turns the clash into two rooms, both run.",
              hairline: "Crams both into the one hall back-to-back, banking on running the overlap on the night.",
              crack: "Bumps the later booking off the calendar; two into one slot isn't allowed." },
          ],
          companyLine: [
            { grey: "Leaves the bowls a little short tonight and files the shortage; stock moves once the reorder's signed.",
              hairline: "Files the shortage properly, then rings the supplier after hours to hurry the reorder along.",
              crack: "Calls in a favour from the deli two doors down and closes the gap off the books." },
            { grey: "Reports the bounce to the treasurer straight away and pauses the tab until it clears.",
              hairline: "Pauses the tab as the rule asks, but leans on the venue to hold the bill over a day.",
              crack: "Covers the gap on a quiet nod from the treasurer and keeps the music going regardless." },
            { grey: "Rules by the timestamp: the first booking keeps the hall, the second gets the standard rebooking letter.",
              hairline: "Keeps the rule, but hand-delivers the rebooking letter with the three best open dates circled.",
              crack: "Shuffles one booking to the courtyard and runs the clash as two rooms, both on." },
          ],
        },
      },
      {
        name: "Clover",
        beats: {
          fixer: [
            { grey: "Splits the short crates by need and quietly tops up the kittens from a private stash.",
              hairline: "Splits the crates by need, but pauses to note who's owed what before handing them out.",
              crack: "Holds the crates in the store until the paperwork's squared; policy is policy on stock." },
            { grey: "Fronts the shortfall out of pocket, settles up with the donor tomorrow; no scene.",
              hairline: "Quietly makes up the shortfall from another pot's float and squares it later.",
              crack: "Won't settle a bounced cheque from event funds; freezes it until the donor's paid up through the books." },
            { grey: "Trades the slot with the choir next door for a later favour; both keep their night.",
              hairline: "Double-books the courtyard as backup and sorts the overlap once everyone's in.",
              crack: "Cancels the clashing booking by the room-hire rule and points them to the form." },
          ],
          companyLine: [
            { grey: "Holds the crates in the store until the delivery note's squared away; stock policy doesn't bend for a busy night.",
              hairline: "Squares the delivery note first, but weighs the kittens' bowls a little heavier inside the split.",
              crack: "Tops the kittens up from a private stash and evens the shortfall out by need, no forms." },
            { grey: "Won't let event funds touch a bounced cheque; the shortfall waits until the donor pays through the books.",
              hairline: "Holds the funds as written, but talks the supplier into invoicing next month instead.",
              crack: "Covers the gap quietly from a private purse before the band's finished the first set." },
            { grey: "Applies the room-hire rule as written and sends the later booking back through proper channels.",
              hairline: "Applies the rule, then rings the choir next door off the record about spare nights anyway.",
              crack: "Swaps the clash away in a handshake deal with the choir next door; both nights run, no forms." },
          ],
        },
      },
      {
        name: "Biscuit",
        beats: {
          fixer: [
            { grey: "Reroutes a crate to the kittens on the spot; short on paper beats short in the bowls tonight.",
              hairline: "Reroutes the crate but stops to log the discrepancy against the delivery note first.",
              crack: "Refuses to move the short stock and lodges it for a formal reorder; rules first, bowls later." },
            { grey: "Squares the gap from the float and keeps the night rolling; sorts the cheque tomorrow.",
              hairline: "Keeps things going but logs the bounce and flags it for the treasurer straight away.",
              crack: "Freezes the night's spending until the bounced cheque clears the books; no exceptions." },
            { grey: "Trades one slot to the annexe and keeps both nights on; nobody's turned away.",
              hairline: "Runs both in the one hall on a tight changeover, cutting it fine to keep them both.",
              crack: "Cancels the later booking because it broke the calendar rule." },
          ],
          companyLine: [
            { grey: "Counts the crates twice against the docket, logs the gap, and feeds strictly to the listed ration.",
              hairline: "Feeds to the listed ration, but rounds every scoop generously so the shortfall barely shows.",
              crack: "Shifts stock to wherever it's needed most and sorts the ledger later; bowls beat paperwork tonight." },
            { grey: "Logs the bounce, notifies the treasurer in writing, and holds every further cost till it clears.",
              hairline: "Holds further costs as required, but times the announcement so the raffle's already been drawn.",
              crack: "Waves the night on and nets the cheque off against tomorrow's takings; results first, ledgers later." },
            { grey: "Cancels whichever booking broke the calendar rule and logs the clash for the committee.",
              hairline: "Cancels by the rule, but books the bumped event into the next slot before anyone can ask.",
              crack: "Digs out the annexe key and runs the second event there; the calendar can complain in the morning." },
          ],
        },
      },
    ],
    beatPrompts: [
      "The shelter's food delivery lands two crates short.",
      "A donor's cheque bounces mid-event.",
      "Two events are double-booked into one hall.",
    ],
    sceneTags: ["the short delivery", "the bounced cheque", "the double-booking"],
  },
  {
    id: "WHO2", mode: "whodunnit", minTier: "Medium",
    dispatch: "Exercise: Counter-Read. Four suspects, one borrowed cover. Read the tell.",
    archetype: "broker",
    imposterArchetype: "fixer",
    randomiseImposter: true,
    imposterTell: "kept quietly improving on the terms the moment the result looked better",
    situationIntro: "Someone re-cut a signed rehoming behind the front desk, and a family turned up to collect a cat that had quietly been promised elsewhere. No one owns up. Four suspects worked the desk that week: {names}.\n\nThe imposter is hiding behind a profile: a single card of exactly the sort of cat they swear they are, handed over as their cover. \"That's me, that's how I work.\" But a profile only holds if you actually live it, and it won't survive a close read on anyone who's just borrowed it.",
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
            { grey: "Keeps the waitlist order and tells the regular they'll get the next good match instead.",
              hairline: "Pencils the regular in ahead of the list, meaning to square it with the others after.",
              crack: "Bumps the regular straight to the front; the better fit for this cat beats the order." },
            { grey: "Won't pay a cent over the signed quote until the supplier reissues it properly.",
              hairline: "Quietly settles the small overage to keep things moving, then notes it for the desk.",
              crack: "Renegotiates a bigger order on the spot to make the higher price worth their while." },
            { grey: "Leaves the locked roster as agreed; a swap needs everyone's say-so first.",
              hairline: "Starts lining the swap up on a nod from one colleague, ahead of the full team.",
              crack: "Swaps the roster solo for the busier day; more cats seen beats the lock." },
          ],
          fixer: [
            { grey: "Gives the cat to the regular outright; the best fit for this cat beats whoever asked first.",
              hairline: "Leans toward the regular, but checks in with the waitlisted families before deciding.",
              crack: "Won't jump anyone ahead of the list; the queue holds regardless of who's asking." },
            { grey: "Pays the higher invoice and keeps the delivery moving; a stalled order costs more than the gap.",
              hairline: "Pays the overage to keep things moving, though not before noting the gap against the quote.",
              crack: "Refuses every cent over the signed quote until the supplier reissues the invoice properly." },
            { grey: "Swaps the roster for the busier day without ceremony; more cats seen is the whole point.",
              hairline: "Sets the swap up ready to go, pausing only to leave the team a note about it.",
              crack: "Won't touch the locked roster without the whole team's sign-off, busy day or not." },
          ],
        },
      },
      {
        name: "Marmalade",
        beats: {
          broker: [
            { grey: "Holds the waitlist order; the regular goes on the list same as everyone else.",
              hairline: "Sounds the waitlisted families out about swapping to another cat, to clear the regular through.",
              crack: "Waves the regular to the front on her own call; the better match beats the list." },
            { grey: "Holds the supplier to the quote everyone signed and asks them to reissue it right.",
              hairline: "Pays a little over to keep the supplier sweet, meaning to square the paperwork after.",
              crack: "Rewrites the signed terms on the spot, swallowing the overcharge for a bigger order reckoned to net out better." },
            { grey: "Keeps the locked roster and puts the swap to the team before touching it.",
              hairline: "Pencils the swap in pending a yes, then rings round to line it up early.",
              crack: "Quietly swaps the roster unasked because more cats get seen, then tells everyone after." },
          ],
          fixer: [
            { grey: "Tells the regular yes; the right match for this cat outranks whoever asked first.",
              hairline: "Leans toward the regular, but rings the waitlisted families before making it final.",
              crack: "Reads the waitlist back in order and tells the regular to take a number like anyone else." },
            { grey: "Swallows the overcharge to keep the supplier onside; the food arriving matters more than the figure.",
              hairline: "Pays the difference for now, but keeps the reissued-quote question alive with the supplier.",
              crack: "Holds the payment at the signed figure and won't release a cent till the quote's honoured." },
            { grey: "Rewrites the weekend for the busier day; the extra cats seen will make the argument.",
              hairline: "Lines the swap up on a couple of quick nods rather than wait for the full team.",
              crack: "Declares the roster locked means locked and tables the swap for the next team meeting." },
          ],
        },
      },
      {
        name: "Suki",
        beats: {
          broker: [
            { grey: "Points the regular to the waitlist; first in line stays first in line, fair's fair.",
              hairline: "Half-promises the regular a look-in before checking back with the families already waiting.",
              crack: "Hands the cat to the regular outright; the best home wins, waitlist or not." },
            { grey: "Holds the payment to the agreed figure and asks the supplier to match their quote.",
              hairline: "Squares the gap from petty cash to keep the delivery, then flags it to the desk.",
              crack: "Strikes a new deal for extra stock to justify the overcharge, quote be damned." },
            { grey: "Keeps the roster as locked and offers to raise the swap at the next meeting.",
              hairline: "Pencils the swap in on two quick yeses, before the whole team's signed off.",
              crack: "Rewrites the weekend roster alone to see more cats, squaring it after." },
          ],
          fixer: [
            { grey: "Matches the cat to the regular and finds the waitlisted families a kitten they'll love just as well.",
              hairline: "Holds the cat for the regular overnight while working out how to square the rest of the list.",
              crack: "Fair's fair on the list: whoever's first keeps the match and the regular joins the queue." },
            { grey: "Settles the invoice as it stands and gets the crates unloaded; arguing can happen fed.",
              hairline: "Settles it to keep the delivery, though the difference gets circled in red for later.",
              crack: "Sends the invoice straight back against the signed quote; payment waits on a corrected copy." },
            { grey: "Swaps the shifts around to catch the busy day; the point of a roster is cats seen.",
              hairline: "Half-arranges the swap, then hesitates over whether the lock needed the team's blessing first.",
              crack: "Treats the lock as a promise made; the swap goes to the whole team or nowhere." },
          ],
        },
      },
      {
        name: "Rascal",
        beats: {
          broker: [
            { grey: "Checks the waitlist, honours it, and offers the regular the next litter instead.",
              hairline: "Lets the regular believe there's a chance before it's squared with the families already waiting.",
              crack: "Overturns the waitlist for the regular without asking a soul, sorting the fallout after." },
            { grey: "Refuses the overcharge outright and flags the invoice against the signed quote.",
              hairline: "Pays a touch over to keep the supplier onside, then flags the gap against the signed quote.",
              crack: "Rewrites the order bigger so the higher unit price nets out, without asking anyone." },
            { grey: "Runs the locked roster; a change goes to the whole team or it doesn't happen.",
              hairline: "Sounds the swap out with a couple of the team and half-commits before the rest weigh in.",
              crack: "Overrides the locked roster for the bigger day, telling the team once it's done." },
          ],
          fixer: [
            { grey: "Puts the cat with the regular and wears whatever the desk says about it tomorrow.",
              hairline: "Favours the regular, but pulls the waitlist first to see how firm the order really is.",
              crack: "Checks the waitlist, finds it firm, and closes the door on the regular there." },
            { grey: "Pays what the supplier's asking and keeps the shelves full; a hungry week costs more than pride.",
              hairline: "Covers the gap to land the delivery, then chases the supplier over the signed figure.",
              crack: "Won't pay a figure nobody agreed to; the order stands or falls on the signed quote." },
            { grey: "Runs the swap for the bigger day and backfills the gaps personally; more cats through the door.",
              hairline: "Books the swap in pencil, still meaning to run it past the team before the weekend.",
              crack: "Points at the lock: agreed is agreed, and the roster stays put till everyone's asked." },
          ],
        },
      },
    ],
    beatPrompts: [
      "A long-time adopter asks to jump the queue for a cat three other families are already waitlisted for.",
      "A supplier's invoice arrives higher than the quote everyone signed off.",
      "The weekend roster is locked, but a last-minute swap would get more cats seen.",
    ],
    sceneTags: ["the queue jump", "the disputed invoice", "the locked roster"],
  },
  {
    id: "WHO3", mode: "whodunnit", minTier: "Medium",
    dispatch: "Exercise: Counter-Read. Four suspects, one borrowed cover. Read the tell.",
    archetype: "oldHand",
    imposterArchetype: "contact",
    randomiseImposter: true,
    imposterTell: "couldn't keep from getting personally pulled in, close to whoever was hurting",
    situationIntro: "A foster carer's private address ended up in the wrong hands, and someone on the evening desk let it slip. Four suspects worked that week: {names}.\n\nThe imposter is hiding behind a profile: a single card of exactly the sort of cat they swear they are, handed over as their cover. \"That's me, that's how I work.\" But a profile only holds if you actually live it, and it won't survive a close read on anyone who's just borrowed it.",
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
            { grey: "Holds the room, gives the owner the honest state of it, and keeps closing on track.",
              hairline: "Stays with the owner a while past closing to settle them before locking up.",
              crack: "Shuts the desk to sit with the sobbing owner for an hour, promising to chase down every answer personally." },
            { grey: "Steady on the roster; reworks the night shift for the sick kitten without a fuss.",
              hairline: "Reworks the roster, then hangs back to sit with the kitten longer than the shift needs.",
              crack: "Takes the whole night at the kitten's side rather than hand the shift off." },
            { grey: "Calmly takes the desk back from the volunteer and keeps the file shut.",
              hairline: "Takes the shouting visitor aside to settle them one on one, keeping the file shut.",
              crack: "Wades in and starts sharing the case details to calm the shouting visitor down." },
          ],
          contact: [
            { grey: "Sits down with the crying owner, tea and a blanket, and stays until the shaking stops.",
              hairline: "Comforts the owner properly, though one eye keeps drifting to the closing jobs still undone.",
              crack: "Offers the owner a calm, practised summary of what's known and steers the desk to close on time." },
            { grey: "Stays the night at the kitten's side, warm towel and hourly checks, and lets tomorrow sort itself.",
              hairline: "Stays with the kitten most of the night, but slips away once the worst has clearly passed.",
              crack: "Reworks the roster with a steady hand, briefs the night cover, and heads home on schedule." },
            { grey: "Steps in beside the volunteer, takes the brunt of the shouting, and stays with the visitor till it's all talked out.",
              hairline: "Shields the volunteer and soothes the visitor, though the whole rescue runs a touch by-the-numbers.",
              crack: "Takes the desk back with unhurried authority, file shut, voice level, nothing personal in any of it." },
          ],
        },
      },
      {
        name: "Willow",
        beats: {
          oldHand: [
            { grey: "Keeps the desk calm, hears the owner out without letting it derail closing.",
              hairline: "Sits the owner down for a proper while, letting closing slide to see them right.",
              crack: "Closes the desk to comfort the owner one to one, promising to ring the moment there's news." },
            { grey: "Reslots the night shift and gets the kitten to the right hands without fuss.",
              hairline: "Stays up half the night fussing the sick kitten instead of handing off.",
              crack: "Won't leave the kitten's side all night, letting the rest of the roster fend for itself." },
            { grey: "Steps in evenly, walks the new volunteer back from the edge, no details spilled.",
              hairline: "Takes the visitor aside to hear them out personally, keeping the case file closed.",
              crack: "Jumps in and shares a few details to calm the visitor, the file falling open." },
          ],
          contact: [
            { grey: "Pulls up a chair, takes the owner's paw, and won't lock up till there's somewhere warm to send them.",
              hairline: "Hears the owner right out, warm enough, while quietly squaring the closing list behind the counter.",
              crack: "Settles the owner with a composed word and a printed contact card, then locks up to the minute." },
            { grey: "Beds down beside the kitten for the night, feeding on the hour, and asks nothing of the roster.",
              hairline: "Sits with the kitten till it settles, then hands over to the night shift, half reluctant.",
              crack: "Reslots the shift cleanly, passes the kitten to steadier hands, and calls that the kind thing done." },
            { grey: "Wraps the volunteer up out of the firing line and gives the visitor a shoulder and full attention.",
              hairline: "Looks after both of them warmly, though it lands more like technique than tenderness.",
              crack: "Separates everyone with three calm sentences and has the queue moving again as if nothing happened." },
          ],
        },
      },
      {
        name: "Nutmeg",
        beats: {
          oldHand: [
            { grey: "Settles the owner with a calm word and a cuppa, keeps the desk moving.",
              hairline: "Stays with the crying owner well past closing to hear them out, the desk ticking on behind.",
              crack: "Abandons the counter to sit with the crying owner, taking their number to chase it up personally." },
            { grey: "Adjusts the roster without drama and gets the kitten properly minded for the night.",
              hairline: "Sorts the shift, but keeps slipping back to check on the kitten through the night.",
              crack: "Drops everything to nurse the kitten through the night, leaving the thin roster thinner." },
            { grey: "Quietly takes over from the volunteer and shuts the overshare down.",
              hairline: "Takes over from the volunteer, then spends a while soothing the visitor one to one.",
              crack: "Steps in and keeps talking the visitor through the case, details and all." },
          ],
          contact: [
            { grey: "Comes straight around the counter, sits knee to knee with the owner, and takes on the chasing personally.",
              hairline: "Gives the owner a proper sit-down and a cuppa, but keeps the visit gently on the clock.",
              crack: "Offers a kind, efficient word and a tissue, then returns to the closing rounds unruffled." },
            { grey: "Spends the night hand-feeding the kitten, everything else parked till morning.",
              hairline: "Nurses the kitten well past midnight before letting the night cover talk the handover through.",
              crack: "Notes the kitten's turn on the chart, adjusts the roster neatly, and trusts the system to carry it." },
            { grey: "Gets between the visitor and the volunteer, soaks up the shouting personally, and stays till both are right.",
              hairline: "Sorts the pair of them kindly enough, but from behind the counter the whole time.",
              crack: "Defuses the whole scene in a minute flat, all polish and procedure, and moves on without a backward glance." },
          ],
        },
      },
      {
        name: "Boots",
        beats: {
          oldHand: [
            { grey: "Unruffled; gives the owner an honest \"we don't know yet\" and holds the room.",
              hairline: "Holds the room, but takes the owner aside a good while longer than closing allows.",
              crack: "Leaves the desk to sit with the owner and won't be moved till they've been heard right out." },
            { grey: "Handles the turn matter-of-factly and reslots the night without fuss.",
              hairline: "Reslots the night, then sits up a while with the kitten longer than planned.",
              crack: "Cancels the arranged shift to stay with the kitten till morning, whatever it does to the roster." },
            { grey: "Steps between the volunteer and the visitor, steady, and keeps the file shut.",
              hairline: "Walks the shouting visitor off to calm them down solo, though the file stays shut.",
              crack: "Wades in to placate the shouting visitor with details of the case, file wide open." },
          ],
          contact: [
            { grey: "Parks the closing jobs, fetches the owner something warm, and listens for as long as listening takes.",
              hairline: "Stays close to the owner and means it, though the comforting runs to a practised script.",
              crack: "Delivers a steady, honest \"no news yet\" and has the owner gently out the door by closing." },
            { grey: "Stays on unasked, the kitten tucked against a warm wheat bag, till the sun's up.",
              hairline: "Sits up with the kitten till the small hours before letting the arranged cover take over.",
              crack: "Steadies the ward in ten practised minutes, reslots the cover, and is home by twelve." },
            { grey: "Puts an arm round the volunteer, walks the visitor to a quiet corner, and gives both the whole evening if needed.",
              hairline: "Looks after the volunteer first and properly, though the visitor gets textbook handling.",
              crack: "Steps between them, level and impersonal, resets the desk, and files the incident without a flutter." },
          ],
        },
      },
    ],
    beatPrompts: [
      "A distressed owner turns up at closing, crying, wanting answers no one has yet.",
      "A kitten in care takes a bad turn overnight and the roster's already thin.",
      "A new volunteer freezes and starts spilling case details to calm a shouting visitor.",
    ],
    sceneTags: ["the crying owner", "the sick kitten", "the volunteer's overshare"],
  },
  {
    id: "WHO4", mode: "whodunnit", minTier: "Medium",
    dispatch: "Exercise: Counter-Read. Four suspects, one borrowed cover. Read the tell.",
    archetype: "contact",
    imposterArchetype: "broker",
    randomiseImposter: true,
    imposterTell: "kept checking the agreed terms before lifting a paw for anyone",
    situationIntro: "An injured stray was turned away from the night door and spent hours alone on the step; it pulled through, no thanks to whoever shut that door. Four suspects worked the night shift that week: {names}.\n\nThe imposter is hiding behind a profile: a single card of exactly the sort of cat they swear they are, handed over as their cover. \"That's me, that's how I work.\" But a profile only holds if you actually live it, and it won't survive a close read on anyone who's just borrowed it.",
    archetypeVariants: [
      { archetype: "contact", imposterArchetype: "broker",
        imposterTell: "kept checking the agreed terms before lifting a paw for anyone" },
      { archetype: "broker", imposterArchetype: "contact",
        imposterTell: "kept lifting a paw first and squaring the terms after, whenever someone hurt" },
    ],
    suspects: [
      {
        name: "Socks",
        beats: {
          contact: [
            { grey: "Has the door open before the second mew; towel, warm box, the paperwork can wait for morning.",
              hairline: "Brings the stray in, but checks the after-hours intake sheet before settling it anywhere.",
              crack: "Won't take the stray in outside the intake terms without a sign-off; offers the first slot tomorrow instead." },
            { grey: "Tells the carer to come straight in, and waits at the desk with a crate ready and the kettle on.",
              hairline: "Agrees to tonight, but reads the return clause back over the phone first to be sure it's included.",
              crack: "Points to the notice period in the foster agreement and offers the earliest appointment inside it." },
            { grey: "Comes around the desk, sits the adopter down, and works the problem with them for as long as it takes.",
              hairline: "Helps them through it, but pulls the adoption pack first to see what support was actually promised.",
              crack: "Checks the adoption pack's support terms and sticks to them: two calls included, book the first." },
          ],
          broker: [
            { grey: "Checks the night-door terms before anything else; intake reopens at nine, and the first slot's held.",
              hairline: "Holds the intake terms, but leaves a warm box and a bowl out on the step till morning.",
              crack: "Scoops the limping stray inside without a glance at the clock and worries about the terms tomorrow." },
            { grey: "Reads the return clause back to the carer and books the earliest appointment inside the notice period.",
              hairline: "Books the appointment per the agreement, then stays on the line till the carer's calm enough to sleep.",
              crack: "Waves the notice period; the litter comes in tonight and the agreement can be tidied later." },
            { grey: "Pulls the adoption pack and offers exactly what it promises: the included support call, booked.",
              hairline: "Books the included call as agreed, but slips a handwritten settling-in tip sheet across the desk too.",
              crack: "Drops the queue, sits with the adopter, and maps every hideaway and feeding trick till the panic's gone." },
          ],
        },
      },
      {
        name: "Pickles",
        beats: {
          contact: [
            { grey: "Scoops the stray straight into the warm room and settles it; the forms can catch up tomorrow.",
              hairline: "Takes it in, though only after ringing the duty vet to confirm the after-hours arrangement includes it.",
              crack: "Keeps the door shut and quotes the intake agreement: intake reopens at nine, as agreed." },
            { grey: "Keeps the carer on the line, talking them down, while lining up a crate and a spot for tonight.",
              hairline: "Takes the litter in tonight, though not before noting the return sits outside the agreed notice.",
              crack: "Won't vary the return terms over a phone call; the agreement says by appointment, so it's an appointment." },
            { grey: "Drops the filing mid-stack and spends the hour on hideaways, feeding spots and a plan to try tonight.",
              hairline: "Walks them through it, but first confirms the adoption pack actually includes settling-in support.",
              crack: "Looks up what the adoption pack promises and offers exactly that: the included support call, booked." },
          ],
          broker: [
            { grey: "Quotes the intake agreement kindly and firmly: the door reopens at nine, first slot promised.",
              hairline: "Keeps the stray outside the terms but not the cold; the porch box gets a blanket and a check each hour.",
              crack: "Opens the door at the first mew and has the stray fed and warm before the clock's even checked." },
            { grey: "Holds the return to the agreement as written; by appointment means by appointment, first one offered.",
              hairline: "Books the proper appointment, but talks the carer through the night ahead until the crying stops.",
              crack: "Tells the carer nothing's broken that tonight can't fix, and starts clearing a pen while still on the phone." },
            { grey: "Looks up the adoption pack's support terms and sticks to them: the call that's included, scheduled.",
              hairline: "Sticks to the included support, though the call runs long past what any clause imagined.",
              crack: "Shoves the filing aside and gives the adopter the whole hour: hideaways, feeding spots, a plan for tonight." },
          ],
        },
      },
      {
        name: "Bramble",
        beats: {
          contact: [
            { grey: "Sits on the step with the stray, gets it eating, and carries it in wrapped in a spare jumper.",
              hairline: "Carries it in, then stops to log the out-of-hours intake against the roster before settling it.",
              crack: "Checks what the night-door terms actually allow before anything else; until that's squared, the stray waits." },
            { grey: "Offers to drive out and collect the litter tonight rather than have the carer struggle in.",
              hairline: "Says yes to tonight, but spends the first minutes checking whose sign-off a same-day return needs.",
              crack: "Holds the carer to the agreement as written and books the return for the next open appointment." },
            { grey: "Offers to swing past their place after shift and look at the setup first-hand.",
              hairline: "Talks them through it, but keeps an eye on whether this counts against the pack's support allowance.",
              crack: "Confirms what was agreed at adoption and won't go beyond it without the coordinator's say-so." },
          ],
          broker: [
            { grey: "Won't vary the night-door terms solo; the stray's listed for the nine o'clock slot and the duty vet's told.",
              hairline: "Follows the terms to the letter, but sits out on the step with the stray until the shift ends.",
              crack: "Wraps the stray in an old jumper and brings it in; whoever wrote the terms never met a limping cat." },
            { grey: "Checks whose sign-off a same-day return needs, finds none available, and books the next open appointment.",
              hairline: "Books the appointment as the agreement asks, then offers to drop spare litter supplies round meanwhile.",
              crack: "Gets in the van; the litter's collected within the hour and the carer tucked up by ten." },
            { grey: "Opens the adoption file first; whatever support was agreed is what gets offered, no more.",
              hairline: "Stays inside the agreed support, but lingers after close to answer one more round of questions.",
              crack: "Promises to call past on the way home tonight and sort the setup in person." },
          ],
        },
      },
      {
        name: "Ginger",
        beats: {
          contact: [
            { grey: "Props the night door wide, warms some food, and stays by the box till the stray settles.",
              hairline: "Brings it in quickly, but circles back twice to whether after-hours intake needed a manager's OK.",
              crack: "Rings the on-call manager to confirm the terms allow an after-hours intake; no confirmation, no entry." },
            { grey: "Tells the carer to bring the litter now, and stays past shift so someone's there to meet them.",
              hairline: "Meets them tonight, but brings the foster agreement to the handover to square the clause on the spot.",
              crack: "Sympathises, then holds the line: returns run by appointment under the agreement, and tonight isn't one." },
            { grey: "Sends them home with the cat's old blanket and a promise to ring every day till it's eating.",
              hairline: "Sorts them out, though only after checking the file for what the adoption terms actually include.",
              crack: "Reads the adoption terms back to them and keeps the help inside exactly what was signed." },
          ],
          broker: [
            { grey: "Checks the after-hours terms twice, finds no allowance, and lists the stray first for the morning.",
              hairline: "Keeps to the intake terms, but stands at the door talking softly to the stray until the shift's done.",
              crack: "Has the door open and dinner warming before the stray's finished limping up the path." },
            { grey: "Brings the foster agreement to the phone and walks the carer through what the notice clause allows.",
              hairline: "Holds the clause, but promises to ring the carer every morning until the appointment comes round.",
              crack: "Says bring them now, stays hours past shift, and meets the carer at the door with tea going." },
            { grey: "Finds the signed adoption terms and matches the help to them line for line, nothing off-menu.",
              hairline: "Stays inside the signed terms, though the cat's old blanket goes home with them anyway.",
              crack: "Promises a call every day till the cat's eating, and means it, signed terms nowhere in sight." },
          ],
        },
      },
    ],
    beatPrompts: [
      "A limping stray turns up at the night door, ten minutes after intake has closed.",
      "An overwhelmed foster carer rings in tears, wanting to hand a litter back tonight.",
      "Last week's adopter is back at the desk, frantic: the new cat's hiding and won't eat.",
    ],
    sceneTags: ["the night-door stray", "the tearful foster call", "the frantic adopter"],
  },
  {
    id: "WHO5", mode: "whodunnit", minTier: "Medium",
    dispatch: "Exercise: Counter-Read. Four suspects, one borrowed cover. Read the tell.",
    archetype: "companyLine",
    imposterArchetype: "oldHand",
    randomiseImposter: true,
    imposterTell: "kept trusting old habit over the briefed steps",
    situationIntro: "Half the intake wing is down with the sniffles, traced back to the new arrival that came straight through into the main room without a stop in the isolation pen. Four suspects ran intake that week: {names}.\n\nThe imposter is hiding behind a profile: a single card of exactly the sort of cat they swear they are, handed over as their cover. \"That's me, that's how I work.\" But a profile only holds if you actually live it, and it won't survive a close read on anyone who's just borrowed it.",
    archetypeVariants: [
      { archetype: "companyLine", imposterArchetype: "oldHand",
        imposterTell: "kept trusting old habit over the briefed steps" },
      { archetype: "oldHand", imposterArchetype: "companyLine",
        imposterTell: "kept waiting on the written say-so where practised paws would've just worked" },
    ],
    suspects: [
      {
        name: "Rocket",
        beats: {
          companyLine: [
            { grey: "Walks the newcomer straight to the isolation pen and starts the 48-hour clock; the sheet says every arrival, no exceptions.",
              hairline: "Books the newcomer in by the sheet, but lets it hold court at the front desk while the isolation pen gets a slow set-up.",
              crack: "Looks the newcomer over with a practised eye, calls it healthy, and settles it into the main room like always." },
            { grey: "Parks the treatment trolley and waits; the chart wants two signatures and one signer isn't here.",
              hairline: "Measures every dose out ready at each pen, holding the trolley one signature short of rolling.",
              crack: "Runs the round alone, doses by eye and long habit, and leaves the chart to catch up in the morning." },
            { grey: "Works the new closing list top to bottom, every box, even with the lights going off around it.",
              hairline: "Ticks every box on the new list, just not in the printed order; the old route through the building dies hard.",
              crack: "Locks up by feel the way it's been done for years, every latch checked from memory, the new list untouched on its hook." },
          ],
          oldHand: [
            { grey: "Gives the newcomer a slow, practised once-over, nose to tail, calls it sound, and settles it into the main room without fuss.",
              hairline: "Settles the newcomer by feel, though the intake sheet gets fetched afterwards and filled in neatly for the record.",
              crack: "Marches the newcomer straight to the isolation pen and starts the 48-hour clock; the sheet says every arrival, and the sheet decides." },
            { grey: "Works the trolley solo, unhurried, each dose weighed by years of the same round, chart squared when the signer lands.",
              hairline: "Starts the round from experience, then stalls halfway, suddenly wanting the second signature before the strong doses.",
              crack: "Locks the trolley where it stands; the chart wants two signatures, one signer's out, so nothing moves till the rule's satisfied." },
            { grey: "Closes the building the way years have worn it smooth, every latch checked by feel, quick and quiet and nothing missed.",
              hairline: "Works mostly by the old route, but doubles back twice to check the new list hasn't added anything the routine missed.",
              crack: "Takes the new list from its hook and works it top to bottom in printed order, every box, however long it runs." },
          ],
        },
      },
      {
        name: "Basil",
        beats: {
          companyLine: [
            { grey: "Reads the intake rule out to the protesting volunteer, then carries the newcomer through to isolation for the full stay.",
              hairline: "Follows the isolation rule, though only after weighing up out loud whether such a bright-eyed arrival really needs it.",
              crack: "Skips the isolation pen for an old-fashioned nose-to-tail check and a spot in the main room; experience says this one's clean." },
            { grey: "Rings the duty signer twice, then shelves the round; no countersign, no doses, as briefed.",
              hairline: "Holds the round, but drafts the whole chart in pencil so it only needs the signature dropped in.",
              crack: "Doses the lot steady-handed from memory of last week's chart and squares the signatures whenever the signer lands." },
            { grey: "Runs the new checklist to the letter and logs the finish time, late or not.",
              hairline: "Folds two of the new list's steps into one pass to claw the evening back, every box still ticked.",
              crack: "Does the rounds the old way, unhurried, by a routine worn smooth over years; the list stays on the nail." },
          ],
          oldHand: [
            { grey: "Trusts a thorough nose-to-tail and a lifetime of intakes; the bright-eyed newcomer gets a warm spot in the main room.",
              hairline: "Calls the newcomer sound on experience, but keeps it apart from the youngest kittens overnight, just to be comfortable.",
              crack: "Reads the isolation rule out loud to anyone arguing and carries the newcomer through for the full 48 hours, no debate." },
            { grey: "Runs the treatment round from a memory that's never yet been wrong, calm as ever, and parks the signature question for morning.",
              hairline: "Preps the whole round by practised hand, then leaves the strongest three doses drawn but ungiven for the countersign.",
              crack: "Shelves the entire round and rings the duty signer twice; no countersign, no doses, exactly as the briefing says." },
            { grey: "Shuts the place down by a routine worn smooth over years, unhurried, and has the lights off in half the list's time.",
              hairline: "Runs the familiar circuit first, then walks the new list once after, half checking the routine against it.",
              crack: "Works the new checklist to the letter, in order, and logs the finish time at the bottom, late or not." },
          ],
        },
      },
      {
        name: "Cleo",
        beats: {
          companyLine: [
            { grey: "Signs the newcomer into the isolation log first and settles it second; that's the order the sheet gives.",
              hairline: "Isolates the newcomer as briefed, though not before a long once-over at the desk that the sheet never asked for.",
              crack: "Waves the newcomer through to the main room after a calm, thorough check of the old school; a pen won't teach anything a good look didn't." },
            { grey: "Leaves the trolley locked and posts a note on the round sheet: resumes when the second signer's back.",
              hairline: "Walks the round without dosing, jotting what each pen needs so the real pass takes five minutes once countersigned.",
              crack: "Quietly works the round solo, hands steady, doses exact from years of the same trolley, chart squared after." },
            { grey: "Takes the new list at face value and works it in printed order, however long it runs.",
              hairline: "Runs the new list, but from memory instead of off the page, only fetching it at the end to tick the boxes.",
              crack: "Closes the building on instinct, the same circuit as every night for years, and signs the list off in one go at the door." },
          ],
          oldHand: [
            { grey: "Checks the newcomer over the old way, unrushed and thorough, and finds it a corner of the main room; the look was the quarantine.",
              hairline: "Trusts the seasoned once-over, but jots the newcomer's details into the isolation log anyway, in case anyone asks.",
              crack: "Signs the newcomer into the isolation log before touching anything else; the sheet gives an order, and the order gets followed." },
            { grey: "Takes the trolley round alone at the usual easy pace, every measure second nature, and writes the chart up fair afterwards.",
              hairline: "Doses the routine pens from habit, but holds the two tricky charts back until a second pair of eyes exists.",
              crack: "Padlocks the trolley and pins a notice to the round sheet: two signatures or no doses, resuming when the signer returns." },
            { grey: "Closes on instinct, the same circuit as a thousand nights, and the building's dark and safe before the list's half read.",
              hairline: "Walks the old circuit but carries the new list along, glancing at it whenever the routine and the page disagree.",
              crack: "Props the new list on the trolley and obeys it box by box in printed order, and closing takes as long as it takes." },
          ],
        },
      },
      {
        name: "Tilley",
        beats: {
          companyLine: [
            { grey: "Apologises to the newcomer's finder, then follows the intake sheet anyway; isolation first, sympathy after.",
              hairline: "Puts the newcomer in isolation by the book, but trims the intake paperwork down to the parts that seem to matter.",
              crack: "Gives the newcomer one seasoned look, pronounces it sound, and sets it up in the main room without breaking stride." },
            { grey: "Holds every dose until the countersign; a round done late still counts, a round done wrong doesn't.",
              hairline: "Holds the doses, though the trolley's already wheeled out and half set up before the signature exists.",
              crack: "Works the trolley alone at an easy, practised pace, every dose from memory, and back-fills the chart at the end." },
            { grey: "Follows the new closing list step for step and leaves it signed and dated on the office desk.",
              hairline: "Has a volunteer call the new list out while walking the rounds the familiar way, every box answered.",
              crack: "Ignores the list and shuts the place down the way years on the desk taught: smooth, quiet, finished in half the time." },
          ],
          oldHand: [
            { grey: "Sizes the newcomer up in the time it takes to say hello, finds nothing wrong, and settles it among the others without a second thought.",
              hairline: "Judges the newcomer healthy on experience, though the isolation pen gets aired and readied, just in case the call's wrong.",
              crack: "Points the finder to the intake sheet with an apologetic shrug; every arrival does the 48 hours, and this one's no different." },
            { grey: "Rolls the trolley out and does the round the way it's been done for years, unbothered, filling the chart in at the last pen.",
              hairline: "Runs the round from memory, but leaves a written note against each dose so the signer can countersign the lot at once.",
              crack: "Wheels the trolley back to the cupboard; the chart wants two signatures on every dose, so the round waits, full stop." },
            { grey: "Closes up by pure muscle memory, every latch and light in its old order, done and gone while the new list would still be warming up.",
              hairline: "Trusts the old routine for the building, but reads the new list at the door after, ticking off what habit already covered.",
              crack: "Walks the new list in strict printed order, ticking as it goes, and leaves it signed and dated square on the office desk." },
          ],
        },
      },
    ],
    beatPrompts: [
      "A perfectly healthy-looking new arrival meets the new rule: every intake spends 48 hours in the isolation pen.",
      "The treatment round now needs a second signature on every dose, and the only other signer is out on a call.",
      "This week's new closing checklist runs twice as long as the old routine everyone knows by heart.",
    ],
    sceneTags: ["the isolation rule", "the second signature", "the new checklist"],
  },
];

function buildEggPi1() {
  const answers = shuffled([
    { text: "1415 9265 3589 7932", tier: "grey" },
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
    { text: "HELLO WORLD", tier: "grey" },
    { text: "HERO WORLD", tier: "hairline" },
    { text: "HELLO WORD", tier: "hairline" },
    { text: "HERO WORD", tier: "crack" },
  ]);
  const options = answers.map(a => a.text);
  const tiers = answers.map(a => a.tier);
  return {
    id: "EMC1", morse: true,
    dispatch: "Exercise: Wire Check. Line-verification drill, no backup.",
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
    { text: "LAZY DOG", tier: "grey" },
    { text: "LAY DOG", tier: "hairline" },
    { text: "LAZY DO", tier: "hairline" },
    { text: "LAY DO", tier: "crack" },
  ]);
  const options = answers.map(a => a.text);
  const tiers = answers.map(a => a.tier);
  return {
    id: "EMC3", morse: true,
    dispatch: "Exercise: Font Check. Typeface-verification drill, no backup.",
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
    { text: "SCHRODINGER", tier: "grey" },
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

