
import type { DetailedTactic } from './types';

export const guideContent = [
  {
    title: "Key Insights for SM26",
    content: ["Soccer Manager 2026 builds upon SM25's mechanics with an enhanced match engine and AI. Tactical instructions now have a more direct and visible impact on the pitch."],
    list: [
      "Tactical Enhancements: High press instructions lead to realistic ball recovery, and the match engine better supports counter-attacks, especially after opponent set pieces.",
      "Player Focus: The meta favors fast forwards, central attacks, and wingers who can cut inside and shoot with their opposite foot. Prioritize players with high dribbling, speed, and long-shot attributes.",
      "Training: Training has been improved to show clearer progress for each role, boosting player ratings faster in specialized sessions."
    ]
  },
  {
    title: "Step 1: Plan Your Approach",
    content: ["Navigate to the 'Tactics' section to begin. Before choosing specifics, analyze your team and decide on a core philosophy based on the SM26 meta."],
    list: [
      "Assess your squad: Review player attributes, focusing on speed, dribbling, and long shots.",
      "Define your philosophy: Decide if you want to dominate possession, play a high-press counter-attacking game, or overload the attack.",
      "Choose a formation: Your choice should complement your best players and tactical goals. Formations like 4-2-3-1, 3-5-2, and 4-3-3 are highly effective.",
    ]
  },
  {
    title: "Step 2: Assign Player Roles",
    content: ["Roles define how players behave. Assign roles based on their attributes to maximize their effectiveness. Ensure you have a balanced mix of defensive and attacking duties."],
    list: [
      "Goalkeeper: Modern Keeper for high lines, traditional Keeper otherwise.",
      "Central Defender: A mix of Stopper and Ball-playing defenders is ideal.",
      "Fullback (DL/DR): Wingbacks provide width in attack.",
      "Midfielder (DMC/MC): Ball-winners are crucial for high-pressing systems. Pair them with creative Playmakers or all-action Box-to-box midfielders.",
      "Winger/Wide Forward (AML/AMR): Use players who can cut inside to exploit the SM26 engine.",
      "Forward (FC): Fast forwards are key. Finisher, Deep-lying Forward, and Target Man roles are all viable depending on your style.",
    ]
  },
  {
    title: "Step 3: Set Team Instructions",
    content: ["Instructions are split into General, Attack, and Defence categories. Start with aggressive settings favored by the SM26 meta and adjust based on performance."],
    list: [
      "General: Fast tempo, Attacking mentality, and Wide width are often effective.",
      "Attack: Direct passing and focusing attacks Down Both Flanks can stretch defenses. Enable Counter Attacks to leverage fast forwards.",
      "Defence: High pressing (All Over), hard tackling, and a high Back Line can suffocate opponents, but require fast defenders."
    ]
  },
  {
    title: "Understanding Player Roles",
    content: ["Assigning the correct role is crucial. Each role has specific behaviors and thrives with certain attributes."],
    list: [
      "Stopper (DC): Aggressively closes down forwards. Needs high tackling and strength.",
      "Ball-Playing Defender (DC): Starts attacks from the back. Needs high passing and composure.",
      "Wingback (DL/DR): Overlaps to provide width in attack. Needs high stamina, speed, and crossing.",
      "Ball-Winning Midfielder (DMC/MC): Disrupts opposition attacks. Needs high tackling and work rate.",
      "Advanced Playmaker (AMC/MC): Creates chances in the final third. Needs high creativity, passing, and dribbling.",
      "Winger (AML/AMR): Stays wide to stretch defenses and deliver crosses. Needs high speed and crossing.",
      "Wide Forward (AML/AMR): Cuts inside to shoot or create. Needs high dribbling, speed, and finishing.",
      "Finisher (FC): The primary goalscorer. Needs high finishing, composure, and off-the-ball movement."
    ]
  }
];

export const PLAYER_ROLE_DESCRIPTIONS: Record<string, string> = {
    'Keeper': 'A traditional shot-stopper. Focuses on saving shots.',
    'Modern Keeper': 'Acts as a sweeper and starts attacks. Needs good passing and speed.',
    'Stopper': 'Aggressively closes down forwards. Needs high tackling and strength.',
    'General Defender': 'A balanced defender, focusing on core defensive duties without specializing.',
    'Ball-Playing Defender': 'Starts attacks from the back. Needs high passing and composure.',
    'Wingback': 'Overlaps to provide width in attack. Needs high stamina, speed, and crossing.',
    'Fullback': 'A more traditional defensive full-back. Needs good positioning and tackling.',
    'Wide Midfielder': 'Provides width and balance between attack and defence on the flanks.',
    'Ball-Winning Midfielder': 'Disrupts opposition attacks. Needs high tackling and work rate.',
    'Box-to-box Midfielder': 'Contributes to both defence and attack. High stamina is key.',
    'General Midfielder': 'A versatile midfielder performing a variety of duties without a specific focus.',
    'Advanced Playmaker': 'Creates chances in the final third. Needs high creativity, passing, and dribbling.',
    'Deep-lying Playmaker': 'Controls the tempo from deep. Needs excellent passing and vision.',
    'Playmaker': 'A creative hub in midfield who dictates the flow of play with superior passing and vision.',
    'Winger': 'Stays wide to stretch defenses and deliver crosses. Needs high speed and crossing.',
    'Wide Forward': 'Cuts inside to shoot or create. Needs high dribbling, speed, and finishing.',
    'Support Striker': 'Operates in the space between midfield and the main striker, creating and scoring goals.',
    'Finisher': 'The primary goalscorer. Needs high finishing, composure, and off-the-ball movement.',
    'Deep-lying Forward': 'Links midfield and attack. Needs good passing and teamwork.',
    'General Forward': 'A versatile striker who can score, create, and link up play effectively.',
    'Target Man': 'A physical presence upfront. Needs strength and heading ability.',
};

