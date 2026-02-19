import { CanvasEdgeModel } from '@~/db/models/canvas-edge.model';
import { CanvasNodeModel } from '@~/db/models/canvas-node.model';
import { CharacterModel } from '@~/db/models/character.model';
import { LocationModel } from '@~/db/models/location.model';
import { PropModel } from '@~/db/models/prop.model';
import { SceneModel } from '@~/db/models/scene.model';
import { ScriptModel } from '@~/db/models/script.model';
import { SeriesModel } from '@~/db/models/series.model';
import { StoryArcModel } from '@~/db/models/story-arc.model';
import { ThemeModel } from '@~/db/models/theme.model';
import { TimelineEntryModel } from '@~/db/models/timeline-entry.model';
import { WildCardModel } from '@~/db/models/wildcard.model';

const BEE_MOVIE_SCRIPT_CONTENT = `NARRATOR: 

(Black screen with text; The sound of buzzing bees can be heard) 
According to all known laws of aviation, there is no way a bee should be able to fly.

Its wings are too small to get its fat little body off the ground.

The bee, of course, flies anyway because bees don't care what humans think is impossible.

BARRY BENSON: 

(Barry is picking out a shirt) 
Yellow, black. Yellow, black. Yellow, black. Yellow, black.

Ooh, black and yellow! Let's shake it up a little.

JANET BENSON: 

Barry! Breakfast is ready!

BARRY: 

Coming! Hang on a second.
(Barry uses his antenna like a phone) 
Hello?

ADAM FLAYMAN: 

(Through phone) 
Barry?

BARRY: 

Adam?

ADAM: 

Can you believe this is happening?

BARRY: 

I can't. I'll pick you up.

(Barry flies down the stairs)

MARTIN BENSON: 

Looking sharp.

JANET: 

Use the stairs. Your father paid good money for those.

BARRY: 

Sorry. I'm excited.

MARTIN: 

Here's the graduate. We're very proud of you, son. A perfect report card, all B's.

JANET: 

Very proud.
(Rubs Barry's hair)

BARRY: 

Ma! I got a thing going here.

JANET: 

You got lint on your fuzz.

BARRY: 

Ow! That's me!

JANET: 

Wave to us! We'll be in row 118,000. Bye!

(Barry flies out the door)

JANET: 

Barry, I told you, stop flying in the house!

(Barry drives through the hive, and is waved at by Adam who is reading a newspaper)

BARRY: 

Hey, Adam.

ADAM: 

Hey, Barry. Is that fuzz gel?

BARRY: 

A little. Special day, graduation.

ADAM: 

Never thought I'd make it.

(Barry pulls away from the house and continues driving)

BARRY: 

Three days grade school, three days high school...

ADAM: 

Those were awkward.

BARRY: 

Three days college. I'm glad I took a day and hitchhiked around the hive.

ADAM: 

You did come back different.

(Barry and Adam pass by Artie, who is jogging)

ARTIE: 

Hi, Barry!

BARRY: 

Artie, growing a mustache? Looks good.

ADAM: 

Hear about Frankie?

BARRY: 

Yeah. You going to the funeral?

ADAM: 

No, I'm not going. Everybody knows, sting someone, you die. Don't waste it on a squirrel. Such a hothead.

BARRY: 

I guess he could have just gotten out of the way.

(The car does a barrel roll on the loop-shaped bridge and lands on the highway)

I love this incorporating an amusement park into our regular day.

ADAM: 

I guess that's why they say we don't need vacations.

(Barry parallel parks the car and together they fly over the graduating students)

BARRY: 

Boy, quite a bit of pomp... under the circumstances. Well, Adam, today we are men.

ADAM: 

We are!

BARRY: 

Bee-men.

ADAM: 

Amen!

BARRY AND ADAM: 

Hallelujah!

(Barry and Adam both have a happy spasm)

ANNOUNCER: 

Students, faculty, distinguished bees, please welcome Dean Buzzwell.

DEAN BUZZWELL: 

Welcome, New Hive City graduating class of... 9:15. That concludes our ceremonies. And begins your career at Honex Industries!

ADAM: 

Will we pick our job today?

(Adam and Barry get into a tour bus)

BARRY: 

I heard it's just orientation.

(Tour buses rise out of the ground and the students are automatically loaded into the buses)

TOUR GUIDE: 

Heads up! Here we go.

ANNOUNCER: 

Keep your hands and antennas inside the tram at all times.

BARRY: 

Wonder what it'll be like?

ADAM: 

A little scary.

TOUR GUIDE: 

Welcome to Honex, a division of Honesco and a part of the Hexagon Group.

BARRY: 

This is it!

(The bus drives down a road and on either side are the Bee's massive complicated Honey-making machines)

TOUR GUIDE: 

We know that you, as a bee, have worked your whole life to get to the point where you can work for your whole life. Honey begins when our valiant Pollen Jocks bring the nectar to the hive. Our top-secret formula is automatically color-corrected, scent-adjusted and bubble-contoured into this soothing sweet syrup with its distinctive golden glow you know as...

EVERYONE ON BUS: 

Honey!

(The guide has been collecting honey into a bottle and she throws it into the crowd on the bus)

ADAM: 

That girl was hot.

BARRY: 

She's my cousin!

ADAM: 

She is?

BARRY: 

Yes, we're all cousins.

ADAM: 

Right. You're right.

TOUR GUIDE: 

At Honex, we constantly strive to improve every aspect of bee existence. These bees are stress-testing a new helmet technology.

(The bus passes by a Bee wearing a helmet who is being smashed into the ground with fly-swatters, newspapers and boots)

ADAM: 

What do you think he makes?

BARRY: 

Not enough.

TOUR GUIDE: 

Here we have our latest advancement, the Krelman.

(They pass by a turning wheel with Bees standing on pegs, who are each wearing a finger-shaped hat)

BARRY: 

Wow, What does that do?

TOUR GUIDE: 

Catches that little strand of honey that hangs after you pour it. Saves us millions.

ADAM: 

Can anyone work on the Krelman?

TOUR GUIDE: 

Of course. Most bee jobs are small ones. But bees know that every small job, if it's done well, means a lot. But choose carefully because you'll stay in the job you pick for the rest of your life.

(Everyone claps except for Barry)

BARRY: 

The same job the rest of your life? I didn't know that.

ADAM: 

What's the difference?

TOUR GUIDE: 

You'll be happy to know that bees, as a species, haven't had one day off in 27 million years.

BARRY: 

(Upset) 
So you'll just work us to death? We'll sure try.

(Everyone on the bus laughs except Barry)`;

interface iBeeMovieCreationResult {
  seriesId: string;
  scriptId: string;
  characterCount: number;
  locationCount: number;
  propCount: number;
  sceneCount: number;
  storyArcCount: number;
  themeCount: number;
  timelineEntryCount: number;
  wildcardCount: number;
  canvasNodeCount: number;
  canvasEdgeCount: number;
}

