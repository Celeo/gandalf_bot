import { BotWrapper, Message } from "./deps.ts";
import { Config } from "./config.ts";

const QUOTES = [
  "Courage will now be your best defense against the storm that is at hand -- that and such hope as I bring.",
  "Sauron will suspect a trap. He will not take the bait.",
  "The Grey Pilgrim. That's what they used to call me. Three hundred lives of Men I've walked this earth, and now I have no time. With luck, my search will not be in vain. Look to my coming at first light on the fifth day. At dawn, look to the east.",
  "That wound will never fully heal, he will carry it for the rest of his life",
  "Fool of a Took! Throw yourself in next time, and rid us of your stupidity!",
  "Gandalf?... Yes. That was what they used to call me. Gandalf the Grey... That was my name. I am Gandalf the White. And I come back to you now at the turn of the tide.",
  "I am the servant of the Secret Fire, wielder of the Flame of Anor. You cannot pass. The dark fire will not avail you, Flame of Udun. Go back to the Shadow. You cannot pass!",
  "White shores, and beyond that a far green country.",
  "Frodo has passed beyond my sight. The darkness is deepening.",
  "The treacherous are ever distrustful.",
  "Sauron fears you, Aragorn. He fears what you may become. And so he'll strike hard and fast at the world of Men. He will use his puppet Saruman to destroy Rohan. War is coming. Rohan must defend itself, and therein lies our first challenge for Rohan is weak and ready to fall. The king's mind is enslaved, it's an old device of Saruman's. His hold over King Theoden is now very strong. Sauron and Saruman are tightening the noose. But for all their cunning we have one advantage. The Ring remains hidden. And that we should seek to destroy it has not yet entered their darkest dreams. And so the weapon of the enemy is moving towards Mordor in the hands of a Hobbit. Each day brings it closer to the fires of Mount Doom. We must trust now in Frodo. Everything depends upon speed and the secrecy of his quest. Do not regret your decision to leave him. Frodo must finish this task alone.",
  "This is no place for a Hobbit!",
  "I think you should leave the ring behind. Is that so hard?",
  "Yes! Their own masters cannot find them, if their secrets are forgotten! Ah... now let me see... Ithildin. It mirrors only starlight and moonlight. It reads: The Doors of Durin, Lord of Moria, Speak Friend and Enter",
  "You shall not pass!",
  "If you're referring to the incident with the dragon, I was barely involved. All I did was give your uncle a little nudge out of the door.",
  "Left.",
  "Right.",
  "And what about very old friends?",
  "Hold out your hand, Frodo. Its quite cool. What can you see? Can you see anything?",
  "Oh not at all!",
  "You... shall not... pass!",
  "The Eye of Sauron",
  "Breathe the free air again, my friend",
  "Yes. I never told him, but its worth was greater than the value of The Shire!",
  "They are not all accounted for. The lost seeing stones. We do not know who else may be watching.",
  "Yes, for sixty years the Ring lay quiet in Bilbo's keeping prolonging his life. Delaying old age. But no longer. Evil is stirring in Mordor. The Ring has awoken. Its heard its master's call.",
  "So am I dear boy. So am I.",
  "Pity? It was pity that stayed Bilbo's hand. Many that live deserve death and many that die, deserve life. Can you give it to them Frodo? Do not be too eager to deal out death and judgement. Even the very wise cannot see all ends. My heart tells me that Gollum has some part to play, yet for good or ill before this is over. The pity of Bilbo, may rule the fate of many",
  "My lord, there will be a time to grieve for Boromir but it is not now. War is coming. The enemy is on your doorstep. As steward, you are charged with the defence of this city. Where are Gondor's armies? You still have friends. You are not alone in this fight. Send word to Theoden of Rohan. Light the beacons.",
  "No perhaps not. I have thought of a better use for you",
  "Helm's Deep. There is no way out of that ravine. Theoden is walking into a trap. He thinks he's leading them to safety. What they will get is a massacre. Theoden has a strong will, but I fear for him. I fear for the survival of Rohan. He will need you before the end, Aragorn. The people of Rohan will need you. The defenses have to hold.",
  "The fellowship awaits the ringbearer.",
  "What do you mean? Do you wish me a good morning, or mean that it is a good morning whether I want it or not; or that you feel good this morning; or that it is a morning to be good on?",
  "I think there's more to this hobbit than meets the eye.",
  "End? No, the journey doesn't end here. Death is just another path, one that we all must take. The grey rain curtain of this world rolls back and all turns to silvered glass. And then you see it.",
  "Up! Quickly!",
  "Where? When?",
  "Knock your head against these doors, and if that does not shatter them and I'm allowed a little peace from foolish questions, I will try to find the opening words.",
  "There are many magic rings in this world, Bilbo, and none of them should be used lightly",
  "Many that live deserve death. And some that die deserve life. Can you give it to them? Then do not be too eager to deal out death in judgement.",
  "Saruman believes it is only great power that can hold evil in check, but that is not what I have found. I found it is the small things, everyday deeds of ordinary folk that keeps the darkness at bay. Simple acts of love and kindness.",
  "Pity? It was pity that stayed Bilbo's hand. Many that live deserve death and many that die, deserve life. Can you give it to them Frodo? Do not be too eager to deal out death and judgement. Even the very wise cannot see all ends. My heart tells me that Gollum has some part to play, yet for good or ill before this is over. The pity of Bilbo, may rule the fate of many",
  "Let the Ringbearer decide",
  "Home is now behind you, the world is ahead!",
  "His treachery runs deeper than you know. By foul craft Saruman has crossed orcs with goblin men, he is breeding an army in the caverns of Isengard. An army that can move in sunlight and cover great distance at speed. Saruman is coming for the Ring.",
  "Go back to the abyss! Fall into the nothingness that awaits you and your master!",
  "I suppose you think that was terribly clever",
  "No word. Nothing.",
  "Hmmm, You would not part an old man from his walking stick",
  "The battle for Helm's Deep is over. The battle for Middle-earth is about to begin. All our hopes now lie with two little Hobbits... somewhere in the wilderness.",
  "Fly, you fools!",
  "Helm's Deep. There is no way out of that ravine. Theoden is walking into a trap. He thinks he's leading them to safety. What they will get is a massacre. Theoden has a strong will, but I fear for him. I fear for the survival of Rohan. He will need you before the end, daibz. The people of Rohan will need you. The defenses have to hold.",
  "Be careful. Even in defeat, Saruman is dangerous.",
  "Questions. Questions that need answering",
  "That Frodo is alive. Yes, yes he's alive.",
  "No! Losto Caradhras, sedho, hodo, nuitho i 'ruith!",
  "Go back to the shadow!",
  "White shores and beyond, a far green country under a swift sunrise.",
  "Spies of Saruman. The passage south is being watched We must take the Pass of Caradhras",
  "There's no need to get angry.",
  "Back to the gate! Hurry!",
  "Through fire... and water. From the lowest dungeon to the highest peak I fought with the Balrog of Morgoth. Until at last I threw down my enemy and smote his ruin upon the mountainside. Darkness took me... and I strayed out of thought and time. Stars wheeled overhead. and every day was as long as a life age of the Earth. But it was not the end. I felt life in me again. I've been sent back until my task is done!",
  "Frodo suspects something",
  "Ash nazg durbatuluk, ash nazg gimbatul ash nazg thrakatuluk agh burzum-ishi krimpatul",
  "Be silent. Keep your forked tongue behind your teeth. I did not pass through fire and death to bandy crooked words with a witless worm.",
  "Yes.",
  "I will not say: do not weep; for not all tears are evil",
  "Oh really?",
  "Sauron's wrath will be terrible, his retribution swift.",
  "Understand this, things are now in motion that cannot be undone",
  "I do not ask your pardon Master Elrond for the Black Speech of Mordor may yet be heard in every corner of the West. The Ring is altogether evil",
  "But we still have time. Time enough to counter Sauron if we act quickly",
  "Do you not understand that while we bicker amongst ourselves, Sauron's power grows?! None can escape it! You'll all be destroyed",
  "Hold them back, do not give in to fear. Stand to your posts. Fight!",
  "It is not despair, for despair is only for those who see the end beyond all doubt",
  "By the skills of Lord Elrond you're beginning to mend",
  "A little late for trimming the verge don't you think?",
  "Even the very wise cannot see all ends",
  "He that breaks a thing to find out what it is has left the path of wisdom",
  "Over the Bridge! Fly!",
  "Two eyes, as often as I can spare. What about this ring of yours? Is that staying too?",
  "Hmm, well now that should please him, hmmm.",
  "No! Come down Saruman and your life will be spared!",
  "Be gone.",
  "I think you've had that ring long enough.",
  "Steady! Steady! You are soldiers of Gondor. No matter what comes through that gate you will stand your ground... Volley! Fire!",
  "Helm's Deep. There is no way out of that ravine. Theoden is walking into a trap. He thinks he's leading them to safety. What they will get is a massacre. Theoden has a strong will, but I fear for him. I fear for the survival of Rohan. He will need you before the end, Aragorn. The people of Rohan will need you. The defenses have to hold.",
  "This foe is beyond any of you... Run!",
  "Frodo...",
  "Authority is not given to you to deny the return of the King, steward!",
  "I will draw you, Saruman, as poison is drawn from a wound!",
  "No, we need him alive. We need him to talk.",
  "They guard it because they have hope. A faint and fading hope that one day it will flower. That a king will come and this city will be as it once was before it fell into decay. The old wisdom born out of the west was forsaken. Kings made tombs more splendid than the houses of the living and counted the old names of their descent dearer than the names of their sons. Childless lords sat in aged halls musing on heraldry or in high, cold towers asking questions of the stars. And so the people of Gondor fell into ruin. The line of Kings failed. The white tree withered. The rule of Gondor was given over to lesser men.",
  "It is a burden he should never have had to bear. We can ask no more of him",
  "Theodred's death was not of your making.",
  "All we have to decide is what to do with the time that is given to us.",
  "The world is not in your books and maps. It is out there.",
  "And what did you tell him? Speak!",
  "Hmm. Bilbo's Ring. He's gone to stay with the elves. He's left you Bag End. Along with all his possessions. The Ring is yours now. Put it out of sight.",
  "You know this? How?",
  "Oh it's useless",
  "I've no memory of this place",
  "Get out of The Shire. Make for the village of Bree",
  "His treachery runs deeper than you know. By foul craft Saruman has crossed orcs with goblin men, he is breeding an army in the caverns of Isengard. An army that can move in sunlight and gather great distance at speed. Saruman is coming for the Ring.",
  "There is one other who knew Bilbo had the Ring. I looked everywhere for the creature Gollum but the enemy found him first. Admist the endless screams and inane babble they discerned two words.",
  "You were deep in the enemy's counsel. Tell us what you know!",
  "I have some things I have to attend to.",
  "Helm's Deep. There is no way out of that ravine. Theoden is walking into a trap. He thinks he's leading them to safety. What they will get is a massacre. Theoden has a strong will, but I fear for him. I fear for the survival of Rohan. He will need you before the end, Aragorn. The people of Rohan will need you. The defenses have to hold.",
  "Throw yourself in next time and save us your stupidity!",
  "No. The spirit of Sauron endured. His life force is bound to the Ring and the Ring survived. Sauron has returned. His orcs have multiplied. His fortress at Barad-Dur is rebuilt in the land of Mordor. Sauron needs only this Ring to cover all the lands of a second darkness. He is seeking it, seeking it. All his thought is bent on it. The Ring yearns above all else to return to the hand of its master. They are one, the Ring and the Dark Lord. He must never find it",
  "We now have but one choice, we must face the long dark of Moria. Be on your guard, there are older and fouler things than orcs in the deep places of the world. The wealth of Moria is not in gold, or jewels, but Mithril. Bilbo had a shirt of Mithril rings that Thorin gave him.",
  "We do not come to treat with Sauron, faithless and accursed. Tell your master this. The armies of Mordor must disband. He is to depart these lands, never to return.",
  "So stop your fretting, Master Dwarf. Merry and Pippin are quite safe. In fact, they are far safer than you are about to be.",
  "Do we know that?",
  "Now listen carefully. Lord Denethor is Boromir's father. To give him news of his beloved son's death would be most unwise. And do not mention Frodo or the Ring. And say nothing of Aragorn either. In fact, its better if you don't speak at all.",
  "Your treachery has already cost many lives. Thousands more are now at risk. But you could save them Saruman. You were deep in the enemy's counsel.",
  "It was more than mere chance that brought Merry and Pippin to Fangorn. A great power has been sleeping here for many long years. The coming of Merry and Pippin will be like the falling of small stones... that starts an avalanche in the mountains.",
  "Faramir? This is not the first Halfling to have crossed your path.",
  "Fly you fools!",
  "It's only a matter of time. He has suffered a defeat, yes, but behind the walls of Mordor our enemy is regrouping.",
  "Neither do I. Keep it Secret. Keep it Safe.",
  "Let me risk a little more light. Behold the great realm and dwarf city of Dwarrowdelf.",
  "So be it.",
  "Your fingers would remember their old strength better if they grasped your sword.",
  "There are few who can. The language is that of Mordor, which I will not utter here. In the common tongue it says  One Ring to Rule Them All  One Ring to find them  One Ring to bring them all  and in the darkness bind them! This is the One Ring. Forged by the Dark Lord Sauron in the fires of Mount Doom. Taken by Isildur from the hand of Sauron himself.",
  "Is it secret? Is it safe?",
  "So you mean to go through with your plan then?",
  "My dear Frodo. Hobbits really are amazing creatures. You can learn all there is to know about them in a month and yet after a hundred years they can still surprise you... Get down! Confound you Samwise Gamgee! Have you been eavesdropping?",
  "No! No it can't",
  "Of all the Hobbits, Peregrin Took, you are the worst! Hurry! Hurry!",
  "I am the servant of the Flame of Anor... The dark fire will not avail you! Flame of Udun!",
  "No, no it doesn't.",
  "I will help you bear this burden, as long as it is yours to bear",
  "What?",
  "Oh I'm sorry Frodo, I was delayed.",
  "Gandalf?... Yes. That was what they used to call me. Gandalf the Grey... That was my name. I am Gandalf the White. And I come back to you now at the turn of the tide. One stage of your journey is over. Another begins. We must travel to Edoras with all speed.",
  "Theoden King stands alone.",
  "You cannot pass!",
  "There never was much hope, only a fools hope",
  "Hail Denethor son of Ecthelion, Lord and Steward of Gondor. I come with tidings in this dark hour and with counsel.",
  "Thank you.",
  "Farewell my brave Hobbits. My work is now finished. Here at last, on the shores of the sea, comes the end of our Fellowship. I will not say do not weep for not all tears are an evil. It is time Frodo.",
  "Pity? It was pity that stayed Bilbo's hand. Many that live deserve death and many that die, deserve life. Can you give it to them, Frodo? Do not be too eager to deal out death and judgement. Even the very wise cannot see all ends. My heart tells me that Gollum has some part to play, yet for good or ill before this is over. The pity of Bilbo, may rule the fate of many",
  "Foreseen and done nothing!",
  "Look at me! What did you see?",
  "Out of the frying pan and into the fire.",
  "You must leave, and leave quickly.",
  "What did you tell him about Frodo and the Ring?",
  "Precious? It's been called that before. Not by you!",
  "Riddles in the dark...",
  "There is only one Lord of the Ring. Only one who can bend it to his will and he does not share power.",
  "Yes, for sixty years the Ring lay quiet in Bilbo's keeping prolonging his life. Delaying old age. But no longer. Evil is stirring in Mordor. The Ring has awoken. Its heard its master's call.",
  "Evidently we look so much alike that your desire to make an incurable dent in my hat must be excused.",
  "Yes, and it will not be easily cured.",
  "White shores, and beyond that a far green country.",
  "Be gone!",
  "You cannot offer me this Ring",
  "Owwwh!",
  "It is in men we must place our hope",
  "I am a Servant of the Secret Fire, Wielder of the Flame of Anor.",
  "Prepare for battle! Hurry men! To the wall! Defend the wall! Over here! Return to your posts! Send these foul beasts into the Abyss.",
  "Confound it all Samwise Gamgee! Have you been eavesdropping?!",
  "Ooh! You didn't think I'd miss your Uncle Bilbo's birthday?",
  "Breathe the free air again, my friend.",
  "If you're referring to the incident with the dragon, I was barely involved. All I did was give your uncle a little nudge out of the door.",
  "Meriadoc Brandybuck and Peregrin Took! I might have known!",
  "They will be. You must come to Minas Tirith by another road. Follow the river. Look to the black ships. Understand this, things are now in motion that cannot be undone. I ride for Minas Tirith, and I wont be going alone.",
  "It's good to see you. One hundred and eleven years old who would believe it. You haven't aged a day!",
  "Just tea, thank you.",
  "Bilbo! The ring is still in your pocket.",
  "There never was much hope.  Just a fool's hope. Our enemy is ready.  His full strength's gathered. Not only orcs, but men as well. Legions of Haradrim from the South, mercenaries from the coast. All will answer Mordor's call. This will be the end of Gondor as we know it. Here the hammer stroke will fall hardest. If the river is taken, if the garrison at Osgiliath falls, the last defence of this city will be gone.",
  "Knock your head against these doors and if that does not shatter them and I'm allowed a little peace from foolish questions, I will try to find the opening words.",
  "Be silent. Keep your forked tongue behind your teeth! I have not passed through fire and death to bandy crooked words with a witless worm.",
  "End? No the journey doesn't end here. Death is but another path, one that we all must take. The gray rain curtain of this world rolls back. And all turns to silver glass. Then you see it.",
  "Into the Mines!",
  "Fool of a Took!",
  "Shadowfax. He is the lord of all horses and has been my friend through many dangers.",
  "No. No it isn't.",
  "Now listen carefully. Lord Denethor is Boromir's father. To give him news of his beloved son's death would be most unwise. And do not mention Frodo or the Ring. And say nothing of Aragorn either. In fact, its better if you don't speak at all.",
  "Ooh! The long expected party! So how is the old rascal? I hear it's got to be a party of special magnificence",
  "So passes Denethor, son of Ecthelion.",
  "So do all who live to see such times. But that is not for them to decide. All we have to decide is what to do with the time that is given to us.",
  "Did he? Did he, indeed? Good. Yes, very good.",
  "Far, far below the deepest delvings of the dwarves, the world is gnawed by nameless things",
  "You did not kill me, you will not kill him",
  "Mellon",
  "Just tea, thank you",
  "The authority is not granted you to deny the return of the King - Steward!",
  "Three days ride as the Nazgul flies. And you'd better hope we don't have one of those on our tail.",
  "Now come the days of the King. May they be blessed.",
  "There is one who could unite them. One who could reclaim the throne of Gondor",
  "This is not the weather of the world. This is a device of Sauron's making. A broil of fume he sends ahead of his host. The Orcs of Mordor have no love of daylight, so he covers the face of the sun to ease their passage along the road to war. When the shadow of Mordor reaches this city it will begin.",
  "The dark fire will not avail you Flame of Udun!",
  "Good gracious me!",
  "The Nine!",
  "Out of the frying pan and in to the fire.",
  "Look to my coming, at first light, on the fifth day. At dawn, look to the East.",
  "They've reached The Shire?",
  "Keep it secret. Keep it safe.",
  "Oh it's quite simple. If you are a friend, you speak the password and the doors will open. Annon Edhellen, edro hi ammen! Fennas Nogothrim, lasto beth lammen.",
  "Silence!",
  "Hope is kindled!",
  "Send word to all our allies and to every corner of Middle Earth that still stands free. The enemy moves against us. We need to know where he will strike.",
  "Riddles in the dark",
  "I am looking for someone to share in an adventure that I am arranging, and it's very difficult to find anyone.",
  "Everything? Far too eager and curious for a hobbit, most unnatural. Well what can I tell you? Life in the wide world goes on much as it has this past age, full of its own comings and goings. Scarcely aware of the existence of hobbits... which I am very thankful.",
  "Tell me. Friend... When did Saruman the Wise abandon reason for madness?",
  "Then what is the king's decision?",
  "He's been following us for three days",
  "A Balrog... a demon of the ancient world.",
  "A thing is about to happen which has not happened since the Elder Days: the Ents are going to wake up and find that they are strong.",
  "Pity? It was pity that stayed Bilbo's hand. Many that live deserve death and many that die, deserve life. Can you give it to them, Frodo? Do not be too eager to deal out death and judgement. Even the very wise cannot see all ends. My heart tells me that Gollum has some part to play, yet for good or ill before this is over. The pity of Bilbo, may rule the fate of many",
  "To the Bridge of Khazad-dum!",
  "We cannot achieve victory by arms, but by arms we can give the Ring-bearer his only chance, frail though it be.",
  "They have taken the Bridge and the second hall. We have barred the gates, but cannot hold them for long. The ground shakes. Drums. Drums in the deep. We cannot get out. A shadow moves in the dark. We cannot get out. They are coming.",
  "And the Ring? You feel its power growing don't you. I've felt it too. You must be careful now. Evil will be drawn to you from outside the Fellowship and I fear from within.",
  "We come to it at last. The great battle of our time. The board is set, the pieces are moving",
  "You will tell him won't you? He's very fond of you",
  "A thing is about to happen that has not happened since the Elder Days. The Ents are going to wake up and find that they are strong.",
  "Run, Shadowfax show us the meaning of haste.",
  "Be careful what you say. Do not look for welcome here.",
  "Helm's Deep. There is no way out of that ravine. Theoden is walking into a trap. He thinks he's leading them to safety. What they will get is a massacre. Theoden has a strong will, but I fear for him. I fear for the survival of Rohan. He will need you before the end, BukkakeFan. The people of Rohan will need you. The defenses have to hold.",
  "We have just passed into the realm of Gondor. Minas Tirith. City of Kings.",
  "You must trust to yourself. Trust your own strength.",
  "The courtesy of your hall is somewhat lessened of late... Theoden King.",
  "You're in the service of the steward now.  You'll have to do as you are told. Ridiculous Hobbit!  Guard of the Citadel!",
  "I'll be waiting for you. At the Inn of the Prancing Pony",
  "Yes the white tree of Gondor. The tree of the King. Lord Denethor however, is not the King. He is a steward only, a caretaker of the throne.",
  "Indeed?",
  "A balrog... a demon of the ancient world. This foe is beyond any of you... RUN! Lead them on. The Bridge is near! Do as I say! Swords are of no more use here.",
  "Guard of the Citadel indeed! Now back up the hill quickly. Quick!",
  "Edoras and the Golden Hall of Meduseld. There dwells Theoden, King of Rohan... whose mind is overthrown. Saruman's hold over King Theoden is now very strong.",
  "His defeat at Helm's Deep showed our enemy one thing. He knows the Heir of Elendil has come forth. Men are not as weak as he supposed. There is courage still. Strength enough, perhaps, to challenge him. Sauron fears this. He will not risk the peoples of Middle Earth uniting under one banner. He will raze Minas Tirith to the ground before he sees a King return to the throne of men. If the beacons of Gondor are lit Rohan must be ready for war.",
  "Retreat! The city is breached. Fall back to the second level. Get the women and children out. Get them out. Retreat!",
  "Theoden son of Thengel... too long have you sat in the Shadows. Hearken to me! I release you from the spell.",
  "Beyond any doubt",
  "I suppose you think that was terribly clever.",
  "I am Saruman. Or rather, Saruman as he should have been.",
  "I once knew every spell in all the tongues of elves, men and orcs",
  "You are in the House of Elrond and it is ten o'clock in the morning on October the 24th, if you want to know. Yes, I am here and you're lucky to be here too. A few more hours and you would have been beyond our aid, but you have some strength in you my dear Hobbit.",
  "A wizard is never late. Nor is he early, he arrives precisely when he means to.",
  "Yes, there it lies. This city has dwelt ever in the sight of its shadow.",
  "Do not take me for some conjurer of cheap tricks. I am not trying to rob you. I’m trying to help you.",
  "Don't tempt me Frodo! I dare not take it. Not even to keep it safe. Understand Frodo, I would use this Ring from the desire to do good. But through me, it would wield a power too great and terrible to imagine.",
  "https://tenor.com/view/the-lord-of-the-rings-gandalf-nod-gandalf-approves-gif-3520584",
];

/**
 * Send a random quote when mentioned.
 */
export async function handler(
  wrapper: BotWrapper,
  _config: Config,
  message: Message,
): Promise<void> {
  if (!message.mentionedUserIds.includes(wrapper.bot.id)) {
    return;
  }
  const randomQuote = QUOTES[Math.ceil(Math.random() * QUOTES.length) - 1];
  await wrapper.replyTo(message, randomQuote);
}