export const POSITION_TO_ROLES_MAP: Record<string, string[]> = {
    'GK': ['Keeper', 'Modern Keeper'],
    'DC': ['Stopper', 'General Defender', 'Ball-Playing Defender'],
    'DL': ['Wingback', 'Fullback'],
    'DR': ['Wingback', 'Fullback'],
    'DML': ['Wingback', 'Fullback', 'Wide Midfielder'],
    'DMR': ['Wingback', 'Fullback', 'Wide Midfielder'],
    'DMC': ['Ball-Winning Midfielder', 'Box-to-box Midfielder', 'Deep-lying Playmaker'],
    'ML': ['Wingback', 'Winger', 'Playmaker', 'Wide Midfielder'],
    'MR': ['Wingback', 'Winger', 'Playmaker', 'Wide Midfielder'],
    'MC': ['General Midfielder', 'Ball-Winning Midfielder', 'Box-to-box Midfielder', 'Playmaker', 'Advanced Playmaker'],
    'AMC': ['Advanced Playmaker', 'Support Striker'],
    'AML': ['Winger', 'Advanced Playmaker', 'Wide Forward'],
    'AMR': ['Winger', 'Advanced Playmaker', 'Wide Forward'],
    'FL': ['Wide Forward', 'General Forward', 'Winger'],
    'FR': ['Wide Forward', 'General Forward', 'Winger'],
    'FC': ['General Forward', 'Target Man', 'Finisher', 'Deep-lying Forward'],
    'ST': ['General Forward', 'Target Man', 'Finisher', 'Deep-lying Forward'], // Alias for FC
};

export const DIFFICULTY_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

export const PLAYER_ATTRIBUTES: string[] = [
  'Fast Forwards',
  'Creative Midfielders',
  'Solid Defence',
  'Strong Wingers',
  'Possession-based',
  'Counter-attacking threat',
  'Tall Striker',
  'Technical Dribblers',
];