export async function createBeeMovieMockData(): Promise<iBeeMovieCreationResult> {
  // Create Series
  const series = await SeriesModel.create({
    title: 'Bee Movie',
    genre: 'Animated Comedy',
    logline:
      'Barry B. Benson, a bee who has just graduated from college, is disillusioned at his lone career choice: making honey. On a special trip outside the hive, Barry befriends Vanessa, a florist in New York City. When he discovers humans sell honey, he decides to sue humanity.',
    coverUrl: 'https://upload.wikimedia.org/wikipedia/en/5/5a/Bee_Movie_poster.png',
    lastEditedAt: new Date(),
  });

  // Create Script
  const script = await ScriptModel.create({
    seriesId: series._id,
    title: 'Bee Movie - Full Script',
    authors: ['Jerry Seinfeld', 'Spike Feresten', 'Barry Marder', 'Andy Robin'],
    genre: 'Animated Comedy',
    logline: 'The complete screenplay for Bee Movie (2007)',
    content: BEE_MOVIE_SCRIPT_CONTENT,
    contentVersion: 1,
    lastEditedAt: new Date(),
  });

  // ============================================
  // CHARACTERS - Enhanced with relationships
  // ============================================
  const characterData = [
    {
      seriesId: series._id,
      name: 'Barry B. Benson',
      description:
        'The protagonist of the film. Barry is a young bee who has just graduated from college and is dissatisfied with his only career option: making honey. He is curious, idealistic, and brave enough to challenge the status quo.',
      traits: ['Idealistic', 'Curious', 'Brave', 'Persistent', 'Romantic', 'Rebellious', 'Witty'],
      avatarUrl: 'https://static.wikia.nocookie.net/dreamworks/images/5/5c/Barry-bee-benson.png',
    },
    {
      seriesId: series._id,
      name: 'Vanessa Bloome',
      description:
        'A kind-hearted florist in New York City who saves Barry and becomes his close friend and love interest. She is compassionate and values all forms of life, willing to break social norms for her beliefs.',
      traits: ['Compassionate', 'Kind', 'Open-minded', 'Supportive', 'Independent', 'Brave', 'Romantic'],
    },
    {
      seriesId: series._id,
      name: 'Adam Flayman',
      description:
        "Barry's best friend since childhood. He is more conventional than Barry and initially reluctant to support Barry's unconventional choices, but remains a loyal friend throughout.",
      traits: ['Loyal', 'Cautious', 'Supportive', 'Traditional', 'Nervous', 'Food-loving'],
    },
    {
      seriesId: series._id,
      name: 'Ken',
      description:
        "Vanessa's boyfriend who is allergic to bees. He becomes increasingly jealous of Barry's relationship with Vanessa and serves as the secondary antagonist. Self-absorbed and insecure.",
      traits: ['Insecure', 'Jealous', 'Competitive', 'Arrogant', 'Allergic to bees', 'Vain'],
    },
    {
      seriesId: series._id,
      name: 'Janet Benson',
      description:
        "Barry's caring mother who worries about her son but ultimately supports him. She represents traditional bee values and is proud of her family.",
      traits: ['Nurturing', 'Worrying', 'Supportive', 'Traditional', 'Loving'],
    },
    {
      seriesId: series._id,
      name: 'Martin Benson',
      description:
        "Barry's father who works as a honey stirrer at Honex. He has difficulty understanding Barry's reluctance to accept the traditional bee career path but ultimately respects his son's choices.",
      traits: ['Hardworking', 'Traditional', 'Proud', 'Stubborn', 'Loving'],
    },
    {
      seriesId: series._id,
      name: 'Lou Lo Duva',
      description:
        'The charismatic commander of the Pollen Jocks. He is tough, enthusiastic, and deeply proud of his elite unit of bees who venture outside the hive.',
      traits: ['Authoritative', 'Enthusiastic', 'Tough', 'Experienced', 'Inspiring'],
    },
    {
      seriesId: series._id,
      name: 'Mooseblood',
      description:
        'A wise-cracking mosquito Barry befriends on the Honey Farms truck. He provides comic relief, philosophical insights, and unexpected friendship across species.',
      traits: ['Friendly', 'Philosophical', 'Humorous', 'Adventurous', 'Streetwise'],
    },
    {
      seriesId: series._id,
      name: 'Dean Buzzwell',
      description:
        "The dean of Barry's bee college who welcomes the graduates and announces their entry into Honex Industries. Represents the establishment.",
      traits: ['Professional', 'Formal', 'Authoritative', 'Traditional'],
    },
    {
      seriesId: series._id,
      name: 'Hector',
      description:
        'A supermarket employee who initially tries to kill Barry but later becomes a source of information about where honey comes from. Has an iguana named Ignacio.',
      traits: ['Suspicious', 'Aggressive', 'Cowardly', 'Dramatic'],
    },
    {
      seriesId: series._id,
      name: 'Bee Larry King',
      description:
        'A bee version of Larry King who hosts a popular talk show in the hive. He interviews Barry about his groundbreaking lawsuit against the human race.',
      traits: ['Professional', 'Iconic', 'Interviewer', 'Curious'],
    },
    {
      seriesId: series._id,
      name: 'Bob Bumble',
      description: "A bee news anchor at 'Hive at Five', the hive's only full-hour action news source.",
      traits: ['Professional', 'Authoritative', 'Reliable'],
    },
    {
      seriesId: series._id,
      name: 'Jeanette Chung',
      description: "A bee news co-anchor at 'Hive at Five'. Professional and well-spoken.",
      traits: ['Professional', 'Articulate', 'Reliable'],
    },
    {
      seriesId: series._id,
      name: 'Artie',
      description: "A bee seen jogging in the hive, waving at Barry. He's growing a mustache that Barry compliments.",
      traits: ['Friendly', 'Athletic', 'Fashionable'],
    },
    {
      seriesId: series._id,
      name: 'Uncle Carl',
      description:
        "Barry's eccentric uncle who once dated a cricket in San Antonio. He has a laid-back perspective on interspecies relationships.",
      traits: ['Eccentric', 'Laid-back', 'Open-minded', 'Nostalgic'],
    },
    {
      seriesId: series._id,
      name: 'Pollen Jock #1 (Jackson)',
      description:
        'One of the elite Pollen Jocks who ventures outside the hive. He befriends Barry and takes him on his first trip outside. Cool and experienced.',
      traits: ['Cool', 'Experienced', 'Friendly', 'Brave', 'Mentor'],
    },
    {
      seriesId: series._id,
      name: 'Pollen Jock #2 (Buzz)',
      description:
        'Another Pollen Jock who participates in the sunflower patch mission. He spots the "moving flower" (tennis ball). Observant and cautious.',
      traits: ['Observant', 'Professional', 'Cautious', 'Loyal'],
    },
    {
      seriesId: series._id,
      name: 'Tour Guide',
      description:
        'A cheerful bee who guides the new graduates through Honex Industries, explaining the honey-making process and job responsibilities with forced enthusiasm.',
      traits: ['Informative', 'Enthusiastic', 'Professional', 'Perky'],
    },
    {
      seriesId: series._id,
      name: 'Layton T. Montgomery',
      description:
        "A fast-talking defense attorney who represents the honey industry against Barry's lawsuit. Bombastic and dismissive of bees.",
      traits: ['Arrogant', 'Eloquent', 'Manipulative', 'Dismissive', 'Theatrical'],
    },
    {
      seriesId: series._id,
      name: 'Judge Bumbleton',
      description:
        "The judge presiding over Barry's lawsuit against the honey industry. Fair-minded but initially skeptical of a bee plaintiff.",
      traits: ['Fair', 'Skeptical', 'Authoritative', 'Patient'],
    },
    {
      seriesId: series._id,
      name: 'Ray Liotta',
      description:
        "The actor Ray Liotta appears as himself, testifying at the trial about his 'Ray Liotta Private Select' honey brand.",
      traits: ['Celebrity', 'Defensive', 'Confused', 'Self-promotional'],
    },
    {
      seriesId: series._id,
      name: 'Sting',
      description:
        'The musician Sting appears as himself, called as a witness due to his stage name. Reveals his real name is Gordon M. Sumner.',
      traits: ['Celebrity', 'Calm', 'Philosophical', 'Witty'],
    },
  ];

  const createdCharacters = await CharacterModel.insertMany(characterData);

  // Add relationships between characters
  const barryId = createdCharacters[0]._id;
  const vanessaId = createdCharacters[1]._id;
  const adamId = createdCharacters[2]._id;
  const kenId = createdCharacters[3]._id;
  const janetId = createdCharacters[4]._id;
  const martinId = createdCharacters[5]._id;
  const moosebloodId = createdCharacters[7]._id;
  const laytonId = createdCharacters[18]._id;

  // Update Barry with relationships
  await CharacterModel.findByIdAndUpdate(barryId, {
    relationships: [
      { targetId: vanessaId, type: 'Love Interest', note: 'Met when Vanessa saved his life' },
      { targetId: adamId, type: 'Best Friend', note: 'Childhood friends since bee school' },
      { targetId: janetId, type: 'Mother', note: 'Caring but worried about his choices' },
      { targetId: martinId, type: 'Father', note: 'Struggles to understand Barry' },
      { targetId: kenId, type: 'Rival', note: "Competes for Vanessa's attention" },
      { targetId: moosebloodId, type: 'Friend', note: 'Unlikely interspecies friendship' },
    ],
    variations: [
      {
        scriptId: script._id,
        label: 'Graduate Barry',
        notes: 'Fresh out of college, optimistic',
        age: 'Young adult',
        appearance: 'Clean fuzz, graduation cap',
      },
      {
        scriptId: script._id,
        label: 'Lawyer Barry',
        notes: 'During the trial, more serious',
        age: 'Young adult',
        appearance: 'Professional demeanor, determined expression',
      },
    ],
  });

  // Update Vanessa with relationships
  await CharacterModel.findByIdAndUpdate(vanessaId, {
    relationships: [
      { targetId: barryId, type: 'Love Interest', note: 'Initially friendship, evolves to romance' },
      { targetId: kenId, type: 'Ex-Boyfriend', note: 'Breaks up during the film' },
    ],
  });

  // Update Adam with relationships
  await CharacterModel.findByIdAndUpdate(adamId, {
    relationships: [{ targetId: barryId, type: 'Best Friend', note: "Loyal despite disapproval of Barry's choices" }],
  });

  // Update Ken with relationships
  await CharacterModel.findByIdAndUpdate(kenId, {
    relationships: [
      { targetId: vanessaId, type: 'Ex-Girlfriend', note: 'Increasingly jealous of Barry' },
      { targetId: barryId, type: 'Enemy', note: 'Sees Barry as romantic rival' },
    ],
  });

  // ============================================
  // LOCATIONS - Enhanced with all fields
  // ============================================
  const locationData = [
    {
      seriesId: series._id,
      name: 'The Benson Home',
      description:
        "Barry's family home inside the hive. A cozy bee residence with multiple rooms including Barry's bedroom, kitchen, and a honey pool in the backyard.",
      tags: ['Interior', 'Hive', 'Residential', 'Family'],
      mood: 'Warm and familial',
      timeOfDay: ['Morning', 'Day', 'Evening'],
      productionNotes: 'Key domestic setting for family dynamics',
    },
    {
      seriesId: series._id,
      name: 'Honex Industries',
      description:
        'The massive honey-making facility where all bees work. Features assembly-line honey production, the Krelman machine, testing facilities, and the job selection center.',
      tags: ['Interior', 'Factory', 'Industrial', 'Corporate'],
      mood: 'Busy and mechanical',
      timeOfDay: ['Day'],
      productionNotes: 'Represents conformity and the system Barry rebels against',
    },
    {
      seriesId: series._id,
      name: 'New Hive City',
      description:
        'The sprawling bee metropolis featuring streets, highways with loop-de-loops, and hundreds of thousands of bee residents. Located near Central Park.',
      tags: ['Exterior', 'City', 'Hive', 'Urban'],
      mood: 'Bustling and organized',
      timeOfDay: ['Morning', 'Day', 'Evening', 'Night'],
      productionNotes: 'Shows the scale and organization of bee society',
    },
    {
      seriesId: series._id,
      name: 'Central Park',
      description:
        'The large park in New York City where the hive is located (in Sheep Meadow near Turtle Pond). Beautiful natural outdoor setting.',
      tags: ['Exterior', 'Park', 'Nature', 'New York'],
      mood: 'Peaceful and natural',
      timeOfDay: ['Morning', 'Day', 'Sunset'],
      productionNotes: 'Connection point between bee world and human world',
    },
    {
      seriesId: series._id,
      name: "Vanessa's Flower Shop",
      description:
        "Vanessa's florist business in New York City. Filled with various flowers and has a warm, inviting atmosphere. Called 'Vanessa's Flowers'.",
      tags: ['Interior', 'Shop', 'Urban', 'Floral'],
      mood: 'Colorful and fragrant',
      timeOfDay: ['Day'],
      productionNotes: "Represents Vanessa's dream and passion",
    },
    {
      seriesId: series._id,
      name: "Vanessa's Apartment",
      description:
        "Vanessa's home where Barry first encounters humans. Features windows with drapes, a kitchen, living area, and rooftop access.",
      tags: ['Interior', 'Apartment', 'Urban', 'Domestic'],
      mood: 'Modern and cozy',
      timeOfDay: ['Day', 'Evening', 'Night'],
      productionNotes: 'Setting for key bonding scenes between Barry and Vanessa',
    },
    {
      seriesId: series._id,
      name: 'Tennis Court',
      description:
        'An outdoor tennis court where Barry gets stuck on a tennis ball and first encounters Ken and Vanessa during their game.',
      tags: ['Exterior', 'Sports', 'Urban', 'Recreational'],
      mood: 'Active and dangerous',
      timeOfDay: ['Day'],
      productionNotes: 'Inciting location for Barry-Vanessa meeting',
    },
    {
      seriesId: series._id,
      name: 'Honey Farms',
      description:
        'The villainous human operation that enslaves bees and steals their honey. Features rows of fake hives, smokers, and industrial honey processing.',
      tags: ['Exterior', 'Farm', 'Antagonist', 'Industrial'],
      mood: 'Dark and oppressive',
      timeOfDay: ['Night', 'Day'],
      productionNotes: 'Visual representation of exploitation',
    },
    {
      seriesId: series._id,
      name: 'Supermarket',
      description:
        'A grocery store where Barry discovers that humans sell honey in jars. Features a honey aisle with brands like "Cute Bee", "Golden Blossom", and "Ray Liotta Private Select".',
      tags: ['Interior', 'Store', 'Urban', 'Commercial'],
      mood: 'Commercial and shocking',
      timeOfDay: ['Day'],
      productionNotes: 'Turning point where Barry discovers the truth',
    },
    {
      seriesId: series._id,
      name: 'Bee College Graduation Hall',
      description:
        'The venue where Barry and Adam graduate before starting their careers at Honex Industries. Large auditorium with thousands of seats.',
      tags: ['Interior', 'School', 'Hive', 'Ceremonial'],
      mood: 'Celebratory and formal',
      timeOfDay: ['Morning'],
      productionNotes: 'Opening ceremony establishing bee education system',
    },
    {
      seriesId: series._id,
      name: 'J-Gate Flight Deck',
      description:
        'The launch point where Pollen Jocks depart from the hive. Features advanced bee flight technology, briefing areas, and dramatic launch sequences.',
      tags: ['Interior', 'Hive', 'Military', 'Technical'],
      mood: 'Exciting and professional',
      timeOfDay: ['Day'],
      productionNotes: 'Shows elite nature of Pollen Jocks',
    },
    {
      seriesId: series._id,
      name: 'Rooftop Cafe',
      description:
        "A rooftop location on Vanessa's apartment building where Barry and Vanessa have coffee and deepen their friendship.",
      tags: ['Exterior', 'Urban', 'Romantic', 'Intimate'],
      mood: 'Intimate and friendly',
      timeOfDay: ['Day', 'Sunset'],
      productionNotes: 'Key romantic and bonding location',
    },
    {
      seriesId: series._id,
      name: 'Courtroom',
      description:
        'The human courtroom where Barry sues the honey industry. Filled with spectators, media, and features the historic bee vs. humanity trial.',
      tags: ['Interior', 'Legal', 'Urban', 'Dramatic'],
      mood: 'Tense and dramatic',
      timeOfDay: ['Day'],
      productionNotes: 'Central location for Act 2 climax',
    },
    {
      seriesId: series._id,
      name: "Barry's Car",
      description:
        'A tiny yellow and black car that Barry drives through the hive. Features loop-de-loop capable suspension.',
      tags: ['Vehicle', 'Hive', 'Personal'],
      mood: 'Fun and adventurous',
      timeOfDay: ['Morning', 'Day'],
      productionNotes: 'Shows bee technology and lifestyle',
    },
    {
      seriesId: series._id,
      name: 'Airplane Cockpit',
      description:
        'The cockpit of a commercial airplane that Barry and Vanessa must land after the pilots are incapacitated. High-stakes emergency setting.',
      tags: ['Interior', 'Vehicle', 'Dangerous', 'Climax'],
      mood: 'Intense and terrifying',
      timeOfDay: ['Day'],
      productionNotes: 'Final act climax location',
    },
  ];

  const createdLocations = await LocationModel.insertMany(locationData);

  // ============================================
  // PROPS - Enhanced with associations
  // ============================================
  const propData = [
    {
      seriesId: series._id,
      name: 'Fuzz Gel',
      description: 'A gel product used by bees to style their fuzz (hair). Barry uses it for graduation day.',
      associations: [{ characterId: barryId, note: 'Uses for graduation' }],
    },
    {
      seriesId: series._id,
      name: "Ken's Resume Brochure",
      description:
        'A fold-out brochure resume created by Ken to show off his "special skills" and top-ten favorite movies. Pretentious and self-absorbed.',
      associations: [{ characterId: kenId, note: 'Created by Ken to impress' }],
    },
    {
      seriesId: series._id,
      name: 'Winter Boots',
      description: 'Ken uses winter boots as weapons to try to kill Barry in the apartment. Represents his hostility.',
      associations: [{ characterId: kenId, note: 'Weapon against Barry' }],
    },
    {
      seriesId: series._id,
      name: 'Tennis Ball',
      description:
        'A yellow fuzzy tennis ball that Barry mistakes for a flower and gets stuck to, leading to his first encounter with Vanessa.',
      associations: [
        { characterId: barryId, note: 'Gets stuck to it' },
        { locationId: createdLocations[6]._id, note: 'Tennis court scene' },
      ],
    },
    {
      seriesId: series._id,
      name: 'Nectar Collector Gun',
      description:
        'High-tech equipment used by Pollen Jocks to collect nectar from flowers. Fires tubes that suck up nectar into backpack storage.',
    },
    {
      seriesId: series._id,
      name: 'Pollen Jock Goggles',
      description:
        'Advanced goggles worn by Pollen Jocks that highlight flowers using heat-sink like technology. Standard Pollen Jock equipment.',
    },
    {
      seriesId: series._id,
      name: 'Thomas 3000 Smoker',
      description:
        'A semi-automatic smoker used by beekeepers at Honey Farms. Delivers ninety puffs a minute with twice the nicotine. Tool of oppression.',
      associations: [{ locationId: createdLocations[7]._id, note: 'Used at Honey Farms' }],
    },
    {
      seriesId: series._id,
      name: 'Honey Jars',
      description:
        'Jars of honey sold in supermarkets. Brands include "Cute Bee", "Golden Blossom", and "Ray Liotta Private Select". Evidence of exploitation.',
      associations: [{ locationId: createdLocations[8]._id, note: 'Found in supermarket' }],
    },
    {
      seriesId: series._id,
      name: 'Krelman Hat',
      description:
        'A finger-shaped hat worn by bees operating the Krelman machine, which catches the strand of honey that hangs after you pour it.',
      associations: [{ locationId: createdLocations[1]._id, note: 'Part of Honex equipment' }],
    },
    {
      seriesId: series._id,
      name: 'Bee Camera',
      description: 'A tiny camera Barry uses to document the bee slavery at Honey Farms for evidence in his lawsuit.',
      associations: [{ characterId: barryId, note: 'Uses to gather evidence' }],
    },
    {
      seriesId: series._id,
      name: 'Rum Cake Crumb',
      description:
        "A crumb from Vanessa's rum cake that Barry takes home and shares with Adam, introducing him to human food.",
      associations: [
        { characterId: barryId, note: 'Takes from Vanessa' },
        { characterId: adamId, note: 'Shares with Adam' },
      ],
    },
    {
      seriesId: series._id,
      name: 'Graduation Cap',
      description: 'The cap worn by Barry and Adam during their graduation ceremony at Bee College.',
      associations: [
        { characterId: barryId, note: 'Wears at graduation' },
        { characterId: adamId, note: 'Wears at graduation' },
      ],
    },
    {
      seriesId: series._id,
      name: 'Italian Vogue Magazine',
      description: "A magazine mentioned as having killed one of Barry's cousins. Running joke about magazine dangers.",
    },
    {
      seriesId: series._id,
      name: 'Cinnabon',
      description:
        'A human pastry that Barry describes enthusiastically to Adam. Represents the wonders of the human world.',
    },
    {
      seriesId: series._id,
      name: 'Legal Documents',
      description: "The legal paperwork for Barry's lawsuit against the honey industry.",
      associations: [
        { characterId: barryId, note: 'Plaintiff' },
        { locationId: createdLocations[12]._id, note: 'Used in courtroom' },
      ],
    },
    {
      seriesId: series._id,
      name: 'Airplane Controls',
      description: 'The flight controls of the commercial airplane that Barry must help land in the climax.',
      associations: [{ locationId: createdLocations[14]._id, note: 'Cockpit' }],
    },
    {
      seriesId: series._id,
      name: "Pic 'N' Save Circular",
      description: 'A magazine Vanessa uses to hit Hector when he attacks Barry. "Felt like about 10 pages."',
      associations: [{ characterId: vanessaId, note: 'Uses as weapon' }],
    },
  ];

  const createdProps = await PropModel.insertMany(propData);

  // ============================================
  // SCENES - Comprehensive with all fields
  // ============================================
  const characterIds = createdCharacters.map((c) => c._id);
  const locationIds = createdLocations.map((l) => l._id);
  const propIds = createdProps.map((p) => p._id);

  const sceneData = [
    {
      seriesId: series._id,
      scriptId: script._id,
      sceneNumber: 1,
      heading: 'BLACK SCREEN - OPENING NARRATION',
      timeOfDay: 'Day',
      emotionalTone: 'Mysterious and Inspiring',
      conflict: 'Setting up the impossible nature of bee flight',
      beats: [
        { order: 1, description: 'Black screen with buzzing sounds' },
        { order: 2, description: "Narrator explains bees shouldn't be able to fly" },
        { order: 3, description: "Establishes bees don't care what humans think" },
      ],
      lighting: 'Dark to bright transition',
      sound: 'Buzzing bees, dramatic narration',
      storyNotes: 'Iconic opening that sets the rebellious tone of the film',
      characterIds: [],
    },
    {
      seriesId: series._id,
      scriptId: script._id,
      sceneNumber: 2,
      heading: "INT. BENSON HOME - BARRY'S BEDROOM - MORNING",
      locationId: locationIds[0],
      timeOfDay: 'Morning',
      emotionalTone: 'Exciting and Hopeful',
      conflict: 'Barry preparing for the biggest day of his life',
      characterIds: [characterIds[0]],
      propIds: [propIds[0]],
      beats: [
        { order: 1, description: 'Barry wakes up excited for graduation day' },
        { order: 2, description: 'Barry picks out a shirt - "Yellow, black" routine' },
        { order: 3, description: 'Barry uses fuzz gel to style his look' },
        { order: 4, description: 'Phone call with Adam establishing their friendship' },
      ],
      lighting: 'Warm morning light',
      sound: 'Upbeat music, phone sounds',
      camera: "Close-ups on Barry's expressions, establishing shots of room",
      storyNotes: 'Establishes Barry as an idealistic young bee on the cusp of adulthood.',
    },
    {
      seriesId: series._id,
      scriptId: script._id,
      sceneNumber: 3,
      heading: 'INT. BENSON HOME - KITCHEN - MORNING',
      locationId: locationIds[0],
      timeOfDay: 'Morning',
      emotionalTone: 'Warm and Familial',
      conflict: "Barry's excitement vs parents' traditional expectations",
      characterIds: [characterIds[0], characterIds[4], characterIds[5]],
      beats: [
        { order: 1, description: 'Janet calls Barry for breakfast' },
        { order: 2, description: 'Barry flies down instead of using stairs' },
        { order: 3, description: 'Martin congratulates Barry - "All B\'s" joke' },
        { order: 4, description: "Janet fusses over Barry's appearance" },
        { order: 5, description: 'Barry leaves for graduation' },
      ],
      lighting: 'Bright kitchen light',
      sound: 'Family chatter, sizzling breakfast sounds',
      storyNotes: 'Shows loving but traditional family dynamic',
    },
    {
      seriesId: series._id,
      scriptId: script._id,
      sceneNumber: 4,
      heading: 'EXT. NEW HIVE CITY STREETS - MORNING',
      locationId: locationIds[2],
      timeOfDay: 'Morning',
      emotionalTone: 'Fun and Energetic',
      conflict: 'Hints at the conformist bee society',
      characterIds: [characterIds[0], characterIds[2], characterIds[13]],
      beats: [
        { order: 1, description: 'Barry drives through the hive picking up Adam' },
        { order: 2, description: 'They discuss graduation and their future' },
        { order: 3, description: 'Barry waves to Artie who is growing a mustache' },
        { order: 4, description: 'They discuss Frankie who died stinging a squirrel' },
        { order: 5, description: 'Car does barrel roll on loop-shaped bridge' },
      ],
      lighting: 'Bright daylight',
      camera: 'Tracking shots following the car, wide shots of hive city',
      storyNotes: 'Shows the organized bee society, hints at bee mortality and rules.',
    },
    {
      seriesId: series._id,
      scriptId: script._id,
      sceneNumber: 5,
      heading: 'INT. BEE COLLEGE GRADUATION HALL - DAY',
      locationId: locationIds[9],
      timeOfDay: 'Day',
      emotionalTone: 'Ceremonial but Brief',
      conflict: 'Ceremony reveals predetermined fate',
      characterIds: [characterIds[0], characterIds[2], characterIds[8]],
      propIds: [propIds[11]],
      beats: [
        { order: 1, description: 'Dean Buzzwell welcomes the graduating class' },
        { order: 2, description: 'Absurdly short ceremony concludes immediately' },
        { order: 3, description: 'Students directed to Honex Industries' },
        { order: 4, description: 'Barry and Adam put on graduation caps' },
      ],
      lighting: 'Stage lighting, ceremonial',
      sound: 'Applause, ceremonial music',
      storyNotes: "The absurdly short ceremony hints at bees' efficiency and conformity.",
    },
    {
      seriesId: series._id,
      scriptId: script._id,
      sceneNumber: 6,
      heading: 'INT. HONEX INDUSTRIES - TOUR - DAY',
      locationId: locationIds[1],
      timeOfDay: 'Day',
      emotionalTone: 'Overwhelming and Concerning',
      conflict: "Barry's growing unease with predetermined life",
      characterIds: [characterIds[0], characterIds[2], characterIds[17]],
      propIds: [propIds[8]],
      beats: [
        { order: 1, description: 'Tour Guide explains honey-making process enthusiastically' },
        { order: 2, description: 'Barry and Adam see the Krelman machine' },
        { order: 3, description: 'Stress-testing scene with fly-swatters' },
        { order: 4, description: 'Tour Guide reveals they work same job forever' },
        { order: 5, description: 'Barry is disturbed, everyone else applauds' },
        { order: 6, description: '"27 million years without a day off" revelation' },
      ],
      lighting: 'Industrial fluorescent',
      sound: 'Machinery, tour guide voiceover',
      storyNotes: 'Key scene establishing Barry\'s conflict with the system. "One job forever?"',
    },
    {
      seriesId: series._id,
      scriptId: script._id,
      sceneNumber: 7,
      heading: 'EXT. J-GATE FLIGHT DECK - DAY',
      locationId: locationIds[10],
      timeOfDay: 'Day',
      emotionalTone: 'Exciting and Aspirational',
      conflict: 'Barry wants adventure vs safety of conformity',
      characterIds: [characterIds[0], characterIds[2], characterIds[6], characterIds[15], characterIds[16]],
      propIds: [propIds[4], propIds[5]],
      beats: [
        { order: 1, description: 'Barry watches the Pollen Jocks arrive dramatically' },
        { order: 2, description: 'Lou Lo Duva greets his team' },
        { order: 3, description: 'Pollen Jocks challenge Barry to join them' },
        { order: 4, description: 'Lou gives safety briefing about rain, humans, etc.' },
        { order: 5, description: '"Bee law number one: no talking to humans"' },
        { order: 6, description: 'Barry decides to go outside despite risks' },
      ],
      lighting: 'Bright daylight, dramatic',
      sound: 'Wind, jet-like sounds, military cadence',
      camera: 'Dynamic angles, slow-motion hero shots',
      storyNotes: 'Barry makes his first rebellious choice.',
    },
    {
      seriesId: series._id,
      scriptId: script._id,
      sceneNumber: 8,
      heading: 'EXT. OUTSIDE THE HIVE - FLOWER FIELDS - DAY',
      locationId: locationIds[3],
      timeOfDay: 'Day',
      emotionalTone: 'Wonder and Freedom',
      conflict: 'Beauty of freedom vs dangers of outside world',
      characterIds: [characterIds[0], characterIds[15], characterIds[16]],
      propIds: [propIds[4], propIds[5]],
      beats: [
        { order: 1, description: 'Barry experiences outside world for first time' },
        { order: 2, description: '"So blue. I feel so fast and free!"' },
        { order: 3, description: 'Pollen Jocks demonstrate pollination' },
        { order: 4, description: 'Barry learns about the flower-honey ecosystem' },
      ],
      lighting: 'Bright, golden sunlight',
      sound: 'Wind, nature sounds, triumphant music',
      storyNotes: 'Barry experiences true freedom for the first time.',
    },
    {
      seriesId: series._id,
      scriptId: script._id,
      sceneNumber: 9,
      heading: 'EXT. TENNIS COURT - DAY',
      locationId: locationIds[6],
      timeOfDay: 'Day',
      emotionalTone: 'Chaotic and Dangerous',
      conflict: 'Barry in mortal danger, first human encounter',
      characterIds: [characterIds[0], characterIds[1], characterIds[3], characterIds[15], characterIds[16]],
      propIds: [propIds[3]],
      beats: [
        { order: 1, description: 'Pollen Jocks spot "moving flowers" (tennis balls)' },
        { order: 2, description: 'Barry mistakes tennis ball for a flower and gets stuck' },
        { order: 3, description: 'Ken and Vanessa play tennis, tossing Barry around' },
        { order: 4, description: 'Barry is launched into the city' },
      ],
      lighting: 'Bright outdoor',
      sound: 'Tennis sounds, Barry screaming, slow-motion whooshes',
      camera: 'POV shots, slow-motion impacts',
      storyNotes: 'First encounter with Vanessa and Ken. Sets up entire relationship dynamic.',
    },
    {
      seriesId: series._id,
      scriptId: script._id,
      sceneNumber: 10,
      heading: 'INT. CAR - CONTINUOUS',
      timeOfDay: 'Day',
      emotionalTone: 'Terror and Comedy',
      conflict: 'Barry trapped with panicking humans',
      characterIds: [characterIds[0]],
      beats: [
        { order: 1, description: 'Barry blown into car through AC' },
        { order: 2, description: 'Family panics - "There\'s a bee in the car!"' },
        { order: 3, description: 'Grandma attacks with bee spray' },
        { order: 4, description: 'Baby girl waves cutely at Barry' },
        { order: 5, description: "Barry escapes but realizes he can't fly in rain" },
      ],
      lighting: 'Car interior, shifting',
      sound: 'Screaming, spray sounds, chaos',
      storyNotes: 'Comedy and danger, showing human fear of bees.',
    },
    {
      seriesId: series._id,
      scriptId: script._id,
      sceneNumber: 11,
      heading: "INT. VANESSA'S APARTMENT - EVENING",
      locationId: locationIds[5],
      timeOfDay: 'Evening',
      emotionalTone: 'Tense then Hopeful',
      conflict: "Barry's life in danger, Vanessa's compassion",
      characterIds: [characterIds[0], characterIds[1], characterIds[3]],
      propIds: [propIds[1], propIds[2]],
      beats: [
        { order: 1, description: 'Barry crashes into apartment during rainstorm' },
        { order: 2, description: 'Ken shows off his resume brochure' },
        { order: 3, description: 'Ken tries to kill Barry with winter boots' },
        { order: 4, description: "Vanessa dramatically saves Barry's life" },
        { order: 5, description: 'Vanessa releases Barry outside' },
        { order: 6, description: 'Barry is shocked a human saved him' },
      ],
      lighting: 'Indoor evening light, rain outside',
      sound: "Rain, Ken's attacks, tense music",
      storyNotes: 'Establishes Vanessa as compassionate and Ken as antagonistic.',
    },
    {
      seriesId: series._id,
      scriptId: script._id,
      sceneNumber: 12,
      heading: "INT. VANESSA'S APARTMENT - KITCHEN - NEXT DAY",
      locationId: locationIds[5],
      timeOfDay: 'Day',
      emotionalTone: 'Surprising and Comedic',
      conflict: 'Barry breaking bee law to thank Vanessa',
      characterIds: [characterIds[0], characterIds[1]],
      beats: [
        { order: 1, description: 'Barry debates whether to break bee law and speak' },
        { order: 2, description: '"You like jazz?" - Barry\'s awkward opener' },
        { order: 3, description: 'Vanessa shocked, drops dishes' },
        { order: 4, description: "Vanessa realizes she's not dreaming" },
        { order: 5, description: 'They begin friendship over coffee' },
      ],
      lighting: 'Bright kitchen',
      sound: 'Dishes breaking, awkward silence, conversation',
      storyNotes: 'The iconic "You like jazz?" scene. Barry breaks bee law.',
    },
    {
      seriesId: series._id,
      scriptId: script._id,
      sceneNumber: 13,
      heading: 'EXT. ROOFTOP CAFE - DAY',
      locationId: locationIds[11],
      timeOfDay: 'Day',
      emotionalTone: 'Romantic and Bonding',
      conflict: 'Two different worlds connecting',
      characterIds: [characterIds[0], characterIds[1]],
      propIds: [propIds[10]],
      beats: [
        { order: 1, description: 'Barry and Vanessa have coffee on rooftop' },
        { order: 2, description: 'Barry tells bee jokes' },
        { order: 3, description: 'They discover they live near each other' },
        { order: 4, description: 'Deep conversation about their lives and dreams' },
        { order: 5, description: 'Vanessa gives Barry rum cake crumb' },
      ],
      lighting: 'Golden hour sunlight',
      sound: 'City ambiance, intimate conversation',
      camera: 'Romantic framing, soft focus',
      storyNotes: 'Key bonding scene that deepens their relationship.',
    },
    {
      seriesId: series._id,
      scriptId: script._id,
      sceneNumber: 14,
      heading: 'INT. SUPERMARKET - DAY',
      locationId: locationIds[8],
      timeOfDay: 'Day',
      emotionalTone: 'Shocking and Angry',
      conflict: 'Barry discovers human exploitation of bees',
      characterIds: [characterIds[0], characterIds[1], characterIds[9]],
      propIds: [propIds[7], propIds[16]],
      beats: [
        { order: 1, description: 'Barry discovers honey being sold in the supermarket' },
        { order: 2, description: 'Barry sees "Ray Liotta Private Select" - "Never heard of him"' },
        { order: 3, description: 'Barry confronts Vanessa about humans eating honey' },
        { order: 4, description: 'Hector attacks Barry, Vanessa defends him' },
        { order: 5, description: 'Barry vows to investigate' },
      ],
      lighting: 'Harsh fluorescent',
      sound: 'Store muzak, escalating tension',
      storyNotes: 'Inciting incident for the lawsuit plotline. "This is stealing!"',
    },
    {
      seriesId: series._id,
      scriptId: script._id,
      sceneNumber: 15,
      heading: 'EXT. HONEY FARMS - NIGHT',
      locationId: locationIds[7],
      timeOfDay: 'Night',
      emotionalTone: 'Dark and Disturbing',
      conflict: 'Barry witnesses systemic exploitation',
      characterIds: [characterIds[0], characterIds[7]],
      propIds: [propIds[6], propIds[9]],
      beats: [
        { order: 1, description: 'Barry meets Mooseblood on the truck' },
        { order: 2, description: 'They arrive at Honey Farms' },
        { order: 3, description: 'Barry witnesses beekeepers using smokers' },
        { order: 4, description: 'Discovers fake hives and enslaved bees' },
        { order: 5, description: 'Barry photographs evidence' },
        { order: 6, description: '"They make the honey, we make the money"' },
        { order: 7, description: 'Barry decides to sue the human race' },
      ],
      lighting: 'Dark, sinister, industrial',
      sound: 'Ominous music, smoker sounds, bee distress',
      camera: 'Documentary style, evidence gathering shots',
      storyNotes: 'Reveals the antagonist operation. Holocaust parallels intentional.',
    },
    {
      seriesId: series._id,
      scriptId: script._id,
      sceneNumber: 16,
      heading: 'INT. BENSON HOME - NIGHT',
      locationId: locationIds[0],
      timeOfDay: 'Night',
      emotionalTone: 'Confrontational',
      conflict: "Family divided over Barry's choices",
      characterIds: [characterIds[0], characterIds[2], characterIds[4], characterIds[5], characterIds[14]],
      beats: [
        { order: 1, description: 'Barry shows evidence to his family' },
        { order: 2, description: "Parents think it's conspiracy theory" },
        { order: 3, description: 'Adam reveals Barry has a human girlfriend' },
        { order: 4, description: 'Uncle Carl shares his cricket girlfriend story' },
        { order: 5, description: 'Barry announces intention to sue' },
      ],
      sound: 'Family argument, dramatic music',
      storyNotes: 'Family conflict escalates. Barry commits to action.',
    },
    {
      seriesId: series._id,
      scriptId: script._id,
      sceneNumber: 17,
      heading: 'INT. HIVE - BEE LARRY KING SHOW - NIGHT',
      locationId: locationIds[2],
      timeOfDay: 'Night',
      emotionalTone: 'Media Sensation',
      conflict: 'Barry becomes public figure',
      characterIds: [characterIds[0], characterIds[10]],
      beats: [
        { order: 1, description: 'Barry interviewed by Bee Larry King' },
        { order: 2, description: 'Discussion of the lawsuit' },
        { order: 3, description: 'Barry mentions human Larry King has same appearance' },
        { order: 4, description: 'Bee Larry King gets annoyed' },
      ],
      lighting: 'TV studio lighting',
      sound: 'Talk show music, applause',
      storyNotes: 'Media parody, building public awareness.',
    },
    {
      seriesId: series._id,
      scriptId: script._id,
      sceneNumber: 18,
      heading: 'INT. COURTROOM - DAY',
      locationId: locationIds[12],
      timeOfDay: 'Day',
      emotionalTone: 'Dramatic and Tense',
      conflict: 'Bees vs Humanity legal battle',
      characterIds: [
        characterIds[0],
        characterIds[1],
        characterIds[18],
        characterIds[19],
        characterIds[20],
        characterIds[21],
      ],
      propIds: [propIds[14]],
      beats: [
        { order: 1, description: 'Trial begins with packed courtroom' },
        { order: 2, description: 'Layton T. Montgomery gives dismissive opening' },
        { order: 3, description: 'Barry presents evidence of exploitation' },
        { order: 4, description: 'Ray Liotta called to stand' },
        { order: 5, description: 'Sting testifies about his name' },
        { order: 6, description: 'Barry wins the case dramatically' },
      ],
      lighting: 'Formal courtroom lighting',
      sound: 'Gavel, murmuring crowd, dramatic music',
      camera: 'Courtroom drama angles',
      storyNotes: 'Central dramatic scene. Victory has unintended consequences.',
    },
    {
      seriesId: series._id,
      scriptId: script._id,
      sceneNumber: 19,
      heading: 'INT./EXT. VARIOUS - THE CONSEQUENCES - DAY',
      timeOfDay: 'Day',
      emotionalTone: 'Disaster and Regret',
      conflict: 'Victory leads to ecological collapse',
      characterIds: [characterIds[0], characterIds[1], characterIds[2]],
      beats: [
        { order: 1, description: 'Bees stop working' },
        { order: 2, description: 'Flowers begin dying' },
        { order: 3, description: 'Ecosystem collapsing' },
        { order: 4, description: 'Barry realizes his mistake' },
      ],
      lighting: 'Increasingly grey and dying',
      sound: 'Somber music',
      storyNotes: 'Consequences of well-intentioned action. Environmental message.',
    },
    {
      seriesId: series._id,
      scriptId: script._id,
      sceneNumber: 20,
      heading: 'INT. AIRPLANE COCKPIT - DAY',
      locationId: locationIds[14],
      timeOfDay: 'Day',
      emotionalTone: 'Intense Climax',
      conflict: 'Life or death, redemption through action',
      characterIds: [characterIds[0], characterIds[1]],
      propIds: [propIds[15]],
      beats: [
        { order: 1, description: 'Plane pilots incapacitated' },
        { order: 2, description: 'Barry and Vanessa must land the plane' },
        { order: 3, description: 'All the bees work together to help' },
        { order: 4, description: 'Successful emergency landing' },
        { order: 5, description: 'Barry proves bees are essential' },
      ],
      lighting: 'Cockpit instruments, emergency red',
      sound: 'Alarms, wind, dramatic music',
      camera: 'Intense close-ups, action angles',
      storyNotes: 'Climactic action sequence. Bees prove their worth.',
    },
  ];

  const createdScenes = await SceneModel.insertMany(sceneData);
  const sceneIds = createdScenes.map((s) => s._id);

  // ============================================
  // THEMES - Comprehensive thematic elements
  // ============================================
  const themeData = [
    {
      seriesId: series._id,
      name: 'Individuality vs Conformity',
      description:
        "The central theme exploring Barry's desire to break free from the predetermined bee society where everyone works the same job forever.",
      color: '#FFD700',
      visualMotifs: [
        'Yellow and black uniformity',
        'Assembly line imagery',
        'Barry standing apart from crowds',
        'Loop-de-loop highways (conformity)',
      ],
      relatedCharacters: [
        { characterId: barryId, connection: 'Protagonist fighting for individuality' },
        { characterId: adamId, connection: 'Represents comfortable conformity' },
        { characterId: createdCharacters[17]._id, connection: 'Voice of the system' },
      ],
      evolution: [
        { scriptId: script._id, notes: 'Barry questions the system at Honex' },
        { scriptId: script._id, notes: 'Barry breaks free by joining Pollen Jocks' },
        { scriptId: script._id, notes: "Barry's individuality saves the ecosystem" },
      ],
      appearances: [
        { sceneId: sceneIds[5], quote: 'The same job the rest of your life?', notes: "Barry's awakening" },
        { sceneId: sceneIds[6], notes: 'Barry chooses adventure' },
      ],
    },
    {
      seriesId: series._id,
      name: 'Interspecies Understanding',
      description:
        "The unlikely friendship and romance between Barry (bee) and Vanessa (human), challenging both species' preconceptions.",
      color: '#FF69B4',
      visualMotifs: [
        'Size contrast imagery',
        'Shared coffee cups',
        "Vanessa's flower shop (natural connection)",
        'Cross-species communication',
      ],
      relatedCharacters: [
        { characterId: barryId, connection: 'Breaks bee law to connect with human' },
        { characterId: vanessaId, connection: 'Accepts Barry despite societal expectations' },
        { characterId: kenId, connection: 'Represents human intolerance' },
        { characterId: moosebloodId, connection: 'Another cross-species friendship' },
      ],
      evolution: [
        { scriptId: script._id, notes: "Vanessa saves Barry's life" },
        { scriptId: script._id, notes: 'First conversation breaks barriers' },
        { scriptId: script._id, notes: 'Romantic connection develops' },
        { scriptId: script._id, notes: 'Partnership saves the world' },
      ],
    },
    {
      seriesId: series._id,
      name: 'Corporate Exploitation',
      description:
        "The film's critique of industrialized exploitation of nature and labor, represented by Honey Farms and the honey industry.",
      color: '#8B0000',
      visualMotifs: [
        'Smokers and industrial equipment',
        'Assembly lines',
        'Jars of commodified honey',
        'Fake hives',
        'The Krelman machine',
      ],
      relatedCharacters: [
        { characterId: barryId, connection: 'Discovers and fights exploitation' },
        { characterId: laytonId, connection: 'Defends corporate interests' },
      ],
      evolution: [
        { scriptId: script._id, notes: 'Barry discovers honey for sale' },
        { scriptId: script._id, notes: 'Honey Farms reveals systematic exploitation' },
        { scriptId: script._id, notes: 'Courtroom battle against corporations' },
      ],
      appearances: [
        { sceneId: sceneIds[13], quote: 'This is stealing!', notes: 'Discovery moment' },
        { sceneId: sceneIds[14], quote: 'They make the honey, we make the money', notes: "Villain's creed" },
      ],
    },
    {
      seriesId: series._id,
      name: 'Environmental Interdependence',
      description:
        'The ecological message about how bees are essential to the ecosystem, and unintended consequences of disrupting natural systems.',
      color: '#228B22',
      visualMotifs: [
        'Flowers blooming and dying',
        'Pollination sequences',
        'Chain reaction imagery',
        'Rose Parade flowers',
      ],
      relatedCharacters: [
        { characterId: barryId, connection: 'Learns the importance of bee work' },
        { characterId: vanessaId, connection: 'Florist dependent on bees' },
      ],
      evolution: [
        { scriptId: script._id, notes: 'Pollen Jocks show pollination importance' },
        { scriptId: script._id, notes: 'Victory leads to bees stopping work' },
        { scriptId: script._id, notes: 'Ecosystem collapse demonstrates interdependence' },
        { scriptId: script._id, notes: 'Restoration through cooperation' },
      ],
    },
    {
      seriesId: series._id,
      name: 'Finding Purpose',
      description:
        "Barry's journey from aimless graduate to finding meaningful purpose that contributes to both species.",
      color: '#4169E1',
      visualMotifs: ['Graduation imagery', 'Job selection board', 'Courtroom triumph', 'Flying freely'],
      relatedCharacters: [
        { characterId: barryId, connection: 'Primary journey of purpose' },
        { characterId: vanessaId, connection: 'Found purpose in floristry' },
      ],
      evolution: [
        { scriptId: script._id, notes: 'Barry rejects predetermined purpose' },
        { scriptId: script._id, notes: 'Barry finds temporary purpose in lawsuit' },
        { scriptId: script._id, notes: 'Barry discovers true purpose: bridging worlds' },
      ],
    },
  ];

  const createdThemes = await ThemeModel.insertMany(themeData);

  // ============================================
  // STORY ARCS - Major narrative arcs
  // ============================================
  const storyArcData = [
    {
      seriesId: series._id,
      name: "Barry's Identity Crisis",
      description:
        "Barry's journey from conformist graduate to rebellious individual who questions the bee system and eventually finds his true purpose.",
      status: 'completed' as const,
      startScriptId: script._id,
      endScriptId: script._id,
      keyBeats: [
        {
          order: 1,
          description: 'Barry graduates and faces predetermined future',
          scriptId: script._id,
          sceneId: sceneIds[4],
        },
        { order: 2, description: 'Barry discovers life outside the hive', scriptId: script._id, sceneId: sceneIds[7] },
        {
          order: 3,
          description: 'Barry breaks bee law and connects with humans',
          scriptId: script._id,
          sceneId: sceneIds[11],
        },
        {
          order: 4,
          description: 'Barry finds purpose in fighting for bee rights',
          scriptId: script._id,
          sceneId: sceneIds[14],
        },
        {
          order: 5,
          description: 'Barry realizes true purpose is cooperation',
          scriptId: script._id,
          sceneId: sceneIds[19],
        },
      ],
      resolution:
        'Barry finds his purpose bridging bee and human worlds, working with Vanessa at the flower shop while maintaining his bee identity.',
      characters: [
        { characterId: barryId, role: 'Protagonist' },
        { characterId: adamId, role: 'Best friend and foil' },
        { characterId: martinId, role: 'Father representing tradition' },
      ],
      themeIds: [createdThemes[0]._id, createdThemes[4]._id],
    },
    {
      seriesId: series._id,
      name: 'Barry & Vanessa Romance',
      description:
        'The unconventional romantic arc between a bee and a human, evolving from gratitude to friendship to love.',
      status: 'completed' as const,
      startScriptId: script._id,
      endScriptId: script._id,
      keyBeats: [
        { order: 1, description: "Vanessa saves Barry's life from Ken", scriptId: script._id, sceneId: sceneIds[10] },
        { order: 2, description: 'Barry breaks bee law to thank Vanessa', scriptId: script._id, sceneId: sceneIds[11] },
        {
          order: 3,
          description: 'Coffee on the rooftop deepens connection',
          scriptId: script._id,
          sceneId: sceneIds[12],
        },
        { order: 4, description: 'They work together on the lawsuit', scriptId: script._id, sceneId: sceneIds[17] },
        { order: 5, description: 'They save the world together', scriptId: script._id, sceneId: sceneIds[19] },
      ],
      resolution: 'Barry and Vanessa become partners in both business and life, running the flower shop together.',
      characters: [
        { characterId: barryId, role: 'Love interest' },
        { characterId: vanessaId, role: 'Love interest' },
        { characterId: kenId, role: 'Romantic rival' },
      ],
      themeIds: [createdThemes[1]._id],
    },
    {
      seriesId: series._id,
      name: 'The Honey Lawsuit',
      description:
        "Barry's legal battle against the human honey industry, representing bees everywhere in a historic case.",
      status: 'completed' as const,
      startScriptId: script._id,
      endScriptId: script._id,
      keyBeats: [
        {
          order: 1,
          description: 'Barry discovers honey for sale in supermarket',
          scriptId: script._id,
          sceneId: sceneIds[13],
        },
        { order: 2, description: 'Barry investigates Honey Farms', scriptId: script._id, sceneId: sceneIds[14] },
        { order: 3, description: 'Barry decides to sue humanity', scriptId: script._id, sceneId: sceneIds[15] },
        { order: 4, description: 'The trial with celebrity witnesses', scriptId: script._id, sceneId: sceneIds[17] },
        {
          order: 5,
          description: 'Barry wins but victory has consequences',
          scriptId: script._id,
          sceneId: sceneIds[18],
        },
      ],
      resolution: 'Barry wins the case but realizes the unintended consequences of his victory.',
      characters: [
        { characterId: barryId, role: 'Plaintiff' },
        { characterId: vanessaId, role: 'Legal assistant' },
        { characterId: laytonId, role: 'Defense attorney' },
        { characterId: createdCharacters[19]._id, role: 'Judge' },
      ],
      themeIds: [createdThemes[2]._id],
    },
    {
      seriesId: series._id,
      name: 'Ecological Restoration',
      description:
        'The aftermath of the lawsuit victory where bees stop working, leading to environmental collapse and the need for restoration.',
      status: 'completed' as const,
      startScriptId: script._id,
      endScriptId: script._id,
      keyBeats: [
        { order: 1, description: 'Bees win and stop working', scriptId: script._id },
        { order: 2, description: 'Flowers begin to die', scriptId: script._id },
        { order: 3, description: 'Barry realizes his mistake', scriptId: script._id, sceneId: sceneIds[18] },
        { order: 4, description: 'Rose Parade flowers must be saved', scriptId: script._id },
        {
          order: 5,
          description: 'Airplane emergency unites bees and humans',
          scriptId: script._id,
          sceneId: sceneIds[19],
        },
        { order: 6, description: 'Ecosystem restored through cooperation', scriptId: script._id },
      ],
      resolution: 'Bees return to work with newfound respect from humans, achieving a better balance.',
      characters: [
        { characterId: barryId, role: 'Leader of restoration' },
        { characterId: vanessaId, role: 'Human ally' },
      ],
      themeIds: [createdThemes[3]._id],
    },
  ];

  const createdStoryArcs = await StoryArcModel.insertMany(storyArcData);

  // ============================================
  // TIMELINE ENTRIES - Chronological events
  // ============================================
  const timelineData = [
    {
      seriesId: series._id,
      label: "Barry's Graduation Day",
      order: 1,
      timestamp: 'Day 1 - Morning',
      links: [
        { entityType: 'scene', entityId: sceneIds[1] },
        { entityType: 'scene', entityId: sceneIds[4] },
        { entityType: 'character', entityId: barryId },
      ],
    },
    {
      seriesId: series._id,
      label: 'Honex Industries Tour',
      order: 2,
      timestamp: 'Day 1 - Midday',
      links: [
        { entityType: 'scene', entityId: sceneIds[5] },
        { entityType: 'location', entityId: locationIds[1] },
      ],
    },
    {
      seriesId: series._id,
      label: 'Barry Joins Pollen Jocks',
      order: 3,
      timestamp: 'Day 2',
      links: [
        { entityType: 'scene', entityId: sceneIds[6] },
        { entityType: 'character', entityId: createdCharacters[6]._id },
      ],
    },
    {
      seriesId: series._id,
      label: 'First Trip Outside Hive',
      order: 4,
      timestamp: 'Day 2 - Afternoon',
      links: [
        { entityType: 'scene', entityId: sceneIds[7] },
        { entityType: 'scene', entityId: sceneIds[8] },
      ],
    },
    {
      seriesId: series._id,
      label: 'Tennis Ball Incident',
      order: 5,
      timestamp: 'Day 2 - Afternoon',
      links: [
        { entityType: 'scene', entityId: sceneIds[8] },
        { entityType: 'character', entityId: vanessaId },
        { entityType: 'character', entityId: kenId },
      ],
    },
    {
      seriesId: series._id,
      label: 'Vanessa Saves Barry',
      order: 6,
      timestamp: 'Day 2 - Evening',
      links: [
        { entityType: 'scene', entityId: sceneIds[10] },
        { entityType: 'character', entityId: vanessaId },
      ],
    },
    {
      seriesId: series._id,
      label: 'Barry Speaks to Vanessa',
      order: 7,
      timestamp: 'Day 3 - Morning',
      links: [{ entityType: 'scene', entityId: sceneIds[11] }],
    },
    {
      seriesId: series._id,
      label: 'Coffee on Rooftop',
      order: 8,
      timestamp: 'Day 3 - Afternoon',
      links: [
        { entityType: 'scene', entityId: sceneIds[12] },
        { entityType: 'location', entityId: locationIds[11] },
      ],
    },
    {
      seriesId: series._id,
      label: 'Supermarket Discovery',
      order: 9,
      timestamp: 'Day 4',
      links: [
        { entityType: 'scene', entityId: sceneIds[13] },
        { entityType: 'location', entityId: locationIds[8] },
      ],
    },
    {
      seriesId: series._id,
      label: 'Honey Farms Infiltration',
      order: 10,
      timestamp: 'Day 4 - Night',
      links: [
        { entityType: 'scene', entityId: sceneIds[14] },
        { entityType: 'character', entityId: moosebloodId },
        { entityType: 'location', entityId: locationIds[7] },
      ],
    },
    {
      seriesId: series._id,
      label: 'Family Confrontation',
      order: 11,
      timestamp: 'Day 5',
      links: [{ entityType: 'scene', entityId: sceneIds[15] }],
    },
    {
      seriesId: series._id,
      label: 'Bee Larry King Interview',
      order: 12,
      timestamp: 'Day 6',
      links: [
        { entityType: 'scene', entityId: sceneIds[16] },
        { entityType: 'character', entityId: createdCharacters[10]._id },
      ],
    },
    {
      seriesId: series._id,
      label: 'The Trial',
      order: 13,
      timestamp: 'Day 7-14',
      links: [
        { entityType: 'scene', entityId: sceneIds[17] },
        { entityType: 'location', entityId: locationIds[12] },
        { entityType: 'character', entityId: laytonId },
      ],
    },
    {
      seriesId: series._id,
      label: 'Bees Win the Case',
      order: 14,
      timestamp: 'Day 14',
      links: [
        { entityType: 'scene', entityId: sceneIds[17] },
        { entityType: 'storyArc', entityId: createdStoryArcs[2]._id },
      ],
    },
    {
      seriesId: series._id,
      label: 'Ecological Collapse Begins',
      order: 15,
      timestamp: 'Day 15-30',
      links: [
        { entityType: 'scene', entityId: sceneIds[18] },
        { entityType: 'theme', entityId: createdThemes[3]._id },
      ],
    },
    {
      seriesId: series._id,
      label: 'Rose Parade Emergency',
      order: 16,
      timestamp: 'Day 31',
      links: [{ entityType: 'storyArc', entityId: createdStoryArcs[3]._id }],
    },
    {
      seriesId: series._id,
      label: 'Airplane Crisis',
      order: 17,
      timestamp: 'Day 31',
      links: [
        { entityType: 'scene', entityId: sceneIds[19] },
        { entityType: 'location', entityId: locationIds[14] },
      ],
    },
    {
      seriesId: series._id,
      label: 'Ecosystem Restored',
      order: 18,
      timestamp: 'Day 32+',
      links: [{ entityType: 'storyArc', entityId: createdStoryArcs[3]._id }],
    },
    {
      seriesId: series._id,
      label: "Barry & Vanessa's Partnership",
      order: 19,
      timestamp: 'Epilogue',
      links: [
        { entityType: 'character', entityId: barryId },
        { entityType: 'character', entityId: vanessaId },
        { entityType: 'location', entityId: locationIds[4] },
      ],
    },
  ];

  const createdTimeline = await TimelineEntryModel.insertMany(timelineData);

  // ============================================
  // WILDCARDS - Miscellaneous notes and trivia
  // ============================================
  const wildcardData = [
    {
      seriesId: series._id,
      title: '"According to all known laws of aviation..."',
      body: 'The iconic opening narration that became a viral internet meme. References the real aerodynamic puzzle of how bumblebees fly despite their body-to-wing ratio.',
      tag: 'Iconic Line',
    },
    {
      seriesId: series._id,
      title: '"You like jazz?"',
      body: "Barry's awkward conversation starter with Vanessa that became one of the most quoted lines from the film and a widespread meme.",
      tag: 'Iconic Line',
    },
    {
      seriesId: series._id,
      title: 'Ray Liotta Private Select',
      body: 'A fictional honey brand featuring actor Ray Liotta, who appears in the film as himself testifying about his honey endorsement deal.',
      tag: 'Easter Egg',
    },
    {
      seriesId: series._id,
      title: 'Sting Cameo',
      body: 'The musician Sting appears as a witness, called because of his stage name. He reveals his real name is Gordon M. Sumner.',
      tag: 'Celebrity Cameo',
    },
    {
      seriesId: series._id,
      title: 'Bee Larry King',
      body: "A bee version of talk show host Larry King, complete with suspenders and glasses. Part of the film's extensive parallelism between bee and human society.",
      tag: 'Parody',
    },
    {
      seriesId: series._id,
      title: "All B's Joke",
      body: 'Martin congratulates Barry on "a perfect report card, all B\'s" - one of many bee-themed puns throughout the film.',
      tag: 'Pun',
    },
    {
      seriesId: series._id,
      title: '27 Million Years Without a Day Off',
      body: "The tour guide mentions bees haven't had a day off in 27 million years, emphasizing the industrious nature of bee society.",
      tag: 'World-building',
    },
    {
      seriesId: series._id,
      title: 'The Krelman',
      body: 'A machine that catches the strand of honey that hangs after you pour it. "Saves us millions." One of many absurdist bee jobs.',
      tag: 'World-building',
    },
    {
      seriesId: series._id,
      title: 'Row 118,000',
      body: "Janet says she'll be in row 118,000 at graduation, establishing the massive scale of bee society.",
      tag: 'World-building',
    },
    {
      seriesId: series._id,
      title: 'Italian Vogue Danger',
      body: 'Barry mentions losing a cousin to Italian Vogue, establishing magazines as deadly weapons to bees.',
      tag: 'Running Joke',
    },
    {
      seriesId: series._id,
      title: 'Thinking Bee',
      body: '"You gotta start thinking bee!" - Adam\'s advice to Barry, representing the conformist bee mindset.',
      tag: 'Iconic Line',
    },
    {
      seriesId: series._id,
      title: 'Jerry Seinfeld Connection',
      body: 'Jerry Seinfeld wrote and starred as Barry B. Benson. The "B" in Barry B. Benson stands for "Bee".',
      tag: 'Production',
    },
    {
      seriesId: series._id,
      title: "Ken's Top Ten Movies",
      body: 'Ken\'s resume brochure includes his top ten favorite movies, which Barry comments "Star Wars?" Ken denies liking that "kind of stuff."',
      tag: 'Character Detail',
    },
    {
      seriesId: series._id,
      title: "Mooseblood's Philosophy",
      body: 'Mooseblood the mosquito shares wisdom about being an outsider: "You a mosquito, you in trouble. Nobody likes us."',
      tag: 'Character Detail',
    },
    {
      seriesId: series._id,
      title: 'Cinnabon Description',
      body: 'Barry enthusiastically describes a Cinnabon to Adam: "It\'s bread and cinnamon and frosting. They heat it up... really hot!"',
      tag: 'Comedy Beat',
    },
  ];

  const createdWildcards = await WildCardModel.insertMany(wildcardData);

  // ============================================
  // CANVAS NODES - Visual story mapping
  // ============================================
  const canvasNodeData = [
    // Act structure
    {
      seriesId: series._id,
      type: 'text' as const,
      content: 'ACT 1: Setup\nBarry graduates, discovers life outside hive, meets Vanessa',
      position: { x: 100, y: 100 },
      style: { backgroundColor: '#4CAF50', fontSize: 16 },
    },
    {
      seriesId: series._id,
      type: 'text' as const,
      content: 'ACT 2: Confrontation\nBarry discovers honey exploitation, files lawsuit, wins case',
      position: { x: 400, y: 100 },
      style: { backgroundColor: '#FF9800', fontSize: 16 },
    },
    {
      seriesId: series._id,
      type: 'text' as const,
      content: 'ACT 3: Resolution\nConsequences unfold, airplane crisis, ecosystem restored',
      position: { x: 700, y: 100 },
      style: { backgroundColor: '#F44336', fontSize: 16 },
    },
    // Character nodes
    {
      seriesId: series._id,
      type: 'note' as const,
      content: 'BARRY B. BENSON\nProtagonist - Idealistic graduate seeking purpose',
      position: { x: 100, y: 250 },
      style: { backgroundColor: '#FFD700' },
    },
    {
      seriesId: series._id,
      type: 'note' as const,
      content: 'VANESSA BLOOME\nLove Interest - Compassionate florist',
      position: { x: 300, y: 250 },
      style: { backgroundColor: '#FF69B4' },
    },
    {
      seriesId: series._id,
      type: 'note' as const,
      content: 'ADAM FLAYMAN\nBest Friend - Voice of conformity',
      position: { x: 100, y: 400 },
      style: { backgroundColor: '#87CEEB' },
    },
    {
      seriesId: series._id,
      type: 'note' as const,
      content: 'KEN\nAntagonist - Jealous boyfriend',
      position: { x: 300, y: 400 },
      style: { backgroundColor: '#DC143C' },
    },
    // Theme nodes
    {
      seriesId: series._id,
      type: 'shape' as const,
      content: 'Theme: Individuality vs Conformity',
      position: { x: 550, y: 250 },
      style: { shape: 'diamond', backgroundColor: '#9370DB' },
    },
    {
      seriesId: series._id,
      type: 'shape' as const,
      content: 'Theme: Environmental Interdependence',
      position: { x: 550, y: 400 },
      style: { shape: 'diamond', backgroundColor: '#228B22' },
    },
    // Plot points
    {
      seriesId: series._id,
      type: 'note' as const,
      content: 'INCITING INCIDENT\nBarry discovers honey for sale',
      position: { x: 400, y: 250 },
      style: { backgroundColor: '#FFA500' },
    },
    {
      seriesId: series._id,
      type: 'note' as const,
      content: 'MIDPOINT\nBarry wins the lawsuit',
      position: { x: 400, y: 400 },
      style: { backgroundColor: '#FFA500' },
    },
    {
      seriesId: series._id,
      type: 'note' as const,
      content: 'CLIMAX\nAirplane emergency - Bees save the day',
      position: { x: 700, y: 250 },
      style: { backgroundColor: '#FF0000' },
    },
  ];

  const createdCanvasNodes = await CanvasNodeModel.insertMany(canvasNodeData);

  // ============================================
  // CANVAS EDGES - Connections between nodes
  // ============================================
  const canvasEdgeData = [
    // Act flow
    {
      seriesId: series._id,
      sourceId: createdCanvasNodes[0]._id,
      targetId: createdCanvasNodes[1]._id,
      label: 'progresses to',
    },
    {
      seriesId: series._id,
      sourceId: createdCanvasNodes[1]._id,
      targetId: createdCanvasNodes[2]._id,
      label: 'progresses to',
    },
    // Character relationships
    {
      seriesId: series._id,
      sourceId: createdCanvasNodes[3]._id,
      targetId: createdCanvasNodes[4]._id,
      label: 'loves',
    },
    {
      seriesId: series._id,
      sourceId: createdCanvasNodes[3]._id,
      targetId: createdCanvasNodes[5]._id,
      label: 'best friends with',
    },
    {
      seriesId: series._id,
      sourceId: createdCanvasNodes[4]._id,
      targetId: createdCanvasNodes[6]._id,
      label: 'breaks up with',
    },
    {
      seriesId: series._id,
      sourceId: createdCanvasNodes[3]._id,
      targetId: createdCanvasNodes[6]._id,
      label: 'rivals with',
    },
    // Theme connections
    {
      seriesId: series._id,
      sourceId: createdCanvasNodes[3]._id,
      targetId: createdCanvasNodes[7]._id,
      label: 'embodies',
    },
    {
      seriesId: series._id,
      sourceId: createdCanvasNodes[3]._id,
      targetId: createdCanvasNodes[8]._id,
      label: 'learns about',
    },
    // Plot connections
    {
      seriesId: series._id,
      sourceId: createdCanvasNodes[9]._id,
      targetId: createdCanvasNodes[10]._id,
      label: 'leads to',
    },
    {
      seriesId: series._id,
      sourceId: createdCanvasNodes[10]._id,
      targetId: createdCanvasNodes[11]._id,
      label: 'causes',
    },
  ];

  const createdCanvasEdges = await CanvasEdgeModel.insertMany(canvasEdgeData);

  // ============================================
  // Update locations with character associations
  // ============================================
  await LocationModel.findByIdAndUpdate(locationIds[0], {
    associatedCharacterIds: [barryId, janetId, martinId],
  });

  await LocationModel.findByIdAndUpdate(locationIds[5], {
    associatedCharacterIds: [vanessaId, barryId, kenId],
  });

  await LocationModel.findByIdAndUpdate(locationIds[4], {
    associatedCharacterIds: [vanessaId, barryId],
  });

  return {
    seriesId: series._id,
    scriptId: script._id,
    characterCount: createdCharacters.length,
    locationCount: createdLocations.length,
    propCount: createdProps.length,
    sceneCount: createdScenes.length,
    storyArcCount: createdStoryArcs.length,
    themeCount: createdThemes.length,
    timelineEntryCount: createdTimeline.length,
    wildcardCount: createdWildcards.length,
    canvasNodeCount: createdCanvasNodes.length,
    canvasEdgeCount: createdCanvasEdges.length,
  };
}