export const communityTactics: DetailedTactic[] = [
    { 
      tacticName: "Gegenpress Inferno 4-3-3",
      formation: "4-3-3",
      keyRoles: "GK: Modern Keeper; DC: Ball-playing (x2); DL/DR: Wingback; DMC: Ball-Winning; MC: Box-to-box (x2); AML/AMR: Wide Forward; FC: Finisher",
      generalInstructions: "Width: Wide; Mentality: V.Attacking; Tempo: Fast; Fluidity: Adventurous; Work Rate: Fast; Creativity: Bold",
      attackInstructions: "Passing: Direct; Attacking: Down Both Flanks; Forwards: Shoot on sight; Wide Play: Mixed; Build up: Fast; Counter: Yes",
      defenceInstructions: "Pressing: All Over; Tackling: Aggressive; Back Line: High; Sweeper Keeper: Yes; Time Wasting: Low",
      bestForTips: "For elite teams with high stamina. Aims to win the ball back immediately after losing it, overwhelming opponents with relentless pressure."
    },
    { 
      tacticName: "Insane Overload 4-2-3-1",
      formation: "4-2-3-1",
      keyRoles: "DCs: Stopper/Ball-playing; DL/DR: Wingback; DMCs: Ball-winning/Box-to-box; AMC: Advanced Playmaker; AML/AMR: Wide Forward/Winger (cut-in focus); FC: Finisher",
      generalInstructions: "Width: Wide; Mentality: Attacking; Tempo: Fast; Fluidity: Adventurous; Work Rate: Fast; Creativity: Bold",
      attackInstructions: "Passing: Direct; Attacking: Down Both Flanks; Forwards: Work ball into box; Wide Play: Byline crosses; Build up: Fast; Counter: Yes",
      defenceInstructions: "Pressing: All Over; Tackling: Hard; Back Line: Normal; Sweeper Keeper: Yes; Time Wasting: Normal",
      bestForTips: "Big teams like Liverpool for trophy hauls; Works for small teams too. Exploit channels for quick transitions."
    },
    { 
      tacticName: "Unbreakable Wall 5-2-1-2",
      formation: "5-2-1-2",
      keyRoles: "GK: Keeper; DC: Stopper (x3); DML/DMR: Wingback; MC: Ball-winning/Box-to-box; AMC: Advanced Playmaker; FC: Finisher/Deep-lying Forward",
      generalInstructions: "Width: Narrow; Mentality: Defensive; Tempo: Normal; Fluidity: Disciplined; Work Rate: Fast; Creativity: Balanced",
      attackInstructions: "Passing: Direct; Attacking: Through the Middle; Forwards: Mixed; Wide Play: Mixed; Build up: Fast; Counter: Yes",
      defenceInstructions: "Pressing: Own Half; Tackling: Hard; Back Line: Low; Sweeper Keeper: No; Time Wasting: High",
      bestForTips: "Perfect for underdog teams or seeing out a tough game. Frustrates opponents and hits them on the break with two strikers."
    },
    { 
      tacticName: "Wing Overload Mayhem 4-2-4",
      formation: "4-2-4",
      keyRoles: "GK: Modern Keeper; DC: Stopper (x2); DL/DR: Fullback; MC: Box-to-box (x2); AML/AMR: Winger; FC: Finisher (x2)",
      generalInstructions: "Width: Wide; Mentality: V.Attacking; Tempo: Fast; Fluidity: Normal; Work Rate: Fast; Creativity: Balanced",
      attackInstructions: "Passing: Mixed; Attacking: Down Both Flanks; Forwards: Shoot on sight; Wide Play: Play early crosses; Build up: Fast; Counter: Yes",
      defenceInstructions: "Pressing: All Over; Tackling: Aggressive; Back Line: High; Sweeper Keeper: Yes; Time Wasting: Low",
      bestForTips: "An all-out attack formation. Use when you need goals. Risky defensively but can produce huge scorelines against weaker opposition."
    },
    { 
      tacticName: "Total Football 3-4-3 Diamond",
      formation: "3-4-3",
      keyRoles: "GK: Modern Keeper; DC: Ball-playing (x3); ML/MR: Wide Midfielder; MC: Deep-lying Playmaker/Advanced Playmaker; FC: Deep-lying Forward (central), Finisher (x2 wide)",
      generalInstructions: "Width: Wide; Mentality: Attacking; Tempo: Normal; Fluidity: Adventurous; Work Rate: Normal; Creativity: Bold",
      attackInstructions: "Passing: Short; Attacking: Mixed; Forwards: Work ball into box; Wide Play: Mixed; Build up: Slow; Counter: No",
      defenceInstructions: "Pressing: All Over; Tackling: Normal; Back Line: High; Sweeper Keeper: Yes; Time Wasting: Low",
      bestForTips: "For technically gifted squads. Players should be comfortable on the ball. Aims to dominate possession and create chances through fluid movement."
    },
    { 
      tacticName: "400+ Goals Wing Attack 3-2-1-4",
      formation: "3-2-1-4",
      keyRoles: "DCs: Stopper (all three); DMCs: Ball-winning (defensive focus); MC: General Midfielder; AML/AMR/FL/FR: Winger/Wide Forward; FCs: Finisher/Target Man",
      generalInstructions: "Width: Wide; Mentality: V.Attacking; Tempo: Fast; Fluidity: Normal; Work Rate: Fast; Creativity: Balanced",
      attackInstructions: "Passing: Mixed; Attacking: Down Both Flanks; Forwards: Shoot on sight; Wide Play: Play early crosses; Build up: Fast; Counter: Yes",
      defenceInstructions: "Pressing: All Over; Tackling: Aggressive; Back Line: Low; Sweeper Keeper: No; Time Wasting: Low",
      bestForTips: "Elite squads for goal fests. High press recovers the ball quickly. Focus on wing overloads for rapid chances."
    },
    { 
      tacticName: "Broken Unbeaten 3-5-2",
      formation: "3-5-2",
      keyRoles: "DCs: Stopper (all three); DML/DMR: Wingback/Wide Midfielder; DMCs: Ball-winning; MC: Box-to-box/Playmaker; AML/AMR: Advanced Playmaker; FCs: Finisher/General Forward",
      generalInstructions: "Width: Normal; Mentality: V.Attacking; Tempo: Normal; Fluidity: Disciplined; Work Rate: Fast; Creativity: Bold",
      attackInstructions: "Passing: Direct; Attacking: Through the Middle; Forwards: Mixed; Wide Play: Mixed; Build up: Normal; Counter: Yes",
      defenceInstructions: "Pressing: All Over; Tackling: Hard; Back Line: Normal; Sweeper Keeper: Yes; Time Wasting: Normal",
      bestForTips: "Any team aiming for 100% win rates. High offensive push with forward movement; use for finals or tough opponents."
    },
    { 
      tacticName: "Liverpool 300+ Goals Counter",
      formation: "4-3-3",
      keyRoles: "GK: Modern Keeper; DCs: Ball-playing; DL/DR: Fullback; MCs: Deep-lying Playmaker/Box-to-box/Advanced Playmaker; AML/AMR: Winger (cut-in); FC: Deep-lying Forward",
      generalInstructions: "Width: Wide; Mentality: Attacking; Tempo: Fast; Fluidity: Adventurous; Work Rate: Fast; Creativity: Bold",
      attackInstructions: "Passing: Mixed; Attacking: Down Both Flanks; Forwards: Work ball into box; Wide Play: Byline crosses; Build up: Fast; Counter: Yes",
      defenceInstructions: "Pressing: All Over; Tackling: Aggressive; Back Line: High; Sweeper Keeper: Yes; Time Wasting: Low",
      bestForTips: "Possession-dominant teams. Exploit SM26's counter meta—steal after corners and use fast forwards for long shots."
    },
    { 
      tacticName: "Tiki-Taka Dominance 4-1-2-1-2",
      formation: "4-1-2-1-2",
      keyRoles: "GK: Sweeper Keeper; DCs: Ball-playing (both); DL/DR: Fullback (support); DMC: Deep-lying Playmaker; MCs: Box-to-box/Advanced Playmaker; AMC: Advanced Playmaker; FCs: Deep-lying Forward/Finisher",
      generalInstructions: "Width: Narrow; Mentality: Attacking; Tempo: Normal; Fluidity: Adventurous; Work Rate: Normal; Creativity: Bold",
      attackInstructions: "Passing: Short; Attacking: Through the Middle; Forwards: Work ball into box; Wide Play: Mixed; Build up: Slow; Counter: No",
      defenceInstructions: "Pressing: Own Half; Tackling: Normal; Back Line: High; Sweeper Keeper: Yes; Time Wasting: Low",
      bestForTips: "For teams with technical midfielders. Starve the opposition of the ball and create chances through intricate passing."
    },
    { 
      tacticName: "The Iron Wall 5-3-2 Counter",
      formation: "5-3-2",
      keyRoles: "GK: Goalkeeper; DCs: Stopper (all three); DML/DMR: Wingback; MCs: Ball-winning/Box-to-box/General Midfielder; FCs: Deep-lying Forward/Finisher (fast)",
      generalInstructions: "Width: Normal; Mentality: Defensive; Tempo: Fast; Fluidity: Disciplined; Work Rate: Fast; Creativity: Balanced",
      attackInstructions: "Passing: Direct; Attacking: Mixed; Forwards: Shoot on sight; Wide Play: Play early crosses; Build up: Fast; Counter: Yes",
      defenceInstructions: "Pressing: Own Half; Tackling: Hard; Back Line: Low; Sweeper Keeper: No; Time Wasting: Normal",
      bestForTips: "Ideal for underdog teams or protecting a lead. Soaks up pressure and hits opponents quickly on the break."
    },
    { 
      tacticName: "Cataclyse FC Pro 2-2-3-3",
      formation: "2-2-3-3",
      keyRoles: "GK: Modern Keeper; DCs: Ball-Playing Defender (both); DMCs: Ball-Winning Midfielder (both); AMCs: Advanced Playmaker (all three); FCs: Finisher (all three)",
      generalInstructions: "Width: Wide; Mentality: V.Attacking; Tempo: Fast; Fluidity: Adventurous; Work Rate: Fast; Creativity: Bold",
      attackInstructions: "Passing: Direct; Attacking: Down Both Flanks; Forwards: Shoot on sight; Wide Play: Mixed; Build up: Fast; Counter: Yes",
      defenceInstructions: "Pressing: All Over; Tackling: Aggressive; Back Line: High; Sweeper Keeper: Yes; Time Wasting: Low",
      bestForTips: "Extreme offensive overload tactic used by pro players for high scores. Requires world-class players to avoid being exposed defensively. High risk, high reward."
    },
    {
      tacticName: "Park the Bus 5-4-1",
      formation: "5-4-1",
      keyRoles: "GK: Keeper; DC: Stopper (x3); DL/DR: Fullback; ML/MR: Wide Midfielder; MC: Ball-winning (x2); FC: Target Man",
      generalInstructions: "Width: Narrow; Mentality: V.Defensive; Tempo: Slow; Fluidity: Disciplined; Work Rate: Slow; Creativity: Cautious",
      attackInstructions: "Passing: Long Ball; Attacking: Mixed; Forwards: Mixed; Wide Play: Mixed; Build up: Slow; Counter: Yes",
      defenceInstructions: "Pressing: Own Area; Tackling: Hard; Back Line: Low; Sweeper Keeper: No; Time Wasting: High",
      bestForTips: "For the final minutes when protecting a narrow lead against a top opponent. Aims to concede no goals at all costs."
    },
    {
      tacticName: "Asymmetric Overload 4-1-2-3",
      formation: "4-1-2-3",
      keyRoles: "GK: Modern Keeper; DC: Stopper/Ball-playing; DL: Wingback; DR: Fullback; DMC: Anchor Man; MC: Box-to-box/Advanced Playmaker; AML: Wide Forward; AMR: Winger; FC: Deep-lying Forward",
      generalInstructions: "Width: Wide; Mentality: Attacking; Tempo: Fast; Fluidity: Adventurous; Work Rate: Fast; Creativity: Bold",
      attackInstructions: "Passing: Mixed; Attacking: Down Left Flank; Forwards: Work ball into box; Wide Play: Byline crosses; Build up: Fast; Counter: Yes",
      defenceInstructions: "Pressing: Own Half; Tackling: Normal; Back Line: Normal; Sweeper Keeper: Yes; Time Wasting: Normal",
      bestForTips: "Creates confusion for defenders by focusing attacks down one side. Requires a world-class left side (DL, AML)."
    },
    {
      tacticName: "The False Nine 4-6-0",
      formation: "4-3-3-0",
      keyRoles: "GK: Modern Keeper; DC: Ball-playing (x2); DL/DR: Wingback; DMC: Deep-lying Playmaker; MC: Box-to-box/Advanced Playmaker; AMC: Support Striker (x3, central one is the 'False 9')",
      generalInstructions: "Width: Narrow; Mentality: Attacking; Tempo: Normal; Fluidity: Adventurous; Work Rate: Normal; Creativity: Bold",
      attackInstructions: "Passing: Short; Attacking: Through the Middle; Forwards: Work ball into box; Wide Play: Mixed; Build up: Slow; Counter: No",
      defenceInstructions: "Pressing: All Over; Tackling: Normal; Back Line: High; Sweeper Keeper: Yes; Time Wasting: Low",
      bestForTips: "Dominates the midfield by packing it with players. The 'striker' drops deep, pulling defenders out of position for others to exploit."
    },
    {
      tacticName: "Route One Express 4-4-2",
      formation: "4-4-2",
      keyRoles: "GK: Keeper; DC: Stopper (x2); DL/DR: Fullback; ML/MR: Winger; MC: Ball-winning/Box-to-box; FC: Target Man/Finisher",
      generalInstructions: "Width: Wide; Mentality: Normal; Tempo: Fast; Fluidity: Disciplined; Work Rate: Fast; Creativity: Balanced",
      attackInstructions: "Passing: Long Ball; Attacking: Mixed; Forwards: Shoot on sight; Wide Play: Play early crosses; Build up: Fast; Counter: Yes",
      defenceInstructions: "Pressing: Own Half; Tackling: Hard; Back Line: Normal; Sweeper Keeper: No; Time Wasting: Normal",
      bestForTips: "A classic, direct approach. Get the ball to your big striker and fast striker as quickly as possible. Effective for teams with less technical ability."
    },
    {
      tacticName: "Brazilian Box 4-2-2-2",
      formation: "4-2-2-2",
      keyRoles: "GK: Modern Keeper; DC: Ball-playing (x2); DL/DR: Wingback; DMC: Deep-lying Playmaker/Ball-winning; AMC: Advanced Playmaker (x2); FC: Deep-lying Forward/Finisher",
      generalInstructions: "Width: Normal; Mentality: Attacking; Tempo: Normal; Fluidity: Adventurous; Work Rate: Normal; Creativity: Bold",
      attackInstructions: "Passing: Mixed; Attacking: Through the Middle; Forwards: Work ball into box; Wide Play: Mixed; Build up: Normal; Counter: Yes",
      defenceInstructions: "Pressing: All Over; Tackling: Normal; Back Line: Normal; Sweeper Keeper: Yes; Time Wasting: Low",
      bestForTips: "Relies on the creativity of two attacking midfielders behind two strikers. Needs highly technical and creative AMCs to unlock defenses."
    },
    {
      tacticName: "Inverted Wingback Press 4-1-4-1",
      formation: "4-1-4-1",
      keyRoles: "GK: Modern Keeper; DC: Stopper (x2); DL/DR: Wingback (inverted); DMC: Deep-lying Playmaker; MC: Advanced Playmaker/Box-to-box; ML/MR: Winger; FC: Finisher",
      generalInstructions: "Width: Wide; Mentality: Attacking; Tempo: Fast; Fluidity: Normal; Work Rate: Fast; Creativity: Bold",
      attackInstructions: "Passing: Short; Attacking: Mixed; Forwards: Work ball into box; Wide Play: Mixed; Build up: Normal; Counter: No",
      defenceInstructions: "Pressing: All Over; Tackling: Aggressive; Back Line: High; Sweeper Keeper: Yes; Time Wasting: Low",
      bestForTips: "A modern tactic where fullbacks move into midfield to create overloads. Requires very intelligent and versatile fullbacks."
    },
    {
      tacticName: "Fluid Counter 3-4-3",
      formation: "3-4-3",
      keyRoles: "GK: Modern Keeper; DC: Ball-playing (x3); ML/MR: Wingback; MC: Box-to-box/Ball-winning; AML/AMR: Wide Forward; FC: Deep-lying Forward",
      generalInstructions: "Width: Wide; Mentality: Normal; Tempo: Fast; Fluidity: Adventurous; Work Rate: Fast; Creativity: Balanced",
      attackInstructions: "Passing: Direct; Attacking: Down Both Flanks; Forwards: Mixed; Wide Play: Play early crosses; Build up: Fast; Counter: Yes",
      defenceInstructions: "Pressing: Own Half; Tackling: Hard; Back Line: Normal; Sweeper Keeper: Yes; Time Wasting: Normal",
      bestForTips: "Solid defensively with three center-backs, but offers a potent, fast-breaking attack with three forwards. Great for balanced teams."
    },
    {
      tacticName: "High-Press Diamond 4-4-2",
      formation: "4-4-2 Diamond",
      keyRoles: "GK: Modern Keeper; DC: Stopper (x2); DL/DR: Wingback; DMC: Ball-winning; MC: Box-to-box (x2); AMC: Advanced Playmaker; FC: Finisher, Deep-lying Forward",
      generalInstructions: "Width: Narrow; Mentality: Attacking; Tempo: Fast; Fluidity: Adventurous; Work Rate: Fast; Creativity: Bold",
      attackInstructions: "Passing: Direct; Attacking: Through the Middle; Forwards: Work ball into box; Wide Play: Mixed; Build up: Fast; Counter: Yes",
      defenceInstructions: "Pressing: All Over; Tackling: Aggressive; Back Line: High; Sweeper Keeper: Yes; Time Wasting: Low",
      bestForTips: "A very aggressive, narrow formation that aims to dominate the center of the pitch and win the ball high up. Relies on attacking fullbacks for width."
    },
    {
      tacticName: "Triple Threat 4-2-1-3",
      formation: "4-2-1-3",
      keyRoles: "GK: Modern Keeper; DL/DR: Wingback; DMC: Ball-winning/Box-to-box; AMC: Advanced Playmaker; AML/AMR: Wide Forward; FC: Finisher",
      generalInstructions: "Width: Wide; Mentality: V.Attacking; Tempo: Fast; Fluidity: Adventurous; Work Rate: Fast; Creativity: Bold",
      attackInstructions: "Passing: Direct; Attacking: Down Both Flanks; Forwards: Shoot on sight; Wide Play: Cut inside; Build up: Fast; Counter: Yes",
      defenceInstructions: "Pressing: All Over; Tackling: Aggressive; Back Line: High; Sweeper Keeper: Yes; Time Wasting: Low",
      bestForTips: "Overwhelms opponents with four attackers supported by two solid DMCs. Requires a world-class AMC to connect midfield and attack."
    },
    {
      tacticName: "Solid Spine 3-1-4-2",
      formation: "3-1-4-2",
      keyRoles: "GK: Keeper; DC: Stopper (x3); DMC: Ball-Winning Midfielder; ML/MR: Wide Midfielder; MC: Box-to-box/Playmaker; FC: Finisher/Deep-lying Forward",
      generalInstructions: "Width: Wide; Mentality: Attacking; Tempo: Fast; Fluidity: Normal; Work Rate: Fast; Creativity: Balanced",
      attackInstructions: "Passing: Mixed; Attacking: Down Both Flanks; Forwards: Work ball into box; Wide Play: Play early crosses; Build up: Fast; Counter: Yes",
      defenceInstructions: "Pressing: Own Half; Tackling: Hard; Back Line: Normal; Sweeper Keeper: No; Time Wasting: Normal",
      bestForTips: "A very balanced formation. The 3 DCs and 1 DMC create a defensive rock, while the wide midfielders and two strikers provide a constant threat."
    },
    {
      tacticName: "Vietnamese Unbeaten 4-1-2-3",
      formation: "4-1-2-3",
      keyRoles: "GK: Modern Keeper; DL/DR: Wingback; DMC: Deep-lying Playmaker; MC: Box-to-box (x2); AML/AMR: Wide Forward; FC: Finisher",
      generalInstructions: "Width: Wide; Mentality: V.Attacking; Tempo: Fast; Fluidity: Adventurous; Work Rate: Fast; Creativity: Bold",
      attackInstructions: "Passing: Direct; Attacking: Down Both Flanks; Forwards: Shoot on sight; Wide Play: Cut inside; Build up: Fast; Counter: Yes",
      defenceInstructions: "Pressing: All Over; Tackling: Aggressive; Back Line: High; Sweeper Keeper: Yes; Time Wasting: Low",
      bestForTips: "A meta tactic from the Vietnamese SM community. Extremely aggressive and high-scoring. Relies on non-stop pressure and fast wingers."
    },
    { 
      tacticName: "Korean Firepower 4-2-2-2",
      formation: "4-2-2-2",
      keyRoles: "GK: Modern Keeper; DC: Ball-playing (x2); DL/DR: Wingback; DMC: Box-to-box/Ball-winning; AMC: Advanced Playmaker (x2); FC: Finisher/Deep-lying Forward",
      generalInstructions: "Width: Narrow; Mentality: Attacking; Tempo: Fast; Fluidity: Adventurous; Work Rate: Fast; Creativity: Bold",
      attackInstructions: "Passing: Mixed; Attacking: Through the Middle; Forwards: Work ball into box; Wide Play: Mixed; Build up: Fast; Counter: Yes",
      defenceInstructions: "Pressing: All Over; Tackling: Aggressive; Back Line: High; Sweeper Keeper: Yes; Time Wasting: Low",
      bestForTips: "Inspired by the Korean SM community. Relies on quick, short passing between the front four to overwhelm central defenses. Wingbacks must have high stamina."
    },
    { 
      tacticName: "Spanish Inquisition 4-1-4-1",
      formation: "4-1-4-1",
      keyRoles: "GK: Modern Keeper; DC: Ball-playing (x2); DL/DR: Fullback (support); DMC: Deep-lying Playmaker; MC: Advanced Playmaker/Playmaker; ML/MR: Winger (support); FC: Deep-lying Forward",
      generalInstructions: "Width: Wide; Mentality: Normal; Tempo: Slow; Fluidity: Adventurous; Work Rate: Normal; Creativity: Bold",
      attackInstructions: "Passing: Short; Attacking: Mixed; Forwards: Work ball into box; Wide Play: Mixed; Build up: Slow; Counter: No",
      defenceInstructions: "Pressing: All Over; Tackling: Normal; Back Line: V.High; Sweeper Keeper: Yes; Time Wasting: Low",
      bestForTips: "For technically elite teams aiming for 70%+ possession. A patient approach that requires high passing and creativity attributes across the midfield."
    },
    { 
      tacticName: "Samba Magic 4-2-3-1 Deep",
      formation: "4-2-3-1",
      keyRoles: "GK: Modern Keeper; DC: Stopper/Ball-playing; DL/DR: Wingback; DMC: Deep-lying Playmaker/Ball-winning; AMC: Advanced Playmaker; AML/AMR: Wide Forward; FC: Finisher",
      generalInstructions: "Width: Wide; Mentality: Attacking; Tempo: Normal; Fluidity: Adventurous; Work Rate: Normal; Creativity: Bold",
      attackInstructions: "Passing: Mixed; Attacking: Mixed; Forwards: Work ball into box; Wide Play: Mixed; Build up: Normal; Counter: Yes",
      defenceInstructions: "Pressing: Own Half; Tackling: Normal; Back Line: Normal; Sweeper Keeper: Yes; Time Wasting: Normal",
      bestForTips: "Unlocks defenses with creative freedom. Perfect for teams with technically gifted players in attacking positions who can create something out of nothing."
    },
    {
      tacticName: "Best Tactic",
      formation: "4-3-3",
      keyRoles: "GK: Keeper; DML: Fullback; DC: Stopper; DC: Ball-playing defender; DMR: Fullback; DMC: Deep-lying playmaker; MC: General Midfielder; MC: Playmaker; AML: Advanced Playmaker; FC: Target Man; AMR: Advanced Playmaker",
      generalInstructions: "Width: Narrow; Mentality: Normal; Tempo: Fast; Fluidity: Normal; Work Rate: Fast; Creativity: Balanced",
      attackInstructions: "Passing Style: Mixed; Attacking Style: Mixed; Forwards: Shoot on sight; Wide Play: Play early crosses; Build Up: Normal; Counter Attack: No",
      defenceInstructions: "Pressing: All Over; Tackling Style: Aggressive; Back Line: Normal; Sweeper Keeper: No; Time Wasting: Normal",
      bestForTips: "This tactical setup is designed to fully leverage the SM26 meta, which heavily favors fast-paced, high-pressure football. The squad composition perfectly fits a 4-3-3 formation, allowing for a strong attacking overload while maintaining defensive solidity. The two DCs are complemented by DML and DMR Wingbacks, providing width in attack and defensive cover. The DMC acts as a Deep-lying playmaker, dictating tempo, supported by a Box-to-box midfielder for energy and an Advanced playmaker to link with the attack. The AML and AMR are set as Wide Forwards, encouraging them to cut inside and contribute to scoring, aligning with the meta's emphasis on wingers who can do so. The central FC as a Finisher is ideal for converting the numerous chances created by this aggressive system.\n\nThe 'Attacking' mentality, 'Fast' tempo, and 'Adventurous' fluidity are chosen to promote a relentless, forward-thinking approach, directly in line with the SM26 engine's preference for rapid play. 'Direct' passing style, combined with 'Fast' build-up and 'true' counter-attack, ensures quick transitions and capitalizes on the meta's favorability towards rapid counter-attacks. 'Shoot on sight' for forwards and 'Play early crosses' for wide play further enhance the directness and goal threat. Defensively, an 'All Over' pressing scheme with 'Aggressive' tackling and a 'High' back line, supported by a 'Sweeper Keeper', creates an intense, suffocating press that aims to win the ball back high up the pitch, another core tenet of the SM26 meta. 'Low' time wasting ensures the team maintains its high tempo throughout the match. This comprehensive approach maximizes the team's strengths and exploits the game engine's mechanics for optimal performance."
    },
    {
      tacticName: "Jun Phạm Tactic",
      formation: "4-2-3-1",
      keyRoles: "GK: Keeper; DML: Wingback; DC: Stopper; DC: General Defender; DMR: Fullback; MC: General Midfielder; MC: Playmaker; AML: Winger; AMC: Advanced Playmaker; AMR: Winger; FC: Target Man",
      generalInstructions: "Width: Narrow; Mentality: V.Attacking; Tempo: Fast; Fluidity: Adventurous; Work Rate: Fast; Creativity: Bold",
      attackInstructions: "Passing Style: Mixed; Attacking Style: Through the Middle; Forwards: Work ball into box; Wide Play: Mixed; Build Up: Fast; Counter Attack: Yes",
      defenceInstructions: "Pressing: All Over; Tackling Style: Aggressive; Back Line: High; Sweeper Keeper: No; Time Wasting: Low",
      bestForTips: "This tactical setup is designed to fully leverage the SM26 meta, which heavily favors fast-paced, high-pressure, attacking football. The chosen 4-2-3-1 formation perfectly accommodates your squad composition (GK, 2 DC, 1 DML, 1 DMR, 2 MC, 1 AMC, 1 AML, 1 AMR, 1 ST) and is explicitly mentioned as an 'extremely effective' formation for overloading the attack. The DML and DMR are deployed as Wingbacks to provide width and support the attack, aligning with the fast tempo and direct passing style. In midfield, one Ball-winning midfielder will aid in aggressive 'All Over' pressing, while an Advanced Playmaker MC will facilitate quick transitions and direct passes. The AMC, AML, and AMR form a potent attacking trio behind the Finisher FC, with the Wide Forwards (AML/AMR) specifically chosen for their ability to 'cut inside', a key success factor highlighted in the meta. The Finisher FC is ideal for capitalizing on the numerous chances created by this attacking setup. General instructions like 'Attacking' mentality, 'Fast' tempo, 'Adventurous' fluidity, 'Fast' work rate, and 'Bold' creativity are all geared towards an aggressive, proactive style. Attacking instructions emphasize 'Direct' passing, 'Down Both Flanks' attacking style (to utilize the wide forwards and wingbacks), 'Shoot on sight' for quick goal attempts, 'Play early crosses' for rapid attacks, and a 'Fast' build-up, all reinforced by enabling 'Counter Attack'. Defensively, 'All Over' pressing, 'Aggressive' tackling, and a 'High' back line are implemented to win the ball back quickly and high up the pitch, minimizing the opponent's time on the ball. The 'Sweeper Keeper' is essential to cover the space behind the high defensive line, and 'Low' time wasting ensures the team maintains its high tempo throughout the match. This comprehensive approach ensures maximum adherence to the SM26 meta, optimizing your squad's strengths for dominant, attacking play."
    }
];

export const tips: string[] = [
    "Prioritize fast forwards for counters and wingers with opposite-foot dominance for curling shots.",
    "Favor players with high dribbling, speed, and long-shot attributes for optimal results.",
    "Always test tactics in matches and adjust for your specific squad.",
    "Use the new youth academy interface to scout for prospects that fit your tactical roles.",
    "For underdogs, start with a 'Normal' mentality before shifting to more aggressive tactics mid-game.",
];

export const SM_TACTICS_GUIDE_CONTEXT = `
SM26 Meta Summary: The game engine heavily favors fast-paced, high-pressure football. Key success factors include using fast forwards, wingers who can cut inside, aggressive 'All Over' pressing, and a 'Fast' tempo with 'Direct' passing to enable rapid counter-attacks. Formations that overload the attack (e.g., 4-2-3-1, 4-3-3, 3-4-3) are extremely effective.

Understanding Tactics in Soccer Manager (based on SM25/26 mechanics)
This guide provides the core tactical instructions and player roles.

Core Tactical Instructions

General:
- Width: Narrow, Normal, Wide
- Mentality: V.Defensive, Defensive, Normal, Attacking, V.Attacking
- Tempo: Slow, Normal, Fast
- Formation Fluidity: Disciplined, Normal, Adventurous
- Work Rate: Slow, Normal, Fast
- Creativity: Cautious, Balanced, Bold

Attack:
- Passing style: Short, Mixed, Direct, Long Ball
- Attacking style: Mixed, Down Both Flanks, Down Left Flank, Down Right Flank, Through the Middle
- Forwards: Mixed, Work ball into box, Shoot on sight
- Wide play: Mixed, Byline crosses, Play early crosses, work ball into box
- Build up play: Slow, Normal, Fast
- Counter Attack: Yes, No

Defence:
- Pressing: Own Area, Own Half, All Over
- Tackling Style: Normal, Hard, Aggressive
- Back Line: Low, Normal, High
- Sweeper Keeper: Yes, No
- Time Wasting: Low, Normal, High

Player Roles (Position-Specific for SM25/26)
Assign roles strictly from the options available for each position:
- GK: Keeper, Modern Keeper
- DC: Stopper, General Defender, Ball-playing defender
- DL, DR: Wingback, Fullback
- DML, DMR: Wingback, Fullback, Wide Midfielder
- DMC: Ball-winning midfielder, Box-to-box midfielder, Deep-lying playmaker
- ML, MR: Wingback, winger, playmaker, Wide Midfielder
- MC: General midfielder, ball-winning midfielder, box-to-box midfielder, playmaker, advanced playmaker
- AMC: Advanced Playmaker, Support Striker
- AML, AMR: Winger, Advanced Playmaker, Wide Forward
- FL, FR: Wide Forward, General Forward, Winger
- FC: General Forward, Target Man, Finisher, Deep-lying Forward
`;